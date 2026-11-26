// Pane Cards 0.2.0 - https://github.com/donsebby/pane-cards (MIT)
const CARD_VERSION = '0.2.0';

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
  // null: own panel, none inside a pop-up. Cards that are sections of the
  // page rather than panels (today, rooms) return false.
  defaultFrame() {
    return null;
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
    const inPopup = _PaneCard.insidePopup(this);
    if (inPopup !== this._inPopup) {
      this._inPopup = inPopup;
      if (this.cardEl) this._applyCardClasses();
    }
  }
  static insidePopup(el) {
    let n = el.parentNode || el.host;
    for (let i = 0; n && i < 60; i += 1) {
      const cl = n.classList;
      if (cl && (cl.contains("bubble-pop-up") || cl.contains("bubble-pop-up-container"))) return true;
      if (n.localName === "ha-more-info-dialog" || n.localName === "ha-dialog") return true;
      n = n.parentNode || n.host;
    }
    return false;
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
    const frame = c.frame ?? this.defaultFrame();
    this.cardEl.classList.toggle("frameless", frame === false || frame == null && !!this._inPopup);
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
  static clean(obj2) {
    const out = {};
    Object.entries(obj2).forEach(([k, v]) => {
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
      frame: "Rahmen",
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
      frame: c.frame === void 0 ? "auto" : c.frame ? "on" : "off",
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
            { name: "frame", selector: select([{ value: "auto", label: "Automatisch (kein Rahmen im Pop-up)" }, { value: "on", label: "Immer" }, { value: "off", label: "Nie" }]) },
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
    if (next.frame === "auto") delete next.frame;
    else if (next.frame === "on") next.frame = true;
    else if (next.frame === "off") next.frame = false;
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

// src/cards/rooms.js
var HGC_INK = "var(--text-1, var(--primary-text-color, #fff))";
var HGC_INK2 = "var(--text-2, var(--secondary-text-color, rgba(255,255,255,.65)))";
var HGC_COLORS = ["#FFB020", "#8C7BFF", "#4F8CFF", "#FF5FA2", "#34C759", "#C86BFF", "#2EC4B6", "#FF7A45"];
var HGC_HINT = { window: "#2EC4B6", heat: "#FF7A45", manual: "#FF7A45", media: "#A66CFF", light: "#FFB020" };
var hgcEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
var hgcDeg = (v) => Number.isFinite(v) ? v.toFixed(1).replace(".", ",") + "\xB0" : "\u2013";
var GLASS_BG = (tint, a, b) => `linear-gradient(160deg, color-mix(in srgb, ${tint} ${a}, color-mix(in srgb, #fff 16%, transparent)), color-mix(in srgb, ${tint} ${b}, color-mix(in srgb, #fff 4%, transparent)))`;
var HGC_GLASS = `
  .card:not(.solid) .blk, .card:not(.solid) .tiles .room {
    -webkit-backdrop-filter: var(--pane-backdrop, blur(22px) saturate(170%)); backdrop-filter: var(--pane-backdrop, blur(22px) saturate(170%));
    border: 1px solid color-mix(in srgb, #fff 22%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 45%, transparent), 0 14px 32px rgba(6, 10, 30, 0.22); }
  .card:not(.solid) .blk { background: ${GLASS_BG("#fff", "0%", "0%")}; }
  .card:not(.solid) .tiles .room { background: ${GLASS_BG("var(--rc)", "30%", "14%")}; }
  .card:not(.solid) .tiles .room:hover { background: ${GLASS_BG("var(--rc)", "40%", "20%")}; }
  .card:not(.solid) .chip { box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 50%, transparent); }
`;
var HGC_STYLE = `
  :host { display:block; font-family: -apple-system, "SF Pro Text", Inter, var(--paper-font-body1_-_font-family, Helvetica), sans-serif; color:${HGC_INK}; }
  .blk { background: var(--surface, color-mix(in srgb, ${HGC_INK} 7%, transparent)); border-radius: var(--lg-radius, 20px);
    backdrop-filter: var(--pane-backdrop, none); -webkit-backdrop-filter: var(--pane-backdrop, none);
    box-shadow: inset 0 0 0 1px var(--pane-border, rgba(255,255,255,.06)); padding:6px 6px 8px; }
  .bt { color:${HGC_INK2}; font-size:13px; font-weight:500; padding:8px 12px 6px; }
  .grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:6px; padding:0 4px; }
  .room { display:flex; flex-direction:column; gap:4px; min-height:92px; box-sizing:border-box; padding:12px 14px; border-radius:16px;
    background: color-mix(in srgb, ${HGC_INK} 5%, transparent); cursor:pointer; -webkit-tap-highlight-color:transparent; transition: background .2s ease; }
  .room:hover { background: color-mix(in srgb, ${HGC_INK} 9%, transparent); }
  .rn { font-size:13px; color:${HGC_INK2}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .rt { font-size:26px; font-weight:500; line-height:1.1; font-variant-numeric: tabular-nums; letter-spacing:-0.01em; }
  .rh { font-size:12px; color: var(--h, ${HGC_INK2}); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-height:15px; }
  .row { display:flex; align-items:center; gap:12px; min-height:52px; box-sizing:border-box; padding:6px 12px; margin-top:6px; border-radius:14px; }
  .row ha-icon { --mdc-icon-size:22px; color:#FFC145; flex:none; }
  .t { flex:1; min-width:0; }
  .tt { font-size:15px; font-weight:500; }
  .ts { font-size:13px; color:${HGC_INK2}; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .btn { display:inline-flex; align-items:center; gap:6px; height:40px; padding:0 16px; border-radius:999px; flex:none;
    background: color-mix(in srgb, ${HGC_INK} 12%, transparent); font-size:14px; font-weight:500; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .btn ha-icon { --mdc-icon-size:18px; color:inherit; }
  .tiles .head { font-size:15px; font-weight:700; padding:2px 4px 8px; color:${HGC_INK}; }
  .tiles .grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:10px; padding:0; }
  .tiles .room { min-height:104px; justify-content:space-between; padding:12px 14px; border-radius: var(--lg-radius, 20px);
    background: color-mix(in srgb, var(--rc) var(--room-tint, 26%), var(--surface, rgba(255,255,255,.5)));
    border: 1px solid var(--pane-border, rgba(255,255,255,.08));
    backdrop-filter: var(--pane-backdrop, none); -webkit-backdrop-filter: var(--pane-backdrop, none); }
  .tiles .room:hover { background: color-mix(in srgb, var(--rc) calc(var(--room-tint, 26%) + 8%), var(--surface, rgba(255,255,255,.5))); }
  .tiles .rn { font-size:14px; font-weight:600; color:${HGC_INK}; order:3; }
  .tiles .rt { font-size:24px; font-weight:600; order:2; }
  .tiles .rh { order:1; min-height:20px; }
  .pill { display:inline-block; font-size:11px; font-weight:600; padding:2px 8px; border-radius:999px; color:${HGC_INK};
    background: color-mix(in srgb, var(--hc) 30%, transparent); max-width:100%; box-sizing:border-box; overflow:hidden; text-overflow:ellipsis; }
  .tiles .blk { margin-top:10px; }
  .tiles .row { margin-top:0; }
  .chip { width:34px; height:34px; border-radius:10px; display:grid; place-items:center; flex:none; background:#FFB020; }
  .chip ha-icon { --mdc-icon-size:20px; color:#3A2600 !important; }
  .tiles .btn { background: color-mix(in srgb, #FFB020 30%, transparent); }
  @media (max-width: 600px) {
    .tiles .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap:8px; }
    .tiles .room { min-height:100px; padding:10px 12px; }
    .tiles .rt { font-size:20px; }
    .tiles .rn { font-size:13px; }
  }
  @media (max-width: 600px) {
    .root:not(.tiles) .grid { grid-template-columns: 1fr; gap:0; }
    .root:not(.tiles) .room { flex-direction:row; align-items:center; min-height:48px; padding:6px 12px; background:none; gap:10px; }
    .root:not(.tiles) .rn { flex:1; font-size:15px; font-weight:500; color:${HGC_INK}; }
    .root:not(.tiles) .rh { order:2; min-height:0; }
    .root:not(.tiles) .rt { order:3; font-size:17px; width:56px; text-align:right; }
  }
`;
var PaneRoomsCard = class _PaneRoomsCard extends PaneCard {
  static get styles() {
    return HGC_STYLE + HGC_GLASS;
  }
  static getStubConfig(hass) {
    const climates = Object.keys(hass?.states || {}).filter((e) => e.startsWith("climate.")).slice(0, 3);
    return { title: "R\xE4ume", tiles: true, rooms: climates.length ? climates.map((c) => ({ name: hass.states[c].attributes.friendly_name || c, climate: c })) : [{ name: "Wohnzimmer" }] };
  }
  validateConfig(config) {
    if (!Array.isArray(config.rooms)) throw new Error('Pane Rooms Card: "rooms" fehlt.');
  }
  defaultFrame() {
    return false;
  }
  build() {
    this._config = { title: "Zuhause", ...this._config };
    if (!this._root) {
      this._root = document.createElement("div");
      this._root.className = "root";
      this.bodyEl.appendChild(this._root);
      this._root.addEventListener("click", (e) => this._onClick(e));
    }
    this._sig = null;
  }
  // Renders only when one of the watched entities changed.
  update() {
    const hass = this._hass;
    const sig = this._watched().map((id) => hass.states[id]?.last_updated).join("|");
    if (sig !== this._sig) {
      this._sig = sig;
      this._render();
    }
  }
  static getConfigElement() {
    return document.createElement(_PaneRoomsCard.editorTag);
  }
  getCardSize() {
    return 6;
  }
  getGridOptions() {
    return { columns: "full" };
  }
  // Lights per area (entity area, else its device's area) and the labelled lamps.
  _index() {
    const h = this._hass;
    if (this._idxFor === h.entities) return;
    this._idxFor = h.entities;
    const byArea = {}, labelled = [], lbl = this._config.lights_label;
    for (const [id, e] of Object.entries(h.entities || {})) {
      if (!id.startsWith("light.") || e.hidden) continue;
      const area = e.area_id || e.device_id && h.devices?.[e.device_id]?.area_id;
      const isLamp = !!lbl && (e.labels || []).includes(lbl);
      if (isLamp) labelled.push(id);
      if (area && (!lbl || isLamp)) (byArea[area] = byArea[area] || []).push(id);
    }
    this._lightsByArea = byArea;
    this._lamps = labelled;
  }
  _watched() {
    this._index();
    const ids = [];
    this._config.rooms.forEach((r) => {
      ids.push(r.climate, r.temperature, r.heating_status, ...r.windows || [], ...(r.media || []).map((m) => m.entity || m));
      if (r.area) ids.push(...this._lightsByArea[r.area] || []);
    });
    ids.push(...this._lamps);
    return ids.filter(Boolean);
  }
  _hint(r) {
    const h = this._hass, on = (id) => h.states[id]?.state === "on";
    const open = (r.windows || []).filter(on);
    if (open.length) return ["Fenster offen", "#FFC145", "window"];
    const hs = r.heating_status && h.states[r.heating_status];
    const text = hs ? String(hs.state).trim() : "";
    const man = /^Manuell\s+([\d,.]+)\s*°C(?:\s+bis\s+(\d{1,2}:\d{2}))?/i.exec(text);
    if (man) {
      const deg = man[1].replace(".", ",").replace(/,0+$/, "");
      return [`Hand ${deg}\xB0${man[2] ? ` bis ${man[2]}` : ""}`, "#FF9E6B", "manual"];
    }
    if (/^Fenster/i.test(text) && !(r.windows || []).length) return ["Fenster offen", "#FFC145", "window"];
    const cl = r.climate && h.states[r.climate];
    if (cl && cl.attributes.hvac_action === "heating") {
      const t = parseFloat(cl.attributes.temperature), cur = this._temp(r);
      if (!Number.isFinite(t) || !Number.isFinite(cur) || cur < t - 0.5) return [Number.isFinite(t) ? `heizt auf ${hgcDeg(t)}` : "heizt", "#FF9E6B", "heat"];
    }
    for (const m of r.media || []) {
      const st = h.states[m.entity || m];
      if (st && st.state === "playing") return [`${m.name || st.attributes.friendly_name} spielt`, "var(--mood, #8FA8FF)", "media"];
    }
    const lights = (this._lightsByArea[r.area] || []).filter(on).length;
    if (lights) return [lights === 1 ? "Licht an" : `${lights} Lampen an`, "", "light"];
    return ["", "", ""];
  }
  _temp(r) {
    const h = this._hass;
    const s = r.temperature && h.states[r.temperature];
    if (s && Number.isFinite(parseFloat(s.state))) return parseFloat(s.state);
    const cl = r.climate && h.states[r.climate];
    return cl ? parseFloat(cl.attributes.current_temperature) : NaN;
  }
  _render() {
    if (!this._hass || !this._root) return;
    const h = this._hass, c = this._config;
    const tiles = !!c.tiles;
    this._root.classList.toggle("tiles", tiles);
    const rooms = c.rooms.map((r, i) => {
      const [hint, col, kind] = this._hint(r);
      if (tiles) {
        const rc = r.color || HGC_COLORS[i % HGC_COLORS.length];
        const pill = hint ? `<span class="pill" style="--hc:${HGC_HINT[kind] || "#9AA3B8"}">${hgcEsc(hint)}</span>` : "";
        return `<div class="room" data-room="${i}" role="button" tabindex="0" style="--rc:${hgcEsc(rc)}"><span class="rh">${pill}</span>
          <span class="rt">${hgcDeg(this._temp(r))}</span><span class="rn">${hgcEsc(r.name)}</span></div>`;
      }
      return `<div class="room" data-room="${i}" role="button" tabindex="0"><span class="rn">${hgcEsc(r.name)}</span>
        <span class="rt">${hgcDeg(this._temp(r))}</span><span class="rh" style="${col ? `--h:${col}` : ""}">${hgcEsc(hint)}</span></div>`;
    }).join("");
    const on = this._lamps.filter((id) => h.states[id]?.state === "on");
    const names = on.map((id) => h.states[id].attributes.friendly_name || id);
    const lampIcon = tiles ? '<span class="chip"><ha-icon icon="mdi:lightbulb-on"></ha-icon></span>' : '<ha-icon icon="mdi:lightbulb-on-outline"></ha-icon>';
    const lamps = on.length ? `<div class="row">${lampIcon}<div class="t"><div class="tt">${on.length === 1 ? hgcEsc(names[0]) + " ist an" : on.length + " Lampen an"}</div>${on.length > 1 ? `<div class="ts">${hgcEsc(names.slice(0, 3).join(", "))}${on.length > 3 ? " \u2026" : ""}</div>` : ""}</div><div class="btn" data-act="off" role="button" tabindex="0"><ha-icon icon="mdi:power"></ha-icon>Alle aus</div></div>` : "";
    this._root.innerHTML = tiles ? `${c.title ? `<div class="head">${hgcEsc(c.title)}</div>` : ""}<div class="grid">${rooms}</div>${lamps ? `<div class="blk">${lamps}</div>` : ""}` : `<div class="blk"><div class="bt">${hgcEsc(c.title)}</div><div class="grid">${rooms}</div>${lamps}</div>`;
  }
  _onClick(e) {
    if (e.target.closest('[data-act="off"]')) {
      const on = this._lamps.filter((id2) => this._hass.states[id2]?.state === "on");
      if (on.length) this._hass.callService("light", "turn_off", { entity_id: on });
      this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
      return;
    }
    const el = e.target.closest("[data-room]");
    if (!el) return;
    const r = this._config.rooms[Number(el.dataset.room)];
    if (!r) return;
    if (r.navigate) {
      history.pushState(null, "", r.navigate);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      return;
    }
    const id = r.climate || r.temperature;
    if (id) this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: id } }));
  }
};
var ROOM_COLORS = [
  { value: "auto", label: "Automatisch" },
  { value: "#FFB020", label: "Gelb" },
  { value: "#8C7BFF", label: "Violett" },
  { value: "#4F8CFF", label: "Blau" },
  { value: "#FF5FA2", label: "Pink" },
  { value: "#34C759", label: "Gr\xFCn" },
  { value: "#C86BFF", label: "Lila" },
  { value: "#2EC4B6", label: "T\xFCrkis" },
  { value: "#FF7A45", label: "Orange" }
];
var PaneRoomsCardEditor = class extends PaneEditor {
  labels() {
    return {
      title: "Titel",
      tiles: "Farbige Kacheln",
      lights_label: "Label der Lampen",
      look: "Look",
      name: "Name",
      area: "Bereich",
      climate: "Thermostat",
      temperature: "Temperatur-Sensor",
      windows: "Fenster",
      media: "Medien",
      navigate: "Antippen \xF6ffnet",
      color: "Farbe",
      heating_status: "Heizungs-Status"
    };
  }
  helpers() {
    return {
      lights_label: "Lampen mit diesem Label z\xE4hlen f\xFCr \u201EN Lampen an\u201C und \u201EAlle aus\u201C.",
      area: "Eingeschaltete Lampen in diesem Bereich zeigen \u201ELicht an\u201C.",
      temperature: "Leer = aktuelle Temperatur des Thermostats.",
      heating_status: "Text wie \u201AManuell 22,0 \xB0C bis 18:00\u2018 zeigt \u201AHand 22\xB0 bis 18:00\u2018.",
      navigate: "Zum Beispiel #raum-wohnzimmer f\xFCr ein Pop-up. Leer = Details von Thermostat oder Sensor."
    };
  }
  sections() {
    const c = this._config || {};
    const top = { ...c, tiles: !!c.tiles, look: c.look || "theme" };
    return [
      {
        title: "Karte",
        schema: [
          { name: "title", selector: { text: {} } },
          { type: "grid", name: "", schema: [
            { name: "tiles", selector: { boolean: {} } },
            { name: "look", selector: { select: { mode: "dropdown", options: [{ value: "theme", label: "Vom Theme" }, { value: "glass", label: "Glass" }, { value: "solid", label: "Solid" }] } } }
          ] },
          { name: "lights_label", selector: { label: {} } }
        ],
        data: () => top,
        set: (v) => {
          const next = { ...this._config, ...v };
          if (!next.tiles) delete next.tiles;
          if (next.look === "theme") delete next.look;
          const rooms = next.rooms;
          const out = PaneEditor.clean(next);
          out.rooms = rooms || [];
          this.emit(out);
        }
      },
      {
        key: "rooms",
        title: "R\xE4ume",
        list: {
          items: () => c.rooms || [],
          set: (rooms) => this.emit({ ...this._config, rooms }),
          create: () => ({ name: "Neuer Raum" }),
          addLabel: "+ Raum hinzuf\xFCgen",
          title: (r) => r.name,
          subtitle: (r) => r.climate || r.temperature || "",
          icon: () => "mdi:floor-plan",
          schema: () => [
            { name: "name", required: true, selector: { text: {} } },
            { type: "grid", name: "", schema: [
              { name: "area", selector: { area: {} } },
              { name: "color", selector: { select: { mode: "dropdown", custom_value: true, options: ROOM_COLORS } } }
            ] },
            { name: "climate", selector: { entity: { domain: "climate" } } },
            { name: "temperature", selector: { entity: { domain: "sensor", device_class: "temperature" } } },
            { name: "heating_status", selector: { entity: { domain: "sensor" } } },
            { name: "windows", selector: { entity: { domain: "binary_sensor", multiple: true } } },
            { name: "media", selector: { entity: { domain: "media_player", multiple: true } } },
            { name: "navigate", selector: { text: {} } }
          ],
          data: (r) => ({ color: "auto", ...r, media: (r.media || []).map((m) => m.entity || m) }),
          merge: (r, v) => {
            const names = Object.fromEntries((r.media || []).map((m) => [m.entity || m, m.name]));
            const next = PaneEditor.clean({ ...v });
            if (next.color === "auto") delete next.color;
            if (Array.isArray(next.windows) && !next.windows.length) delete next.windows;
            if (Array.isArray(next.media)) {
              if (!next.media.length) delete next.media;
              else next.media = next.media.map((id) => names[id] ? { entity: id, name: names[id] } : { entity: id });
            }
            return next;
          }
        }
      }
    ];
  }
};

