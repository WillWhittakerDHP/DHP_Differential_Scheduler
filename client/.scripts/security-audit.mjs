import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

/**
 * Security Audit Script
 *
 * Goal: produce a deterministic inventory of security issues across the codebase
 *
 * Scope:
 * - Included: server/src (ts, mjs files) for route/controller scanning
 * - Dependencies: server/ and client/ package.json for npm audit
 * - Config files: server/src for security configuration checks
 * - Excluded: __tests__, test files, spec files, node_modules, dist
 *
 * Output:
 * - client/.audit-reports/security-audit.json
 * - client/.audit-reports/security-audit.md
 *
 * Exception Handling:
 * - Config: .audit-reports/security-audit-config.json (allowlist patterns/specific)
 *
 * Notes:
 * - Security audit checks dependencies, secrets, config, CSRF, auth, and IDOR vulnerabilities
 * - Priority scoring: P0 (critical), P1 (important), P2 (low priority)
 */

// Detect if we're running from client/ or project root
const CWD = path.resolve(process.cwd())
const IS_CLIENT_DIR = fs.existsSync(path.join(CWD, 'src'))
const PROJECT_ROOT = IS_CLIENT_DIR ? path.resolve(CWD, '..') : CWD

const CLIENT_ROOT = IS_CLIENT_DIR ? CWD : path.join(PROJECT_ROOT, 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'server')
const SERVER_SRC = path.join(SERVER_ROOT, 'src')

const OUT_DIR = fs.existsSync(CLIENT_ROOT)
  ? path.join(CLIENT_ROOT, '.audit-reports')
  : path.join(CWD, 'client', '.audit-reports')
const OUT_JSON = path.join(OUT_DIR, 'security-audit.json')
const OUT_MD = path.join(OUT_DIR, 'security-audit.md')
const CONFIG_PATH = path.join(OUT_DIR, 'security-audit-config.json')

const _AUDIT_TYPE = 'security'

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function toRepoPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll(path.sep, '/')
}

function toStableId(repoPath) {
  return repoPath.replaceAll('/', '__')
}

function shouldExcludeDir(repoPath) {
  if (repoPath.includes('/__tests__/') || repoPath.includes('.test.') || repoPath.includes('.spec.')) {
    return true
  }
  if (repoPath.includes('node_modules') || repoPath.includes('/dist/') || repoPath.includes('.git/')) {
    return true
  }
  return false
}

function isScannable(absPath) {
  return absPath.endsWith('.ts') || absPath.endsWith('.js') || absPath.endsWith('.mjs')
}

function listFilesRecursive(dirPath) {
  const files = []
  if (!fs.existsSync(dirPath)) return files
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const repoPath = toRepoPath(fullPath)
      
      if (shouldExcludeDir(repoPath)) continue
      
      if (entry.isDirectory()) {
        files.push(...listFilesRecursive(fullPath))
      } else if (entry.isFile() && isScannable(fullPath)) {
        files.push(fullPath)
      }
    }
  } catch (_error) {
    // Skip directories we can't read
  }
  
  return files
}

// Secret patterns (from check-secrets.ts)
const SECRET_PATTERNS = [
  { pattern: /api[_-]?key\s*[:=]\s*["']([^"']{20,})["']/gi, name: 'API Key', severity: 'error' },
  { pattern: /password\s*[:=]\s*["']([^"']{8,})["']/gi, name: 'Password', severity: 'error' },
  { pattern: /token\s*[:=]\s*["']([^"']{20,})["']/gi, name: 'Token', severity: 'error' },
  { pattern: /secret\s*[:=]\s*["']([^"']{20,})["']/gi, name: 'Secret', severity: 'error' },
  { pattern: /aws[_-]?(access[_-]?key|secret[_-]?key)\s*[:=]\s*["']([^"']{20,})["']/gi, name: 'AWS Key', severity: 'error' },
  { pattern: /private[_-]?key\s*[:=]\s*["']([^"']{40,})["']/gi, name: 'Private Key', severity: 'error' },
  { pattern: /console\.(log|warn|error|info)\([^)]*(password|token|secret|key|api[_-]?key)[^)]*\)/gi, name: 'Console.log with secret', severity: 'warning' },
]

// State-changing HTTP methods
const STATE_CHANGING_METHODS = ['post', 'put', 'delete', 'patch']

