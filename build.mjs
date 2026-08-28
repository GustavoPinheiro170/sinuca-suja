/* Gera dist/index.html: um arquivo só, com CSS e JS embutidos.
   Node puro, sem dependências.  Uso:
     node build.mjs              → embute CSS+JS, bibliotecas continuam no CDN
     node build.mjs --offline    → embute também o que estiver em lib/*.js
*/
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(fileURLToPath(import.meta.url));
const offline = process.argv.includes('--offline');
let html = readFileSync(join(raiz, 'index.html'), 'utf8');

html = html.replace(/<link rel="stylesheet" href="estilo\.css">/,
  '<style>\n' + readFileSync(join(raiz, 'estilo.css'), 'utf8').trim() + '\n</style>');

const arquivos = [];
html = html.replace(/[ \t]*<script src="(src\/[^"]+)"><\/script>\n?/g, (_, p) => { arquivos.push(p); return ''; });
const codigo = arquivos
  .map(p => '/* ---------- ' + p + ' ---------- */\n' + readFileSync(join(raiz, p), 'utf8').trim())
  .join('\n\n');
// sem IIFE de propósito: mantém o mesmo escopo global do modo de desenvolvimento,
// então G, OBJECTS, junkPool, NPCS e Som seguem inspecionáveis no console
html = html.replace('</body>', '<script>\n' + codigo + '\n</script>\n</body>');

if (offline) {
  const dir = join(raiz, 'lib');
  if (!existsSync(dir)) {
    console.error('lib/ não existe. Baixe react.production.min.js, react-dom.production.min.js e');
    console.error('three.min.js para uma pasta lib/ e aponte os <script> do index.html para lá.');
    process.exit(1);
  }
  html = html.replace(/[ \t]*<script src="(lib\/[^"]+)"><\/script>/g,
    (_, p) => '<script>\n' + readFileSync(join(raiz, p), 'utf8') + '\n</script>');
  console.log('bibliotecas embutidas de lib/:', readdirSync(dir).join(', '));
}

mkdirSync(join(raiz, 'dist'), { recursive: true });
writeFileSync(join(raiz, 'dist', 'index.html'), html);
console.log('dist/index.html gerado — ' + (html.length / 1024).toFixed(0) + ' KB, ' +
            arquivos.length + ' arquivos de src/ embutidos' + (offline ? ', offline' : ', CDN'));
