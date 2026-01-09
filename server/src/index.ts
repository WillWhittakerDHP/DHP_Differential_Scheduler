import app from "./app.js";

// WHY: Use SERVER_PORT from env, fallback to PORT, then default to 3001
// PATTERN: Support both SERVER_PORT and PORT for flexibility
// Convert to number since app.listen() expects a number
const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 3001);

app.listen(PORT, () => {
  // WHY: Output URL format so terminal makes it clickable
  // PATTERN: Most terminals auto-detect URLs when they're on their own line
  const url = `http://localhost:${PORT}`;
  const apiUrl = `${url}/api`;
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`\n${url}`);
  console.log(`${apiUrl}\n`);
});