// CSRF patterns
const CSRF_PATTERNS = [
  /csrf/i,
  /csurf/i,
  /csrfProtection/i,
  /csrfToken/i,
  /validateCsrf/i,
  /verifyCsrf/i,
]

// Auth patterns
const AUTH_PATTERNS = [
  /auth/i,
  /authenticate/i,
  /requireAuth/i,
  /isAuthenticated/i,
  /verifyToken/i,
  /validateToken/i,
  /jwt/i,
  /session/i,
]

// Authorization patterns
const AUTHORIZATION_PATTERNS = [
  /authorize/i,
  /permission/i,
  /canAccess/i,
  /hasPermission/i,
  /checkOwnership/i,
  /verifyUser/i,
  /validateUser/i,
  /req\.user/i,
  /req\.session\.user/i,
]

// ID patterns
const ID_PATTERNS = [
  /req\.params\.id/gi,
  /req\.params\.userId/gi,
  /req\.params\.(\w+)Id/gi,
  /req\.query\.id/gi,
  /req\.body\.id/gi,
]

// Route patterns
const ROUTE_PATTERNS = [
  /router\.(get|post|put|delete|patch|put|patch)\s*\(/gi,
  /app\.(get|post|put|delete|patch)\s*\(/gi,
  /\.(get|post|put|delete|patch)\s*\(/gi,
]

/**
 * Check dependencies using npm audit
 */
function checkDependencies() {
  const categories = []
  const errors = []
  const warnings = []
  
  // Check server dependencies
  const serverPackageJson = path.join(SERVER_ROOT, 'package.json')
  if (fs.existsSync(serverPackageJson)) {
    try {
      const auditCommand = `cd "${SERVER_ROOT}" && npm audit --json 2>/dev/null || echo '{}'`
      const auditOutput = execSync(auditCommand, { encoding: 'utf-8', cwd: PROJECT_ROOT })
      const auditData = JSON.parse(auditOutput)
      
      if (auditData.vulnerabilities) {
        for (const [packageName, vulnData] of Object.entries(auditData.vulnerabilities)) {
          const vuln = vulnData
          const severity = vuln.severity || 'unknown'
          
          const issue = {
            package: packageName,
            version: vuln.version || 'unknown',
            severity,
            advisory: vuln.url || vuln.id || 'N/A',
            path: vuln.path || packageName,
          }
          
          if (severity === 'high' || severity === 'critical') {
            errors.push(issue)
          } else if (severity === 'moderate' || severity === 'low') {
            warnings.push(issue)
          }
        }
      }
    } catch (_error) {
      // npm audit may fail if vulnerabilities exist, but we've parsed the output
    }
  }
  
  // Check client dependencies
  const clientPackageJson = path.join(CLIENT_ROOT, 'package.json')
  if (fs.existsSync(clientPackageJson)) {
    try {
      const auditCommand = `cd "${CLIENT_ROOT}" && npm audit --json 2>/dev/null || echo '{}'`
      const auditOutput = execSync(auditCommand, { encoding: 'utf-8', cwd: PROJECT_ROOT })
      const auditData = JSON.parse(auditOutput)
      
      if (auditData.vulnerabilities) {
        for (const [packageName, vulnData] of Object.entries(auditData.vulnerabilities)) {
          const vuln = vulnData
          const severity = vuln.severity || 'unknown'
          
          const issue = {
            package: packageName,
            version: vuln.version || 'unknown',
            severity,
            advisory: vuln.url || vuln.id || 'N/A',
            path: vuln.path || packageName,
          }
          
          if (severity === 'high' || severity === 'critical') {
            errors.push(issue)
          } else if (severity === 'moderate' || severity === 'low') {
            warnings.push(issue)
          }
        }
      }
    } catch (_error) {
      // npm audit may fail if vulnerabilities exist
    }
  }
  
  const score = errors.length * 10 + warnings.length * 5
  categories.push({
    id: 'dependencies',
    name: 'Dependency Vulnerabilities',
    errors,
    warnings,
    score,
  })
  
  return categories
}

/**
 * Check for exposed secrets
 */
function checkSecrets(files) {
  const categories = []
  const errors = []
  const warnings = []
  const fileIssues = new Map()
  
  for (const absPath of files) {
    const repoPath = toRepoPath(absPath)
    if (shouldExcludeDir(repoPath)) continue
    
    try {
      const content = fs.readFileSync(absPath, 'utf-8')
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        // Skip if line contains process.env (environment variable usage)
        if (line.includes('process.env') || line.includes('import.meta.env')) {
          return
        }
        
        // Check each pattern
        for (const { pattern, name, severity } of SECRET_PATTERNS) {
          const matches = Array.from(line.matchAll(pattern))
          
          for (const _match of matches) {
            // Skip if it's a comment explaining why it's safe
            if (line.trim().startsWith('//') && (line.includes('safe') || line.includes('example'))) {
              continue
            }
            
            const issue = {
              file: repoPath,
              line: index + 1,
              pattern: name,
              issue: `Potential ${name.toLowerCase()} found`,
              severity,
            }
            
            if (!fileIssues.has(repoPath)) {
              fileIssues.set(repoPath, [])
            }
            fileIssues.get(repoPath).push(issue)
            
            if (severity === 'error') {
              errors.push(issue)
            } else {
              warnings.push(issue)
            }
          }
        }
      })
    } catch (_error) {
      // Skip files we can't read
    }
  }
  
  const score = errors.length * 15 + warnings.length * 5
  categories.push({
    id: 'secrets',
    name: 'Exposed Secrets',
    errors,
    warnings,
    score,
    fileIssues: Object.fromEntries(fileIssues),
  })
  
  return categories
}

/**
 * Check security configuration
 */
function checkConfig() {
  const categories = []
  const errors = []
  const warnings = []
  
  // Check for default credentials in config files
  const configFiles = [
    path.join(SERVER_ROOT, '.env'),
    path.join(SERVER_ROOT, '.env.example'),
    path.join(SERVER_SRC, 'config', 'database.ts'),
    path.join(SERVER_SRC, 'config', 'database.mjs'),
  ]
  
  for (const configFile of configFiles) {
    if (fs.existsSync(configFile)) {
      try {
        const content = fs.readFileSync(configFile, 'utf-8')
        const repoPath = toRepoPath(configFile)
        
        // Check for default passwords
        if (content.match(/password\s*[:=]\s*["'](password|admin|123456|changeme|default)["']/gi)) {
          errors.push({
            file: repoPath,
            issue: 'Default password detected',
            severity: 'error',
          })
        }
        
        // Check for default usernames
        if (content.match(/username\s*[:=]\s*["'](admin|root|user|test)["']/gi)) {
          warnings.push({
            file: repoPath,
            message: 'Default username detected',
          })
        }
      } catch (_error) {
        // Skip files we can't read
      }
    }
  }
  
  // Check for CORS configuration
  const appFiles = [
    path.join(SERVER_SRC, 'app.ts'),
    path.join(SERVER_SRC, 'index.ts'),
  ]
  
  let hasCORS = false
  let hasHelmet = false
  
  for (const appFile of appFiles) {
    if (fs.existsSync(appFile)) {
      try {
        const content = fs.readFileSync(appFile, 'utf-8')
        if (/cors/i.test(content)) {
          hasCORS = true
        }
        if (/helmet/i.test(content)) {
          hasHelmet = true
        }
      } catch (_error) {
        // Skip
      }
    }
  }
  
  if (!hasCORS) {
    warnings.push({
      file: 'server/src/app.ts',
      message: 'CORS configuration not detected',
    })
  }
  
  if (!hasHelmet) {
    warnings.push({
      file: 'server/src/app.ts',
      message: 'Helmet security headers not detected',
    })
  }
  
  const score = errors.length * 10 + warnings.length * 3
  categories.push({
    id: 'config',
    name: 'Security Configuration',
    errors,
    warnings,
    score,
  })
  
  return categories
}

/**
 * Check CSRF protection
 */
function checkCSRF(files) {
  const categories = []
  const errors = []
  const warnings = []
  const fileIssues = new Map()
  
  // Check for global CSRF middleware
  const appFiles = [
    path.join(SERVER_SRC, 'app.ts'),
    path.join(SERVER_SRC, 'index.ts'),
  ]
  
  let globalCSRF = false
  for (const appFile of appFiles) {
    if (fs.existsSync(appFile)) {
      try {
        const content = fs.readFileSync(appFile, 'utf-8')
        if (CSRF_PATTERNS.some(pattern => pattern.test(content))) {
          globalCSRF = true
          break
        }
      } catch (_error) {
        // Skip
      }
    }
  }
  
  // Scan route files
  for (const absPath of files) {
    const repoPath = toRepoPath(absPath)
    if (shouldExcludeDir(repoPath)) continue
    if (!repoPath.includes('route') && !repoPath.includes('router')) continue
    
    try {
      const content = fs.readFileSync(absPath, 'utf-8')
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        // Check for state-changing methods
        for (const method of STATE_CHANGING_METHODS) {
          // eslint-disable-next-line security/detect-non-literal-regexp
          const methodPattern = new RegExp(`\\.${method}\\s*\\(`, 'gi')
          if (methodPattern.test(line)) {
            // Check if CSRF protection exists in file
            const hasCSRF = CSRF_PATTERNS.some(pattern => pattern.test(content))
            
            if (!hasCSRF && !globalCSRF) {
              const routeMatch = line.match(/['"`]([^'"`]+)['"`]/)
              const route = routeMatch ? routeMatch[1] : 'unknown'
              
              const issue = {
                file: repoPath,
                line: index + 1,
                route,
                method: method.toUpperCase(),
                issue: `Missing CSRF protection on ${method.toUpperCase()} route`,
                severity: 'error',
              }
              
              if (!fileIssues.has(repoPath)) {
                fileIssues.set(repoPath, [])
              }
              fileIssues.get(repoPath).push(issue)
              
              errors.push(issue)
            }
          }
        }
      })
    } catch (_error) {
      // Skip files we can't read
    }
  }
  
  const score = errors.length * 12 + warnings.length * 4
  categories.push({
    id: 'csrf',
    name: 'CSRF Protection',
    errors,
    warnings,
    score,
    fileIssues: Object.fromEntries(fileIssues),
  })
  
  return categories
}

/**
 * Check authentication patterns
 */
function checkAuth(files) {
  const categories = []
  const errors = []
  const warnings = []
  const fileIssues = new Map()
  
  // Check for global auth middleware
  const appFiles = [
    path.join(SERVER_SRC, 'app.ts'),
    path.join(SERVER_SRC, 'index.ts'),
  ]
  
  let globalAuth = false
  for (const appFile of appFiles) {
    if (fs.existsSync(appFile)) {
      try {
        const content = fs.readFileSync(appFile, 'utf-8')
        if (AUTH_PATTERNS.some(pattern => pattern.test(content))) {
          globalAuth = true
          break
        }
      } catch (_error) {
        // Skip
      }
    }
  }
  
  // Scan route files for protected routes without auth
  for (const absPath of files) {
    const repoPath = toRepoPath(absPath)
    if (shouldExcludeDir(repoPath)) continue
    if (!repoPath.includes('route') && !repoPath.includes('router')) continue
    
    try {
      const content = fs.readFileSync(absPath, 'utf-8')
      const _lines = content.split('\n')
      
      // Check if file has auth patterns
      const hasAuth = AUTH_PATTERNS.some(pattern => pattern.test(content))
      
      // Check for routes that might need protection (containing sensitive keywords)
      const sensitiveKeywords = ['user', 'admin', 'account', 'profile', 'payment', 'order', 'data']
      const hasSensitiveRoutes = sensitiveKeywords.some(keyword => 
        content.toLowerCase().includes(keyword) && ROUTE_PATTERNS.some(pattern => pattern.test(content))
      )
      
      if (hasSensitiveRoutes && !hasAuth && !globalAuth) {
        const issue = {
          file: repoPath,
          line: 1,
          route: 'multiple',
          method: 'various',
          issue: 'Sensitive routes detected without authentication',
          severity: 'warning',
        }
        
        if (!fileIssues.has(repoPath)) {
          fileIssues.set(repoPath, [])
        }
        fileIssues.get(repoPath).push(issue)
        
        warnings.push(issue)
      }
    } catch (_error) {
      // Skip files we can't read
    }
  }
  
  const score = errors.length * 15 + warnings.length * 5
  categories.push({
    id: 'auth',
    name: 'Authentication Patterns',
    errors,
    warnings,
    score,
    fileIssues: Object.fromEntries(fileIssues),
  })
  
  return categories
}

/**
 * Check IDOR vulnerabilities
 */
function checkIDOR(files) {
  const categories = []
  const errors = []
  const warnings = []
  const fileIssues = new Map()
  
  // Scan controller/route files
  for (const absPath of files) {
    const repoPath = toRepoPath(absPath)
    if (shouldExcludeDir(repoPath)) continue
    if (!repoPath.includes('route') && !repoPath.includes('router') && !repoPath.includes('controller')) {
      continue
    }
    
    try {
      const content = fs.readFileSync(absPath, 'utf-8')
      const lines = content.split('\n')
      
      let hasIDParams = false
      let hasAuthorization = false
      
      lines.forEach((line, index) => {
        // Check for ID parameters
        if (ID_PATTERNS.some(pattern => pattern.test(line))) {
          hasIDParams = true
        }
        
        // Check for authorization
        if (AUTHORIZATION_PATTERNS.some(pattern => pattern.test(line))) {
          hasAuthorization = true
        }
      })
      
      if (hasIDParams && !hasAuthorization) {
        const issue = {
          file: repoPath,
          line: 1,
          route: 'multiple',
          method: 'various',
          issue: 'ID parameters detected without authorization checks',
          severity: 'error',
        }
        
        if (!fileIssues.has(repoPath)) {
          fileIssues.set(repoPath, [])
        }
        fileIssues.get(repoPath).push(issue)
        
        errors.push(issue)
      }
    } catch (_error) {
      // Skip files we can't read
    }
  }
  
  const score = errors.length * 12 + warnings.length * 4
  categories.push({
    id: 'idor',
    name: 'IDOR Vulnerabilities',
    errors,
    warnings,
    score,
    fileIssues: Object.fromEntries(fileIssues),
  })
  
  return categories
}

function assignPriority(score, config) {
  const p0Min = Number(config?.priorities?.p0MinSeverityScore ?? 15)
  const p1Min = Number(config?.priorities?.p1MinSeverityScore ?? 8)
  
  if (score >= p0Min) return 'P0'
  if (score >= p1Min) return 'P1'
  return 'P2'
}

function calculateFileScore(fileIssues) {
  if (!fileIssues || fileIssues.length === 0) return 0
  
  let score = 0
  for (const issue of fileIssues) {
    if (issue.severity === 'error') {
      score += 10
    } else {
      score += 3
    }
  }
  return score
}

function renderMarkdownReport(data) {
  const { categories, files, summary } = data
  const lines = []
  lines.push('# Security Audit (Generated)')
  lines.push('')
  lines.push('This file is generated by `client/.scripts/security-audit.mjs`.')
  lines.push('')
  lines.push('Scope:')
  lines.push('- Included: `server/src/**/*.{ts,mjs}` for route/controller scanning')
  lines.push('- Dependencies: `server/` and `client/` package.json')
  lines.push('- Excluded: `**/__tests__/**`, `**/*.test.*`, `**/*.spec.*`, `node_modules`, `dist`')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total errors: **${summary.totalErrors}**`)
  lines.push(`- Total warnings: **${summary.totalWarnings}**`)
  lines.push(`- Files with issues: **${files.length}**`)
  lines.push('')
  lines.push('## Categories')
  lines.push('')
  lines.push('| Category | Priority | Score | Errors | Warnings |')
  lines.push('| --- | --- | ---: | ---: | ---: |')
  
  for (const cat of categories) {
    const priority = assignPriority(cat.score, { priorities: { p0MinSeverityScore: 15, p1MinSeverityScore: 8 } })
    lines.push(
      `| ${cat.name} | ${priority} | ${cat.score} | ${cat.errors.length} | ${cat.warnings.length} |`
    )
  }
  
  lines.push('')
  lines.push('## Issues by File (sorted by priority)')
  lines.push('')
  lines.push('Legend: **P0** = critical (fix soon), **P1** = important (high leverage), **P2** = low priority (best practices)')
  lines.push('')
  
  // Sort files by priority, then by score
  const priorityOrder = { P0: 0, P1: 1, P2: 2 }
  const sortedFiles = files.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 2
    const bPriority = priorityOrder[b.priority] ?? 2
    if (aPriority !== bPriority) return aPriority - bPriority
    return b.score - a.score
  })
  
  for (const fileData of sortedFiles) {
    if (fileData.issues.length === 0) continue
    
    lines.push(`### \`${fileData.repoPath}\` [${fileData.priority}] (score: ${fileData.score})`)
    lines.push('')
    
    for (const issue of fileData.issues) {
      const severity = issue.severity === 'error' ? '❌' : '⚠️'
      const lineInfo = issue.line ? ` (line ${issue.line})` : ''
      lines.push(`- ${severity} **${issue.issue}**${lineInfo}`)
      if (issue.route && issue.route !== 'multiple') {
        lines.push(`  - Route: ${issue.route} (${issue.method})`)
      }
    }
    
    lines.push('')
  }
  
  return lines.join('\n')
}

function main() {
  ensureDir(OUT_DIR)
  
  // Load priority config
  let priorityConfig = {}
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
      priorityConfig = JSON.parse(configRaw)
    }
  } catch (_error) {
    // Config might not exist or be invalid, use defaults
  }
  
  // Get server files
  const serverFiles = listFilesRecursive(SERVER_SRC)
  
  // Run all security checks
  const allCategories = []
  allCategories.push(...checkDependencies())
  allCategories.push(...checkSecrets(serverFiles))
  allCategories.push(...checkConfig())
  allCategories.push(...checkCSRF(serverFiles))
  allCategories.push(...checkAuth(serverFiles))
  allCategories.push(...checkIDOR(serverFiles))
  
  // Calculate summary
  const totalErrors = allCategories.reduce((sum, cat) => sum + cat.errors.length, 0)
  const totalWarnings = allCategories.reduce((sum, cat) => sum + cat.warnings.length, 0)
  
  // Group issues by file
  const fileMap = new Map()
  
  for (const category of allCategories) {
    // Add category-level issues
    for (const error of category.errors) {
      if (error.file) {
        if (!fileMap.has(error.file)) {
          fileMap.set(error.file, {
            id: toStableId(error.file),
            repoPath: error.file,
            categories: [],
            issues: [],
            score: 0,
          })
        }
        const fileData = fileMap.get(error.file)
        if (!fileData.categories.includes(category.id)) {
          fileData.categories.push(category.id)
        }
        fileData.issues.push(error)
      }
    }
    
    for (const warning of category.warnings) {
      if (warning.file) {
        if (!fileMap.has(warning.file)) {
          fileMap.set(warning.file, {
            id: toStableId(warning.file),
            repoPath: warning.file,
            categories: [],
            issues: [],
            score: 0,
          })
        }
        const fileData = fileMap.get(warning.file)
        if (!fileData.categories.includes(category.id)) {
          fileData.categories.push(category.id)
        }
        fileData.issues.push(warning)
      }
    }
    
    // Add file-specific issues from fileIssues
    if (category.fileIssues) {
      for (const [filePath, issues] of Object.entries(category.fileIssues)) {
        if (!fileMap.has(filePath)) {
          fileMap.set(filePath, {
            id: toStableId(filePath),
            repoPath: filePath,
            categories: [],
            issues: [],
            score: 0,
          })
        }
        const fileData = fileMap.get(filePath)
        if (!fileData.categories.includes(category.id)) {
          fileData.categories.push(category.id)
        }
        fileData.issues.push(...issues)
      }
    }
  }
  
  // Calculate scores and priorities for files
  const files = Array.from(fileMap.values()).map(fileData => {
    const fileScore = calculateFileScore(fileData.issues)
    const filePriority = assignPriority(fileScore, priorityConfig)
    return {
      ...fileData,
      score: fileScore,
      priority: filePriority,
    }
  })
  
  // Assign priorities to categories
  const categoriesWithPriority = allCategories.map(cat => {
    const catPriority = assignPriority(cat.score, priorityConfig)
    return {
      ...cat,
      priority: catPriority,
    }
  })
  
  const out = {
    generatedAt: new Date().toISOString(),
    scope: {
      included: ['server/src/**/*.{ts,mjs}'],
      excluded: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'node_modules', 'dist'],
    },
    summary: {
      totalErrors,
      totalWarnings,
      byCategory: Object.fromEntries(
        categoriesWithPriority.map(cat => [cat.id, { errors: cat.errors.length, warnings: cat.warnings.length }])
      ),
    },
    categories: categoriesWithPriority,
    files,
  }
  
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
  fs.writeFileSync(OUT_MD, renderMarkdownReport(out))
  
  console.log(`Wrote:\n- ${toRepoPath(OUT_JSON)}\n- ${toRepoPath(OUT_MD)}`)
  console.log(`Files scanned: ${serverFiles.length}`)
  console.log(`Findings: ${totalErrors} error(s), ${totalWarnings} warning(s)`)
  process.exitCode = 0
}

main()
