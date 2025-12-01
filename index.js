/**
 * This is a CJS wrapper to run this app in a modern shared hosting environment with Node app support.
 * By default there is inject PORT and HOST, these are managed by the Node server internally
*/
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * A function to load a static file
 */
function loadPage(relativePath) {
  const fullPath = path.resolve(__dirname, relativePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    return content;
  } catch (err) {
    return `<html><head><meta charset="utf-8"><title>500</title></head>
            <body><h1>500 - Internal Server Error</h1>
            <p>Page not found</p>
            </body></html>`;
  }
}

// 1. Define the port (Hosting providers usually inject 'PORT' env var)
//const port = process.env.PORT || 3000;

// 2. Explicitly set Nitro's port to match the hosting port
//process.env.NITRO_PORT = port;
//process.env.NITRO_HOST = '0.0.0.0';

// 3. Use an async function to import the ES Module build
(async () => {
  try {
    // Adjust this path to point to your uploaded .output/server/index.mjs
    const serverPath = path.join(__dirname, '.output', 'server', 'index.mjs');
    
    // Dynamic import allows loading ESM in a CommonJS file
    await import(serverPath);
    
    //console.log(`Nuxt Bridge: Server started on port ${port}`);
  } catch (error) {
    //console.error('Nuxt Bridge Error:', error);
    //process.exit(1);
    const server = http.createServer(function (req, res) {
      if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(loadPage('./index.html'));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      }
    });
    
    server.listen();
  }
})();

