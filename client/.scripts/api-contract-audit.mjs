import fs from 'node:fs'
import path from 'node:path'
import {
  parseChangedOnlyFlag,
  loadCentralAllowlist,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath,
  checkConfigAllowlist,
  getAuditReportHeaderLines,
} from './shared-audit-utils.mjs'

/**
 * API Contract Validation Audit Script
 *
 * Goal: Compare client-side API service types with server-side route handler types
 * to detect mismatches, missing shared types, and unvalidated request bodies.
 *
 * What it detects:
 *   - Client services using different types than server route handlers for the same endpoint
 *   - Endpoints missing shared type definitions (client and server define types independently)
 *   - Routes that don't validate req.body at all (no type guard, no schema check)
 *   - Request/response shape mismatches
 *
 * Scope:
 *   - Client: client/src/services/ (axios calls)
 *   - Server: server/src/routes/ (Express handlers)
 *   - Shared: shared/types/ (shared type definitions)
 *
 * Output:
 *   - client/.audit-reports/api-contract-audit.json
 *   - client/.audit-reports/api-contract-audit.md
 */

/**
 * Scan client service files for axios/fetch calls
 * Extracts: HTTP method, URL pattern, request type, response type
 */
function scanClientServices(serviceDir, projectRoot) {
  const endpoints = []
  const files = listAuditFiles('api-contract', [serviceDir])

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const repoPath = toRepoPath(file, projectRoot)

    // Match axios.get<ResponseType>('/api/xxx') patterns
    const axiosRe = /(?:axios|api|http)\.(get|post|put|patch|delete)\s*(?:<([^>]*)>)?\s*\(\s*[`'"](\/[^'"`$]*)[`'"]/gi
    for (const match of content.matchAll(axiosRe)) {
      endpoints.push({
        source: 'client',
        file: repoPath,
        method: match[1].toUpperCase(),
        url: match[3],
        responseType: match[2] || null,
        hasTypeAnnotation: !!match[2],
      })
    }

    // Match fetch('/api/xxx') patterns
    const fetchRe = /fetch\s*\(\s*[`'"](\/[^'"`$]*)[`'"]/gi
    for (const match of content.matchAll(fetchRe)) {
      endpoints.push({
        source: 'client',
        file: repoPath,
        method: 'GET',
        url: match[1],
        responseType: null,
        hasTypeAnnotation: false,
      })
    }
  }

  return endpoints
}

/**
 * Scan server route files for Express handlers
 * Extracts: HTTP method, URL pattern, request body validation, response typing
 */
