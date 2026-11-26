import { PaneCard } from '../core/base.js';
import { PaneEditor } from '../core/editor.js';
import { INK } from '../core/style.js';
import {
  setText, setAttr, setStyle, domainOf, haptic, lightColor, resolveColor, isGerman, STATE_COLORS, TOGGLE_DOMAINS,
} from '../core/util.js';

// Pane Tile Card: one card, many rows. Each row is a toggle, bar, gauge
// (ring) or stat tile for one entity. Successor of liquid-glass-tile-card-v2:
// its configs work unchanged (title, layout, rows, look, frame, glow ...).

const STYLE = `
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

const ROW_TYPES = ['toggle', 'bar', 'gauge', 'stat'];

export class PaneTileCard extends PaneCard {
  static get styles() { return STYLE; }

  static get cardType() { return 'pane-tile-card'; }

  static getStubConfig(hass) {
    const lights = Object.keys(hass?.states || {}).filter((e) => e.startsWith('light.')).slice(0, 4);
    return {
      title: 'Licht',
      icon: 'mdi:lightbulb-group',
      columns: 2,
      rows: lights.length ? lights.map((entity) => ({ entity, type: 'bar' })) : [{ entity: 'sun.sun', type: 'toggle' }],
    };
  }

  validateConfig(config) {
    if (!Array.isArray(config.rows)) throw new Error('Pane Tile Card: "rows" fehlt.');
  }

  getCardSize() { return Math.ceil(((this._config?.rows?.length || 1) / this._cols()) * 1.2) + 1; }

  getGridOptions() { return { columns: 12, min_columns: 4 }; }

  _cols() {
    const c = Number(this._config?.columns);
    if (c >= 1 && c <= 4) return c;
    return this._config?.layout === 'grid' ? 2 : 1;
  }

  build() {
    const c = this._config;
    this._lastColor = this._lastColor || {};
    this.cardEl.classList.toggle('stat-lg', c.stat_size === 'large');
    const cols = this._cols();
    this.bodyEl.classList.toggle('grid', cols > 1);
    setStyle(this.bodyEl, '--cols', cols > 1 ? cols : '');
    this._buildRows();
    if (!this._wired) this._wire();
  }

  // ---- header --------------------------------------------------------
  _header() {
    const c = this._config;
    const de = isGerman(this._hass);
    const rows = (c.rows || []).filter((r) => r.entity);
    let sub = null;
    if (c.subtitle === false || c.subtitle === 'none') sub = null;
    else if (c.subtitle) sub = this.template(c.subtitle, rows[0]?.entity);
    else {
      const sw = rows.filter((r) => this._isSwitchable(r));
      if (sw.length > 1) {
        const on = sw.filter((r) => this._isActive(r, this._hass.states[r.entity])).length;
        sub = de ? `${on} von ${sw.length} an` : `${on} of ${sw.length} on`;
      }
    }
    const hasLight = rows.some((r) => domainOf(r.entity) === 'light');
    const color = resolveColor(this.template(c.icon_color, rows[0]?.entity)) || (hasLight ? STATE_COLORS.warm : STATE_COLORS.accent);
    let button = null;
    if (c.header_action === 'all_off') {
      const targets = rows.filter((r) => TOGGLE_DOMAINS.includes(domainOf(r.entity)) || domainOf(r.entity) === 'light').map((r) => r.entity);
      button = {
        icon: 'mdi:power',
        label: de ? 'Alle aus' : 'All off',
        run: () => { this._hass.callService('homeassistant', 'turn_off', { entity_id: targets }); haptic(this, 'medium'); },
      };
    }
    this.setHeader({ title: this.template(c.title, rows[0]?.entity), icon: c.icon, sub, color, button });
  }

  // ---- rows: build once per config -----------------------------------
  _buildRows() {
    const solid = this.isSolid();
    this.bodyEl.innerHTML = (this._config.rows || []).map((row, i) => {
      const type = ROW_TYPES.includes(row.type) ? row.type : 'toggle';
      const domain = domainOf(row.entity);
      if (solid && (type === 'toggle' || type === 'bar')) {
        const fill = type === 'bar' && !row.hide_track ? '<div class="solid-fill"></div>' : '';
        return `<div class="${type === 'bar' ? 'bar-tile' : 'pill'}" data-row-i="${i}">${fill}
          <div class="left"><div class="icon-box"><ha-icon></ha-icon></div>
          <div class="text"><div class="name"></div><div class="sub"></div></div></div></div>`;
      }
      if (type === 'toggle') {
        const iconAttrs = (domain === 'light' || row.tap_action) ? `data-action="icon-tap" data-i="${i}"` : 'data-action="icon-inert"';
        const sw = TOGGLE_DOMAINS.includes(domain)
          ? `<div class="toggle" data-action="toggle" data-i="${i}" role="switch"><div class="knob"></div></div>` : '';
        return `<div class="pill" data-row-i="${i}">
          <div class="left"><div class="icon-box" ${iconAttrs}><ha-icon></ha-icon></div>
          <div class="text"><div class="name" data-action="name-tap" data-i="${i}"></div><div class="sub"></div></div></div>${sw}</div>`;
      }
      if (type === 'stat') {
        return `<div class="stat-tile" data-row-i="${i}"><ha-icon class="stat-icon"></ha-icon><div class="stat-value"></div>
          <div class="name" data-action="name-tap" data-i="${i}"></div><div class="sub"></div><div class="stat-line"></div></div>`;
      }
      if (type === 'gauge') {
        return `<div class="gauge-tile" data-row-i="${i}">
          <div class="ring" data-action="drag-ring" data-i="${i}">
            <div class="ring-inner" data-action="icon-tap" data-i="${i}"><ha-icon></ha-icon></div><div class="ring-lens"></div></div>
          <div class="text center"><div class="name" data-action="name-tap" data-i="${i}"></div><div class="sub"></div></div></div>`;
      }
      const track = row.hide_track ? ''
        : `<div class="track" data-action="drag-bar" data-i="${i}"><div class="fill"></div><div class="lens"></div></div>`;
      return `<div class="bar-tile" data-row-i="${i}">
        <div class="left"><div class="icon-box" data-action="icon-tap" data-i="${i}"><ha-icon></ha-icon></div>
        <div class="text"><div class="name" data-action="name-tap" data-i="${i}"></div><div class="sub"></div></div></div>${track}</div>`;
    }).join('');
    this._rowEls = [...this.bodyEl.querySelectorAll('[data-row-i]')];
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
      const type = ROW_TYPES.includes(row.type) ? row.type : 'toggle';
      const color = this._rowColor(row, st);
      const active = this._isActive(row, st);
      const dragging = el.dataset.dragging === '1';
      if (solid && (type === 'toggle' || type === 'bar')) el.classList.toggle('info', !this._isSwitchable(row));

      setText(el.querySelector('.name'), this.template(row.name, row.entity) || this.entityName(row.entity, st));
      const sub = type === 'stat' ? (row.state_text ? this.template(row.state_text, row.entity) ?? '' : '') : this._subText(row, st);
      if (!(dragging && solid && type === 'bar')) setText(el.querySelector('.sub'), sub);
      setAttr(el.querySelector('ha-icon'), 'icon', this.template(row.icon, row.entity) || st?.attributes?.icon || this._defaultIcon(row, st));
      setStyle(el, '--c', color);

      if (type === 'toggle') {
        el.classList.toggle('active', active);
        el.querySelector('.icon-box')?.classList.toggle('active', active);
        const t = el.querySelector('.toggle');
        if (t) { t.classList.toggle('on', active); setAttr(t, 'aria-checked', active ? 'true' : 'false'); }
        return;
      }
      if (type === 'stat') {
        const raw = row.value != null ? this.template(row.value, row.entity) : st?.state;
        const num = typeof raw === 'number' ? raw : parseFloat(raw);
        setText(el.querySelector('.stat-value'), raw == null || raw === 'unavailable' || raw === 'unknown' ? '–' : String(raw));
        el.classList.toggle('zero', !Number.isFinite(num) || num <= 0);
        const line = el.querySelector('.stat-line');
        const showLine = row.line == null ? true : (typeof row.line === 'string' ? !!this.template(row.line, row.entity) : !!row.line);
        setStyle(line, 'display', showLine ? '' : 'none');
        setStyle(line, 'width', row.max != null && Number.isFinite(num) && num > 0
          ? `${Math.max(8, Math.min(100, ((num - (row.min ?? 0)) / ((row.max - (row.min ?? 0)) || 1)) * 100))}%` : '');
        return;
      }
      const pct = this._pctFor(row, st);
      if (type === 'gauge') {
        el.querySelector('.ring-inner')?.classList.toggle('active', active);
        if (!dragging) {
          setStyle(el, '--glow', active ? Math.max(0.12, pct).toFixed(2) : 0);
          this._paintRing(el.querySelector('.ring'), pct, color, active);
        }
        return;
      }
      el.classList.toggle('active', active);
      el.querySelector('.icon-box')?.classList.toggle('active', active);
      if (!dragging) {
        setStyle(el, '--glow', active ? Math.max(0.12, pct).toFixed(2) : 0);
        setStyle(el.querySelector('.fill'), 'width', `${pct * 100}%`);
        setStyle(el.querySelector('.lens'), 'left', `calc(13px + (100% - 26px) * ${pct})`);
        setStyle(el.querySelector('.solid-fill'), 'width', `${pct * 100}%`);
      }
    });
  }

  // ---- row helpers ---------------------------------------------------
  _defaultIcon(row, st) {
    const d = domainOf(row.entity);
    const on = this._isActive(row, st);
    return ({
      light: on ? 'mdi:lightbulb' : 'mdi:lightbulb-outline',
      switch: on ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off-outline',
      fan: 'mdi:fan', input_boolean: 'mdi:toggle-switch-outline', climate: 'mdi:thermostat',
      binary_sensor: on ? 'mdi:checkbox-marked-circle' : 'mdi:checkbox-blank-circle-outline',
      sensor: 'mdi:eye', number: 'mdi:ray-vertex', input_number: 'mdi:ray-vertex', cover: 'mdi:window-shutter',
    })[d] || 'mdi:circle-outline';
  }

  _isSwitchable(row) {
    const d = domainOf(row.entity);
    return d === 'light' || d === 'binary_sensor' || d === 'timer' || TOGGLE_DOMAINS.includes(d);
  }

  _isActive(row, st) {
    if (this._isSwitchable(row)) return !!st && ['on', 'open', 'active'].includes(st.state);
    return true;
  }

  // Colour means state: lights in their own colour (warm when they can't
  // show one), heating orange, everything else the accent - unless the row
  // sets `color` (state name, HA colour name, CSS colour or template).
  _rowColor(row, st) {
    const own = resolveColor(this.template(row.color, row.entity));
    if (own) return own;
    const d = domainOf(row.entity);
    if (d === 'light') return lightColor(st, row.entity, this._lastColor);
    if (d === 'climate' || d === 'water_heater') return STATE_COLORS.heat;
    return STATE_COLORS.accent;
  }

  _isEditable(row) {
    if (row.progress) return false;
    return ['number', 'input_number', 'light'].includes(domainOf(row.entity));
  }

  _pctFor(row, st) {
    if (row.progress) {
      const v = this.template(row.progress, row.entity);
      const n = typeof v === 'number' ? v : parseFloat(v);
      return Number.isFinite(n) ? Math.max(0, Math.min(1, n / 100)) : 0;
    }
    if (!st) return 0;
    if (domainOf(row.entity) === 'light' && st.attributes.brightness != null) return Math.max(0, Math.min(1, st.attributes.brightness / 255));
    const v = parseFloat(st.state);
    if (Number.isNaN(v)) return 0;
    const min = row.min ?? 0, max = row.max ?? 100;
    return Math.max(0, Math.min(1, (v - min) / ((max - min) || 1)));
  }

  _subText(row, st) {
    if (row.power_entity) {
      const p = this._hass.states[row.power_entity];
      if (p && Number.isFinite(parseFloat(p.state))) return this.formatState(p);
    }
    if (row.state_text) {
      const r = this.template(row.state_text, row.entity);
      if (r != null && r !== '') return r;
    }
    return this.formatState(st);
  }

  _setNumeric(row, pct) {
    const d = domainOf(row.entity);
    const min = row.min ?? 0, max = row.max ?? 100;
    const value = Math.round((min + (max - min) * pct) * 100) / 100;
    if (d === 'number' || d === 'input_number') this._hass.callService(d, 'set_value', { entity_id: row.entity, value });
    else if (d === 'light') this._hass.callService('light', 'turn_on', { entity_id: row.entity, brightness_pct: Math.round(pct * 100) });
  }

  _tap(row) {
    this.performAction(row.tap_action || this.defaultTapAction(row.entity), row.entity);
  }

  _hold(row) {
    haptic(this, 'medium');
    this.performAction(row.hold_action || { action: 'more-info' }, row.entity);
  }

  _row(el) { return this._config.rows[Number(el.dataset.i ?? el.dataset.rowI)]; }

  // ---- input ---------------------------------------------------------
  _wire() {
    this._wired = true;
    const root = this.shadowRoot;
    root.addEventListener('click', (e) => {
      if (this._lpFired) { this._lpFired = false; return; }
      if (this._dragFired) { this._dragFired = false; return; }
      if (this.isSolid()) {
        const tile = e.target.closest('.pill[data-row-i], .bar-tile[data-row-i]');
        if (tile) { const row = this._row(tile); if (row?.entity) this._tap(row); return; }
      }
      const t = e.target.closest('[data-action="toggle"]');
      if (t) { this.toggle(this._row(t).entity); return; }
      if (e.target.closest('[data-action="icon-inert"]')) return;
      const icon = e.target.closest('[data-action="icon-tap"]');
      if (icon) { this._tap(this._row(icon)); return; }
      const name = e.target.closest('[data-action="name-tap"]');
      if (name) {
        const row = this._row(name);
        if (row.tap_action) this._tap(row); else this.moreInfo(row.entity);
        return;
      }
      const rowEl = e.target.closest('[data-row-i]');
      if (rowEl) { const row = this._row(rowEl); if (row?.entity && !this._isEditable(row)) this._tap(row); }
    });
    root.addEventListener('pointerdown', (e) => {
      this._lpFired = false;
      this._dragFired = false;
      if (!e.target.closest('.body')) return;
      const solidBar = this.isSolid() && e.target.closest('.bar-tile[data-row-i]');
      if (solidBar) { this._startTileDrag(e, solidBar); this._startLongPress(e); return; }
      const track = e.target.closest('[data-action="drag-bar"]');
      const ring = e.target.closest('[data-action="drag-ring"]');
      if (track) this._startBarDrag(e, track);
      else if (ring) this._startRingDrag(e, ring);
      else this._startLongPress(e);
    });
  }

  _startLongPress(e) {
    const tile = e.target.closest('[data-row-i]');
    if (!tile || e.target.closest('[data-action="toggle"]')) return;
    const row = this._row(tile);
    if (!row?.entity) return;
    const x0 = e.clientX, y0 = e.clientY;
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('pointerup', cleanup, true);
      window.removeEventListener('pointercancel', cleanup, true);
      window.removeEventListener('pointermove', onMove, true);
    };
    const onMove = (ev) => { if (Math.abs(ev.clientX - x0) > 8 || Math.abs(ev.clientY - y0) > 8) cleanup(); };
    const timer = setTimeout(() => { cleanup(); this._lpFired = true; this._hold(row); }, 500);
    window.addEventListener('pointerup', cleanup, true);
    window.addEventListener('pointercancel', cleanup, true);
    window.addEventListener('pointermove', onMove, true);
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
    if (step !== state.step) { state.step = step; haptic(this, step >= 8 ? 'medium' : step >= 4 ? 'light' : 'selection'); }
  }

  _startBarDrag(e, trackEl) {
    const row = this._row(trackEl);
    if (!this._isEditable(row)) return;
    const tile = trackEl.closest('[data-row-i]');
    tile.dataset.dragging = '1';
    trackEl.setPointerCapture(e.pointerId);
    const send = this._sender(row);
    const hs = { step: -1 };
    let pct = 0;
    const at = (ev) => {
      const r = trackEl.getBoundingClientRect();
      pct = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      setStyle(trackEl.querySelector('.fill'), 'width', `${pct * 100}%`);
      setStyle(trackEl.querySelector('.lens'), 'left', `calc(13px + (100% - 26px) * ${pct})`);
      setStyle(tile, '--glow', Math.max(0.12, pct).toFixed(2));
    };
    const done = () => {
      trackEl.removeEventListener('pointermove', move);
      trackEl.removeEventListener('pointerup', up);
      trackEl.removeEventListener('pointercancel', done);
      delete tile.dataset.dragging;
      this.update();
    };
    const move = (ev) => { at(ev); this._stepHaptic(hs, pct); send(pct, true); };
    const up = (ev) => { at(ev); send(pct, false); done(); };
    trackEl.addEventListener('pointermove', move);
    trackEl.addEventListener('pointerup', up);
    trackEl.addEventListener('pointercancel', done);
  }

  // Solid bar tiles: the whole tile is the slider, relative to where the
  // finger started; vertical movement stays a scroll.
  _startTileDrag(e, tile) {
    const row = this._row(tile);
    if (!row?.entity || row.hide_track || !this._isEditable(row)) return;
    const id = e.pointerId, x0 = e.clientX, y0 = e.clientY;
    const start = this._pctFor(row, this._hass.states[row.entity]);
    const fill = tile.querySelector('.solid-fill');
    const sub = tile.querySelector('.sub');
    const send = this._sender(row);
    const hs = { step: -1 };
    let dragging = false, refX = x0, width = 1, pct = start;
    const paint = () => {
      setStyle(fill, 'width', `${pct * 100}%`);
      setText(sub, this._dragLabel(row, pct));
    };
    const done = () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', cancel, true);
      if (tile.dataset.dragging) { delete tile.dataset.dragging; this.update(); }
    };
    const move = (ev) => {
      if (ev.pointerId !== id) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!dragging) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) && !this._lpFired) {
          dragging = true;
          refX = ev.clientX;
          width = tile.getBoundingClientRect().width || 1;
          tile.dataset.dragging = '1';
          try { tile.setPointerCapture(id); } catch (err) { /* window listeners cover it */ }
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
      if (dragging) { send(pct, false); this._dragFired = true; }
      done();
    };
    const cancel = (ev) => { if (ev.pointerId === id) done(); };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', cancel, true);
  }

  _dragLabel(row, pct) {
    if (domainOf(row.entity) === 'light') return `${Math.round(pct * 100)} %`;
    const min = row.min ?? 0, max = row.max ?? 100;
    const v = Math.round((min + (max - min) * pct) * 100) / 100;
    const unit = this._hass?.states[row.entity]?.attributes?.unit_of_measurement;
    return unit ? `${v} ${unit}` : String(v);
  }

  _startRingDrag(e, ringEl) {
    const row = this._row(ringEl);
    if (!this._isEditable(row)) return;
    const tile = ringEl.closest('[data-row-i]');
    tile.dataset.dragging = '1';
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
      ringEl.removeEventListener('pointermove', move);
      ringEl.removeEventListener('pointerup', up);
      ringEl.removeEventListener('pointercancel', done);
      delete tile.dataset.dragging;
      this.update();
    };
    const move = (ev) => { at(ev); this._stepHaptic(hs, pct); send(pct, true); };
    const up = (ev) => { at(ev); send(pct, false); done(); };
    at(e);
    ringEl.addEventListener('pointermove', move);
    ringEl.addEventListener('pointerup', up);
    ringEl.addEventListener('pointercancel', done);
  }

  _paintRing(ringEl, pct, color, active) {
    if (!ringEl) return;
    const key = `${pct}|${color}|${active}|${this.glowOn()}`;
    if (ringEl._pPainted === key) return;
    ringEl._pPainted = key;
    const deg = pct * 360;
    const track = `color-mix(in srgb, ${INK} 14%, transparent)`;
    ringEl.style.background = `conic-gradient(${color} 0deg, ${color} ${deg}deg, ${track} ${deg}deg)`;
    ringEl.style.boxShadow = active && this.glowOn() ? `0 0 ${Math.round(8 + pct * 10)}px -4px ${color}` : 'none';
    const lens = ringEl.querySelector('.ring-lens');
    if (lens) {
      const th = pct * 2 * Math.PI;
      lens.style.left = `${37 + 33 * Math.sin(th)}px`;
      lens.style.top = `${37 - 33 * Math.cos(th)}px`;
      lens.style.transform = `translate(-50%,-50%) rotate(${deg}deg)`;
    }
  }

  static getConfigElement() {
    return document.createElement(PaneTileCard.editorTag);
  }
}

// ---------------------------------------------------------------------
// Visual editor: every option of the card, no YAML needed.
// ---------------------------------------------------------------------
const COLOR_OPTIONS = [
  { value: 'auto', label: 'Automatisch' },
  { value: 'warm', label: 'Warm (Licht, Sonne)' },
  { value: 'heat', label: 'Heizen' },
  { value: 'accent', label: 'Akzent' },
  { value: 'ok', label: 'OK / läuft' },
  { value: 'alert', label: 'Warnung' },
];

export class PaneTileCardEditor extends PaneEditor {
  labels() {
    return {
      title: 'Titel', icon: 'Icon', subtitle: 'Untertitel', icon_color: 'Icon-Farbe', header_action: 'Knopf rechts',
      columns: 'Spalten', look: 'Look', frame: 'Rahmen', glow: 'Leuchten', stat_size: 'Zahlen',
      entity: 'Entität', type: 'Art', name: 'Name', color: 'Farbe', min: 'Minimum', max: 'Maximum',
      hide_track: 'Leiste ausblenden', power_entity: 'Leistung aus Entität', state_text: 'Statuszeile',
      progress: 'Füllstand (Vorlage)', value: 'Wert (Vorlage)', tap_action: 'Antippen', hold_action: 'Lang drücken',
      line: 'Linie zeigen',
    };
  }

  helpers() {
    return {
      subtitle: 'Leer = automatisch („3 von 6 an“), „none“ = keiner. Vorlagen mit [[[ … ]]] möglich.',
      state_text: 'Leer = Zustand der Entität. Vorlagen mit [[[ … ]]] möglich.',
      color: 'Automatisch: Licht in seiner Farbe, sonst Akzent. Eigene Farbe als Hex eintippen.',
    };
  }

  sections() {
    const c = this._config || {};
    const data = {
      ...c,
      columns: String(c.columns ?? (c.layout === 'grid' ? 2 : 1)),
      look: c.look || 'theme',
      frame: c.frame === undefined ? 'auto' : c.frame ? 'on' : 'off',
      glow: c.glow !== false,
      icon_color: c.icon_color || 'auto',
      header_action: c.header_action || 'none',
      stat_size: c.stat_size || 'normal',
    };
    const select = (options, extra = {}) => ({ select: { mode: 'dropdown', options, ...extra } });
    return [
      {
        title: 'Kopfzeile',
        schema: [
          { name: 'title', selector: { text: {} } },
          { type: 'grid', name: '', schema: [
            { name: 'icon', selector: { icon: {} } },
            { name: 'icon_color', selector: select(COLOR_OPTIONS, { custom_value: true }) },
          ] },
          { name: 'subtitle', selector: { text: {} } },
          { name: 'header_action', selector: select([{ value: 'none', label: 'Keiner' }, { value: 'all_off', label: 'Alles aus' }]) },
        ],
        data: () => data,
        set: (v) => this._setTop(v),
      },
      {
        key: 'rows',
        title: 'Kacheln',
        list: {
          items: () => c.rows || [],
          set: (rows) => this.emit({ ...this._config, rows }),
          create: () => ({ entity: '', type: 'toggle' }),
          addLabel: '+ Kachel hinzufügen',
          title: (r, hass) => r.name || hass?.states[r.entity]?.attributes?.friendly_name || r.entity || 'Neue Kachel',
          subtitle: (r) => [r.entity, { toggle: 'Schalter', bar: 'Balken', gauge: 'Ring', stat: 'Zahl' }[r.type || 'toggle']].filter(Boolean).join(' · '),
          icon: (r, hass) => r.icon || hass?.states[r.entity]?.attributes?.icon || 'mdi:drag-vertical',
          signature: (r) => r.type || 'toggle',
          schema: (r) => this._rowSchema(r),
          data: (r) => ({ type: 'toggle', color: 'auto', ...r }),
          merge: (r, v) => {
            const next = PaneEditor.clean({ ...v });
            if (next.color === 'auto') delete next.color;
            if (next.hide_track === false) delete next.hide_track;
            if (next.line === true) delete next.line;
            return next;
          },
        },
      },
      {
        title: 'Darstellung',
        schema: [
          { type: 'grid', name: '', schema: [
            { name: 'columns', selector: select([{ value: '1', label: 'Liste' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]) },
            { name: 'look', selector: select([{ value: 'theme', label: 'Vom Theme' }, { value: 'glass', label: 'Glass' }, { value: 'solid', label: 'Solid' }]) },
          ] },
          { type: 'grid', name: '', schema: [
            { name: 'frame', selector: select([{ value: 'auto', label: 'Automatisch (kein Rahmen im Pop-up)' }, { value: 'on', label: 'Immer' }, { value: 'off', label: 'Nie' }]) },
            { name: 'glow', selector: { boolean: {} } },
          ] },
          { name: 'stat_size', selector: select([{ value: 'normal', label: 'Normal' }, { value: 'large', label: 'Groß' }]) },
        ],
        data: () => data,
        set: (v) => this._setTop(v),
      },
    ];
  }

  _rowSchema(r) {
    const type = r.type || 'toggle';
    const s = [
      { name: 'entity', required: true, selector: { entity: {} } },
      { name: 'type', selector: { select: { mode: 'box', options: [
        { value: 'toggle', label: 'Schalter' }, { value: 'bar', label: 'Balken' },
        { value: 'gauge', label: 'Ring' }, { value: 'stat', label: 'Zahl' }] } } },
      { type: 'grid', name: '', schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'icon', selector: { icon: {} } },
      ] },
      { name: 'color', selector: { select: { mode: 'dropdown', custom_value: true, options: COLOR_OPTIONS } } },
    ];
    if (type === 'bar' || type === 'gauge' || type === 'stat') {
      s.push({ type: 'grid', name: '', schema: [
        { name: 'min', selector: { number: { mode: 'box', step: 'any' } } },
        { name: 'max', selector: { number: { mode: 'box', step: 'any' } } },
      ] });
    }
    if (type === 'bar') s.push({ name: 'hide_track', selector: { boolean: {} } });
    if (type === 'toggle') s.push({ name: 'power_entity', selector: { entity: { domain: 'sensor' } } });
    if (type === 'stat') s.push({ name: 'value', selector: { text: {} } }, { name: 'line', selector: { boolean: {} } });
    if (type !== 'stat') s.push({ name: 'state_text', selector: { text: {} } });
    if (type === 'bar' || type === 'gauge') s.push({ name: 'progress', selector: { text: {} } });
    s.push(
      { name: 'tap_action', selector: { ui_action: {} } },
      { name: 'hold_action', selector: { ui_action: {} } },
    );
    return s;
  }

  _setTop(v) {
    const next = { ...this._config, ...v };
    delete next.layout;
    next.columns = Number(v.columns ?? next.columns) || 1;
    if (next.columns === 1) delete next.columns;
    if (next.look === 'theme') delete next.look;
    if (next.frame === 'auto') delete next.frame;
    else if (next.frame === 'on') next.frame = true;
    else if (next.frame === 'off') next.frame = false;
    if (next.glow === true) delete next.glow;
    if (next.icon_color === 'auto') delete next.icon_color;
    if (next.header_action === 'none') delete next.header_action;
    if (next.stat_size === 'normal') delete next.stat_size;
    const rows = next.rows;
    const cleaned = PaneEditor.clean(next);
    cleaned.rows = rows || [];
    this.emit(cleaned);
  }
}
