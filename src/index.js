import { PaneTileCard, PaneTileCardEditor } from './cards/tile.js';

// __PANE_VERSION__ and __PANE_SUFFIX__ are set by build.mjs: the stable
// build registers `pane-tile-card`, the Lab build `pane-tile-card-dev`, so
// both can be loaded side by side.
const VERSION = __PANE_VERSION__;
const SUFFIX = __PANE_SUFFIX__;

// eslint-disable-next-line no-console
console.info(`%c PANE-CARDS %c v${VERSION}${SUFFIX ? ' (Lab)' : ''} `,
  'color:#fff;background:#3B6FD8;font-weight:700', 'color:#3B6FD8;background:#fff;font-weight:700');

const CARDS = [
  {
    cls: PaneTileCard, editor: PaneTileCardEditor, tag: 'pane-tile-card',
    name: 'Pane Tile Card',
    description: 'Kacheln für Licht, Schalter, Werte und Zahlen – Schalter, Balken, Ring oder Zahl, alles im visuellen Editor.',
    // Older configs keep working when the old card is not installed.
    aliases: ['liquid-glass-tile-card-v2'],
  },
];

const define = (tag, cls) => {
  if (customElements.get(tag)) return false;
  customElements.define(tag, cls);
  return true;
};

window.customCards = window.customCards || [];
CARDS.forEach((c) => {
  const tag = c.tag + SUFFIX;
  c.cls.editorTag = `${tag}-editor`;
  define(c.cls.editorTag, class extends c.editor {});
  if (define(tag, c.cls)) {
    window.customCards.push({
      type: tag,
      name: c.name + (SUFFIX ? ' (Lab)' : ''),
      description: c.description,
      preview: true,
      documentationURL: 'https://github.com/donsebby/pane-cards',
    });
  }
  if (!SUFFIX) (c.aliases || []).forEach((a) => define(a, class extends c.cls {}));
});
