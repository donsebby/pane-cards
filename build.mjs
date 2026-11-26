// Builds the stable bundle (dist/pane-cards.js) and the Lab bundle
// (lab/pane-cards-dev.js, all tags with -dev). `node build.mjs`
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const common = { entryPoints: ['src/index.js'], bundle: true, format: 'esm', target: 'es2021', legalComments: 'none' };
const banner = (v) => ({ js: `// Pane Cards ${v} - https://github.com/donsebby/pane-cards (MIT)\nconst CARD_VERSION = '${v}';` });

await build({ ...common, outfile: 'dist/pane-cards.js', banner: banner(version),
  define: { __PANE_VERSION__: 'CARD_VERSION', __PANE_SUFFIX__: '""' } });
await build({ ...common, outfile: 'lab/pane-cards-dev.js', banner: banner(`${version}-dev`),
  define: { __PANE_VERSION__: 'CARD_VERSION', __PANE_SUFFIX__: '"-dev"' } });
console.log(`built ${version}`);
