#!/usr/bin/env node

const clientBaseUrl = stripTrailingSlash(process.env.RENDER_SMOKE_CLIENT_URL ?? 'http://localhost:3002')
const apiBaseUrl = stripTrailingSlash(process.env.RENDER_SMOKE_API_URL ?? 'http://localhost:3001')

const clientChecks = [
  { name: 'client app shell', url: `${clientBaseUrl}/`, expect: htmlDocument },
  { name: 'booking wizard route', url: `${clientBaseUrl}/booking`, expect: htmlDocument },
  { name: 'admin route', url: `${clientBaseUrl}/admin`, expect: htmlDocument },
]

const apiChecks = [
  { name: 'api root', url: `${apiBaseUrl}/`, expect: jsonResponse },
  { name: 'csrf endpoint', url: `${apiBaseUrl}/api/v1/internal/auth/csrf-token`, expect: csrfResponse },
]

function stripTrailingSlash(value) {
  return String(value).replace(/\/+$/, '')
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function responseText(response) {
  return await response.text()
}

async function htmlDocument(response) {
  const body = await responseText(response)
  assert(response.ok, `Expected HTTP 2xx, received ${response.status}`)
  assert(body.includes('<html') || body.includes('<div id="app"'), 'Expected an HTML app shell')
}

async function jsonResponse(response) {
  assert(response.ok, `Expected HTTP 2xx, received ${response.status}`)
  const contentType = response.headers.get('content-type') ?? ''
  assert(contentType.includes('application/json'), `Expected JSON response, received ${contentType}`)
  await response.json()
}

async function csrfResponse(response) {
  assert(response.ok, `Expected HTTP 2xx, received ${response.status}`)
  const data = await response.json()
  assert(typeof data.csrfToken === 'string' && data.csrfToken.length > 0, 'Expected csrfToken string')
}

async function runCheck(check) {
  const response = await fetch(check.url, { redirect: 'follow' })
  await check.expect(response)
  console.log(`ok - ${check.name}`)
}

async function main() {
  console.log(`Smoke target client: ${clientBaseUrl}`)
  console.log(`Smoke target API: ${apiBaseUrl}`)
  for (const check of [...clientChecks, ...apiChecks]) {
    await runCheck(check)
  }
}

main().catch((error) => {
  console.error(`smoke failed - ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
