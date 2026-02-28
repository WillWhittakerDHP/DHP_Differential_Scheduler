/**
 * Sync server Google OAuth tokens to Gmail MCP token file.
 *
 * Uses the same OAuth client and redirect as the app (web flow at GOOGLE_REDIRECT_URI).
 * No separate desktop OAuth — avoids redirect_uri_mismatch and the repeated auth popup.
 *
 * Prerequisites:
 * - Server has completed OAuth at least once (server/.google-tokens.json exists).
 * - GOOGLE_SCOPES includes gmail.modify (server requests it; re-auth once if needed).
 *
 * Run from repo root or server dir:
 *   node server/scripts/sync-gmail-mcp-tokens.mjs
 * Or: npm run gmail-mcp:sync-tokens (from server dir)
 *
 * @see .cursor/GMAIL_MCP_SETUP.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server token file (same as googleOAuthTokenPersistence.ts)
const serverTokenPath = path.join(__dirname, '..', '.google-tokens.json');
const credsPath = path.join(os.homedir(), '.cursor', 'gmail-mcp', 'client_creds.json');
const outDir = path.join(os.homedir(), '.cursor', 'gmail-mcp');
const outPath = path.join(outDir, 'tokens.json');

if (!fs.existsSync(serverTokenPath)) {
  console.error('Server tokens not found:', serverTokenPath);
  console.error('Complete Calendar (and Gmail) OAuth first: visit the server auth URL, then run this again.');
  process.exit(1);
}

if (!fs.existsSync(credsPath)) {
  console.error('Gmail MCP creds not found:', credsPath);
  console.error('Run: npm run gmail-mcp:creds');
  process.exit(1);
}

const serverTokens = JSON.parse(fs.readFileSync(serverTokenPath, 'utf8'));
const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

const clientId = creds.installed?.client_id ?? creds.client_id;
const clientSecret = creds.installed?.client_secret ?? creds.client_secret;

if (!clientId || !clientSecret) {
  console.error('client_id or client_secret missing in', credsPath);
  process.exit(1);
}

if (!serverTokens.refresh_token) {
  console.error('Server token file has no refresh_token. Re-authenticate via the server OAuth URL.');
  process.exit(1);
}

// Format expected by Python google.oauth2.credentials.Credentials.from_authorized_user_file()
// Do not add 'scopes' here: the token was issued for the server's GOOGLE_SCOPES. If we add
// gmail.modify and the token was only issued for Calendar, refresh fails with invalid_scope.
const mcpTokens = {
  client_id: clientId,
  client_secret: clientSecret,
  refresh_token: serverTokens.refresh_token,
  token_uri: 'https://oauth2.googleapis.com/token',
  ...(serverTokens.access_token && { access_token: serverTokens.access_token }),
  ...(serverTokens.expiry_date != null && { expiry_date: serverTokens.expiry_date }),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(mcpTokens, null, 2), 'utf8');

console.log('Wrote', outPath);
console.log('Gmail MCP will use these tokens (same account as Calendar). Restart Cursor if the MCP is running.');