// src/cards/today.js
var TDC_DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
var TDC_MONTHS = ["Januar", "Februar", "M\xE4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
var tdcMon = (d) => {
  const m = TDC_MONTHS[d.getMonth()];
  return m.length <= 4 ? m : m.slice(0, 3) + ".";
};
var TDC_COND = {
  "clear-night": ["Klar", "mdi:weather-night"],
  cloudy: ["Bedeckt", "mdi:weather-cloudy"],
  fog: ["Nebel", "mdi:weather-fog"],
  hail: ["Hagel", "mdi:weather-hail"],
  lightning: ["Gewitter", "mdi:weather-lightning"],
  "lightning-rainy": ["Gewitter", "mdi:weather-lightning-rainy"],
  partlycloudy: ["Heiter bis wolkig", "mdi:weather-partly-cloudy"],
  pouring: ["Starkregen", "mdi:weather-pouring"],
  rainy: ["Regen", "mdi:weather-rainy"],
  snowy: ["Schnee", "mdi:weather-snowy"],
  "snowy-rainy": ["Schneeregen", "mdi:weather-snowy-rainy"],
  sunny: ["Sonnig", "mdi:weather-sunny"],
  windy: ["Windig", "mdi:weather-windy"],
  "windy-variant": ["Windig", "mdi:weather-windy-variant"],
  exceptional: ["Unwetter", "mdi:alert"]
};
var TDC_COLORS = { indigo: "#7986cb", cyan: "#4dd0e1", teal: "#4db6ac", green: "#81c784", yellow: "#fdd835", pink: "#f06292", brown: "#a1887f", blue: "#64b5f6", red: "#e57373", orange: "#ffb74d", purple: "#ba68c8" };
var tdcEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var TDC_INK = "var(--text-1, var(--primary-text-color, #fff))";
var TDC_INK2 = "var(--text-2, var(--secondary-text-color, rgba(255,255,255,.65)))";
var TDC_GLASS = `
  .card:not(.solid) .blk, .card:not(.solid) .colorful .wxpill {
    background: linear-gradient(160deg, color-mix(in srgb, #fff 16%, transparent), color-mix(in srgb, #fff 5%, transparent) 45%, color-mix(in srgb, #fff 8%, transparent));
    -webkit-backdrop-filter: var(--pane-backdrop, blur(22px) saturate(170%)); backdrop-filter: var(--pane-backdrop, blur(22px) saturate(170%));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, #fff 20%, transparent), inset 0 1px 0 color-mix(in srgb, #fff 45%, transparent), 0 14px 32px rgba(6, 10, 30, 0.22); }
  .card:not(.solid) .colorful .row > ha-icon:first-child { box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 35%, transparent); }
`;
var TDC_STYLE = `
  :host { display:block; font-family: -apple-system, "SF Pro Text", Inter, var(--paper-font-body1_-_font-family, Helvetica), sans-serif; color:${TDC_INK}; }
  .hero { min-height: clamp(150px, 20vh, 240px); display:flex; flex-direction:column; justify-content:flex-end; padding: 4px 6px 22px; }
  /* Wide screens: other columns start at the top, so the hero does too. */
  @media (min-width: 1024px) { .hero { min-height:0; justify-content:flex-start; padding-top:8px; } }
  .date { color:${TDC_INK2}; font-size:15px; font-weight:500; }
  .wxrow { display:flex; align-items:center; gap:16px; margin-top:4px; cursor:pointer; -webkit-tap-highlight-color: transparent; }
  .wxrow[data-nav=""] { cursor:default; }
  .temp { font-size:76px; font-weight:300; line-height:1; letter-spacing:-0.03em; font-variant-numeric: tabular-nums; }
  .cond { display:flex; flex-direction:column; gap:3px; min-width:0; }
  .cond b { font-size:20px; font-weight:500; display:flex; align-items:center; gap:6px; }
  .cond b ha-icon { --mdc-icon-size:22px; color: var(--mood, ${TDC_INK}); }
  .cond span { color:${TDC_INK2}; font-size:15px; font-variant-numeric: tabular-nums; }
  .greet { font-size:17px; font-weight:500; margin-top:14px; }
  .say { font-size:22px; font-weight:600; line-height:1.25; margin-top:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; letter-spacing:-0.01em; }
  .blk { background: var(--surface, color-mix(in srgb, ${TDC_INK} 7%, transparent)); border-radius: var(--lg-radius, 20px);
    backdrop-filter: var(--pane-backdrop, none); -webkit-backdrop-filter: var(--pane-backdrop, none);
    box-shadow: inset 0 0 0 1px var(--pane-border, rgba(255,255,255,.06)); padding:6px; margin-bottom:12px; }
  .bt { color:${TDC_INK2}; font-size:13px; font-weight:500; padding:8px 12px 4px; }
  .row { position:relative; display:flex; align-items:center; gap:12px; min-height:48px; box-sizing:border-box; padding:4px 12px; border-radius:14px;
    cursor:pointer; -webkit-tap-highlight-color: transparent; transition: background .2s ease; }
  .row:active { background: color-mix(in srgb, ${TDC_INK} 6%, transparent); }
  .row[data-nav=""], .row:not([data-nav]) { cursor:default; }
  .row[data-nav=""]:active, .row:not([data-nav]):active { background:none; }
  .row ha-icon { --mdc-icon-size:20px; flex:none; color: var(--c, ${TDC_INK2}); }
  .row .t { flex:1; min-width:0; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row .t small { color:${TDC_INK2}; font-size:15px; }
  .row .m { flex:none; color:${TDC_INK2}; font-size:15px; font-variant-numeric: tabular-nums; }
  .row.act { min-height:56px; padding-left:16px; }
  .row.act::before { content:""; position:absolute; left:4px; top:12px; bottom:12px; width:3px; border-radius:2px; background: var(--c, #FFC145); }
  .row.act ha-icon { --mdc-icon-size:24px; }
  .row.act .tt { font-size:17px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row.act .ts { color:${TDC_INK2}; font-size:13px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .btn { flex:none; display:flex; align-items:center; gap:6px; min-height:36px; padding:0 14px; border-radius:18px; font-size:15px; font-weight:500;
    color:${TDC_INK}; background: color-mix(in srgb, ${TDC_INK} 14%, transparent); }
  .btn ha-icon { --mdc-icon-size:18px; color: inherit; }
  .dot { width:8px; height:8px; border-radius:50%; flex:none; margin:0 6px; background: var(--c); }
  .nxl { display:flex; gap:12px; margin-top:3px; overflow:hidden; }
  .nx { display:inline-flex; align-items:center; gap:5px; font-size:13px; color:${TDC_INK2}; white-space:nowrap; }
  .nx i { width:6px; height:6px; border-radius:50%; background: var(--c); }
  .nx i + i { margin-left:-2px; }
  .row.waste { background: color-mix(in srgb, #ffb454 13%, transparent); }
  .row.waste::before { background: var(--stripe); }
  .row.waste > ha-icon { color:#ffb454; }
  .bin { display:inline-flex; align-items:center; gap:6px; }
  .bin i { width:10px; height:10px; border-radius:50%; background: var(--b); box-shadow: 0 0 0 1px rgba(255,255,255,.18); flex:none; }
  /* Waste due: fixed title, one chip per bin on its own line (no truncated "Gelber Sack + \u2026") */
  .row.waste { flex-wrap:wrap; row-gap:8px; padding-top:10px; padding-bottom:10px;
    background: color-mix(in srgb, var(--c) 15%, transparent); }
  .row.waste .bins { flex-basis:100%; display:flex; flex-wrap:wrap; gap:6px; padding-left:36px; }
  .chip { display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 10px 0 8px; border-radius:999px; font-size:13px; font-weight:600;
    color:${TDC_INK}; background: color-mix(in srgb, var(--b) 30%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b) 45%, transparent); }
  .chip i { width:10px; height:10px; border-radius:50%; background: var(--b); flex:none; }
  .more { color:${TDC_INK2}; font-size:14px; min-height:40px; }
  .more ha-icon { --mdc-icon-size:18px; }
  .tm { flex:none; width:44px; font-variant-numeric: tabular-nums; color:${TDC_INK2}; font-size:15px; }
  .row.tl > ha-icon { --mdc-icon-size:18px; width:20px; }
  .sep { height:1px; margin:2px 12px; background: color-mix(in srgb, ${TDC_INK} 8%, transparent); }
  /* style: colorful \u2013 coloured icon squares, compact weather pill, big greeting */
  .colorful .row > ha-icon:first-child { --mdc-icon-size:18px; width:34px; height:34px; box-sizing:border-box; padding:0; border-radius:10px;
    display:flex; align-items:center; justify-content:center; line-height:0; --ha-icon-display:flex;
    color: var(--c, ${TDC_INK2}); background: color-mix(in srgb, var(--c, ${TDC_INK2}) 22%, transparent); }
  .colorful .row.act::before { display:none; }
  .colorful .row.act { padding-left:12px; }
  .colorful .row.act > ha-icon:first-child { --mdc-icon-size:20px; color:#fff; background: var(--c, #FFB020); }
  .colorful .row.more > ha-icon:first-child { background:none; color:${TDC_INK2}; }
  .colorful .row.waste { background: color-mix(in srgb, var(--c) 18%, transparent); }
  .colorful .row.waste > ha-icon:first-child { background: color-mix(in srgb, ${TDC_INK} 16%, transparent); color:${TDC_INK}; }
  .colorful .row.waste .bins { padding-left:46px; }
  .colorful .btn { background: color-mix(in srgb, var(--c, ${TDC_INK}) 26%, transparent); }
  .colorful .hero { min-height:0; padding: 4px 6px 16px; }
  .colorful .top { display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .colorful .wxpill { display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 12px; border-radius:999px; font-size:14px; font-weight:600;
    background: var(--surface, color-mix(in srgb, ${TDC_INK} 10%, transparent)); box-shadow: inset 0 0 0 1px var(--pane-border, rgba(255,255,255,.08));
    backdrop-filter: var(--pane-backdrop, none); -webkit-backdrop-filter: var(--pane-backdrop, none); cursor:pointer; white-space:nowrap; font-variant-numeric: tabular-nums; }
  .colorful .wxpill ha-icon { --mdc-icon-size:18px; color: var(--mood, ${TDC_INK}); }
  .colorful .greet { font-size:26px; font-weight:700; margin-top:10px; letter-spacing:-0.01em; }
  .colorful .say { font-size:17px; font-weight:500; margin-top:6px; line-height:1.35; color:${TDC_INK2}; }
`;
var TDC_WET = ["rainy", "pouring", "lightning-rainy", "snowy", "snowy-rainy", "hail"];
var TDC_SNOW = ["snowy", "snowy-rainy"];
function tdcOutfit(fc) {
  const hi = Number(fc?.temperature);
  if (!fc || !Number.isFinite(hi)) return null;
  let item = hi <= 3 ? "Winterjacke + M\xFCtze" : hi <= 10 ? "warme Jacke" : hi <= 16 ? "Jacke" : hi <= 21 ? "Pulli" : "T-Shirt";
  const wet = Number(fc.precipitation) >= 1 || TDC_WET.includes(fc.condition);
  if (wet) item += " \xB7 Schirm";
  return { item, coat: hi <= 16 };
}
var tdcDeg = (v) => v == null || !Number.isFinite(Number(v)) ? "" : String(Math.round(Number(v))).replace("-", "\u2212") + "\xB0";
var PaneTodayCard = class _PaneTodayCard extends PaneCard {
  static get styles() {
    return TDC_STYLE + TDC_GLASS;
  }
  static getStubConfig(hass) {
    const weather = Object.keys(hass?.states || {}).find((e) => e.startsWith("weather."));
    const calendars = Object.keys(hass?.states || {}).filter((e) => e.startsWith("calendar.")).slice(0, 2).map((entity) => ({ entity }));
    return { weather, calendars };
  }
  defaultFrame() {
    return false;
  }
  build() {
    this._config = { max_events: 3, ...this._config };
    if (!this._root) {
      this._root = document.createElement("div");
      this._root.className = "root";
      this.bodyEl.appendChild(this._root);
      this._root.addEventListener("click", (e) => this._onClick(e));
    }
    this._events = null;
    this._eventsAt = 0;
    this._fcAt = 0;
    this._sig = null;
  }
  // Calendar and forecast are fetched now and then; the card renders only
  // when one of the watched entities changed (plus once a minute for times).
  update() {
    const hass = this._hass;
    if (Date.now() - this._eventsAt > 15 * 6e4) this._loadEvents();
    if (Date.now() - this._fcAt > 30 * 6e4) this._loadForecast();
    const sig = this._watched().map((id) => hass.states[id]?.last_updated).join("|");
    if (sig !== this._sig) {
      const calChanged = this._sig && this._calSig !== this._calSignature();
      this._sig = sig;
      if (calChanged) this._loadEvents();
      this._render();
    }
  }
  connectedCallback() {
    super.connectedCallback();
    clearInterval(this._timer);
    this._timer = setInterval(() => this._render(), 6e4);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
  }
  static getConfigElement() {
    return document.createElement(_PaneTodayCard.editorTag);
  }
  getCardSize() {
    return 5;
  }
  getGridOptions() {
    return { columns: "full", rows: "auto" };
  }
  _watched() {
    const c = this._config, ids = [c.weather, "sun.sun"];
    (c.calendars || []).forEach((x) => ids.push(x.entity));
    const w = c.waste || {};
    (w.entities || []).forEach((x) => ids.push(x.entity));
    if (w.done_entity) ids.push(w.done_entity);
    const e = c.energy || {};
    ids.push(e.pv_today, e.pv_tomorrow, e.battery);
    ((c.packages || {}).items || []).forEach((x) => ids.push(x.entity));
    (c.appliances || []).forEach((a) => ids.push(a.state, a.finish, a.remaining, a.door, a.power));
    if (c.goodnight) {
      this._gnWindows().forEach((x) => ids.push(x.entity));
      this._gnLights().forEach((x) => ids.push(x));
    }
    const b = c.bath || {};
    ids.push(b.script, b.status);
    if (c.warning) ids.push(c.warning.entity, c.warning.detail);
    (c.hints || []).forEach((x) => {
      ids.push(x.entity);
      (x.detail || []).forEach((d) => ids.push(d.entity));
    });
    (c.status || []).forEach((x) => ids.push(x.entity, x.when, ...(x.entities || []).map((e2) => e2.entity || e2)));
    if ((c.packages || {}).entity) ids.push(c.packages.entity);
    if (c.updates && this._hass) Object.keys(this._hass.states).forEach((e2) => {
      if (e2.startsWith("update.")) ids.push(e2);
    });
    return ids.filter(Boolean);
  }
  _calSignature() {
    return (this._config.calendars || []).map((x) => this._hass.states[x.entity]?.last_changed).join("|");
  }
  async _loadEvents() {
    const cals = this._config.calendars || [];
    if (!cals.length || !this._hass) return;
    this._eventsAt = Date.now();
    this._calSig = this._calSignature();
    const start = /* @__PURE__ */ new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    const q = `?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
    const out = [];
    await Promise.all(cals.map(async (cal) => {
      try {
        const list = await this._hass.callApi("GET", `calendars/${cal.entity}${q}`);
        for (const ev of list || []) {
          const allDay = !!ev.start.date;
          const s = allDay ? /* @__PURE__ */ new Date(ev.start.date + "T00:00:00") : new Date(ev.start.dateTime);
          const en = allDay ? /* @__PURE__ */ new Date(ev.end.date + "T00:00:00") : new Date(ev.end.dateTime);
          out.push({ title: ev.summary || "(ohne Titel)", start: s, end: en, allDay, color: TDC_COLORS[cal.color] || cal.color || "#90a4ae" });
        }
      } catch (e) {
      }
    }));
    this._events = out.sort((a, b) => a.allDay === b.allDay ? a.start - b.start : a.allDay ? -1 : 1);
    this._render();
  }
  async _loadForecast() {
    const id = this._config.weather;
    if (!id || !this._hass?.states[id]) return;
    this._fcAt = Date.now();
    const get = (type) => this._hass.callWS({
      type: "call_service",
      domain: "weather",
      service: "get_forecasts",
      service_data: { type },
      target: { entity_id: id },
      return_response: true
    });
    try {
      const res = await get("daily");
      this._fcList = res?.response?.[id]?.forecast || [];
      this._fc = this._fcList[0] || null;
      this._render();
    } catch (e) {
    }
    if (this._config.timeline) {
      try {
        const res = await get("hourly");
        this._fcHourly = res?.response?.[id]?.forecast || [];
        this._render();
      } catch (e) {
      }
    }
  }
  _num(id, d = 1) {
    const v = parseFloat(this._hass.states[id]?.state);
    return Number.isFinite(v) ? v.toFixed(d).replace(".", ",") : "\u2013";
  }
  _wasteRow() {
    const w = this._config.waste;
    if (!w || !w.entities) return "";
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const items = [];
    w.entities.forEach((cfg) => {
      const st = this._hass.states[cfg.entity];
      if (!st) return;
      const next2 = Object.keys(st.attributes).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort().map((k) => {
        const [y, m, d] = k.split("-").map(Number);
        return new Date(y, m - 1, d);
      }).find((d) => d >= today);
      if (next2) items.push({ cfg, days: Math.round((next2 - today) / 864e5), date: next2 });
    });
    const vis = items.filter((x) => x.cfg.show_within_days == null || x.days <= x.cfg.show_within_days).sort((a, b) => a.days - b.days);
    this._wasteDue = null;
    this._wasteAct = false;
    if (!vis.length) return "";
    const days = vis[0].days;
    const hero = vis.filter((x) => x.days === days);
    const wd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    const whenS = (x) => x.days === 0 ? "heute" : x.days === 1 ? "morgen" : x.days < 7 ? wd[x.date.getDay()] : `${x.date.getDate()}. ${tdcMon(x.date)}`;
    const groups = [];
    vis.filter((x) => x.days !== days).forEach((x) => {
      const g = groups.find((gg) => gg.days === x.days);
      if (g) g.items.push(x);
      else if (groups.length < 2) groups.push({ days: x.days, items: [x] });
    });
    const next = groups.map((g) => `<span class="nx">${g.items.map((x) => `<i style="--c:${x.cfg.color || "#9e9e9e"}"></i>`).join("")}${g.items.map((x) => tdcEsc(x.cfg.short || x.cfg.name)).join(" + ")} \xB7 ${whenS(g.items[0])}</span>`).join("");
    const nextHtml = next ? `<div class="nxl">${next}</div>` : "";
    const names = hero.map((x) => x.cfg.name).join(" + ");
    const hour = (/* @__PURE__ */ new Date()).getHours();
    const from = w.evening_from ?? 17, until = w.morning_until ?? 9;
    const due = days === 1 && hour >= from || days === 0 && hour < until;
    let done = false;
    const btn = w.done_entity && this._hass.states[w.done_entity];
    if (due && btn) {
      const since = new Date(hero[0].date);
      since.setDate(since.getDate() - 1);
      since.setHours(from, 0, 0, 0);
      const pressed = new Date(btn.state);
      done = !isNaN(pressed) && pressed >= since;
    }
    const alert = due && !done;
    const when = days <= 1 ? whenS(hero[0]) : days < 7 ? TDC_DAYS[hero[0].date.getDay()] : `in ${days} Tagen`;
    const color = hero[0].cfg.color || "#9e9e9e";
    this._wasteDue = alert ? `${names} ${days === 1 ? "heute Abend" : "jetzt"} rausstellen.` : null;
    this._wasteAct = alert;
    if (alert) {
      const cols = hero.map((x) => x.cfg.color || "#9e9e9e");
      const stripe = cols.length > 1 ? `linear-gradient(${cols.map((c2, i) => `${c2} ${i * 100 / cols.length}% ${(i + 1) * 100 / cols.length}%`).join(", ")})` : cols[0];
      const title = "M\xFCll rausstellen";
      const sub = days === 1 ? "Abholung morgen fr\xFCh" : "Abholung heute";
      const chips = `<div class="bins">${hero.map((x) => `<span class="chip" style="--b:${x.cfg.color || "#9e9e9e"}"><i></i>${tdcEsc(x.cfg.name)}</span>`).join("")}</div>`;
      return `<div class="row act waste" data-nav="${w.navigate || ""}" style="--c:${color};--stripe:${stripe}"><ha-icon icon="mdi:trash-can-outline"></ha-icon>
        <div class="t"><div class="tt">${title}</div><div class="ts">${sub}</div></div>
        ${w.done_entity ? '<div class="btn" data-act="waste-done"><ha-icon icon="mdi:check"></ha-icon>Erledigt</div>' : ""}${chips}</div>`;
    }
    return `<div class="row" data-nav="${w.navigate || ""}" style="--c:${color}"><ha-icon icon="mdi:trash-can-outline"></ha-icon>
      <div class="t">${names} <small>\xB7 ${when}${done ? " \xB7 rausgestellt" : ""}</small>${nextHtml}</div></div>`;
  }
  _eventRows() {
    const c = this._config;
    if (!c.calendars) return [];
    if (this._events === null) return [`<div class="row"><ha-icon icon="mdi:calendar-blank-outline"></ha-icon><div class="t"><small>Termine laden \u2026</small></div></div>`];
    const now = /* @__PURE__ */ new Date();
    const today0 = /* @__PURE__ */ new Date();
    today0.setHours(0, 0, 0, 0);
    const tom0 = new Date(today0);
    tom0.setDate(tom0.getDate() + 1);
    const tom1 = new Date(tom0);
    tom1.setDate(tom1.getDate() + 1);
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (e) => e.allDay ? "Ganzt\xE4gig" : `${pad(e.start.getHours())}:${pad(e.start.getMinutes())}`;
    let list = this._events.filter((e) => e.start < tom0 && e.end > now);
    let label = "";
    if (this._evening()) {
      list = this._events.filter((e) => e.start >= tom0 && e.start < tom1 || e.allDay && e.start < tom1 && e.end > tom0);
    } else if (!list.length) {
      list = this._events.filter((e) => e.start >= tom0 && e.start < tom1 || e.allDay && e.start < tom1 && e.end > tom0);
      label = "Morgen ";
    }
    const rows = list.slice(0, c.max_events).map((e) => `<div class="row" data-nav="${c.calendar_navigate || ""}" style="--c:${e.color}">
      <span class="dot"></span><div class="t">${tdcEsc(e.title)}</div><div class="m">${label}${fmt(e)}</div></div>`);
    if (!rows.length) return [];
    if (list.length > c.max_events) rows.push(`<div class="row" data-nav="${c.calendar_navigate || ""}"><span class="dot" style="--c:transparent"></span><div class="t"><small>+ ${list.length - c.max_events} weitere</small></div></div>`);
    return rows;
  }
  // Timeline (timeline: true): today's events that are not over, sunset and
  // the start of rain as rows with their time; all-day first, then by time.
  _timelineRows() {
    const c = this._config, h = this._hass, now = /* @__PURE__ */ new Date();
    const tom0 = /* @__PURE__ */ new Date();
    tom0.setHours(0, 0, 0, 0);
    tom0.setDate(tom0.getDate() + 1);
    const items = [];
    let todayEvents = 0;
    if (c.calendars && this._events === null) return [`<div class="row"><ha-icon icon="mdi:calendar-blank-outline"></ha-icon><div class="t"><small>Termine laden \u2026</small></div></div>`];
    (this._events || []).filter((e) => e.start < tom0 && e.end > now).forEach((e) => {
      todayEvents += 1;
      const time = e.allDay ? "" : e.start <= now ? "jetzt" : this._hm(e.start);
      items.push({ allDay: e.allDay, at: e.start, html: `<div class="row tl" data-nav="${c.calendar_navigate || ""}" style="--c:${e.color}"><span class="tm">${time}</span><span class="dot"></span><div class="t">${tdcEsc(e.title)}</div></div>` });
    });
    const sideRow = (at, icon, color, text) => ({ allDay: false, at, html: `<div class="row tl" data-nav="${c.weather_navigate || ""}" style="--c:${color}"><span class="tm">${this._hm(at)}</span><ha-icon icon="${icon}"></ha-icon><div class="t">${text}</div></div>` });
    const set = new Date(h.states["sun.sun"]?.attributes?.next_setting);
    if (!isNaN(set) && set > now && set < tom0) items.push(sideRow(set, "mdi:weather-sunset-down", "#FFB74D", "Sonnenuntergang"));
    const ws = h.states[c.weather];
    if (!(ws && TDC_WET.includes(ws.state))) {
      const wet = (f2) => Number(f2.precipitation) >= 0.3 || TDC_WET.includes(f2.condition);
      const f = (this._fcHourly || []).find((x) => {
        const t = new Date(x.datetime);
        return t.getTime() + 36e5 > now && t < tom0 && wet(x);
      });
      if (f) {
        const snow = TDC_SNOW.includes(f.condition);
        items.push(sideRow(new Date(f.datetime), snow ? "mdi:weather-snowy" : "mdi:weather-rainy", snow ? "#90CAF9" : "#64B5F6", snow ? "Schnee ab" : "Regen ab"));
      }
    }
    items.sort((a, b) => a.allDay === b.allDay ? a.at - b.at : a.allDay ? -1 : 1);
    const max = c.max_timeline ?? 6;
    const rows = items.slice(0, max).map((x) => x.html);
    if (items.length > max) rows.push(`<div class="row tl"><span class="tm"></span><span class="dot" style="--c:transparent"></span><div class="t"><small>+ ${items.length - max} weitere</small></div></div>`);
    if (!todayEvents) rows.push(...this._eventRows());
    return rows;
  }
  // outfit: true - between 5 and 9 o'clock what to wear, from today's daily forecast.
  _outfitRow(hour) {
    if (!this._config.outfit || hour < 5 || hour >= 9) return "";
    const o = tdcOutfit(this._fc);
    if (!o) return "";
    const lo = this._fc.templow != null ? `${tdcDeg(this._fc.templow)} bis ` : "bis ";
    return `<div class="row" data-nav="${this._config.weather_navigate || ""}" style="--c:#4FC3F7"><ha-icon icon="${o.coat ? "mdi:coat-rack" : "mdi:tshirt-crew"}"></ha-icon><div class="t">Anziehen: ${tdcEsc(o.item)} <small>\xB7 ${lo}${tdcDeg(this._fc.temperature)}</small></div></div>`;
  }
  _evening() {
    return (/* @__PURE__ */ new Date()).getHours() >= (this._config.evening_from ?? 18);
  }
  _hm(d) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  // Appliances: running -> "fertig um HH:MM", finished -> "fertig – ausräumen" until the door opened.
  _applianceRows() {
    const h = this._hass, out = [], run = [], warn = [];
    (this._config.appliances || []).forEach((a) => {
      const st = h.states[a.state];
      if (!st) return;
      let s = String(st.state).toLowerCase();
      const pw = a.power && parseFloat(h.states[a.power]?.state);
      const byPower = Number.isFinite(pw) && pw > (a.power_above ?? 20) && !(a.run || []).includes(s);
      if (byPower) s = (a.run || ["run"])[0];
      if ((a.run || []).includes(s)) {
        let fin = null;
        const ts = !byPower && a.finish && h.states[a.finish];
        if (ts && !isNaN(new Date(ts.state))) fin = new Date(ts.state);
        const rem = !byPower && a.remaining && h.states[a.remaining];
        if (!fin && rem && Number.isFinite(parseFloat(rem.state)) && Date.now() - new Date(rem.last_changed) < 15 * 6e4) {
          fin = new Date(new Date(rem.last_changed).getTime() + parseFloat(rem.state) * 36e5);
        }
        const when = fin && fin > /* @__PURE__ */ new Date() ? ` <small>\xB7 fertig um ${this._hm(fin)}</small>` : " <small>\xB7 l\xE4uft</small>";
        run.push(`<div class="row" data-nav="${this._navOrMore(a, a.state)}" style="--c:${a.color || "#90a4ae"}"><ha-icon icon="${a.icon || "mdi:washing-machine"}"></ha-icon><div class="t">${a.name}${when}</div></div>`);
      } else if ((a.done || []).includes(s)) {
        const doneAt = new Date(st.last_changed);
        const door = a.door && h.states[a.door];
        const emptied = door ? new Date(door.last_changed) > doneAt : Date.now() - doneAt > (a.done_hours ?? 2) * 36e5;
        if (!emptied) {
          const row = `<div class="row act" data-nav="${this._navOrMore(a, a.state)}" style="--c:${a.color || "#4CD08A"}"><ha-icon icon="${a.icon || "mdi:washing-machine"}"></ha-icon><div class="t"><div class="tt">${a.name} ausr\xE4umen</div><div class="ts">fertig seit ${this._hm(doneAt)} Uhr</div></div></div>`;
          out.push(row);
          warn.push(a.name);
        }
      }
    });
    this._applianceWarn = warn;
    this._applianceRun = run;
    return out;
  }
  _visible(x) {
    return !x.admin_only || this._hass.user?.is_admin;
  }
  // Tap target: the configured navigate path, otherwise the entity's more-info dialog.
  _navOrMore(x, id) {
    return x.navigate || (id && x.more_info !== false ? "more-info:" + (x.more_info || id) : "");
  }
  // Hints: one action row per active warning entity, the detail lists what triggered it.
  _hintRows(gn) {
    const h = this._hass;
    return (this._config.hints || []).filter((x) => this._visible(x) && h.states[x.entity]?.state === "on" && !(x.night_skip && gn && gn.open)).map((x) => {
      const names = (x.detail || []).filter((d) => {
        const st = h.states[d.entity];
        if (!st) return false;
        if (d.above != null) return parseFloat(st.state) > d.above;
        const v = String(st.state).toLowerCase();
        if (d.not_states) return !d.not_states.includes(v) && !["unavailable", "unknown"].includes(v);
        return (d.states || ["on"]).includes(String(st.state).toLowerCase());
      }).map((d) => tdcEsc(d.name));
      const list = names.length > 3 ? `${names.slice(0, 2).join(", ")} und ${names.length - 2} weitere` : names.join(", ");
      const sub = names.length ? list : x.text ? tdcEsc(x.text) : "";
      return `<div class="row act" data-nav="${x.navigate || ""}" style="--c:${x.color || "#FF8A65"}"><ha-icon icon="${x.icon || "mdi:alert-outline"}"></ha-icon><div class="t"><div class="tt">${tdcEsc(x.title)}</div>${sub ? `<div class="ts">${sub}</div>` : ""}</div></div>`;
    });
  }
  // Status: calm rows for things that are running right now (vacuum, printer, media).
  // kind: 'all' (default), 'calm' (running things only) or 'alerts' (alert rows + updates).
  _statusRows(kind = "all") {
    const h = this._hass, out = [];
    (this._config.status || []).forEach((x) => {
      if (!this._visible(x)) return;
      const ids = (x.entities || [x.entity]).map((e) => e.entity || e);
      const names = Object.fromEntries((x.entities || []).filter((e) => e.entity).map((e) => [e.entity, e.name]));
      const want = x.states || [];
      const fresh = (st2) => st2.state !== "paused" || x.paused_minutes == null || Date.now() - new Date(st2.last_changed) < x.paused_minutes * 6e4;
      let st = null;
      if (x.when) {
        if (h.states[x.when]?.state !== "on") return;
        st = h.states[ids[0]];
      } else {
        const cand = ids.map((id) => h.states[id]).filter((v) => v && want.includes(String(v.state).toLowerCase()) && fresh(v));
        st = cand.find((v) => v.state !== "paused") || cand[0];
      }
      if (!st) return;
      const s = String(st.state).toLowerCase();
      const alert = (x.alert_states || []).includes(s);
      const a = st.attributes || {};
      let text = x.attribute && a[x.attribute] || h.formatEntityState?.(st) || st.state;
      if (x.attribute && a[x.attribute] && s === "paused") text += " \xB7 pausiert";
      const row = `<div class="row${alert ? " act" : ""}" data-nav="${this._navOrMore(x, st.entity_id)}" style="--c:${alert ? "#FF6B5E" : x.color || "#90a4ae"}"><ha-icon icon="${x.icon || "mdi:information-outline"}"></ha-icon><div class="t">${tdcEsc(names[st.entity_id] || x.name)} <small>\xB7 ${tdcEsc(text)}</small></div></div>`;
      if (kind === "calm" && alert) return;
      if (kind === "alerts" && !alert) return;
      if (alert) out.unshift(row);
      else out.push(row);
    });
    const u = this._config.updates;
    if (u && this._visible(u) && kind !== "calm") {
      const n = Object.keys(h.states).filter((e) => e.startsWith("update.") && h.states[e].state === "on").length;
      if (n) out.push(`<div class="row" data-nav="${u.navigate || ""}" style="--c:#42A5F5"><ha-icon icon="mdi:package-up"></ha-icon><div class="t">${n === 1 ? "1 Update" : n + " Updates"} <small>\xB7 verf\xFCgbar</small></div></div>`);
    }
    return out;
  }
  _bathRow() {
    const b = this._config.bath;
    if (!b || !b.script) return "";
    const now = /* @__PURE__ */ new Date(), m = now.getHours() * 60 + now.getMinutes();
    const from = (b.from ?? 18) * 60, until = Math.round((b.until ?? 21.5) * 60);
    if (m < from || m > until) return "";
    const running = this._hass.states[b.script]?.state === "on";
    const status = b.status ? this._hass.states[b.status]?.state : "";
    const sub = status && !["unknown", "unavailable"].includes(status) ? `<div class="ts">${tdcEsc(status)}</div>` : "";
    return `<div class="row act" style="--c:#FF7A45"><ha-icon icon="mdi:shower-head"></ha-icon><div class="t"><div class="tt">Bad aufheizen</div>${sub}</div>${running ? '<div class="m">l\xE4uft</div>' : '<div class="btn" data-act="bath"><ha-icon icon="mdi:play"></ha-icon>Starten</div>'}</div>`;
  }
  _byLabel(label) {
    const ents = this._hass?.entities || {};
    return Object.keys(ents).filter((e) => (ents[e].labels || []).includes(label)).sort();
  }
  _areaName(id) {
    const h = this._hass, en = h.entities?.[id] || {}, dev = h.devices?.[en.device_id] || {};
    const area = h.areas?.[en.area_id || dev.area_id];
    return area?.name || h.states[id]?.attributes.friendly_name || id;
  }
  _gnWindows() {
    const g = this._config.goodnight || {};
    return g.windows_label ? this._byLabel(g.windows_label).map((e) => ({ entity: e, name: this._areaName(e) })) : g.windows || [];
  }
  _gnLights() {
    const g = this._config.goodnight || {};
    return g.lights_label ? this._byLabel(g.lights_label) : g.lights || [];
  }
  // Night check: open windows and lights on, as action rows. Returns null outside
  // the window; force (view: night) skips the window.
  _goodnight(force = false) {
    const g = this._config.goodnight || (force ? {} : null);
    if (!g) return null;
    const hr = (/* @__PURE__ */ new Date()).getHours(), from = g.from ?? 21, until = g.until ?? 1;
    const inWin = from > until ? hr >= from || hr < until : hr >= from && hr < until;
    if (!inWin && !force) return null;
    const h = this._hass, rows = [];
    const open = this._gnWindows().filter((w) => h.states[w.entity]?.state === "on").map((w) => tdcEsc(w.name));
    if (open.length) rows.push(`<div class="row act" style="--c:#2EC4B6"><ha-icon icon="mdi:window-open-variant"></ha-icon><div class="t"><div class="tt">${open.length === 1 ? "Fenster offen" : open.length + " Fenster offen"}</div><div class="ts">${open.join(", ")}</div></div></div>`);
    const on = this._gnLights().filter((l) => h.states[l]?.state === "on");
    if (on.length && g.show_lights !== false) {
      const names = on.map((l) => h.states[l].attributes.friendly_name || l);
      rows.push(`<div class="row act" style="--c:#FFB020"><ha-icon icon="mdi:lightbulb-on-outline"></ha-icon><div class="t"><div class="tt">${on.length === 1 ? tdcEsc(names[0]) + " ist an" : on.length + " Lampen an"}</div>${on.length > 1 ? `<div class="ts">${tdcEsc(names.slice(0, 3).join(", "))}${on.length > 3 ? " \u2026" : ""}</div>` : ""}</div><div class="btn" data-act="lights-off"><ha-icon icon="mdi:power"></ha-icon>Aus</div></div>`);
    }
    return { rows, open: open.length, lights: on.length };
  }
  // view: running - only what is running right now (appliances, robots, media).
  _renderRunning() {
    this._applianceRows();
    const rows = [...this._applianceRun || [], ...this._statusRows("calm")];
    this.style.display = rows.length ? "" : "none";
    this._root.innerHTML = rows.length ? `<div class="blk"><div class="bt">${tdcEsc(this._config.title || "L\xE4uft gerade")}</div>${rows.join("")}</div>` : "";
  }
  // view: night - the house before bed: open windows, lights on, waste. Never hidden.
  _renderNight() {
    const gn = this._goodnight(true);
    const rows = [...gn.rows];
    if (!rows.length) rows.push('<div class="row" style="--c:#4CD08A"><ha-icon icon="mdi:check-circle"></ha-icon><div class="t">Alles zu <small>\xB7 Fenster zu, Lampen aus</small></div></div>');
    const waste = this._wasteRow();
    if (waste) rows.push(waste);
    this.style.display = "";
    this._root.classList.toggle("colorful", this._config.style === "colorful");
    this._root.innerHTML = `<div class="blk"><div class="bt">${tdcEsc(this._config.title || "Haus f\xFCr die Nacht")}</div>${rows.join("")}</div>`;
  }
  _render() {
    if (!this._hass || !this._root) return;
    if (this._config.view === "running") {
      this._renderRunning();
      return;
    }
    if (this._config.view === "night") {
      this._renderNight();
      return;
    }
    const c = this._config, h = this._hass, now = /* @__PURE__ */ new Date(), hour = now.getHours();
    const first = c.show_name === false ? "" : (h.user?.name || "").split(" ")[0];
    const greet = hour < 5 ? "Gute Nacht" : hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";
    const evening = this._evening();
    let wx = "", wxPill = "";
    const ws = h.states[c.weather];
    if (ws) {
      const night = h.states["sun.sun"]?.state === "below_horizon";
      let [label, icon] = TDC_COND[ws.state] || [ws.state, "mdi:weather-cloudy"];
      if (night && ws.state === "sunny") [label, icon] = TDC_COND["clear-night"];
      if (night && ws.state === "partlycloudy") icon = "mdi:weather-night-partly-cloudy";
      const fc = evening ? (this._fcList || [])[1] : this._fc;
      const hl = fc && fc.temperature != null ? `${evening ? "Morgen " : ""}${tdcDeg(fc.temperature)} / ${tdcDeg(fc.templow)}` : "";
      wxPill = `<div class="wxpill" data-nav="${c.weather_navigate || ""}"><ha-icon icon="${icon}"></ha-icon>${tdcDeg(ws.attributes.temperature)} \xB7 ${label}</div>`;
      wx = `<div class="wxrow" data-nav="${c.weather_navigate || ""}"><div class="temp">${tdcDeg(ws.attributes.temperature)}</div>
        <div class="cond"><b><ha-icon icon="${icon}"></ha-icon>${label}</b>${hl ? `<span>${hl}</span>` : ""}</div></div>`;
    }
    const acts = [], info = [];
    const gn = this._goodnight();
    if (gn) acts.push(...gn.rows);
    const waste = this._wasteRow();
    if (waste) (this._wasteAct ? acts : info).push(waste);
    acts.push(...this._applianceRows());
    acts.push(...this._hintRows(gn));
    const bath = this._bathRow();
    if (bath) acts.push(bath);
    if (c.hide_running) acts.push(...this._statusRows("alerts"));
    else acts.push(...c.show_running_appliances ? this._applianceRun || [] : [], ...this._statusRows());
    const max = c.max_now ?? 4;
    let nowRows = acts;
    if (acts.length > max + 1) {
      nowRows = this._more ? acts.concat(`<div class="row more" data-act="more"><ha-icon icon="mdi:chevron-up"></ha-icon><div class="t">Weniger</div></div>`) : acts.slice(0, max).concat(`<div class="row more" data-act="more"><ha-icon icon="mdi:chevron-down"></ha-icon><div class="t">+ ${acts.length - max} weitere</div></div>`);
    }
    if (c.timeline && !evening) info.push(...this._timelineRows());
    else info.unshift(...this._eventRows());
    const outfit = this._outfitRow(hour);
    if (outfit) info.unshift(outfit);
    if (evening) {
      const fc1 = (this._fcList || [])[1];
      if (fc1 && fc1.templow != null && fc1.templow <= 1) info.push(`<div class="row" style="--c:#90caf9"><ha-icon icon="mdi:snowflake"></ha-icon><div class="t">Morgen fr\xFCh ${tdcDeg(fc1.templow).replace("\xB0", " \xB0C")} <small>\xB7 ${fc1.templow <= 0 ? "Scheiben kratzen" : "kalt"}</small></div></div>`);
    }
    const pk = c.packages;
    if (pk && pk.items) {
      const on = pk.items.filter((x) => h.states[x.entity]?.state === "on").map((x) => x.name);
      if (on.length) info.push(`<div class="row" data-nav="${pk.navigate || ""}" style="--c:#bcaaa4"><ha-icon icon="mdi:package-variant-closed"></ha-icon><div class="t">${on.join(", ")} <small>\xB7 kommt heute</small></div></div>`);
    }
    if (pk && pk.entity) {
      const n = parseInt(h.states[pk.entity]?.state, 10);
      if (n > 0) info.push(`<div class="row" data-nav="${pk.navigate || ""}" style="--c:#bcaaa4"><ha-icon icon="mdi:package-variant-closed"></ha-icon><div class="t">${n === 1 ? "1 Paket" : n + " Pakete"} <small>\xB7 unterwegs</small></div></div>`);
    }
    const en = c.energy && (!c.energy.admin_only || h.user?.is_admin) ? c.energy : null;
    let pvSay = "";
    if (en) {
      const late = hour >= 16;
      const kwh = this._num(late ? en.pv_tomorrow : en.pv_today);
      const bat = en.battery ? `<div class="m">Akku ${this._num(en.battery, 0)} %</div>` : "";
      info.push(`<div class="row" data-nav="${en.navigate || ""}" style="--c:#ffd166"><ha-icon icon="mdi:solar-power-variant"></ha-icon><div class="t">PV ${late ? "morgen" : "heute"} <small>\xB7 ca. ${kwh} kWh</small></div>${bat}</div>`);
    }
    const say = this._sentence({ gn, pvSay, evening });
    const infoTitle = evening ? "Demn\xE4chst" : c.title || "Heute";
    const colorful = c.style === "colorful";
    this._root.classList.toggle("colorful", colorful);
    const dateTxt = `${TDC_DAYS[now.getDay()]}, ${now.getDate()}. ${TDC_MONTHS[now.getMonth()]}`;
    this._root.innerHTML = `
      <div class="hero">
        ${colorful ? `<div class="top"><div class="date">${dateTxt}</div>${wxPill}</div>` : `<div class="date">${dateTxt}</div>
        ${wx}`}
        <div class="greet">${greet}${first ? ", " + tdcEsc(first) : ""}</div>
        <div class="say">${tdcEsc(say)}</div>
      </div>
      ${nowRows.length ? `<div class="blk"><div class="bt">Jetzt</div>${nowRows.join("")}</div>` : ""}
      ${info.length ? `<div class="blk"><div class="bt">${infoTitle}</div>${info.join("")}</div>` : ""}`;
  }
  // One sentence for the day, fixed priority: warning > appliance done > waste > next event > night check > PV.
  _sentence({ gn, pvSay, evening }) {
    const c = this._config, h = this._hass;
    const wr = c.warning && h.states[c.warning.entity];
    if (wr && wr.state === "on") {
      const d = c.warning.detail && h.states[c.warning.detail];
      const head = d && (d.attributes.warning_1_headline || d.attributes.headline);
      const m = head && /vor\s+(.+)$/i.exec(head);
      let warn = "Achtung, Wetterwarnung.";
      if (m) {
        const w = m[1].trim().toLowerCase().split(/\s+/);
        w[w.length - 1] = w[w.length - 1].charAt(0).toUpperCase() + w[w.length - 1].slice(1);
        warn = `Warnung vor ${w.join(" ")}.`;
      } else if (head) warn = `Achtung: ${head}.`;
      const rest = this._sentenceRest({ gn, pvSay, evening });
      return rest ? `${warn} ${rest}` : warn;
    }
    return this._sentenceRest({ gn, pvSay, evening }) || (evening ? "Morgen steht nichts an." : "Heute steht nichts an.");
  }
  _sentenceRest({ gn, pvSay, evening }) {
    const done = this._applianceWarn || [];
    if (done.length) return done.length === 1 ? `${done[0]} ist fertig und kann ausger\xE4umt werden.` : `${done.join(" und ")} sind fertig.`;
    if (this._wasteDue) return this._wasteDue;
    if (gn && gn.open) return gn.open === 1 ? "Ein Fenster ist noch offen." : `${gn.open} Fenster sind noch offen.`;
    const ev = this._nextEvent(evening);
    if (ev) return ev;
    if (gn && !gn.lights) return "Alles zu. Gute Nacht.";
    if (pvSay) return pvSay;
    return "";
  }
  _nextEvent(evening) {
    if (!this._events) return "";
    const now = /* @__PURE__ */ new Date();
    const t0 = /* @__PURE__ */ new Date();
    t0.setHours(0, 0, 0, 0);
    const t1 = new Date(t0);
    t1.setDate(t1.getDate() + 1);
    const t2 = new Date(t1);
    t2.setDate(t2.getDate() + 1);
    const pick = (a, b) => this._events.find((e) => (e.allDay ? e.start < b && e.end > a : e.start >= a && e.start < b) && e.end > now);
    const today = evening ? null : pick(t0, t1);
    if (today) return today.allDay ? `Heute: ${today.title}.` : `Um ${this._hm(today.start)} Uhr: ${today.title}.`;
    const tom = pick(t1, t2);
    if (tom) return tom.allDay ? `Morgen: ${tom.title}.` : `Morgen um ${this._hm(tom.start)} Uhr: ${tom.title}.`;
    return "";
  }
  _onClick(e) {
    if (e.target.closest('[data-act="more"]')) {
      this._more = !this._more;
      this._render();
      return;
    }
    if (e.target.closest('[data-act="waste-done"]')) {
      const id = this._config.waste.done_entity;
      this._hass.callService(id.split(".")[0], "press", { entity_id: id });
      this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "success" }));
      return;
    }
    if (e.target.closest('[data-act="lights-off"]')) {
      const on = this._gnLights().filter((l) => this._hass.states[l]?.state === "on");
      if (on.length) this._hass.callService("light", "turn_off", { entity_id: on });
      this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "success" }));
      return;
    }
    if (e.target.closest('[data-act="bath"]')) {
      this._hass.callService("script", "turn_on", { entity_id: this._config.bath.script });
      this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "success" }));
      return;
    }
    const el = e.target.closest("[data-nav]");
    const nav = el && el.dataset.nav;
    if (!nav) return;
    if (nav.startsWith("more-info:")) {
      this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: nav.slice(10) } }));
      this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
      return;
    }
    const oldURL = location.href;
    history.pushState(null, "", nav);
    if (nav.startsWith("#")) window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: location.href }));
    else window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
  }
};
var CAL_COLORS = Object.keys(TDC_COLORS).map((k) => ({ value: k, label: k }));
var obj = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var PaneTodayCardEditor = class extends PaneEditor {
  labels() {
    return {
      view: "Ansicht",
      title: "Titel",
      max_events: "Termine h\xF6chstens",
      style: "Stil",
      look: "Look",
      weather: "Wetter",
      weather_navigate: "Wetter antippen \xF6ffnet",
      calendar_navigate: "Kalender antippen \xF6ffnet",
      entity: "Entit\xE4t",
      color: "Farbe",
      name: "Name",
      short: "Kurzname",
      icon: "Icon",
      show_within_days: "Erst zeigen ab (Tage vorher)",
      done_entity: "Knopf \u201Erausgestellt\u201C",
      navigate: "Antippen \xF6ffnet",
      evening_from: "Abends ab (Uhr)",
      morning_until: "Morgens bis (Uhr)",
      pv_today: "PV-Prognose heute",
      pv_tomorrow: "PV-Prognose morgen",
      battery: "Akku-Ladestand",
      admin_only: "Nur f\xFCr Admins",
      state: "Status-Entit\xE4t",
      run: "L\xE4uft bei Status",
      done: "Fertig bei Status",
      finish: "Ende (Zeitpunkt)",
      remaining: "Restzeit",
      power: "Leistung",
      power_above: "L\xE4uft ab (W)",
      door: "T\xFCr",
      done_hours: "Fertig zeigen (Stunden)",
      states: "Zeigen bei Status",
      timeline: "Zeitleiste",
      max_timeline: "Zeitleiste h\xF6chstens",
      max_now: "\u201EJetzt\u201C h\xF6chstens",
      outfit: "Anziehtipp morgens",
      from: "Ab (Uhr)",
      until: "Bis (Uhr)",
      windows_label: "Label der Fenster",
      lights_label: "Label der Lampen",
      show_lights: "Lampen zeigen"
    };
  }
  helpers() {
    return {
      view: "Heute: Begr\xFC\xDFung, Wetter und Liste. L\xE4uft gerade: nur Ger\xE4te und Status. Haus f\xFCr die Nacht: offene Fenster, Lampen, M\xFCll.",
      timeline: "Heute mit Uhrzeit: Termine, Sonnenuntergang und Regenbeginn.",
      outfit: "Zwischen 5 und 9 Uhr ein Tipp aus der Tagesvorhersage.",
      from: "Nur Ansicht Heute: von wann bis wann gepr\xFCft wird (Standard 21 bis 1 Uhr).",
      run: "Status-Werte, bei denen das Ger\xE4t als laufend gilt, z. B. running."
    };
  }
  _set(path, value) {
    const next = { ...this._config };
    if (path) {
      const v = PaneEditor.clean(value || {});
      if (Object.keys(v).length) next[path] = v;
      else delete next[path];
    }
    this.emit(next);
  }
  _listSection(key, title, path, { create, titleOf, subtitleOf, icon, schema, addLabel }) {
    const c = this._config || {};
    const get = () => (path ? obj(c[path])[key] : c[key]) || [];
    const put = (list) => {
      const next = { ...this._config };
      if (path) next[path] = { ...obj(next[path]), [key]: list };
      else next[key] = list;
      this.emit(next);
    };
    return {
      key: `${path || ""}.${key}`,
      title,
      list: {
        items: get,
        set: put,
        create,
        addLabel,
        title: titleOf,
        subtitle: subtitleOf,
        icon: () => icon,
        schema: () => schema,
        data: (r) => ({ ...r }),
        merge: (r, v) => PaneEditor.clean({ ...v })
      }
    };
  }
  sections() {
    const c = this._config || {};
    const running = c.view === "running", night = c.view === "night", today = !running && !night;
    const entity = (domain, extra = {}) => ({ entity: { ...domain ? { domain } : {}, ...extra } });
    const out = [{
      title: "Ansicht",
      schema: [
        { type: "grid", name: "", schema: [
          { name: "view", selector: { select: { mode: "dropdown", options: [{ value: "today", label: "Heute" }, { value: "running", label: "L\xE4uft gerade" }, { value: "night", label: "Haus f\xFCr die Nacht" }] } } },
          { name: "look", selector: { select: { mode: "dropdown", options: [{ value: "theme", label: "Vom Theme" }, { value: "glass", label: "Glass" }, { value: "solid", label: "Solid" }] } } }
        ] },
        ...!today ? [{ name: "title", selector: { text: {} } }] : [
          { type: "grid", name: "", schema: [
            { name: "style", selector: { select: { mode: "dropdown", options: [{ value: "calm", label: "Ruhig" }, { value: "colorful", label: "Farbig" }] } } },
            { name: "max_events", selector: { number: { min: 0, max: 10, mode: "box" } } }
          ] },
          { name: "timeline", selector: { boolean: {} } },
          { type: "grid", name: "", schema: [
            { name: "max_timeline", selector: { number: { min: 1, max: 20, mode: "box" } } },
            { name: "max_now", selector: { number: { min: 1, max: 20, mode: "box" } } }
          ] }
        ]
      ],
      signature: () => running ? "r" : night ? "n" : "t",
      data: () => ({ ...c, view: c.view || "today", look: c.look || "theme", style: c.style || "calm", timeline: !!c.timeline }),
      set: (v) => {
        const next = { ...this._config, ...v };
        if (next.view === "today") delete next.view;
        if (next.look === "theme") delete next.look;
        if (next.style === "calm") delete next.style;
        if (next.title === "") delete next.title;
        if (!next.timeline) delete next.timeline;
        ["max_timeline", "max_now"].forEach((k) => {
          if (next[k] === "" || next[k] == null) delete next[k];
        });
        this.emit(next);
      }
    }];
    const goodnight = {
      title: "Gute Nacht",
      schema: [
        { type: "grid", name: "", schema: [
          { name: "from", selector: { number: { min: 0, max: 23, mode: "box" } } },
          { name: "until", selector: { number: { min: 0, max: 23, mode: "box" } } }
        ] },
        { type: "grid", name: "", schema: [
          { name: "windows_label", selector: { label: {} } },
          { name: "lights_label", selector: { label: {} } }
        ] },
        { name: "show_lights", selector: { boolean: {} } }
      ],
      data: () => ({ ...obj(c.goodnight), show_lights: obj(c.goodnight).show_lights !== false }),
      set: (v) => this._set("goodnight", { ...v, show_lights: v.show_lights === false ? false : void 0 })
    };
    const wasteSections = () => {
      out.push(this._listSection("entities", "M\xFCll", "waste", {
        create: () => ({ entity: "" }),
        addLabel: "+ Tonne hinzuf\xFCgen",
        icon: "mdi:trash-can-outline",
        titleOf: (r) => r.name || r.entity || "Neue Tonne",
        subtitleOf: (r) => r.entity || "",
        schema: [
          { name: "entity", required: true, selector: entity("sensor") },
          { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "short", selector: { text: {} } }] },
          { type: "grid", name: "", schema: [{ name: "color", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
          { name: "show_within_days", selector: { number: { min: 0, max: 30, mode: "box" } } }
        ]
      }));
      out.push({
        title: "",
        schema: [
          { name: "done_entity", selector: entity("input_button") },
          { name: "navigate", selector: { text: {} } },
          { type: "grid", name: "", schema: [
            { name: "evening_from", selector: { number: { min: 0, max: 23, mode: "box" } } },
            { name: "morning_until", selector: { number: { min: 0, max: 23, mode: "box" } } }
          ] }
        ],
        data: () => obj(c.waste),
        set: (v) => this._set("waste", { ...obj(this._config.waste), ...v })
      });
    };
    if (night) {
      out.push(goodnight);
      wasteSections();
    }
    if (today) {
      out.push({
        title: "Wetter",
        schema: [
          { name: "weather", selector: entity("weather") },
          { name: "weather_navigate", selector: { text: {} } },
          { name: "outfit", selector: { boolean: {} } }
        ],
        data: () => ({ ...c, outfit: !!c.outfit }),
        set: (v) => {
          const next = PaneEditor.clean({ ...this._config, ...v });
          if (!next.outfit) delete next.outfit;
          this.emit(next);
        }
      });
      out.push(this._listSection("calendars", "Kalender", null, {
        create: () => ({ entity: "" }),
        addLabel: "+ Kalender hinzuf\xFCgen",
        icon: "mdi:calendar",
        titleOf: (r) => r.entity || "Neuer Kalender",
        subtitleOf: (r) => r.color || "",
        schema: [
          { name: "entity", required: true, selector: entity("calendar") },
          { name: "color", selector: { select: { mode: "dropdown", custom_value: true, options: CAL_COLORS } } }
        ]
      }));
      out.push({
        title: "",
        schema: [{ name: "calendar_navigate", selector: { text: {} } }],
        data: () => c,
        set: (v) => this.emit(PaneEditor.clean({ ...this._config, ...v }))
      });
      wasteSections();
      out.push({
        title: "Energie",
        schema: [
          { type: "grid", name: "", schema: [
            { name: "pv_today", selector: entity("sensor") },
            { name: "pv_tomorrow", selector: entity("sensor") }
          ] },
          { name: "battery", selector: entity("sensor") },
          { name: "admin_only", selector: { boolean: {} } }
        ],
        data: () => obj(c.energy),
        set: (v) => this._set("energy", { ...v, admin_only: v.admin_only || void 0 })
      });
      out.push(goodnight);
    }
    if (night) return out;
    out.push(this._listSection("appliances", "Ger\xE4te", null, {
      create: () => ({ name: "Neues Ger\xE4t" }),
      addLabel: "+ Ger\xE4t hinzuf\xFCgen",
      icon: "mdi:washing-machine",
      titleOf: (r) => r.name,
      subtitleOf: (r) => r.state || "",
      schema: [
        { type: "grid", name: "", schema: [{ name: "name", required: true, selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { name: "state", selector: entity() },
        { type: "grid", name: "", schema: [{ name: "run", selector: { text: { multiple: true } } }, { name: "done", selector: { text: { multiple: true } } }] },
        { type: "grid", name: "", schema: [{ name: "finish", selector: entity("sensor") }, { name: "remaining", selector: entity("sensor") }] },
        { type: "grid", name: "", schema: [{ name: "power", selector: entity("sensor") }, { name: "power_above", selector: { number: { min: 0, mode: "box" } } }] },
        { type: "grid", name: "", schema: [{ name: "door", selector: entity("binary_sensor") }, { name: "done_hours", selector: { number: { min: 0, max: 24, mode: "box" } } }] },
        { type: "grid", name: "", schema: [{ name: "color", selector: { text: {} } }, { name: "navigate", selector: { text: {} } }] }
      ]
    }));
    out.push(this._listSection("status", "Status", null, {
      create: () => ({ entity: "" }),
      addLabel: "+ Status hinzuf\xFCgen",
      icon: "mdi:robot-vacuum",
      titleOf: (r) => r.name || r.entity || "Neuer Status",
      subtitleOf: (r) => r.entity || "",
      schema: [
        { name: "entity", required: true, selector: entity() },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { name: "states", selector: { text: { multiple: true } } },
        { type: "grid", name: "", schema: [{ name: "color", selector: { text: {} } }, { name: "navigate", selector: { text: {} } }] }
      ]
    }));
    out[out.length - 1].hint = "Bad, Pakete, Hinweise, Warnung und Updates bisher nur im Code-Editor.";
    return out;
  }
};

// src/index.js
var VERSION = CARD_VERSION;
var SUFFIX = "";
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
  },
  {
    cls: PaneTodayCard,
    editor: PaneTodayCardEditor,
    tag: "pane-today-card",
    name: "Pane Today Card",
    description: "Begr\xFC\xDFung, Wetter und eine ruhige Liste f\xFCr heute \u2013 oder was gerade l\xE4uft.",
    aliases: ["today-glass-card"]
  },
  {
    cls: PaneRoomsCard,
    editor: PaneRoomsCardEditor,
    tag: "pane-rooms-card",
    name: "Pane Rooms Card",
    description: "Alle R\xE4ume auf einen Blick: Temperatur, ein Hinweis je Raum und alle Lampen aus.",
    aliases: ["home-glass-card"]
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
