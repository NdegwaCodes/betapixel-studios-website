import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { SECTIONS } from '../api/enquiry.ts';

const DIST = 'dist';
const OUT = 'release';
const WEB = join(OUT, 'public_html');
const HOST = 'betapixels.studio';

if (!existsSync(join(DIST, 'index.html'))) throw new Error('Run "npm run build" first.');
if (readFileSync(join(DIST, 'index.html'), 'utf8').includes('/_vercel/insights')) throw new Error('dist was built with Vercel Analytics; rebuild locally without VERCEL set.');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(WEB, 'api'), { recursive: true });
cpSync(DIST, WEB, { recursive: true });
cpSync('cpanel/api/enquiry.php', join(WEB, 'api', 'enquiry.php'));
writeFileSync(join(WEB, 'api', 'sections.json'), JSON.stringify(SECTIONS));
cpSync('cpanel/betapixels-config.sample.php', join(OUT, 'betapixels-config.sample.php'));

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const escapeLiteral = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

function toApache(source, destination) {
  const names = [];
  let pattern = '';
  const re = /:(\w+)(\([^)]*\))?|(\([^)]*\))|([^:(]+)/g;
  let m;
  while ((m = re.exec(source))) {
    if (m[1]) { names.push(m[1]); pattern += m[2] ?? '([^/]+)'; }
    else if (m[3]) { names.push(null); pattern += m[3]; }
    else pattern += escapeLiteral(m[4]);
  }
  pattern = pattern.replace(/^\//, '');
  if (pattern.endsWith('/')) pattern = pattern.slice(0, -1) + '/?';
  let dest = destination;
  names.forEach((n, i) => { if (n) dest = dest.replace(`:${n}`, `$${i + 1}`); });
  return `RewriteRule ^${pattern}$ ${dest} [R=301,L,NE]`;
}

const redirects = vercel.redirects.filter((r) => !r.has).map((r) => toApache(r.source, r.destination));

const headerBlock = (headers) => headers.map((h) => `  Header always set ${h.key} "${h.value.replace(/"/g, '\\"')}"`).join('\n');
const OURS = `%{HTTP_HOST} =~ /^(www\\.)?${escapeLiteral(HOST)}$/i`;
const siteHeaders = vercel.headers.filter(({ source }) => source === '/(.*)');
const headerRules = siteHeaders.map(({ headers }) => `  <If "${OURS}">\n${headerBlock(headers).replace(/^/gm, '  ')}\n  </If>`).join('\n');
for (const { source, headers } of vercel.headers.filter((h) => !siteHeaders.includes(h))) {
  const dir = join(WEB, source.replace('(.*)', ''));
  if (existsSync(dir)) writeFileSync(join(dir, '.htaccess'), `<IfModule mod_headers.c>\n${headerBlock(headers)}\n</IfModule>\n`);
}

const htaccess = `Options -Indexes -MultiViews
DirectoryIndex index.html index.php
ErrorDocument 404 /404.html

<IfModule mod_mime.c>
  AddType image/avif .avif
  AddType image/webp .webp
  AddType font/woff2 .woff2
  AddType video/mp4 .mp4
  AddType text/plain .txt
  AddCharset utf-8 .html .css .js .txt .xml .json .svg
</IfModule>

<FilesMatch "(^\\.|\\.(md|mjs|ts|log|ini|sh|sql|bak|config)$|^sections\\.json$)">
  Require all denied
</FilesMatch>

<IfModule mod_rewrite.c>
  RewriteEngine On

  RewriteCond %{HTTP_HOST} !^(www\\.)?${escapeLiteral(HOST)}$ [NC]
  RewriteRule ^ - [L]

  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://${HOST}%{REQUEST_URI} [R=301,L,NE]

  RewriteCond %{HTTP_HOST} ^www\\.${escapeLiteral(HOST)}$ [NC]
  RewriteRule ^ https://${HOST}%{REQUEST_URI} [R=301,L,NE]

  RewriteRule ^api/enquiry/?$ api/enquiry.php [L]

${redirects.map((r) => '  ' + r).join('\n')}
</IfModule>

<IfModule mod_headers.c>
${headerRules}
  <FilesMatch "\\.html$">
    Header always set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
  Header unset X-Powered-By
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript text/javascript application/json application/xml image/svg+xml
</IfModule>
`;
writeFileSync(join(WEB, '.htaccess'), htaccess);

if (process.env.CI) {
  console.log(`cPanel release ready: ${WEB} (${redirects.length} redirects)`);
  process.exit(0);
}
const zip = join(OUT, 'betapixels-cpanel.zip');
execFileSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', `
import os, sys, zipfile
root, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for d, _, files in os.walk(root):
        for f in files:
            p = os.path.join(d, f)
            z.write(p, os.path.relpath(p, root).replace(os.sep, '/'))
`, WEB, zip], { stdio: 'inherit' });
console.log(`cPanel release ready: ${zip} (${redirects.length} redirects)`);
