import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import zlib from 'zlib';

const ASSET_MIME_MAP: Record<string, string> = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function toDataUri(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).toLowerCase();
  const mime = ASSET_MIME_MAP[ext];
  if (!mime) return null;
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

async function buildStandaloneOfflineHtml(distDir: string, publicDir: string) {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  const html = fs.readFileSync(indexPath, 'utf8');
  const jsMatch = html.match(/<script[^>]*src="([^"]*\/assets\/[^"]+\.js)"[^>]*><\/script>/i);
  const cssMatch = html.match(/<link[^>]*href="([^"]*\/assets\/[^"]+\.css)"[^>]*>/i);
  if (!jsMatch || !cssMatch) return;

  const jsRelPath = jsMatch[1].replace(/^\/+/, '');
  const cssRelPath = cssMatch[1].replace(/^\/+/, '');
  const jsFullPath = path.resolve(distDir, jsRelPath);
  const cssFullPath = path.resolve(distDir, cssRelPath);
  if (!fs.existsSync(jsFullPath) || !fs.existsSync(cssFullPath)) return;

  // Bundle entry JS + dynamic chunks into a classic IIFE script (works on file:// without CORS)
  const jsResult = await esbuild.build({
    entryPoints: [jsFullPath],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    write: false,
    define: {
      'import.meta.url': 'window.location.href',
      'import.meta.resolve': 'undefined',
    },
  });
  let inlinedJs = jsResult.outputFiles[0].text;

  // Inline any emitted /assets/* media references inside JS (e.g. bundled JPG images)
  inlinedJs = inlinedJs.replace(/(["'])\/assets\/([^"'\s)]+)\1/g, (full, quote, fileName) => {
    const assetPath = path.resolve(distDir, 'assets', fileName);
    const uri = toDataUri(assetPath);
    return uri ? `${quote}${uri}${quote}` : full;
  });

  // Inline CSS fonts (strip redundant .woff fallback when .woff2 precedes it to keep file compact)
  let inlinedCss = fs.readFileSync(cssFullPath, 'utf8');
  inlinedCss = inlinedCss.replace(
    /(url\([^)]+\.woff2\)\s*format\(["']?woff2["']?\))\s*,\s*url\([^)]+\.woff\)\s*format\(["']?woff["']?\)/gi,
    '$1'
  );
  inlinedCss = inlinedCss.replace(/url\((["']?)\/assets\/([^"')]+)\1\)/g, (full, _q, fileName) => {
    const assetPath = path.resolve(distDir, 'assets', fileName);
    const uri = toDataUri(assetPath);
    return uri ? `url(${uri})` : full;
  });

  // Inline SVG app icon if present
  const iconSvgUri = toDataUri(path.join(publicDir, 'icon.svg'));

  // Build self-contained single HTML without external module scripts, links, or manifest
  let standaloneHtml = html
    .replace(/<script[^>]*src="[^"]*\/assets\/[^"]+\.js"[^>]*><\/script>\s*/gi, '')
    .replace(/<link[^>]*href="[^"]*\/assets\/[^"]+\.css"[^>]*>\s*/gi, '')
    .replace(/<link[^>]*rel="manifest"[^>]*>\s*/gi, '')
    .replace(/<link[^>]*rel="apple-touch-icon"[^>]*>\s*/gi, '');

  if (iconSvgUri) {
    standaloneHtml = standaloneHtml.replace(
      /<link[^>]*rel="icon"[^>]*>/i,
      `<link rel="icon" type="image/svg+xml" href="${iconSvgUri}" />`
    );
  }

  standaloneHtml = standaloneHtml.replace('</head>', () => `<style>${inlinedCss}</style>\n  </head>`);
  const safeJs = inlinedJs.replace(/<\/script>/gi, '<\\/script>');
  standaloneHtml = standaloneHtml.replace('</body>', () => `<script>${safeJs}</script>\n  </body>`);

  fs.writeFileSync(path.join(distDir, 'CASHFLOW-Offline.html'), standaloneHtml, 'utf8');
}

const NODE_CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32Buffer(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = NODE_CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZipBuffer(entries: {name: string; data: Buffer}[]): Buffer {
  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((Math.max(1980, now.getFullYear()) - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const crc = crc32Buffer(entry.data);
    const deflated = entry.data.length > 0 ? zlib.deflateRawSync(entry.data, {level: 9}) : entry.data;
    const useDeflate = deflated.length < entry.data.length;
    const payload = useDeflate ? deflated : entry.data;
    const method = useDeflate ? 8 : 0;

    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(entry.data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    localParts.push(localHeader, payload);

    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(entry.data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuf.copy(centralHeader, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + payload.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuf, eocd]);
}

function buildWebIntoAppZip(distDir: string, publicDir: string) {
  const offlineHtmlPath = path.join(distDir, 'CASHFLOW-Offline.html');
  if (!fs.existsSync(offlineHtmlPath)) return;

  const entries: {name: string; data: Buffer}[] = [
    {name: 'index.html', data: fs.readFileSync(offlineHtmlPath)},
  ];

  const iconPngPath = path.join(publicDir, 'pwa-512x512.png');
  if (fs.existsSync(iconPngPath)) {
    entries.push({name: 'icon.png', data: fs.readFileSync(iconPngPath)});
  }
  const iconSvgPath = path.join(publicDir, 'icon.svg');
  if (fs.existsSync(iconSvgPath)) {
    entries.push({name: 'icon.svg', data: fs.readFileSync(iconSvgPath)});
  }

  const zipBuf = buildZipBuffer(entries);
  fs.writeFileSync(path.join(distDir, 'CASHFLOW-WebIntoApp.zip'), zipBuf);
}

function getLatestMtimeMs(targetPath: string): number {
  if (!fs.existsSync(targetPath)) return 0;
  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let maxMtime = stat.mtimeMs;
  for (const entry of fs.readdirSync(targetPath, {withFileTypes: true})) {
    const childPath = path.join(targetPath, entry.name);
    const childMtime = entry.isDirectory()
      ? getLatestMtimeMs(childPath)
      : fs.statSync(childPath).mtimeMs;
    if (childMtime > maxMtime) maxMtime = childMtime;
  }
  return maxMtime;
}

function getLatestProjectSourceMtimeMs(rootDir: string): number {
  return Math.max(
    getLatestMtimeMs(path.join(rootDir, 'src')),
    getLatestMtimeMs(path.join(rootDir, 'public')),
    getLatestMtimeMs(path.join(rootDir, 'index.html')),
    getLatestMtimeMs(path.join(rootDir, 'vite.config.ts'))
  );
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'CASHFLOW — Financial Strategy Simulation',
          short_name: 'CASHFLOW',
          description:
            'Complete offline financial life simulation & strategy game. Build passive income, manage assets & liabilities, and escape the Rat Race.',
          theme_color: '#080E1C',
          background_color: '#080E1C',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,webp,woff,woff2}'],
          globIgnores: ['**/CASHFLOW-Offline.html'],
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      ((): import('vite').Plugin => {
        let isBuild = false;
        return {
          name: 'build-standalone-offline-app',
          configResolved(config) {
            isBuild = config.command === 'build';
          },
          configureServer(server) {
            let pendingBuild: Promise<void> | null = null;
            const ensureFreshOfflineBundles = async () => {
              const distDir = path.resolve(__dirname, 'dist');
              const offlineHtmlPath = path.join(distDir, 'CASHFLOW-Offline.html');
              const webIntoAppZipPath = path.join(distDir, 'CASHFLOW-WebIntoApp.zip');
              const latestSrcMtime = getLatestProjectSourceMtimeMs(__dirname);
              const htmlMtime = fs.existsSync(offlineHtmlPath)
                ? fs.statSync(offlineHtmlPath).mtimeMs
                : 0;
              const zipMtime = fs.existsSync(webIntoAppZipPath)
                ? fs.statSync(webIntoAppZipPath).mtimeMs
                : 0;
              const needsBuild =
                htmlMtime === 0 ||
                zipMtime === 0 ||
                latestSrcMtime > htmlMtime ||
                latestSrcMtime > zipMtime;

              if (needsBuild) {
                if (!pendingBuild) {
                  pendingBuild = (async () => {
                    const {build} = await import('vite');
                    await build();
                  })().finally(() => {
                    pendingBuild = null;
                  });
                }
                await pendingBuild;
              }
              return {offlineHtmlPath, webIntoAppZipPath};
            };

            server.middlewares.use('/CASHFLOW-Offline.html', async (_req, res, next) => {
              try {
                const {offlineHtmlPath} = await ensureFreshOfflineBundles();
                if (fs.existsSync(offlineHtmlPath)) {
                  res.setHeader('Content-Type', 'text/html; charset=utf-8');
                  res.setHeader('Cache-Control', 'no-store');
                  res.end(fs.readFileSync(offlineHtmlPath));
                  return;
                }
                next();
              } catch (err) {
                next(err);
              }
            });

            server.middlewares.use('/CASHFLOW-WebIntoApp.zip', async (_req, res, next) => {
              try {
                const {webIntoAppZipPath} = await ensureFreshOfflineBundles();
                if (fs.existsSync(webIntoAppZipPath)) {
                  res.setHeader('Content-Type', 'application/zip');
                  res.setHeader(
                    'Content-Disposition',
                    'attachment; filename="CASHFLOW-WebIntoApp.zip"'
                  );
                  res.setHeader('Cache-Control', 'no-store');
                  res.end(fs.readFileSync(webIntoAppZipPath));
                  return;
                }
                next();
              } catch (err) {
                next(err);
              }
            });
          },
          async closeBundle(error?: Error): Promise<void> {
            if (error || !isBuild) {
              return;
            }
            const distDir = path.resolve(__dirname, 'dist');
            const publicDir = path.resolve(__dirname, 'public');
            const srcAssets = path.resolve(__dirname, 'src/assets');
            const distAssets = path.resolve(distDir, 'src/assets');
            if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
              fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
            }
            await buildStandaloneOfflineHtml(distDir, publicDir);
            buildWebIntoAppZip(distDir, publicDir);
          },
        };
      })(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
