/**
 * Generate Gmail MCP client_creds.json from existing server .env (GOOGLE_CLIENT_ID,
 * GOOGLE_CLIENT_SECRET). Writes to ~/.cursor/gmail-mcp/client_creds.json so the
 * Gmail MCP can use the same OAuth client as the app (after Gmail API + scope are
 * enabled in Google Cloud). Run from server dir: node scripts/write-gmail-mcp-creds.mjs
 *
 * @see .cursor/GMAIL_MCP_SETUP.md
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server .env (prefer .env.development so we don't touch production)
const envPath = path.join(__dirname, '..', '.env.development');
if (!fs.existsSync(envPath)) {
  console.error('Missing env file:', envPath);
  process.exit(1);
}
dotenv.config({ path: envPath });

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in', envPath);
  process.exit(1);
}

// Desktop app format expected by Gmail MCP (same as Google "Download JSON" for Desktop client)
const creds = {
  installed: {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: ['http://localhost'],
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  },
};

const outDir = path.join(os.homedir(), '.cursor', 'gmail-mcp');
const outPath = path.join(outDir, 'client_creds.json');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(creds, null, 2), 'utf8');

console.log('Wrote', outPath);
console.log('Run the Gmail MCP once and sign in with the admin dev testing email to create the token file.');
