// Pane Cards 0.1.0-dev - https://github.com/donsebby/pane-cards (MIT)
const CARD_VERSION = '0.1.0-dev';

// src/core/style.js
var INK = "var(--primary-text-color, #fff)";
var BASE_STYLE = `
  :host {
    display: block;
    --p-warm: var(--pane-warm, #F5B544);
    --p-heat: var(--pane-heat, #FF8A50);
    --p-accent: var(--pane-accent, #64B5F6);
    --p-ok: var(--pane-ok, #5BC08A);
    --p-alert: var(--pane-alert, #EF6461);
    --p-ink: ${INK};
    --p-sub: var(--secondary-text-color, color-mix(in srgb, ${INK} 70%, transparent));
    --p-radius: var(--pane-radius, var(--lg-radius, 24px));
    --p-tile-radius: calc(var(--p-radius) - 8px);
    --p-tile: var(--pane-tile, var(--lg-tile-bg, color-mix(in srgb, ${INK} 9%, transparent)));
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Inter, system-ui, sans-serif));
    color: var(--p-ink);
  }

  /* Card: glass by default, .solid when the theme or config says so. */
  .card {
    position: relative; overflow: hidden; isolation: isolate; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 12px; padding: 16px;
    border-radius: var(--p-radius);
    background: var(--pane-glass, linear-gradient(160deg,
      color-mix(in srgb, #fff 16%, transparent),
      color-mix(in srgb, #fff 5%, transparent) 45%,
      color-mix(in srgb, #fff 8%, transparent)));
    -webkit-backdrop-filter: var(--pane-backdrop, blur(var(--pane-blur, 22px)) saturate(170%));
    backdrop-filter: var(--pane-backdrop, blur(var(--pane-blur, 22px)) saturate(170%));
    border: 1px solid var(--pane-border, color-mix(in srgb, #fff 22%, transparent));
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 45%, transparent),
      inset 0 -1px 0 color-mix(in srgb, #fff 8%, transparent),
      0 18px 40px rgba(6, 10, 30, 0.3);
  }
  .card::before {
    content: ""; position: absolute; inset: 0 0 55% 0; z-index: -1; pointer-events: none;
    background: linear-gradient(180deg, color-mix(in srgb, #fff 14%, transparent), transparent);
  }
  .card.solid {
    background: var(--pane-surface, var(--ha-card-background, var(--card-background-color, #1C1F25)));
    -webkit-backdrop-filter: none; backdrop-filter: none;
    border: 1px solid var(--pane-border, color-mix(in srgb, ${INK} 6%, transparent));
    box-shadow: none;
  }
  .card.solid::before { content: none; }
  /* frame: false - no panel of its own (e.g. inside a pop-up that already is one) */
  .card.frameless { background: none; border: none; border-radius: 0; padding: 0; box-shadow: none;
    -webkit-backdrop-filter: none; backdrop-filter: none; }
  .card.frameless::before { content: none; }

  /* Header: icon tile, title, subtitle, optional button */
  .hd { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .hd[hidden] { display: none; }
  .hd-ico { width: 34px; height: 34px; flex: none; border-radius: 11px; display: flex; align-items: center; justify-content: center;
    color: var(--hc, var(--p-accent)); background: color-mix(in srgb, var(--hc, var(--p-accent)) 18%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 30%, transparent); --mdc-icon-size: 18px; }
  .card.solid .hd-ico { box-shadow: none; }
  .hd-ico[hidden] { display: none; }
  .hd-text { flex: 1; min-width: 0; }
  .hd-title { font-size: 15px; font-weight: 600; line-height: 20px; color: var(--p-ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hd-sub { font-size: 12px; line-height: 16px; color: var(--p-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hd-sub:empty { display: none; }

  .pbtn { width: 36px; height: 36px; flex: none; border-radius: 18px; padding: 0; font: inherit; cursor: pointer;
    display: flex; align-items: center; justify-content: center; color: var(--p-ink); --mdc-icon-size: 18px;
    border: 1px solid color-mix(in srgb, #fff 25%, transparent);
    background: color-mix(in srgb, #fff 14%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 50%, transparent), 0 4px 12px rgba(6, 10, 30, 0.18); }
  .card.solid .pbtn { border-radius: 12px; border: none; box-shadow: none; background: color-mix(in srgb, ${INK} 9%, transparent); }
  .pbtn[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;

// src/core/util.js
var TOGGLE_DOMAINS = ["light", "switch", "input_boolean", "fan", "siren"];
var TRUE_COLOR_MODES = ["hs", "rgb", "rgbw", "rgbww", "xy"];
var STATE_COLORS = {
  warm: "var(--p-warm)",
  heat: "var(--p-heat)",
  accent: "var(--p-accent)",
  ok: "var(--p-ok)",
  alert: "var(--p-alert)"
};
function setText(el, value) {
  if (!el) return;
  const v = value == null ? "" : String(value);
  if (el.textContent !== v) el.textContent = v;
}
function setAttr(el, name, value) {
  if (!el) return;
  if (value == null || value === "") {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else if (el.getAttribute(name) !== String(value)) {
    el.setAttribute(name, value);
  }
}
function setStyle(el, prop, value) {
  if (!el) return;
  const v = value == null ? "" : String(value);
  if (el.style.getPropertyValue(prop) !== v) {
    if (v === "") el.style.removeProperty(prop);
    else el.style.setProperty(prop, v);
  }
}
var domainOf = (entityId) => String(entityId || "").split(".")[0];
function resolveColor(value) {
  if (value == null || value === "" || value === "auto") return null;
  const v = String(value).trim();
  if (STATE_COLORS[v]) return STATE_COLORS[v];
  if (/^[a-z-]+$/.test(v) && !["white", "black", "transparent"].includes(v)) return `var(--${v}-color, ${v})`;
  return v;
}
function hsToRgbCss([h, s]) {
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const hue = (h % 360 + 360) % 360;
  const c = sat, x = c * (1 - Math.abs(hue / 60 % 2 - 1)), m = 1 - c;
  let r1, g1, b1;
  if (hue < 60) [r1, g1, b1] = [c, x, 0];
  else if (hue < 120) [r1, g1, b1] = [x, c, 0];
  else if (hue < 180) [r1, g1, b1] = [0, c, x];
  else if (hue < 240) [r1, g1, b1] = [0, x, c];
  else if (hue < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return `rgb(${Math.round((r1 + m) * 255)}, ${Math.round((g1 + m) * 255)}, ${Math.round((b1 + m) * 255)})`;
}
function lightColor(stateObj, entityId, memory) {
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
function fire(node, type, detail) {
  node.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}
function haptic(node, kind) {
  fire(node, "haptic", kind);
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(kind === "medium" ? 14 : kind === "light" ? 8 : 4);
  }
}
function navigate(path) {
  if (path.startsWith("#")) {
    const oldURL = window.location.href;
    window.history.pushState(null, "", path);
    window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: window.location.href }));
  } else {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  }
}
function isGerman(hass) {
  const lang = hass?.locale?.language || hass?.language || "";
  return String(lang).toLowerCase().startsWith("de");
}

// src/core/base.js
var PaneCard = class _PaneCard extends HTMLElement {
  static get styles() {
    return "";
  }
  setConfig(config) {
    if (!config) throw new Error("Pane: invalid configuration");
    this.validateConfig(config);
    this._config = config;
    this._fnCache = /* @__PURE__ */ new Map();
    this._ensureShell();
    if (!this._lookOverride() && this.isConnected) this._themeLook = _PaneCard.readThemeLook(this);
    this._applyCardClasses();
    this.build();
    if (this._hass) this.update();
  }
  validateConfig() {
  }
  build() {
  }
  update() {
  }
  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    const th = hass && hass.themes;
    if (!prev || th !== prev.themes) this._recheckThemeLook();
    if (this._config) this.update();
  }
  get hass() {
    return this._hass;
  }
  connectedCallback() {
    if (!this._onThemeChanged) this._onThemeChanged = () => this._checkThemeLook();
    window.addEventListener("lg-theme-changed", this._onThemeChanged);
    window.addEventListener("pane-theme-changed", this._onThemeChanged);
    this._recheckThemeLook();
  }
  disconnectedCallback() {
    window.removeEventListener("lg-theme-changed", this._onThemeChanged);
    window.removeEventListener("pane-theme-changed", this._onThemeChanged);
    if (this._lookRaf) cancelAnimationFrame(this._lookRaf);
    this._lookRaf = null;
  }
  // ---- shell -------------------------------------------------------
  _ensureShell() {
    if (this.shadowRoot) return;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${BASE_STYLE}${this.constructor.styles}</style>
      <div class="card">
        <div class="hd" hidden>
          <div class="hd-ico" hidden><ha-icon></ha-icon></div>
          <div class="hd-text"><div class="hd-title"></div><div class="hd-sub"></div></div>
          <button class="pbtn hd-btn" type="button" hidden><ha-icon></ha-icon></button>
        </div>
        <div class="body"></div>
      </div>`;
    const r = this.shadowRoot;
    this.cardEl = r.querySelector(".card");
    this.bodyEl = r.querySelector(".body");
    this._hd = {
      root: r.querySelector(".hd"),
      ico: r.querySelector(".hd-ico"),
      icon: r.querySelector(".hd-ico ha-icon"),
      title: r.querySelector(".hd-title"),
      sub: r.querySelector(".hd-sub"),
      btn: r.querySelector(".hd-btn"),
      btnIcon: r.querySelector(".hd-btn ha-icon")
    };
    this._hd.btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._headerAction) this._headerAction();
    });
  }
  // title, icon, sub, color, button: { icon, label, run }
  setHeader({ title, icon, sub, color, button } = {}) {
    const hd = this._hd;
    const show = !!(title || icon);
    if (hd.root.hidden === show) hd.root.hidden = !show;
    if (!show) return;
    setText(hd.title, title || "");
    setText(hd.sub, sub || "");
    if (hd.ico.hidden === !!icon) hd.ico.hidden = !icon;
    setAttr(hd.icon, "icon", icon || null);
    setStyle(hd.ico, "--hc", color || "");
    const hasBtn = !!button;
    if (hd.btn.hidden === hasBtn) hd.btn.hidden = !hasBtn;
    this._headerAction = hasBtn ? button.run : null;
    if (hasBtn) {
      setAttr(hd.btnIcon, "icon", button.icon);
      setAttr(hd.btn, "aria-label", button.label);
      setAttr(hd.btn, "title", button.label);
    }
  }
  _applyCardClasses() {
    const c = this._config;
    this.cardEl.classList.toggle("solid", this.isSolid());
    this.cardEl.classList.toggle("frameless", c.frame === false);
    this.cardEl.classList.toggle("calm", !this.glowOn());
  }
  // ---- look ----------------------------------------------------------
  static readThemeLook(el) {
    try {
      const cs = getComputedStyle(el);
      const raw = cs.getPropertyValue("--pane-look") || cs.getPropertyValue("--lg-look");
      const v = String(raw).trim().replace(/^["']|["']$/g, "").trim().toLowerCase();
      return v === "solid" || v === "glass" ? v : null;
    } catch (e) {
      return null;
    }
  }
  _lookOverride() {
    const look = this._config?.look;
    return look === "solid" || look === "glass" ? look : null;
  }
  isSolid() {
    return (this._lookOverride() || this._themeLook || "glass") === "solid";
  }
  // `glow: false` calms the coloured glows; the solid look has none.
  glowOn() {
    return this._config?.glow !== false && !this.isSolid();
  }
  _recheckThemeLook() {
    this._checkThemeLook();
    if (typeof requestAnimationFrame !== "function" || this._lookRaf) return;
    this._lookRaf = requestAnimationFrame(() => {
      this._lookRaf = null;
      this._checkThemeLook();
    });
  }
  _checkThemeLook() {
    if (!this._config || this._lookOverride() || !this.isConnected) return;
    const look = _PaneCard.readThemeLook(this);
    if (look === this._themeLook) return;
    const was = this.isSolid();
    this._themeLook = look;
    if (this.isSolid() !== was) this.setConfig(this._config);
  }
  // ---- state text ----------------------------------------------------
  formatState(stateObj) {
    if (!stateObj) return "\u2013";
    const hass = this._hass;
    if (hass && typeof hass.formatEntityState === "function") {
      try {
        const text = hass.formatEntityState(stateObj);
        if (text != null && text !== "") return String(text);
      } catch (err) {
      }
    }
    const unit = stateObj.attributes?.unit_of_measurement;
    return unit ? `${stateObj.state} ${unit}` : stateObj.state;
  }
  entityName(entityId, stateObj) {
    return stateObj?.attributes?.friendly_name || entityId || "";
  }
  // ---- templates -----------------------------------------------------
  // `[[[ ... ]]]` runs as JS with states, hass, entity and fmt in scope.
  // Anything else passes through unchanged.
  template(value, entityId) {
    if (value == null) return null;
    if (typeof value !== "string") return value;
    const m = /^\s*\[\[\[([\s\S]*)\]\]\]\s*$/.exec(value);
    if (!m) return value;
    let fn = this._fnCache.get(value);
    if (fn === void 0) {
      try {
        fn = new Function("states", "hass", "entity", "fmt", m[1]);
      } catch (err) {
        console.error(`${this.localName}: template compile error`, err);
        fn = null;
      }
      this._fnCache.set(value, fn);
    }
    if (!fn || !this._hass) return null;
    try {
      if (!this._fmt) this._fmt = (x) => this.formatState(typeof x === "string" ? this._hass.states[x] : x);
      return fn(this._hass.states, this._hass, this._hass.states[entityId], this._fmt);
    } catch (err) {
      console.error(`${this.localName}: template error`, err);
      return null;
    }
  }
  // ---- actions -------------------------------------------------------
  toggle(entityId) {
    const domain = domainOf(entityId);
    const service = domain === "switch" ? "switch" : domain === "light" ? "light" : "homeassistant";
    this._hass.callService(service, "toggle", { entity_id: entityId });
    haptic(this, "light");
  }
  moreInfo(entityId) {
    if (entityId) fire(this, "hass-more-info", { entityId });
  }
  defaultTapAction(entityId) {
    return { action: TOGGLE_DOMAINS.includes(domainOf(entityId)) ? "toggle" : "more-info" };
  }
  // Home Assistant's action format (tap_action / hold_action).
  performAction(action, entityId) {
    if (!action || action.action === "none") return;
    if (action.confirmation) {
      const text = typeof action.confirmation === "object" && action.confirmation.text || "Bist du sicher?";
      if (!window.confirm(text)) return;
    }
    const target = action.entity || entityId;
    switch (action.action) {
      case "toggle":
        this.toggle(target);
        return;
      case "more-info":
        this.moreInfo(target);
        break;
      case "navigate":
        if (action.navigation_path) navigate(action.navigation_path);
        break;
      case "url":
        if (action.url_path) window.open(action.url_path, action.new_tab === false ? "_self" : "_blank");
        break;
      case "call-service":
      case "perform-action": {
        const svc = action.perform_action || action.service;
        if (!svc) return;
        const [d, s] = svc.split(".");
        this._hass.callService(d, s, action.data || action.service_data || {}, action.target || {});
        break;
      }
      default:
        return;
    }
    haptic(this, "light");
  }
};

// src/core/editor.js
var formsReady = null;
function ensureForms() {
  if (customElements.get("ha-form")) return Promise.resolve();
  if (!formsReady) {
    formsReady = (async () => {
      try {
        const helpers = await window.loadCardHelpers?.();
        const card = await helpers?.createCardElement({ type: "entities", entities: [] });
        await card?.constructor?.getConfigElement?.();
      } catch (e) {
      }
    })();
  }
  return formsReady;
}
var EDITOR_STYLE = `
  :host { display: block; }
  .sec { margin: 0 0 16px; }
  .sec-title { font-size: 14px; font-weight: 500; margin: 0 0 8px; color: var(--primary-text-color); }
  .items { display: flex; flex-direction: column; gap: 8px; }
  .item { border: 1px solid var(--divider-color, rgba(127,127,127,.3)); border-radius: 12px; overflow: hidden; }
  .item.open { border-color: var(--primary-color); }
  .item-hd { display: flex; align-items: center; gap: 4px; padding: 4px 4px 4px 12px; min-height: 44px; cursor: pointer; }
  .item-hd ha-icon.lead { --mdc-icon-size: 20px; color: var(--secondary-text-color); margin-right: 8px; }
  .item-title { flex: 1; min-width: 0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item-title small { color: var(--secondary-text-color); margin-left: 6px; }
  .ib { width: 36px; height: 36px; border: 0; border-radius: 18px; background: none; color: var(--secondary-text-color);
    display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; --mdc-icon-size: 20px; }
  .ib:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
  .ib[disabled] { opacity: .3; cursor: default; }
  .item-body { padding: 4px 12px 12px; }
  .item-body[hidden] { display: none; }
  .add { margin-top: 8px; width: 100%; height: 40px; border-radius: 10px; cursor: pointer; font: inherit; font-size: 14px;
    border: 1px dashed var(--divider-color, rgba(127,127,127,.5)); background: none; color: var(--primary-color); }
  .hint { font-size: 12px; color: var(--secondary-text-color); margin-top: 8px; line-height: 1.4; }
`;
var PaneEditor = class extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (this._forms) this._forms.forEach((f) => {
      f.hass = hass;
    });
  }
  connectedCallback() {
    ensureForms().then(() => this._render());
  }
  // Subclasses: [{ title, schema, data(), set(value) } | { title, list }]
  sections() {
    return [];
  }
  labels() {
    return {};
  }
  helpers() {
    return {};
  }
  emit(config) {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  // Drops empty values so a config saved from the editor stays as short as
  // a hand-written one.
  static clean(obj) {
    const out = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === "" || v == null) return;
      if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) return;
      out[k] = v;
    });
    return out;
  }
  _form(schema, data, onChange) {
    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.schema = schema;
    form.data = data;
    const labels = this.labels();
    const helpers = this.helpers();
    form.computeLabel = (s) => labels[s.name] ?? s.label ?? s.name;
    form.computeHelper = (s) => helpers[s.name];
    form.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      onChange(e.detail.value);
    });
    this._forms.push(form);
    return form;
  }
  _render() {
    if (!this._config || !this.isConnected) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const sig = JSON.stringify(this.sections().map((s) => s.list ? [s.list.items().length, this._open?.[s.key], s.list.items().map((it) => s.list.signature?.(it))] : s.signature?.() ?? 0));
    if (this._sig === sig && this._forms?.length) {
      this._patch();
      return;
    }
    this._sig = sig;
    this._forms = [];
    this._formSetters = [];
    const root = this.shadowRoot;
    root.innerHTML = `<style>${EDITOR_STYLE}</style>`;
    if (!customElements.get("ha-form")) {
      const p = document.createElement("div");
      p.className = "hint";
      p.textContent = "Der visuelle Editor l\xE4dt noch \u2026 falls er nicht erscheint, bitte den Code-Editor verwenden.";
      root.appendChild(p);
      return;
    }
    this._open = this._open || {};
    this.sections().forEach((sec) => {
      const el = document.createElement("div");
      el.className = "sec";
      if (sec.title) {
        const t = document.createElement("div");
        t.className = "sec-title";
        t.textContent = sec.title;
        el.appendChild(t);
      }
      if (sec.list) el.appendChild(this._list(sec));
      else {
        const form = this._form(sec.schema, sec.data(), (v) => sec.set(v));
        this._formSetters.push(() => {
          form.schema = sec.schema;
          form.data = sec.data();
        });
        el.appendChild(form);
      }
      if (sec.hint) {
        const h = document.createElement("div");
        h.className = "hint";
        h.textContent = sec.hint;
        el.appendChild(h);
      }
      root.appendChild(el);
    });
  }
  _patch() {
    const secs = this.sections();
    let i = 0;
    secs.forEach((sec) => {
      if (sec.list) {
        sec.list.items().forEach((item, idx) => {
          if (this._open[sec.key] !== idx) return;
          const setter = this._formSetters[i++];
          if (setter) setter(item, idx);
        });
      } else {
        const setter = this._formSetters[i++];
        if (setter) setter();
      }
    });
    this._forms.forEach((f) => {
      f.hass = this._hass;
    });
  }
  // A list of items (rows, tiles, entities ...): header line per item with
  // move, delete and expand; the open item shows its own form.
  _list(sec) {
    const L = sec.list;
    const wrap = document.createElement("div");
    const items = document.createElement("div");
    items.className = "items";
    const all = L.items();
    all.forEach((item, idx) => {
      const open = this._open[sec.key] === idx;
      const box = document.createElement("div");
      box.className = `item${open ? " open" : ""}`;
      const hd = document.createElement("div");
      hd.className = "item-hd";
      hd.innerHTML = `<ha-icon class="lead"></ha-icon><div class="item-title"></div>
        <button class="ib" data-a="up" type="button" title="Nach oben"><ha-icon icon="mdi:arrow-up"></ha-icon></button>
        <button class="ib" data-a="down" type="button" title="Nach unten"><ha-icon icon="mdi:arrow-down"></ha-icon></button>
        <button class="ib" data-a="del" type="button" title="Entfernen"><ha-icon icon="mdi:delete-outline"></ha-icon></button>
        <button class="ib" data-a="open" type="button" title="Bearbeiten"><ha-icon icon="${open ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
      hd.querySelector(".lead").setAttribute("icon", L.icon?.(item, this._hass) || "mdi:drag");
      const title = hd.querySelector(".item-title");
      title.textContent = L.title(item, this._hass) || `#${idx + 1}`;
      const sub = L.subtitle?.(item, this._hass);
      if (sub) {
        const s = document.createElement("small");
        s.textContent = sub;
        title.appendChild(s);
      }
      hd.querySelector('[data-a="up"]').disabled = idx === 0;
      hd.querySelector('[data-a="down"]').disabled = idx === all.length - 1;
      hd.addEventListener("click", (e) => {
        const a = e.target.closest("button")?.dataset.a || "open";
        e.stopPropagation();
        if (a === "open") {
          this._open[sec.key] = open ? null : idx;
          this._sig = null;
          this._render();
        } else if (a === "up" || a === "down") {
          const j = a === "up" ? idx - 1 : idx + 1;
          const next = [...all];
          [next[idx], next[j]] = [next[j], next[idx]];
          if (this._open[sec.key] === idx) this._open[sec.key] = j;
          L.set(next);
        } else if (a === "del") {
          if (this._open[sec.key] === idx) this._open[sec.key] = null;
          L.set(all.filter((_, k) => k !== idx));
        }
      });
      box.appendChild(hd);
      if (open) {
        const body = document.createElement("div");
        body.className = "item-body";
        const form = this._form(L.schema(item), L.data(item), (v) => {
          const cur = L.items();
          const next = cur.map((it, k) => k === idx ? L.merge(it, v) : it);
          L.set(next);
        });
        this._formSetters.push((it) => {
          form.schema = L.schema(it);
          form.data = L.data(it);
        });
        body.appendChild(form);
        box.appendChild(body);
      }
      items.appendChild(box);
    });
    wrap.appendChild(items);
    const add = document.createElement("button");
    add.className = "add";
    add.type = "button";
    add.textContent = L.addLabel || "+ Hinzuf\xFCgen";
    add.addEventListener("click", () => {
      const next = [...L.items(), L.create()];
      this._open[sec.key] = next.length - 1;
      L.set(next);
    });
    wrap.appendChild(add);
    return wrap;
  }
};

