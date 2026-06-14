import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'screenshots');
const PORT = Number(process.env.PORT || 4173);
const BASE_URL = process.env.SCREENSHOT_URL;

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-980', width: 980, height: 1200 },
  { name: 'mobile-390', width: 390, height: 844 },
];

function findChrome() {
  const envPath = process.env.CHROME_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  for (const candidate of CHROME_PATHS) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
  };
  return map[ext] || 'application/octet-stream';
}

function createStaticServer(root) {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
    const filePath = path.join(root, relative);

    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': mimeType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });
}

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

async function startServer() {
  const server = createStaticServer(ROOT);
  await new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(PORT, resolve);
  });
  return {
    baseUrl: `http://127.0.0.1:${PORT}`,
    close: () => server.close(),
  };
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('Google Chrome не найден.');
    console.error('Установите Chrome или задайте путь: CHROME_PATH="/path/to/Google Chrome" npm run screenshots');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const runDir = path.join(OUT_DIR, timestamp());
  fs.mkdirSync(runDir, { recursive: true });

  let baseUrl = BASE_URL;
  let server = null;

  if (!baseUrl) {
    try {
      server = await startServer();
      baseUrl = server.baseUrl;
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.error(`Порт ${PORT} занят. Задайте SCREENSHOT_URL=http://127.0.0.1:${PORT} или PORT=другой_порт`);
      }
      throw error;
    }
  }

  console.log(`Chrome: ${chromePath}`);
  console.log(`URL: ${baseUrl}`);
  console.log(`Скриншоты: ${runDir}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();

    for (const viewport of VIEWPORTS) {
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
      });

      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 60000 });

      const viewportPath = path.join(runDir, `${viewport.name}-viewport.png`);
      await page.screenshot({ path: viewportPath, fullPage: false });
      console.log(`  ✓ ${viewport.name}-viewport.png`);

      const fullPath = path.join(runDir, `${viewport.name}-full.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log(`  ✓ ${viewport.name}-full.png`);
    }

    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${baseUrl}/#form`, { waitUntil: 'networkidle0', timeout: 60000 });
    const formPath = path.join(runDir, 'desktop-form-section.png');
    await page.screenshot({ path: formPath, fullPage: false });
    console.log(`  ✓ desktop-form-section.png`);
  } finally {
    await browser.close();
    if (server) server.close();
  }

  console.log('\nГотово. Проверьте скриншоты перед push на GitHub.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
