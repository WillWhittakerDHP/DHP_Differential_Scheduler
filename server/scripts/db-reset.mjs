/**
 * Reset database: drop, recreate, migrate
 * Uses DB_* env vars from server .env / .env.development
 */

import { config } from 'dotenv';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(__dirname, '..');

// Load env (try .env.development first, then .env)
config({ path: join(serverRoot, '.env.development') });
config({ path: join(serverRoot, '.env') });

const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'jklJKL';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'scheduler_db';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
if (!LOCAL_HOSTS.has(dbHost)) {
  console.error(
    `❌ Database reset blocked: DB_HOST is "${dbHost}" (remote).\n` +
    `   Only the database host machine may drop/recreate the database.\n` +
    `   Run this on the machine that hosts PostgreSQL.`
  );
  process.exit(1);
}

const env = { ...process.env, PGPASSWORD: dbPassword };

console.log(`🔄 Resetting database ${dbName} as ${dbUser}@${dbHost}:${dbPort}...`);

// Terminate other connections so dropdb can proceed
const terminateSql = `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbName}' AND pid <> pg_backend_pid();`;
execSync(`psql -U "${dbUser}" -h "${dbHost}" -p "${dbPort}" -d postgres -c "${terminateSql}"`, {
  stdio: 'pipe',
  env,
});

execSync(`dropdb -U "${dbUser}" -h "${dbHost}" -p "${dbPort}" "${dbName}"`, {
  stdio: 'inherit',
  env,
});

execSync(`createdb -U "${dbUser}" -h "${dbHost}" -p "${dbPort}" "${dbName}"`, {
  stdio: 'inherit',
  env,
});

console.log('✅ Database reset. Running migrations...');
execSync('npm run migrate', {
  stdio: 'inherit',
  cwd: serverRoot,
  env: process.env,
});

console.log('✅ Done.');