// src/cards/tile.js
var STYLE = `
  .body { display: flex; flex-direction: column; gap: 8px; }
  .body.grid { display: grid; grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); gap: 8px; align-items: stretch;
    container-type: inline-size; }

  .pill, .bar-tile, .stat-tile {
    position: relative; box-sizing: border-box; min-width: 0; cursor: pointer;
    -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
    background: var(--p-tile); border: 1px solid color-mix(in srgb, #fff 14%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 25%, transparent);
    border-radius: var(--p-tile-radius); padding: 10px 12px; }
  .pill { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .bar-tile { display: flex; flex-direction: column; gap: 10px; }
  .left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .pill.active, .bar-tile.active {
    background: color-mix(in srgb, var(--c) calc(8% + var(--glow, 1) * 10%), var(--p-tile)); }
  .card.calm .pill.active, .card.calm .bar-tile.active { background: var(--p-tile); }

  .icon-box { width: 32px; height: 32px; flex: none; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    --mdc-icon-size: 18px; color: var(--p-sub); background: color-mix(in srgb, ${INK} 10%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 25%, transparent); transition: background .15s ease, color .15s ease; }
  .icon-box.active, .info .icon-box { color: var(--c); background: color-mix(in srgb, var(--c) 22%, transparent); }
  .text { min-width: 0; }
  .text.center { text-align: center; margin-top: 8px; }
  .name { font-size: 13px; font-weight: 600; line-height: 18px; color: var(--p-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; line-height: 16px; color: var(--p-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub:empty { display: none; }

  /* narrow grids: icon and switch on top, text underneath */
  @container (max-width: 430px) {
    .body.grid .pill { flex-wrap: wrap; row-gap: 8px; }
    .body.grid .pill > .left { display: contents; }
    .body.grid .pill .icon-box { order: 1; }
    .body.grid .pill .toggle { order: 2; }
    .body.grid .pill .text { order: 3; flex: 1 1 100%; }
  }

  .toggle { width: 44px; height: 26px; flex: none; border-radius: 13px; position: relative; cursor: pointer;
    background: color-mix(in srgb, ${INK} 16%, transparent); transition: background .2s ease;
    box-shadow: inset 0 1px 2px rgba(0,0,0,.2); }
  .toggle.on { background: var(--c); }
  .toggle .knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,.3); transition: left .2s ease; }
  .toggle.on .knob { left: 21px; }

  .track { position: relative; width: 100%; height: 8px; border-radius: 4px; touch-action: none; cursor: grab;
    background: color-mix(in srgb, ${INK} 16%, transparent); }
  .track .fill { position: absolute; inset: 0 auto 0 0; border-radius: 4px; background: var(--c); }
  .lens { position: absolute; top: 50%; width: 26px; height: 16px; border-radius: 8px; transform: translate(-50%, -50%); cursor: grab;
    background: linear-gradient(155deg, rgba(255,255,255,.6), rgba(255,255,255,.15) 45%, rgba(255,255,255,.3));
    -webkit-backdrop-filter: blur(3px) saturate(220%) brightness(1.3); backdrop-filter: blur(3px) saturate(220%) brightness(1.3);
    border: 1px solid rgba(255,255,255,.6);
    box-shadow: 0 2px 6px rgba(0,0,0,.3), inset 0 1px 1px rgba(255,255,255,.8), inset 0 -2px 3px rgba(0,0,0,.12); }

  .stat-tile { display: flex; flex-direction: column; padding: 12px 14px; }
  .stat-icon { position: absolute; top: 12px; right: 12px; --mdc-icon-size: 18px; color: var(--p-sub); }
  .stat-value { font-size: 28px; font-weight: 600; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
    padding-right: 24px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--p-ink); }
  .stat-tile .name { font-weight: 500; color: var(--p-sub); margin-top: 4px; }
  .stat-line { height: 3px; width: 28px; max-width: 100%; border-radius: 2px; margin-top: 10px; background: var(--c);
    transition: width .3s ease; }
  .stat-tile.zero .stat-value { opacity: .45; }
  .stat-tile.zero .stat-line { background: color-mix(in srgb, ${INK} 18%, transparent); }
  .card.stat-lg .stat-tile { min-height: 104px; }
  .card.stat-lg .stat-value { font-size: 40px; margin-top: auto; }

  .gauge-tile { display: flex; flex-direction: column; align-items: center; min-width: 0; cursor: pointer; }
  .ring { width: 74px; height: 74px; border-radius: 50%; position: relative; display: flex; align-items: center; justify-content: center;
    touch-action: none; cursor: grab; }
  .ring-inner { width: 58px; height: 58px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    --mdc-icon-size: 20px; color: var(--p-sub);
    background: color-mix(in srgb, var(--card-background-color, #1C1F25) 88%, ${INK} 12%);
    border: 1px solid color-mix(in srgb, ${INK} 12%, transparent); box-shadow: inset 0 1px 1px rgba(255,255,255,.12); }
  .ring-inner.active { color: var(--c); }
  .ring-lens { position: absolute; width: 26px; height: 16px; border-radius: 8px; cursor: grab;
    background: linear-gradient(155deg, rgba(255,255,255,.6), rgba(255,255,255,.15) 45%, rgba(255,255,255,.3));
    border: 1px solid rgba(255,255,255,.6); box-shadow: 0 2px 6px rgba(0,0,0,.3), inset 0 1px 1px rgba(255,255,255,.8); }

  /* solid look: calm tiles, no switch (the tile toggles), the whole bar tile
     is the slider, round icon that fills with the row colour */
  .card.solid .pill, .card.solid .bar-tile, .card.solid .stat-tile { border: 1px solid transparent; box-shadow: none; }
  .card.solid .pill, .card.solid .bar-tile { overflow: hidden; isolation: isolate; flex-direction: row; align-items: center;
    justify-content: flex-start; gap: 12px; padding: 12px 14px; min-height: 64px; }
  .card.solid .pill.active, .card.solid .bar-tile.active { background: color-mix(in srgb, var(--c) 20%, var(--p-tile)); }
  .card.solid .bar-tile { touch-action: pan-y; }
  .card.solid .left { gap: 12px; flex: 1 1 auto; }
  .card.solid .icon-box { width: 36px; height: 36px; border-radius: 50%; box-shadow: none; z-index: 1; --mdc-icon-size: 20px; }
  .card.solid .icon-box.active { background: var(--c); color: #16181d; }
  .card.solid .info .icon-box, .card.solid .info .icon-box.active { background: color-mix(in srgb, var(--c) 20%, transparent); color: var(--c); }
  .card.solid .info { background: var(--p-tile) !important; }
  .card.solid .text { position: relative; z-index: 1; }
  .card.solid .pill .name, .card.solid .bar-tile .name { font-size: 15px; }
  .card.solid .pill .sub, .card.solid .bar-tile .sub { font-size: 13px; }
  .card.solid .solid-fill { position: absolute; top: 0; bottom: 0; left: 0; width: 0; z-index: 0; pointer-events: none;
    background: color-mix(in srgb, var(--c) 30%, transparent); opacity: 0; transition: width .2s ease, opacity .2s ease; }
  .card.solid .bar-tile.active .solid-fill, .card.solid .bar-tile[data-dragging] .solid-fill { opacity: 1; }
  .card.solid .bar-tile[data-dragging] .solid-fill { transition: opacity .2s ease; }
  .card.solid .info .solid-fill { background: color-mix(in srgb, var(--c) 16%, transparent); }
  .card.solid .ring-inner { box-shadow: none; }
  .card.solid .ring-lens { background: var(--p-ink); border: none; box-shadow: 0 1px 3px rgba(0,0,0,.3); }
  @container (max-width: 430px) {
    .card.solid .body.grid .bar-tile, .card.solid .body.grid .pill { flex-wrap: wrap; row-gap: 10px; padding: 12px; }
    .card.solid .body.grid .bar-tile > .left { display: contents; }
    .card.solid .body.grid .bar-tile .text { flex: 1 1 100%; }
  }
`;
var ROW_TYPES = ["toggle", "bar", "gauge", "stat"];
var PaneTileCard = class _PaneTileCard extends PaneCard {
  static get styles() {
    return STYLE;
  }
  static get cardType() {
    return "pane-tile-card";
  }
  static getStubConfig(hass) {
    const lights = Object.keys(hass?.states || {}).filter((e) => e.startsWith("light.")).slice(0, 4);
    return {
      title: "Licht",
      icon: "mdi:lightbulb-group",
      columns: 2,
      rows: lights.length ? lights.map((entity) => ({ entity, type: "bar" })) : [{ entity: "sun.sun", type: "toggle" }]
    };
  }
  validateConfig(config) {
    if (!Array.isArray(config.rows)) throw new Error('Pane Tile Card: "rows" fehlt.');
  }
  getCardSize() {
    return Math.ceil((this._config?.rows?.length || 1) / this._cols() * 1.2) + 1;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 4 };
  }
  _cols() {
    const c = Number(this._config?.columns);
    if (c >= 1 && c <= 4) return c;
    return this._config?.layout === "grid" ? 2 : 1;
  }
  build() {
    const c = this._config;
    this._lastColor = this._lastColor || {};
    this.cardEl.classList.toggle("stat-lg", c.stat_size === "large");
    const cols = this._cols();
    this.bodyEl.classList.toggle("grid", cols > 1);
    setStyle(this.bodyEl, "--cols", cols > 1 ? cols : "");
    this._buildRows();
    if (!this._wired) this._wire();
  }
  // ---- header --------------------------------------------------------
  _header() {
    const c = this._config;
    const de = isGerman(this._hass);
    const rows = (c.rows || []).filter((r) => r.entity);
    let sub = null;
    if (c.subtitle === false || c.subtitle === "none") sub = null;
    else if (c.subtitle) sub = this.template(c.subtitle, rows[0]?.entity);
    else {
      const sw = rows.filter((r) => this._isSwitchable(r));
      if (sw.length > 1) {
        const on = sw.filter((r) => this._isActive(r, this._hass.states[r.entity])).length;
        sub = de ? `${on} von ${sw.length} an` : `${on} of ${sw.length} on`;
      }
    }
    const hasLight = rows.some((r) => domainOf(r.entity) === "light");
    const color = resolveColor(this.template(c.icon_color, rows[0]?.entity)) || (hasLight ? STATE_COLORS.warm : STATE_COLORS.accent);
    let button = null;
    if (c.header_action === "all_off") {
      const targets = rows.filter((r) => TOGGLE_DOMAINS.includes(domainOf(r.entity)) || domainOf(r.entity) === "light").map((r) => r.entity);
      button = {
        icon: "mdi:power",
        label: de ? "Alle aus" : "All off",
        run: () => {
          this._hass.callService("homeassistant", "turn_off", { entity_id: targets });
          haptic(this, "medium");
        }
      };
    }
    this.setHeader({ title: this.template(c.title, rows[0]?.entity), icon: c.icon, sub, color, button });
  }
  // ---- rows: build once per config -----------------------------------
  _buildRows() {
    const solid = this.isSolid();
    this.bodyEl.innerHTML = (this._config.rows || []).map((row, i) => {
      const type = ROW_TYPES.includes(row.type) ? row.type : "toggle";
      const domain = domainOf(row.entity);
      if (solid && (type === "toggle" || type === "bar")) {
        const fill = type === "bar" && !row.hide_track ? '<div class="solid-fill"></div>' : "";
        return `<div class="${type === "bar" ? "bar-tile" : "pill"}" data-row-i="${i}">${fill}
          <div class="left"><div class="icon-box"><ha-icon></ha-icon></div>
          <div class="text"><div class="name"></div><div class="sub"></div></div></div></div>`;
      }
      if (type === "toggle") {
        const iconAttrs = domain === "light" || row.tap_action ? `data-action="icon-tap" data-i="${i}"` : 'data-action="icon-inert"';
        const sw = TOGGLE_DOMAINS.includes(domain) ? `<div class="toggle" data-action="toggle" data-i="${i}" role="switch"><div class="knob"></div></div>` : "";
        return `<div class="pill" data-row-i="${i}">
          <div class="left"><div class="icon-box" ${iconAttrs}><ha-icon></ha-icon></div>
          <div class="text"><div class="name" data-action="name-tap" data-i="${i}"></div><div class="sub"></div></div></div>${sw}</div>`;
      }
      if (type === "stat") {
        return `<div class="stat-tile" data-row-i="${i}"><ha-icon class="stat-icon"></ha-icon><div class="stat-value"></div>
          <div class="name" data-action="name-tap" data-i="${i}"></div><div class="sub"></div><div class="stat-line"></div></div>`;
      }
      if (type === "gauge") {
        return `<div class="gauge-tile" data-row-i="${i}">
          <div class="ring" data-action="drag-ring" data-i="${i}">
            <div class="ring-inner" data-action="icon-tap" data-i="${i}"><ha-icon></ha-icon></div><div class="ring-lens"></div></div>
          <div class="text center"><div class="name" data-action="name-tap" data-i="${i}"></div><div class="sub"></div></div></div>`;
      }
      const track = row.hide_track ? "" : `<div class="track" data-action="drag-bar" data-i="${i}"><div class="fill"></div><div class="lens"></div></div>`;
      return `<div class="bar-tile" data-row-i="${i}">
        <div class="left"><div class="icon-box" data-action="icon-tap" data-i="${i}"><ha-icon></ha-icon></div>
        <div class="text"><div class="name" data-action="name-tap" data-i="${i}"></div><div class="sub"></div></div></div>${track}</div>`;
    }).join("");
    this._rowEls = [...this.bodyEl.querySelectorAll("[data-row-i]")];
  }
  // ---- rows: patch every hass tick ------------------------------------
  update() {
    if (!this._hass || !this._config || !this._rowEls) return;
    this._header();
    const solid = this.isSolid();
    (this._config.rows || []).forEach((row, i) => {
      const el = this._rowEls[i];
      if (!el || !row.entity) return;
      const st = this._hass.states[row.entity];
      const type = ROW_TYPES.includes(row.type) ? row.type : "toggle";
      const color = this._rowColor(row, st);
      const active = this._isActive(row, st);
      const dragging = el.dataset.dragging === "1";
      if (solid && (type === "toggle" || type === "bar")) el.classList.toggle("info", !this._isSwitchable(row));
      setText(el.querySelector(".name"), this.template(row.name, row.entity) || this.entityName(row.entity, st));
      const sub = type === "stat" ? row.state_text ? this.template(row.state_text, row.entity) ?? "" : "" : this._subText(row, st);
      if (!(dragging && solid && type === "bar")) setText(el.querySelector(".sub"), sub);
      setAttr(el.querySelector("ha-icon"), "icon", this.template(row.icon, row.entity) || st?.attributes?.icon || this._defaultIcon(row, st));
      setStyle(el, "--c", color);
      if (type === "toggle") {
        el.classList.toggle("active", active);
        el.querySelector(".icon-box")?.classList.toggle("active", active);
        const t = el.querySelector(".toggle");
        if (t) {
          t.classList.toggle("on", active);
          setAttr(t, "aria-checked", active ? "true" : "false");
        }
        return;
      }
      if (type === "stat") {
        const raw = row.value != null ? this.template(row.value, row.entity) : st?.state;
        const num = typeof raw === "number" ? raw : parseFloat(raw);
        setText(el.querySelector(".stat-value"), raw == null || raw === "unavailable" || raw === "unknown" ? "\u2013" : String(raw));
        el.classList.toggle("zero", !Number.isFinite(num) || num <= 0);
        const line = el.querySelector(".stat-line");
        const showLine = row.line == null ? true : typeof row.line === "string" ? !!this.template(row.line, row.entity) : !!row.line;
        setStyle(line, "display", showLine ? "" : "none");
        setStyle(line, "width", row.max != null && Number.isFinite(num) && num > 0 ? `${Math.max(8, Math.min(100, (num - (row.min ?? 0)) / (row.max - (row.min ?? 0) || 1) * 100))}%` : "");
        return;
      }
      const pct = this._pctFor(row, st);
      if (type === "gauge") {
        el.querySelector(".ring-inner")?.classList.toggle("active", active);
        if (!dragging) {
          setStyle(el, "--glow", active ? Math.max(0.12, pct).toFixed(2) : 0);
          this._paintRing(el.querySelector(".ring"), pct, color, active);
        }
        return;
      }
      el.classList.toggle("active", active);
      el.querySelector(".icon-box")?.classList.toggle("active", active);
      if (!dragging) {
        setStyle(el, "--glow", active ? Math.max(0.12, pct).toFixed(2) : 0);
        setStyle(el.querySelector(".fill"), "width", `${pct * 100}%`);
        setStyle(el.querySelector(".lens"), "left", `calc(13px + (100% - 26px) * ${pct})`);
        setStyle(el.querySelector(".solid-fill"), "width", `${pct * 100}%`);
      }
    });
  }
  // ---- row helpers ---------------------------------------------------
  _defaultIcon(row, st) {
    const d = domainOf(row.entity);
    const on = this._isActive(row, st);
    return {
      light: on ? "mdi:lightbulb" : "mdi:lightbulb-outline",
      switch: on ? "mdi:toggle-switch" : "mdi:toggle-switch-off-outline",
      fan: "mdi:fan",
      input_boolean: "mdi:toggle-switch-outline",
      climate: "mdi:thermostat",
      binary_sensor: on ? "mdi:checkbox-marked-circle" : "mdi:checkbox-blank-circle-outline",
      sensor: "mdi:eye",
      number: "mdi:ray-vertex",
      input_number: "mdi:ray-vertex",
      cover: "mdi:window-shutter"
    }[d] || "mdi:circle-outline";
  }
  _isSwitchable(row) {
    const d = domainOf(row.entity);
    return d === "light" || d === "binary_sensor" || d === "timer" || TOGGLE_DOMAINS.includes(d);
  }
  _isActive(row, st) {
    if (this._isSwitchable(row)) return !!st && ["on", "open", "active"].includes(st.state);
    return true;
  }
  // Colour means state: lights in their own colour (warm when they can't
  // show one), heating orange, everything else the accent - unless the row
  // sets `color` (state name, HA colour name, CSS colour or template).
  _rowColor(row, st) {
    const own = resolveColor(this.template(row.color, row.entity));
    if (own) return own;
    const d = domainOf(row.entity);
    if (d === "light") return lightColor(st, row.entity, this._lastColor);
    if (d === "climate" || d === "water_heater") return STATE_COLORS.heat;
    return STATE_COLORS.accent;
  }
  _isEditable(row) {
    if (row.progress) return false;
    return ["number", "input_number", "light"].includes(domainOf(row.entity));
  }
  _pctFor(row, st) {
    if (row.progress) {
      const v2 = this.template(row.progress, row.entity);
      const n = typeof v2 === "number" ? v2 : parseFloat(v2);
      return Number.isFinite(n) ? Math.max(0, Math.min(1, n / 100)) : 0;
    }
    if (!st) return 0;
    if (domainOf(row.entity) === "light" && st.attributes.brightness != null) return Math.max(0, Math.min(1, st.attributes.brightness / 255));
    const v = parseFloat(st.state);
    if (Number.isNaN(v)) return 0;
    const min = row.min ?? 0, max = row.max ?? 100;
    return Math.max(0, Math.min(1, (v - min) / (max - min || 1)));
  }
  _subText(row, st) {
    if (row.power_entity) {
      const p = this._hass.states[row.power_entity];
      if (p && Number.isFinite(parseFloat(p.state))) return this.formatState(p);
    }
    if (row.state_text) {
      const r = this.template(row.state_text, row.entity);
      if (r != null && r !== "") return r;
    }
    return this.formatState(st);
  }
  _setNumeric(row, pct) {
    const d = domainOf(row.entity);
    const min = row.min ?? 0, max = row.max ?? 100;
    const value = Math.round((min + (max - min) * pct) * 100) / 100;
    if (d === "number" || d === "input_number") this._hass.callService(d, "set_value", { entity_id: row.entity, value });
    else if (d === "light") this._hass.callService("light", "turn_on", { entity_id: row.entity, brightness_pct: Math.round(pct * 100) });
  }
  _tap(row) {
    this.performAction(row.tap_action || this.defaultTapAction(row.entity), row.entity);
  }
  _hold(row) {
    haptic(this, "medium");
    this.performAction(row.hold_action || { action: "more-info" }, row.entity);
  }
  _row(el) {
    return this._config.rows[Number(el.dataset.i ?? el.dataset.rowI)];
  }
  // ---- input ---------------------------------------------------------
  _wire() {
    this._wired = true;
    const root = this.shadowRoot;
    root.addEventListener("click", (e) => {
      if (this._lpFired) {
        this._lpFired = false;
        return;
      }
      if (this._dragFired) {
        this._dragFired = false;
        return;
      }
      if (this.isSolid()) {
        const tile = e.target.closest(".pill[data-row-i], .bar-tile[data-row-i]");
        if (tile) {
          const row = this._row(tile);
          if (row?.entity) this._tap(row);
          return;
        }
      }
      const t = e.target.closest('[data-action="toggle"]');
      if (t) {
        this.toggle(this._row(t).entity);
        return;
      }
      if (e.target.closest('[data-action="icon-inert"]')) return;
      const icon = e.target.closest('[data-action="icon-tap"]');
      if (icon) {
        this._tap(this._row(icon));
        return;
      }
      const name = e.target.closest('[data-action="name-tap"]');
      if (name) {
        const row = this._row(name);
        if (row.tap_action) this._tap(row);
        else this.moreInfo(row.entity);
        return;
      }
      const rowEl = e.target.closest("[data-row-i]");
      if (rowEl) {
        const row = this._row(rowEl);
        if (row?.entity && !this._isEditable(row)) this._tap(row);
      }
    });
    root.addEventListener("pointerdown", (e) => {
      this._lpFired = false;
      this._dragFired = false;
      if (!e.target.closest(".body")) return;
      const solidBar = this.isSolid() && e.target.closest(".bar-tile[data-row-i]");
      if (solidBar) {
        this._startTileDrag(e, solidBar);
        this._startLongPress(e);
        return;
      }
      const track = e.target.closest('[data-action="drag-bar"]');
      const ring = e.target.closest('[data-action="drag-ring"]');
      if (track) this._startBarDrag(e, track);
      else if (ring) this._startRingDrag(e, ring);
      else this._startLongPress(e);
    });
  }
  _startLongPress(e) {
    const tile = e.target.closest("[data-row-i]");
    if (!tile || e.target.closest('[data-action="toggle"]')) return;
    const row = this._row(tile);
    if (!row?.entity) return;
    const x0 = e.clientX, y0 = e.clientY;
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("pointerup", cleanup, true);
      window.removeEventListener("pointercancel", cleanup, true);
      window.removeEventListener("pointermove", onMove, true);
    };
    const onMove = (ev) => {
      if (Math.abs(ev.clientX - x0) > 8 || Math.abs(ev.clientY - y0) > 8) cleanup();
    };
    const timer = setTimeout(() => {
      cleanup();
      this._lpFired = true;
      this._hold(row);
    }, 500);
    window.addEventListener("pointerup", cleanup, true);
    window.addEventListener("pointercancel", cleanup, true);
    window.addEventListener("pointermove", onMove, true);
  }
  _sender(row) {
    let last = 0;
    return (pct, throttle) => {
      const now = Date.now();
      if (throttle && now - last < 100) return;
      last = now;
      this._setNumeric(row, pct);
    };
  }
  _stepHaptic(state, pct) {
    const step = Math.floor(pct * 10);
    if (step !== state.step) {
      state.step = step;
      haptic(this, step >= 8 ? "medium" : step >= 4 ? "light" : "selection");
    }
  }
  _startBarDrag(e, trackEl) {
    const row = this._row(trackEl);
    if (!this._isEditable(row)) return;
    const tile = trackEl.closest("[data-row-i]");
    tile.dataset.dragging = "1";
    trackEl.setPointerCapture(e.pointerId);
    const send = this._sender(row);
    const hs = { step: -1 };
    let pct = 0;
    const at = (ev) => {
      const r = trackEl.getBoundingClientRect();
      pct = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      setStyle(trackEl.querySelector(".fill"), "width", `${pct * 100}%`);
      setStyle(trackEl.querySelector(".lens"), "left", `calc(13px + (100% - 26px) * ${pct})`);
      setStyle(tile, "--glow", Math.max(0.12, pct).toFixed(2));
    };
    const done = () => {
      trackEl.removeEventListener("pointermove", move);
      trackEl.removeEventListener("pointerup", up);
      trackEl.removeEventListener("pointercancel", done);
      delete tile.dataset.dragging;
      this.update();
    };
    const move = (ev) => {
      at(ev);
      this._stepHaptic(hs, pct);
      send(pct, true);
    };
    const up = (ev) => {
      at(ev);
      send(pct, false);
      done();
    };
    trackEl.addEventListener("pointermove", move);
    trackEl.addEventListener("pointerup", up);
    trackEl.addEventListener("pointercancel", done);
  }
  // Solid bar tiles: the whole tile is the slider, relative to where the
  // finger started; vertical movement stays a scroll.
  _startTileDrag(e, tile) {
    const row = this._row(tile);
    if (!row?.entity || row.hide_track || !this._isEditable(row)) return;
    const id = e.pointerId, x0 = e.clientX, y0 = e.clientY;
    const start = this._pctFor(row, this._hass.states[row.entity]);
    const fill = tile.querySelector(".solid-fill");
    const sub = tile.querySelector(".sub");
    const send = this._sender(row);
    const hs = { step: -1 };
    let dragging = false, refX = x0, width = 1, pct = start;
    const paint = () => {
      setStyle(fill, "width", `${pct * 100}%`);
      setText(sub, this._dragLabel(row, pct));
    };
    const done = () => {
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", cancel, true);
      if (tile.dataset.dragging) {
        delete tile.dataset.dragging;
        this.update();
      }
    };
    const move = (ev) => {
      if (ev.pointerId !== id) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!dragging) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) && !this._lpFired) {
          dragging = true;
          refX = ev.clientX;
          width = tile.getBoundingClientRect().width || 1;
          tile.dataset.dragging = "1";
          try {
            tile.setPointerCapture(id);
          } catch (err) {
          }
          paint();
        } else if (Math.abs(dy) > 8 || this._lpFired) {
          if (Math.abs(dy) > 8) this._dragFired = true;
          done();
        }
        return;
      }
      if (ev.cancelable) ev.preventDefault();
      pct = Math.max(0, Math.min(1, start + (ev.clientX - refX) / width));
      paint();
      this._stepHaptic(hs, pct);
      send(pct, true);
    };
    const up = (ev) => {
      if (ev.pointerId !== id) return;
      if (dragging) {
        send(pct, false);
        this._dragFired = true;
      }
      done();
    };
    const cancel = (ev) => {
      if (ev.pointerId === id) done();
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", cancel, true);
  }
  _dragLabel(row, pct) {
    if (domainOf(row.entity) === "light") return `${Math.round(pct * 100)} %`;
    const min = row.min ?? 0, max = row.max ?? 100;
    const v = Math.round((min + (max - min) * pct) * 100) / 100;
    const unit = this._hass?.states[row.entity]?.attributes?.unit_of_measurement;
    return unit ? `${v} ${unit}` : String(v);
  }
  _startRingDrag(e, ringEl) {
    const row = this._row(ringEl);
    if (!this._isEditable(row)) return;
    const tile = ringEl.closest("[data-row-i]");
    tile.dataset.dragging = "1";
    ringEl.setPointerCapture(e.pointerId);
    const st = this._hass.states[row.entity];
    const color = this._rowColor(row, st);
    const active = this._isActive(row, st);
    const send = this._sender(row);
    const hs = { step: -1 };
    let pct = 0;
    const at = (ev) => {
      const r = ringEl.getBoundingClientRect();
      let deg = Math.atan2(ev.clientX - (r.left + r.width / 2), -(ev.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
      if (deg < 0) deg += 360;
      pct = deg / 360;
      this._paintRing(ringEl, pct, color, active);
    };
    const done = () => {
      ringEl.removeEventListener("pointermove", move);
      ringEl.removeEventListener("pointerup", up);
      ringEl.removeEventListener("pointercancel", done);
      delete tile.dataset.dragging;
      this.update();
    };
    const move = (ev) => {
      at(ev);
      this._stepHaptic(hs, pct);
      send(pct, true);
    };
    const up = (ev) => {
      at(ev);
      send(pct, false);
      done();
    };
    at(e);
    ringEl.addEventListener("pointermove", move);
    ringEl.addEventListener("pointerup", up);
    ringEl.addEventListener("pointercancel", done);
  }
  _paintRing(ringEl, pct, color, active) {
    if (!ringEl) return;
    const key = `${pct}|${color}|${active}|${this.glowOn()}`;
    if (ringEl._pPainted === key) return;
    ringEl._pPainted = key;
    const deg = pct * 360;
    const track = `color-mix(in srgb, ${INK} 14%, transparent)`;
    ringEl.style.background = `conic-gradient(${color} 0deg, ${color} ${deg}deg, ${track} ${deg}deg)`;
    ringEl.style.boxShadow = active && this.glowOn() ? `0 0 ${Math.round(8 + pct * 10)}px -4px ${color}` : "none";
    const lens = ringEl.querySelector(".ring-lens");
    if (lens) {
      const th = pct * 2 * Math.PI;
      lens.style.left = `${37 + 33 * Math.sin(th)}px`;
      lens.style.top = `${37 - 33 * Math.cos(th)}px`;
      lens.style.transform = `translate(-50%,-50%) rotate(${deg}deg)`;
    }
  }
  static getConfigElement() {
    return document.createElement(_PaneTileCard.editorTag);
  }
};
var COLOR_OPTIONS = [
  { value: "auto", label: "Automatisch" },
  { value: "warm", label: "Warm (Licht, Sonne)" },
  { value: "heat", label: "Heizen" },
  { value: "accent", label: "Akzent" },
  { value: "ok", label: "OK / l\xE4uft" },
  { value: "alert", label: "Warnung" }
];
var PaneTileCardEditor = class extends PaneEditor {
  labels() {
    return {
      title: "Titel",
      icon: "Icon",
      subtitle: "Untertitel",
      icon_color: "Icon-Farbe",
      header_action: "Knopf rechts",
      columns: "Spalten",
      look: "Look",
      frame: "Eigener Rahmen",
      glow: "Leuchten",
      stat_size: "Zahlen",
      entity: "Entit\xE4t",
      type: "Art",
      name: "Name",
      color: "Farbe",
      min: "Minimum",
      max: "Maximum",
      hide_track: "Leiste ausblenden",
      power_entity: "Leistung aus Entit\xE4t",
      state_text: "Statuszeile",
      progress: "F\xFCllstand (Vorlage)",
      value: "Wert (Vorlage)",
      tap_action: "Antippen",
      hold_action: "Lang dr\xFCcken",
      line: "Linie zeigen"
    };
  }
  helpers() {
    return {
      subtitle: "Leer = automatisch (\u201E3 von 6 an\u201C), \u201Enone\u201C = keiner. Vorlagen mit [[[ \u2026 ]]] m\xF6glich.",
      state_text: "Leer = Zustand der Entit\xE4t. Vorlagen mit [[[ \u2026 ]]] m\xF6glich.",
      color: "Automatisch: Licht in seiner Farbe, sonst Akzent. Eigene Farbe als Hex eintippen."
    };
  }
  sections() {
    const c = this._config || {};
    const data = {
      ...c,
      columns: String(c.columns ?? (c.layout === "grid" ? 2 : 1)),
      look: c.look || "theme",
      frame: c.frame !== false,
      glow: c.glow !== false,
      icon_color: c.icon_color || "auto",
      header_action: c.header_action || "none",
      stat_size: c.stat_size || "normal"
    };
    const select = (options, extra = {}) => ({ select: { mode: "dropdown", options, ...extra } });
    return [
      {
        title: "Kopfzeile",
        schema: [
          { name: "title", selector: { text: {} } },
          { type: "grid", name: "", schema: [
            { name: "icon", selector: { icon: {} } },
            { name: "icon_color", selector: select(COLOR_OPTIONS, { custom_value: true }) }
          ] },
          { name: "subtitle", selector: { text: {} } },
          { name: "header_action", selector: select([{ value: "none", label: "Keiner" }, { value: "all_off", label: "Alles aus" }]) }
        ],
        data: () => data,
        set: (v) => this._setTop(v)
      },
      {
        key: "rows",
        title: "Kacheln",
        list: {
          items: () => c.rows || [],
          set: (rows) => this.emit({ ...this._config, rows }),
          create: () => ({ entity: "", type: "toggle" }),
          addLabel: "+ Kachel hinzuf\xFCgen",
          title: (r, hass) => r.name || hass?.states[r.entity]?.attributes?.friendly_name || r.entity || "Neue Kachel",
          subtitle: (r) => [r.entity, { toggle: "Schalter", bar: "Balken", gauge: "Ring", stat: "Zahl" }[r.type || "toggle"]].filter(Boolean).join(" \xB7 "),
          icon: (r, hass) => r.icon || hass?.states[r.entity]?.attributes?.icon || "mdi:drag-vertical",
          signature: (r) => r.type || "toggle",
          schema: (r) => this._rowSchema(r),
          data: (r) => ({ type: "toggle", color: "auto", ...r }),
          merge: (r, v) => {
            const next = PaneEditor.clean({ ...v });
            if (next.color === "auto") delete next.color;
            if (next.hide_track === false) delete next.hide_track;
            if (next.line === true) delete next.line;
            return next;
          }
        }
      },
      {
        title: "Darstellung",
        schema: [
          { type: "grid", name: "", schema: [
            { name: "columns", selector: select([{ value: "1", label: "Liste" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]) },
            { name: "look", selector: select([{ value: "theme", label: "Vom Theme" }, { value: "glass", label: "Glass" }, { value: "solid", label: "Solid" }]) }
          ] },
          { type: "grid", name: "", schema: [
            { name: "frame", selector: { boolean: {} } },
            { name: "glow", selector: { boolean: {} } }
          ] },
          { name: "stat_size", selector: select([{ value: "normal", label: "Normal" }, { value: "large", label: "Gro\xDF" }]) }
        ],
        data: () => data,
        set: (v) => this._setTop(v)
      }
    ];
  }
  _rowSchema(r) {
    const type = r.type || "toggle";
    const s = [
      { name: "entity", required: true, selector: { entity: {} } },
      { name: "type", selector: { select: { mode: "box", options: [
        { value: "toggle", label: "Schalter" },
        { value: "bar", label: "Balken" },
        { value: "gauge", label: "Ring" },
        { value: "stat", label: "Zahl" }
      ] } } },
      { type: "grid", name: "", schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } }
      ] },
      { name: "color", selector: { select: { mode: "dropdown", custom_value: true, options: COLOR_OPTIONS } } }
    ];
    if (type === "bar" || type === "gauge" || type === "stat") {
      s.push({ type: "grid", name: "", schema: [
        { name: "min", selector: { number: { mode: "box", step: "any" } } },
        { name: "max", selector: { number: { mode: "box", step: "any" } } }
      ] });
    }
    if (type === "bar") s.push({ name: "hide_track", selector: { boolean: {} } });
    if (type === "toggle") s.push({ name: "power_entity", selector: { entity: { domain: "sensor" } } });
    if (type === "stat") s.push({ name: "value", selector: { text: {} } }, { name: "line", selector: { boolean: {} } });
    if (type !== "stat") s.push({ name: "state_text", selector: { text: {} } });
    if (type === "bar" || type === "gauge") s.push({ name: "progress", selector: { text: {} } });
    s.push(
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } }
    );
    return s;
  }
  _setTop(v) {
    const next = { ...this._config, ...v };
    delete next.layout;
    next.columns = Number(v.columns ?? next.columns) || 1;
    if (next.columns === 1) delete next.columns;
    if (next.look === "theme") delete next.look;
    if (next.frame === true) delete next.frame;
    if (next.glow === true) delete next.glow;
    if (next.icon_color === "auto") delete next.icon_color;
    if (next.header_action === "none") delete next.header_action;
    if (next.stat_size === "normal") delete next.stat_size;
    const rows = next.rows;
    const cleaned = PaneEditor.clean(next);
    cleaned.rows = rows || [];
    this.emit(cleaned);
  }
};

