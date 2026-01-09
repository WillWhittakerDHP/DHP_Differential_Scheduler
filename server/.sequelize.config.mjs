import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  config: path.resolve(__dirname, "src/db/config/database.mjs"),
  modelsPath: path.resolve(__dirname, "src/db/models"),
  migrationsPath: path.resolve(__dirname, "src/db/migrations"),
  seedersPath: path.resolve(__dirname, "src/db/seeders"),
  migrationTemplatePath: path.resolve(__dirname, "src/db/migrations/migration-template.mjs")
};
