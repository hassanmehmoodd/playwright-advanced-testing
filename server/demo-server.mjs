import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { basename, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(fileURLToPath(new URL('../fixtures/demo-app/', import.meta.url))).replace(
  /[/\\]+$/,
  '',
);
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);

const pages = new Map([
  ['/', 'index.html'],
  ['/form', 'form.html'],
  ['/storage', 'storage.html'],
  ['/dynamic', 'dynamic.html'],
  ['/locale', 'locale.html'],
  ['/network', 'network.html'],
  ['/upload', 'upload.html'],
  ['/errors', 'errors.html'],
  ['/a11y-broken', 'a11y-broken.html'],
  ['/frame', 'frame.html'],
]);

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2'],
]);

const tasks = {
  tasks: [
    { id: 'T-1042', title: 'Confirm carrier pickup window', owner: 'Intake' },
    { id: 'T-1048', title: 'Review damaged-crate report', owner: 'Coding' },
    { id: 'T-1055', title: 'Schedule dock follow-up', owner: 'Clinic' },
  ],
};

function send(res, status, body, headers = {}) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(body);
  res.writeHead(status, {
    'cache-control': 'no-store',
    'content-length': String(payload.length),
    ...headers,
  });
  res.end(payload);
}

function sendJson(res, status, value) {
  send(res, status, JSON.stringify(value), {
    'content-type': 'application/json; charset=utf-8',
  });
}

function readCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator);
    cookies[key] = decodeURIComponent(trimmed.slice(separator + 1));
  }
  return cookies;
}

function resolveInsideRoot(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relative = decoded.replace(/^\/+/, '');
  const full = normalize(join(root, relative));
  if (full !== root && !full.startsWith(root + sep)) return null;
  return full;
}

async function readBody(req, limit = 600_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error('payload too large');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseUploadedFile(body, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!match) return null;

  const boundary = match[1] || match[2];
  const source = body.toString('latin1');
  for (const part of source.split(`--${boundary}`)) {
    const filenameMatch = /filename="([^"]*)"/i.exec(part);
    if (!filenameMatch) continue;

    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    let data = part.slice(headerEnd + 4);
    if (data.endsWith('\r\n')) data = data.slice(0, -2);

    const filename = basename(filenameMatch[1] || '');
    if (!filename) return null;
    return { filename, bytes: Buffer.byteLength(data, 'latin1') };
  }
  return null;
}

async function sendFile(res, filePath, status, extraHeaders = {}) {
  const body = await readFile(filePath);
  const extension = filePath.slice(filePath.lastIndexOf('.'));
  send(res, status, body, {
    'content-type': types.get(extension) || 'application/octet-stream',
    ...extraHeaders,
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    const { pathname } = url;

    if (req.method === 'GET' && pathname === '/health') {
      send(res, 200, 'ok', { 'content-type': 'text/plain; charset=utf-8' });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/tasks') {
      sendJson(res, 200, tasks);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/activity') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      sendJson(res, 200, { title: 'Dock inspection', state: 'Ready' });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/session') {
      const cookies = readCookies(req.headers.cookie);
      sendJson(res, 200, { session: cookies.harbor_session || '' });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/status/500') {
      sendJson(res, 500, { error: 'upstream unavailable' });
      return;
    }

    if (req.method === 'GET' && pathname === '/files/release-notes.txt') {
      await sendFile(res, join(root, 'files', 'release-notes.txt'), 200, {
        'content-disposition': 'attachment; filename="release-notes.txt"',
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/upload') {
      const body = await readBody(req);
      const uploaded = parseUploadedFile(body, req.headers['content-type']);
      if (!uploaded) {
        sendJson(res, 400, { error: 'Choose a file first.' });
        return;
      }
      sendJson(res, 200, { ok: true, filename: uploaded.filename, bytes: uploaded.bytes });
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }

    const page = pages.get(pathname);
    if (page) {
      await sendFile(res, join(root, page), 200);
      return;
    }

    const filePath = resolveInsideRoot(pathname);
    if (filePath) {
      try {
        const info = await stat(filePath);
        if (info.isFile()) {
          if (req.method === 'HEAD') {
            res.writeHead(200, { 'cache-control': 'no-store' });
            res.end();
            return;
          }
          await sendFile(res, filePath, 200);
          return;
        }
      } catch {
        // Fall through to the not-found page.
      }
    }

    if (pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }

    await sendFile(res, join(root, 'not-found.html'), 404);
  } catch (error) {
    const status = error.status || 500;
    sendJson(res, status, { error: status === 413 ? 'file is too large' : 'server error' });
  }
});

server.listen(port, host, () => {
  console.log(`Harbor Desk listening on http://${host}:${port}`);
});
