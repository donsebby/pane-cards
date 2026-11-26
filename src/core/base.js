import { BASE_STYLE } from './style.js';
import { setText, setAttr, setStyle, domainOf, fire, haptic, navigate, TOGGLE_DOMAINS } from './util.js';

// Base class of every Pane card. It owns what all cards share:
//   - the card shell (glass or solid) and the header row
//   - the look from config or theme (read only on connect and theme change)
//   - [[[ ... ]]] templates, compiled once per string
//   - tap/hold actions in Home Assistant's own action format
//   - localized state text
// A card implements build() (once per config) and update() (every hass tick,
// must only patch what changed - see setText in util.js).
export class PaneCard extends HTMLElement {
  static get styles() { return ''; }

  setConfig(config) {
    if (!config) throw new Error('Pane: invalid configuration');
    this.validateConfig(config);
    this._config = config;
    this._fnCache = new Map();
    this._ensureShell();
    if (!this._lookOverride() && this.isConnected) this._themeLook = PaneCard.readThemeLook(this);
    this._applyCardClasses();
    this.build();
    if (this._hass) this.update();
  }

  validateConfig() {}
  build() {}
  update() {}

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    const th = hass && hass.themes;
    if (!prev || th !== prev.themes) this._recheckThemeLook();
    if (this._config) this.update();
  }

  get hass() { return this._hass; }

  connectedCallback() {
    if (!this._onThemeChanged) this._onThemeChanged = () => this._checkThemeLook();
    window.addEventListener('lg-theme-changed', this._onThemeChanged);
    window.addEventListener('pane-theme-changed', this._onThemeChanged);
    this._recheckThemeLook();
    // frame: auto (default) - inside a pop-up the card drops its own panel,
    // the pop-up already is one (a panel in a panel reads as a box in a box).
    const inPopup = PaneCard.insidePopup(this);
    if (inPopup !== this._inPopup) {
      this._inPopup = inPopup;
      if (this.cardEl) this._applyCardClasses();
    }
  }

  static insidePopup(el) {
    let n = el.parentNode || el.host;
    for (let i = 0; n && i < 60; i += 1) {
      const cl = n.classList;
      if (cl && (cl.contains('bubble-pop-up') || cl.contains('bubble-pop-up-container'))) return true;
      if (n.localName === 'ha-more-info-dialog' || n.localName === 'ha-dialog') return true;
      n = n.parentNode || n.host;
    }
    return false;
  }

  disconnectedCallback() {
    window.removeEventListener('lg-theme-changed', this._onThemeChanged);
    window.removeEventListener('pane-theme-changed', this._onThemeChanged);
    if (this._lookRaf) cancelAnimationFrame(this._lookRaf);
    this._lookRaf = null;
  }

  // ---- shell -------------------------------------------------------
  _ensureShell() {
    if (this.shadowRoot) return;
    this.attachShadow({ mode: 'open' });
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
    this.cardEl = r.querySelector('.card');
    this.bodyEl = r.querySelector('.body');
    this._hd = {
      root: r.querySelector('.hd'),
      ico: r.querySelector('.hd-ico'),
      icon: r.querySelector('.hd-ico ha-icon'),
      title: r.querySelector('.hd-title'),
      sub: r.querySelector('.hd-sub'),
      btn: r.querySelector('.hd-btn'),
      btnIcon: r.querySelector('.hd-btn ha-icon'),
    };
    this._hd.btn.addEventListener('click', (e) => {
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
    setText(hd.title, title || '');
    setText(hd.sub, sub || '');
    if (hd.ico.hidden === !!icon) hd.ico.hidden = !icon;
    setAttr(hd.icon, 'icon', icon || null);
    setStyle(hd.ico, '--hc', color || '');
    const hasBtn = !!button;
    if (hd.btn.hidden === hasBtn) hd.btn.hidden = !hasBtn;
    this._headerAction = hasBtn ? button.run : null;
    if (hasBtn) {
      setAttr(hd.btnIcon, 'icon', button.icon);
      setAttr(hd.btn, 'aria-label', button.label);
      setAttr(hd.btn, 'title', button.label);
    }
  }

  _applyCardClasses() {
    const c = this._config;
    this.cardEl.classList.toggle('solid', this.isSolid());
    this.cardEl.classList.toggle('frameless', c.frame === false || (c.frame == null && !!this._inPopup));
    this.cardEl.classList.toggle('calm', !this.glowOn());
  }

  // ---- look ----------------------------------------------------------
  static readThemeLook(el) {
    try {
      const cs = getComputedStyle(el);
      const raw = cs.getPropertyValue('--pane-look') || cs.getPropertyValue('--lg-look');
      const v = String(raw).trim().replace(/^["']|["']$/g, '').trim().toLowerCase();
      return v === 'solid' || v === 'glass' ? v : null;
    } catch (e) {
      return null;
    }
  }

  _lookOverride() {
    const look = this._config?.look;
    return look === 'solid' || look === 'glass' ? look : null;
  }

  isSolid() { return (this._lookOverride() || this._themeLook || 'glass') === 'solid'; }

  // `glow: false` calms the coloured glows; the solid look has none.
  glowOn() { return this._config?.glow !== false && !this.isSolid(); }

  _recheckThemeLook() {
    this._checkThemeLook();
    if (typeof requestAnimationFrame !== 'function' || this._lookRaf) return;
    this._lookRaf = requestAnimationFrame(() => {
      this._lookRaf = null;
      this._checkThemeLook();
    });
  }

  _checkThemeLook() {
    if (!this._config || this._lookOverride() || !this.isConnected) return;
    const look = PaneCard.readThemeLook(this);
    if (look === this._themeLook) return;
    const was = this.isSolid();
    this._themeLook = look;
    if (this.isSolid() !== was) this.setConfig(this._config);
  }

  // ---- state text ----------------------------------------------------
  formatState(stateObj) {
    if (!stateObj) return '–';
    const hass = this._hass;
    if (hass && typeof hass.formatEntityState === 'function') {
      try {
        const text = hass.formatEntityState(stateObj);
        if (text != null && text !== '') return String(text);
      } catch (err) { /* fall through */ }
    }
    const unit = stateObj.attributes?.unit_of_measurement;
    return unit ? `${stateObj.state} ${unit}` : stateObj.state;
  }

  entityName(entityId, stateObj) {
    return stateObj?.attributes?.friendly_name || entityId || '';
  }

  // ---- templates -----------------------------------------------------
  // `[[[ ... ]]]` runs as JS with states, hass, entity and fmt in scope.
  // Anything else passes through unchanged.
  template(value, entityId) {
    if (value == null) return null;
    if (typeof value !== 'string') return value;
    const m = /^\s*\[\[\[([\s\S]*)\]\]\]\s*$/.exec(value);
    if (!m) return value;
    let fn = this._fnCache.get(value);
    if (fn === undefined) {
      try {
        // eslint-disable-next-line no-new-func
        fn = new Function('states', 'hass', 'entity', 'fmt', m[1]);
      } catch (err) {
        console.error(`${this.localName}: template compile error`, err); // eslint-disable-line no-console
        fn = null;
      }
      this._fnCache.set(value, fn);
    }
    if (!fn || !this._hass) return null;
    try {
      if (!this._fmt) this._fmt = (x) => this.formatState(typeof x === 'string' ? this._hass.states[x] : x);
      return fn(this._hass.states, this._hass, this._hass.states[entityId], this._fmt);
    } catch (err) {
      console.error(`${this.localName}: template error`, err); // eslint-disable-line no-console
      return null;
    }
  }

  // ---- actions -------------------------------------------------------
  toggle(entityId) {
    const domain = domainOf(entityId);
    const service = domain === 'switch' ? 'switch' : domain === 'light' ? 'light' : 'homeassistant';
    this._hass.callService(service, 'toggle', { entity_id: entityId });
    haptic(this, 'light');
  }

  moreInfo(entityId) {
    if (entityId) fire(this, 'hass-more-info', { entityId });
  }

  defaultTapAction(entityId) {
    return { action: TOGGLE_DOMAINS.includes(domainOf(entityId)) ? 'toggle' : 'more-info' };
  }

  // Home Assistant's action format (tap_action / hold_action).
  performAction(action, entityId) {
    if (!action || action.action === 'none') return;
    if (action.confirmation) {
      const text = (typeof action.confirmation === 'object' && action.confirmation.text) || 'Bist du sicher?';
      if (!window.confirm(text)) return; // eslint-disable-line no-alert
    }
    const target = action.entity || entityId;
    switch (action.action) {
      case 'toggle':
        this.toggle(target);
        return;
      case 'more-info':
        this.moreInfo(target);
        break;
      case 'navigate':
        if (action.navigation_path) navigate(action.navigation_path);
        break;
      case 'url':
        if (action.url_path) window.open(action.url_path, action.new_tab === false ? '_self' : '_blank');
        break;
      case 'call-service':
      case 'perform-action': {
        const svc = action.perform_action || action.service;
        if (!svc) return;
        const [d, s] = svc.split('.');
        this._hass.callService(d, s, action.data || action.service_data || {}, action.target || {});
        break;
      }
      default:
        return;
    }
    haptic(this, 'light');
  }
}
