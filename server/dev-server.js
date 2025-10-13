/**
 * dev-server.js
 * Simple static HTTP server with CORS and cache headers to serve the site locally.
 * Eliminates file:// protocol issues and reduces JSON refetch churn.
 *
 * Usage:
 *   node server/dev-server.js
 *   PORT=3000 node server/dev-server.js
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.env.PORT, 10) || 8080;
// Serve project root (one level up from this file)
const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_FILE = 'index.html';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4'
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Accept-Ranges': 'bytes'
  };
}

function safeJoin(base, target) {
  const normalized = path.normalize(target).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(base, normalized);
  // Prevent path traversal
  if (!fullPath.startsWith(base)) return null;
  return fullPath;
}

function sendNotFound(res) {
  const headers = {
    ...corsHeaders(),
    'Content-Type': 'text/plain; charset=utf-8'
  };
  res.writeHead(404, headers);
  res.end('404 Not Found');
}

function serveIndex(res) {
  const indexPath = path.join(ROOT_DIR, DEFAULT_FILE);
  fs.readFile(indexPath, (err, data) => {
    if (err) return sendNotFound(res);
    const headers = {
      ...corsHeaders(),
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    res.end(data);
  });
}

function serveFile(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback to index.html for non-asset routes
      return serveIndex(res);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      ...corsHeaders(),
      'Content-Type': contentType
    };

    // Lightweight cache policy: cache assets longer, JSON shorter
    if (ext === '.json') {
      headers['Cache-Control'] = 'public, max-age=300'; // 5 minutes
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=86400'; // 1 day
    }

    const stream = fs.createReadStream(filePath);
    stream.on('open', () => {
      res.writeHead(200, headers);
      stream.pipe(res);
    });
    stream.on('error', () => {
      sendNotFound(res);
    });
  });
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    const headers = {
      ...corsHeaders(),
      'Cache-Control': 'max-age=86400'
    };
    res.writeHead(204, headers);
    return res.end();
  }

  const parsed = url.parse(req.url);
  let pathname = decodeURIComponent(parsed.pathname || '/');

  // Default file and SPA handling
  if (pathname.endsWith('/')) {
    pathname = path.join(pathname, DEFAULT_FILE);
  }

  const filePath = safeJoin(ROOT_DIR, pathname);
  if (!filePath) {
    const headers = {
      ...corsHeaders(),
      'Content-Type': 'text/plain; charset=utf-8'
    };
    res.writeHead(403, headers);
    return res.end('403 Forbidden');
  }

  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log(`Serving directory: ${ROOT_DIR}`);
  console.log('CORS: enabled (*), JSON cache: 5m, assets cache: 1d');
  console.log('Tip: Open the surf map via the site navigation to ensure modules load correctly.');
});