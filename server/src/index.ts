import app from "./app.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger('Server');

// Convert to number since app.listen() expects a number
const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 3001);

app.listen(PORT, () => {
  // WHY: Output URL format so terminal makes it clickable
  // PATTERN: Most terminals auto-detect URLs when they're on their own line
  const url = `http://localhost:${PORT}`;
  const apiUrl = `${url}/api`;
  
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`\n${url}`);
  logger.info(`${apiUrl}\n`);
});