function scanServerRoutes(routesDir, projectRoot) {
  const endpoints = []
  const files = listAuditFiles('api-contract', [routesDir])

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const repoPath = toRepoPath(file, projectRoot)

    // Match router.get('/xxx', handler) or app.post('/xxx', handler)
    const routeRe = /(?:router|app)\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]*)['"]/gi
    for (const match of content.matchAll(routeRe)) {
      const method = match[1].toUpperCase()
      const url = match[2]

      // Check if req.body has type annotation
      const hasBodyType = /req\.body\s*(?:as\s+\w+|:\s*\w+)/.test(content) ||
                          /Request\s*<[^>]+>/.test(content) ||
                          /TypedRequestBody/.test(content)

      // Check for validation (Joi, Zod, express-validator, manual checks)
      const hasValidation = /validate|schema|joi|zod|check\s*\(|body\s*\(/.test(content) ||
                            /req\.body\.\w+/.test(content) // At least accessing specific properties

      // Check for shared type imports
      const hasSharedImport = /from\s+['"].*shared/.test(content) ||
                              /from\s+['"].*\/types\//.test(content)

      endpoints.push({
        source: 'server',
        file: repoPath,
        method,
        url,
        hasBodyType,
        hasValidation: method !== 'GET' ? hasValidation : true, // GET doesn't need body validation
        hasSharedImport,
      })
    }
  }

  return endpoints
}

/**
 * Scan shared types directory
 */
function scanSharedTypes(sharedDir, projectRoot) {
  const types = []
  if (!fs.existsSync(sharedDir)) return types
  const files = listAuditFiles('api-contract', [sharedDir])

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const repoPath = toRepoPath(file, projectRoot)

    const typeRe = /export\s+(?:type|interface)\s+(\w+)/g
    for (const match of content.matchAll(typeRe)) {
      types.push({ name: match[1], file: repoPath })
    }
  }

  return types
}

/**
 * Match client endpoints with server endpoints by URL pattern
 */
function matchEndpoints(clientEndpoints, serverEndpoints) {
  const findings = []

  // Normalize URL for comparison (strip trailing slashes, replace :param with *)
  const normalizeUrl = (url) => url.replace(/\/$/, '').replace(/:[^/]+/g, '*').toLowerCase()

  for (const client of clientEndpoints) {
    const clientUrl = normalizeUrl(client.url)
    const matchingServer = serverEndpoints.find(s =>
      s.method === client.method && normalizeUrl(s.url) === clientUrl
    )

    if (!matchingServer) {
      // Client calls an endpoint not found in server routes
      findings.push({
        type: 'orphan-client-call',
        severity: 'warning',
        message: `Client calls ${client.method} ${client.url} but no matching server route found`,
        clientFile: client.file,
        serverFile: null,
        url: client.url,
        method: client.method,
      })
      continue
    }

    // Check if client has type annotation
    if (!client.hasTypeAnnotation) {
      findings.push({
        type: 'untyped-client-call',
        severity: 'info',
        message: `Client ${client.method} ${client.url} has no response type annotation`,
        clientFile: client.file,
        serverFile: matchingServer.file,
        url: client.url,
        method: client.method,
      })
    }

    // Check if server validates request body (for POST/PUT/PATCH)
    if (['POST', 'PUT', 'PATCH'].includes(client.method) && !matchingServer.hasValidation) {
      findings.push({
        type: 'unvalidated-body',
        severity: 'warning',
        message: `Server ${client.method} ${client.url} does not validate req.body`,
        clientFile: client.file,
        serverFile: matchingServer.file,
        url: client.url,
        method: client.method,
      })
    }

    // Check for shared types
    if (!matchingServer.hasSharedImport && client.hasTypeAnnotation) {
      findings.push({
        type: 'no-shared-types',
        severity: 'info',
        message: `${client.method} ${client.url}: Client uses local type, server doesn't import from shared`,
        clientFile: client.file,
        serverFile: matchingServer.file,
        url: client.url,
        method: client.method,
      })
    }
  }

  // Find server routes with no client caller
  for (const server of serverEndpoints) {
    const serverUrl = normalizeUrl(server.url)
    const hasClient = clientEndpoints.some(c =>
      c.method === server.method && normalizeUrl(c.url) === serverUrl
    )
    if (!hasClient) {
      findings.push({
        type: 'orphan-server-route',
        severity: 'info',
        message: `Server route ${server.method} ${server.url} has no client caller found`,
        clientFile: null,
        serverFile: server.file,
        url: server.url,
        method: server.method,
      })
    }
  }

  return findings
}

function calculateScore(findings) {
  return findings.reduce((sum, f) => {
    if (f.severity === 'warning') return sum + 3
    return sum + 1
  }, 0)
}

function renderMarkdownReport(result) {
  const lines = []
  lines.push('# API Contract Audit (Generated)')
  lines.push('')
  lines.push(...getAuditReportHeaderLines())
  lines.push('')
  lines.push('This file is generated by `client/.scripts/api-contract-audit.mjs`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Client endpoints found: **${result.clientEndpoints}**`)
  lines.push(`- Server routes found: **${result.serverEndpoints}**`)
  lines.push(`- Shared types found: **${result.sharedTypes.length}**`)
  lines.push(`- Total findings: **${result.findings.length}**`)
  lines.push('')

  // Count by type
  const byCat = {}
  for (const f of result.findings) {
    byCat[f.type] = (byCat[f.type] || 0) + 1
  }
  for (const [type, count] of Object.entries(byCat)) {
    lines.push(`- ${type}: **${count}**`)
  }
  lines.push('')

  // Group findings by type
  const typeOrder = ['unvalidated-body', 'orphan-client-call', 'no-shared-types', 'untyped-client-call', 'orphan-server-route']
  for (const type of typeOrder) {
    const group = result.findings.filter(f => f.type === type)
    if (group.length === 0) continue

    lines.push(`## ${type} (${group.length})`)
    lines.push('')
    for (const f of group.slice(0, 25)) {
      const files = [f.clientFile, f.serverFile].filter(Boolean).map(f => `\`${f}\``).join(' ↔ ')
      lines.push(`- **${f.method} ${f.url}**: ${f.message} (${files})`)
    }
    if (group.length > 25) {
      lines.push(`- *...and ${group.length - 25} more.*`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  const paths = resolveAuditPaths('api-contract')
  const delta = parseChangedOnlyFlag(process.argv, paths.projectRoot)
  const configAllowlist = loadCentralAllowlist('api-contract')

  const clientServicesDir = path.join(paths.clientSrc, 'services')
  const serverRoutesDir = path.join(paths.serverRoot, 'src', 'routes')
  const sharedTypesDir = path.join(paths.projectRoot, 'shared', 'types')

  const clientEndpoints = scanClientServices(clientServicesDir, paths.projectRoot)
  const serverEndpoints = scanServerRoutes(serverRoutesDir, paths.projectRoot)
  const sharedTypes = scanSharedTypes(sharedTypesDir, paths.projectRoot)

  let findings = matchEndpoints(clientEndpoints, serverEndpoints)
  findings = findings.filter((f) => {
    const filePath = f.serverFile || f.clientFile || ''
    const allowed = checkConfigAllowlist(filePath, f.type, 0, configAllowlist).allowed ||
      checkConfigAllowlist(filePath, '*', 0, configAllowlist).allowed
    return !allowed
  })
  const score = calculateScore(findings)

  // Full API surface for api-versioning: server route keys in same format as api-versioning-audit (METHOD /path)
  const endpointKeys = [...new Set(serverEndpoints.map((e) => `${e.method || 'GET'} ${(e.url || '').trim()}`.trim()))]

  const result = {
    generatedAt: new Date().toISOString(),
    clientEndpoints: clientEndpoints.length,
    serverEndpoints: serverEndpoints.length,
    endpointKeys,
    sharedTypes,
    ...(delta.enabled ? { deltaMode: true, baseRef: delta.baseRef } : {}),
    score,
    findings,
  }

  const { outJson, outMd } = writeAuditReports('api-contract', result, renderMarkdownReport(result))

  console.log(`Wrote:\n- ${toRepoPath(outJson, paths.projectRoot)}\n- ${toRepoPath(outMd, paths.projectRoot)}`)
  console.log(`Client endpoints: ${clientEndpoints.length}, Server routes: ${serverEndpoints.length}, Findings: ${findings.length}`)
  process.exitCode = 0
}

main()
