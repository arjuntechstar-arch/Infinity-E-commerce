import fs from 'node:fs';
import path from 'node:path';
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
fs.mkdirSync('licenses', { recursive: true });
const rows = [];
for (const relative of Object.keys(lock.packages).sort()) {
  if (!relative || !fs.existsSync(path.join(relative, 'package.json'))) continue;
  const p = JSON.parse(fs.readFileSync(path.join(relative, 'package.json'), 'utf8'));
  const stem = `${p.name.replaceAll('/', '__').replaceAll('@', '')}-${p.version}`;
  const files = fs.readdirSync(relative).filter(name => /^(licen[cs]e|copying|notice)([.-]|$)/i.test(name) && fs.statSync(path.join(relative, name)).isFile());
  const links = [];
  for (const file of files) { const target = `${stem}-${file}`; fs.copyFileSync(path.join(relative, file), path.join('licenses', target)); links.push(`[${file}](licenses/${target})`); }
  const extra = path.join('licenses', `${stem}-UPSTREAM-LICENSE`);
  if (fs.existsSync(extra)) links.push(`[Upstream license](${extra.replaceAll('\\', '/')})`);
  rows.push(`| ${p.name} | ${p.version} | ${typeof p.license === 'string' ? p.license : JSON.stringify(p.license || p.licenses || 'See package source')} | ${links.join(', ') || 'License identifier in package metadata; inspect upstream source for full terms.'} |`);
}
fs.writeFileSync('THIRD_PARTY_NOTICES.md', '# Third-party notices\n\nGenerated from the installed lockfile dependencies. Includes development tools as well as runtime libraries. Original license/notice files are preserved in `licenses/`. Buyer catalog assets are separate and require their own permissions. Node.js is distributed under its own license; use an official supported runtime.\n\n| Package | Version | Declared license | Notices |\n| --- | --- | --- | --- |\n' + rows.join('\n') + '\n');
console.log(`Recorded ${rows.length} installed package licenses.`);
