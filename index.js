/**
 * This is a CJS wrapper to run this app in a modern shared hosting environment with Node app support
 */
const path = require('path');

// 1. Define the port (Hosting providers usually inject 'PORT' env var)
const port = process.env.PORT || 3000;

// 2. Explicitly set Nitro's port to match the hosting port
process.env.NITRO_PORT = port;
process.env.NITRO_HOST = '0.0.0.0';

// 3. Use an async function to import the ES Module build
(async () => {
  try {
    // Adjust this path to point to your uploaded .output/server/index.mjs
    const serverPath = path.join(__dirname, '.output', 'server', 'index.mjs');
    
    // Dynamic import allows loading ESM in a CommonJS file
    await import(serverPath);
    
    console.log(`Nuxt Bridge: Server started on port ${port}`);
  } catch (error) {
    console.error('Nuxt Bridge Error:', error);
    process.exit(1);
  }
})();