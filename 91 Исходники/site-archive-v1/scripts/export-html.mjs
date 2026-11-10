import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const mobile = process.argv.includes('--mobile');
const require = createRequire(path.join(root, 'package.json'));
const viteRequire = createRequire(require.resolve('vite'));
const { build } = viteRequire('esbuild');
let app = await readFile(path.join(root, 'src/App.jsx'), 'utf8');
app = app.replaceAll('window.location.pathname', "(window.location.hash.slice(1).split('#')[0] || '/')")
 .replaceAll("'popstate'", "'hashchange'")
 .replace("window.history.pushState({},'',to)", 'window.location.hash=to')
 .replace('href={to}', "href={'#'+to}");
for (const name of ['hero', 'warehouse']) {
 const bytes = await readFile(path.join(root, `public/images/${name}.jpg`));
 app = app.replaceAll(`/images/${name}.jpg`, `data:image/jpeg;base64,${bytes.toString('base64')}`);
}
const result = await build({
 stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {App} from './standalone-app.jsx'; createRoot(document.getElementById('root')).render(<App/>);`, resolveDir:root, loader:'jsx' },
 bundle:true, write:false, minify:true, format:'iife', target:['es2020'], define:{'process.env.NODE_ENV':'"production"'}, jsx:'automatic',
 plugins:[{name:'standalone-app',setup(b){b.onResolve({filter:/standalone-app\.jsx$/},()=>({path:'standalone-app',namespace:'standalone'}));b.onLoad({filter:/.*/,namespace:'standalone'},()=>({contents:app,loader:'jsx',resolveDir:root}));}}]
});
let css = await readFile(path.join(root,'src/styles.css'),'utf8');
if (mobile) {
 css = css.replaceAll('@media(max-width:700px)', '@media(max-width:1000px)');
 css += await readFile(path.join(root,'src/mobile-export.css'),'utf8');
}
const js = result.outputFiles[0].text.replaceAll('</script','<\\/script');
const html = `<!doctype html>\n<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1${mobile ? ',viewport-fit=cover' : ''}"><meta name="theme-color" content="#082e50"><title>Деньги & Право${mobile ? ' — мобильная версия' : ''}</title><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`;
const dest=path.join(root,mobile ? '../Деньги и Право — мобильная версия.html' : '../Деньги и Право.html');
await writeFile(dest,html);
console.log(`Exported ${dest} (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MB)`);
