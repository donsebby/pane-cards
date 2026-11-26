// Small helpers shared by every Pane card.

export const TOGGLE_DOMAINS = ['light', 'switch', 'input_boolean', 'fan', 'siren'];
const TRUE_COLOR_MODES = ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'];

// The five state colours of the family. A theme can change all of them at
// once (pane-warm, pane-heat, pane-accent, pane-ok, pane-alert); the cards
// fall back to these values.
export const STATE_COLORS = {
  warm: 'var(--p-warm)',
  heat: 'var(--p-heat)',
  accent: 'var(--p-accent)',
  ok: 'var(--p-ok)',
  alert: 'var(--p-alert)',
};

// Writes text only when it changed. `textContent = x` always swaps the text
// node, even for the same string, and every swap makes the browser lay the
// card out again. Cards patch on every hass tick, so this matters.
export function setText(el, value) {
  if (!el) return;
  const v = value == null ? '' : String(value);
  if (el.textContent !== v) el.textContent = v;
}

export function setAttr(el, name, value) {
  if (!el) return;
  if (value == null || value === '') {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else if (el.getAttribute(name) !== String(value)) {
    el.setAttribute(name, value);
  }
}

export function setStyle(el, prop, value) {
  if (!el) return;
  const v = value == null ? '' : String(value);
  if (el.style.getPropertyValue(prop) !== v) {
    if (v === '') el.style.removeProperty(prop);
    else el.style.setProperty(prop, v);
  }
}

export const domainOf = (entityId) => String(entityId || '').split('.')[0];

// A colour from the config: one of the state names above, a Home Assistant
// colour name (red, amber, ...: --red-color etc.), or any CSS colour.
export function resolveColor(value) {
  if (value == null || value === '' || value === 'auto') return null;
  const v = String(value).trim();
  if (STATE_COLORS[v]) return STATE_COLORS[v];
  if (/^[a-z-]+$/.test(v) && !['white', 'black', 'transparent'].includes(v)) return `var(--${v}-color, ${v})`;
  return v;
}

function hsToRgbCss([h, s]) {
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const hue = ((h % 360) + 360) % 360;
  const c = sat, x = c * (1 - Math.abs(((hue / 60) % 2) - 1)), m = 1 - c;
  let r1, g1, b1;
  if (hue < 60) [r1, g1, b1] = [c, x, 0];
  else if (hue < 120) [r1, g1, b1] = [x, c, 0];
  else if (hue < 180) [r1, g1, b1] = [0, c, x];
  else if (hue < 240) [r1, g1, b1] = [0, x, c];
  else if (hue < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return `rgb(${Math.round((r1 + m) * 255)}, ${Math.round((g1 + m) * 255)}, ${Math.round((b1 + m) * 255)})`;
}

// Colour a light really shows. Lights that can't show a hue stay warm.
// `memory` keeps the last real colour per entity, so a state update that
// briefly lacks rgb_color (common while dimming) doesn't flash warm.
export function lightColor(stateObj, entityId, memory) {
  const modes = stateObj?.attributes?.supported_color_modes;
  const colorCapable = Array.isArray(modes) && modes.some((m) => TRUE_COLOR_MODES.includes(m));
  if (colorCapable) {
    let color = null;
    if (Array.isArray(stateObj.attributes.rgb_color)) {
      const [r, g, b] = stateObj.attributes.rgb_color;
      color = `rgb(${r}, ${g}, ${b})`;
    } else if (Array.isArray(stateObj.attributes.hs_color)) {
      color = hsToRgbCss(stateObj.attributes.hs_color);
    }
    if (color) {
      if (memory && entityId) memory[entityId] = color;
      return color;
    }
    if (memory && entityId && memory[entityId]) return memory[entityId];
  }
  return STATE_COLORS.warm;
}

export function fire(node, type, detail) {
  node.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}

export function haptic(node, kind) {
  fire(node, 'haptic', kind);
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(kind === 'medium' ? 14 : kind === 'light' ? 8 : 4);
  }
}

export function navigate(path) {
  if (path.startsWith('#')) {
    // pushState plus a manual hashchange: assigning location.hash makes the
    // iOS Companion App's WKWebView briefly reload the dashboard.
    const oldURL = window.location.href;
    window.history.pushState(null, '', path);
    window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: window.location.href }));
  } else {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
  }
}

export function isGerman(hass) {
  const lang = hass?.locale?.language || hass?.language || '';
  return String(lang).toLowerCase().startsWith('de');
}