// src/index.js
var VERSION = CARD_VERSION;
var SUFFIX = "-dev";
console.info(
  `%c PANE-CARDS %c v${VERSION}${SUFFIX ? " (Lab)" : ""} `,
  "color:#fff;background:#3B6FD8;font-weight:700",
  "color:#3B6FD8;background:#fff;font-weight:700"
);
var CARDS = [
  {
    cls: PaneTileCard,
    editor: PaneTileCardEditor,
    tag: "pane-tile-card",
    name: "Pane Tile Card",
    description: "Kacheln f\xFCr Licht, Schalter, Werte und Zahlen \u2013 Schalter, Balken, Ring oder Zahl, alles im visuellen Editor.",
    // Older configs keep working when the old card is not installed.
    aliases: ["liquid-glass-tile-card-v2"]
  }
];
var define = (tag, cls) => {
  if (customElements.get(tag)) return false;
  customElements.define(tag, cls);
  return true;
};
window.customCards = window.customCards || [];
CARDS.forEach((c) => {
  const tag = c.tag + SUFFIX;
  c.cls.editorTag = `${tag}-editor`;
  define(c.cls.editorTag, class extends c.editor {
  });
  if (define(tag, c.cls)) {
    window.customCards.push({
      type: tag,
      name: c.name + (SUFFIX ? " (Lab)" : ""),
      description: c.description,
      preview: true,
      documentationURL: "https://github.com/donsebby/pane-cards"
    });
  }
  if (!SUFFIX) (c.aliases || []).forEach((a) => define(a, class extends c.cls {
  }));
});
