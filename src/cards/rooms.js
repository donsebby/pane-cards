import { PaneCard } from '../core/base.js';
import { PaneEditor } from '../core/editor.js';

// Pane Rooms Card: one tile per room with its temperature and at most one
// hint (window open > heating > media playing > lights on), plus a row for
// all lamps that are on with a button to switch them off.
// Successor of the home-glass-card; its configs work unchanged.
//
// type: custom:pane-rooms-card
// title: Räume
// tiles: true                      # colourful tile per room (3 per row on phones)
// lights_label: lampen             # lamps for the "N Lampen an" row and the room counts
// rooms:
//   - name: Wohnzimmer
//     area: wohnzimmer             # lights on in this area -> "Licht an"
//     climate: climate.living_room
//     temperature: sensor.xyz      # optional, else the climate's current_temperature
//     windows: [binary_sensor.a]
//     heating_status: sensor.xyz   # optional text like "Manuell 22,0 °C bis 18:00" -> "Hand 22° bis 18:00"
//     media: [{ entity: media_player.tv, name: TV }]
//     navigate: '#climate-popup'   # optional, else more-info of climate/temperature
//     color: '#FFB020'             # optional room colour (tiles), else one from the palette

// "Zuhause": one tile per room with its temperature and at most one hint
// (window open > heating > media playing > lights on), plus one row for all
// lamps that are on, with a button to switch them off. Colours and surface come
// from the theme / weather-ambience-card variables like the other own cards.
//
// type: custom:home-glass-card
// title: Zuhause
// lights_label: lampen            # lamps for the "N Lampen an" row and the room counts
// rooms:
//   - name: Wohnzimmer
//     area: wohnzimmer             # lights on in this area -> "Licht an"
//     climate: climate.thermostat_wz
//     temperature: sensor.xyz      # optional, else the climate's current_temperature
//     windows: [binary_sensor.a]
//     media: [{ entity: media_player.atv, name: Apple TV }]
//     navigate: '#klima-popup'     # optional, else more-info of climate/temperature
//     color: '#FFB020'             # optional room colour (tiles: true), else one from the palette
// tiles: true                      # colourful glass tile per room (3 per row on phones)

const HGC_INK = 'var(--text-1, var(--primary-text-color, #fff))';
const HGC_INK2 = 'var(--text-2, var(--secondary-text-color, rgba(255,255,255,.65)))';
// Room colours for `tiles: true`, used in order unless a room sets `color`.
const HGC_COLORS = ['#FFB020', '#8C7BFF', '#4F8CFF', '#FF5FA2', '#34C759', '#C86BFF', '#2EC4B6', '#FF7A45'];
// Hint kinds -> colour of their little pill.
const HGC_HINT = { window: '#2EC4B6', heat: '#FF7A45', manual: '#FF7A45', media: '#A66CFF', light: '#FFB020' };
const hgcEsc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const hgcDeg = (v) => (Number.isFinite(v) ? v.toFixed(1).replace('.', ',') + '°' : '–');

// Glass look (theme or weather-ambience card says glass): the same layout,
// but tiles and the lamp row become glass panes - translucent, blurred, with a
// light edge on top. The solid look above stays exactly as it was.
const GLASS_BG = (tint, a, b) => `linear-gradient(160deg, color-mix(in srgb, ${tint} ${a}, color-mix(in srgb, #fff 16%, transparent)), color-mix(in srgb, ${tint} ${b}, color-mix(in srgb, #fff 4%, transparent)))`;
const HGC_GLASS = `
  .card:not(.solid) .blk, .card:not(.solid) .tiles .room {
    -webkit-backdrop-filter: var(--pane-backdrop, blur(22px) saturate(170%)); backdrop-filter: var(--pane-backdrop, blur(22px) saturate(170%));
    border: 1px solid color-mix(in srgb, #fff 22%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 45%, transparent), 0 14px 32px rgba(6, 10, 30, 0.22); }
  .card:not(.solid) .blk { background: ${GLASS_BG('#fff', '0%', '0%')}; }
  .card:not(.solid) .tiles .room { background: ${GLASS_BG('var(--rc)', '30%', '14%')}; }
  .card:not(.solid) .tiles .room:hover { background: ${GLASS_BG('var(--rc)', '40%', '20%')}; }
  .card:not(.solid) .chip { box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 50%, transparent); }
`;

const HGC_STYLE = `
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

export class PaneRoomsCard extends PaneCard {
  static get styles() { return HGC_STYLE + HGC_GLASS; }

  static getStubConfig(hass) {
    const climates = Object.keys(hass?.states || {}).filter((e) => e.startsWith('climate.')).slice(0, 3);
    return { title: 'Räume', tiles: true, rooms: climates.length
      ? climates.map((c) => ({ name: hass.states[c].attributes.friendly_name || c, climate: c }))
      : [{ name: 'Wohnzimmer' }] };
  }

  validateConfig(config) {
    if (!Array.isArray(config.rooms)) throw new Error('Pane Rooms Card: "rooms" fehlt.');
  }

  defaultFrame() { return false; }

  build() {
    this._config = { title: 'Zuhause', ...this._config };
    if (!this._root) {
      this._root = document.createElement('div');
      this._root.className = 'root';
      this.bodyEl.appendChild(this._root);
      this._root.addEventListener('click', (e) => this._onClick(e));
    }
    this._sig = null;
  }

  // Renders only when one of the watched entities changed.
  update() {
    const hass = this._hass;
    const sig = this._watched().map((id) => hass.states[id]?.last_updated).join('|');
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }

  static getConfigElement() { return document.createElement(PaneRoomsCard.editorTag); }

  getCardSize() { return 6; }
  getGridOptions() { return { columns: 'full' }; }

  // Lights per area (entity area, else its device's area) and the labelled lamps.
  _index() {
    const h = this._hass;
    if (this._idxFor === h.entities) return;
    this._idxFor = h.entities;
    const byArea = {}, labelled = [], lbl = this._config.lights_label;
    for (const [id, e] of Object.entries(h.entities || {})) {
      if (!id.startsWith('light.') || e.hidden) continue;
      const area = e.area_id || (e.device_id && h.devices?.[e.device_id]?.area_id);
      const isLamp = !!lbl && (e.labels || []).includes(lbl);
      if (isLamp) labelled.push(id);
      // With lights_label only the labelled lamps count, so status LEDs and the single
      // bulbs inside a lamp group (e.g. a floor lamp with two bulbs) don't add up.
      if (area && (!lbl || isLamp)) (byArea[area] = byArea[area] || []).push(id);
    }
    this._lightsByArea = byArea; this._lamps = labelled;
  }

  _watched() {
    this._index();
    const ids = [];
    this._config.rooms.forEach((r) => {
      ids.push(r.climate, r.temperature, r.heating_status, ...(r.windows || []), ...(r.media || []).map((m) => m.entity || m));
      if (r.area) ids.push(...(this._lightsByArea[r.area] || []));
    });
    ids.push(...this._lamps);
    return ids.filter(Boolean);
  }

  _hint(r) {
    const h = this._hass, on = (id) => h.states[id]?.state === 'on';
    const open = (r.windows || []).filter(on);
    if (open.length) return ['Fenster offen', '#FFC145', 'window'];
    // Heating status text of an own heating control (e.g. "Manuell 22,0 °C bis 18:00").
    const hs = r.heating_status && h.states[r.heating_status];
    const text = hs ? String(hs.state).trim() : '';
    const man = /^Manuell\s+([\d,.]+)\s*°C(?:\s+bis\s+(\d{1,2}:\d{2}))?/i.exec(text);
    if (man) {
      const deg = man[1].replace('.', ',').replace(/,0+$/, '');
      return [`Hand ${deg}°${man[2] ? ` bis ${man[2]}` : ''}`, '#FF9E6B', 'manual'];
    }
    if (/^Fenster/i.test(text) && !(r.windows || []).length) return ['Fenster offen', '#FFC145', 'window'];
    const cl = r.climate && h.states[r.climate];
    // Heating only counts while the room is still clearly below its target:
    // thermostats keep reporting "heating" around the target, which is just noise.
    if (cl && cl.attributes.hvac_action === 'heating') {
      const t = parseFloat(cl.attributes.temperature), cur = this._temp(r);
      if (!Number.isFinite(t) || !Number.isFinite(cur) || cur < t - 0.5) return [Number.isFinite(t) ? `heizt auf ${hgcDeg(t)}` : 'heizt', '#FF9E6B', 'heat'];
    }
    for (const m of r.media || []) {
      const st = h.states[m.entity || m];
      if (st && st.state === 'playing') return [`${m.name || st.attributes.friendly_name} spielt`, 'var(--mood, #8FA8FF)', 'media'];
    }
    const lights = (this._lightsByArea[r.area] || []).filter(on).length;
    if (lights) return [lights === 1 ? 'Licht an' : `${lights} Lampen an`, '', 'light'];
    return ['', '', ''];
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
    this._root.classList.toggle('tiles', tiles);
    const rooms = c.rooms.map((r, i) => {
      const [hint, col, kind] = this._hint(r);
      if (tiles) {
        const rc = r.color || HGC_COLORS[i % HGC_COLORS.length];
        const pill = hint ? `<span class="pill" style="--hc:${HGC_HINT[kind] || '#9AA3B8'}">${hgcEsc(hint)}</span>` : '';
        return `<div class="room" data-room="${i}" role="button" tabindex="0" style="--rc:${hgcEsc(rc)}"><span class="rh">${pill}</span>
          <span class="rt">${hgcDeg(this._temp(r))}</span><span class="rn">${hgcEsc(r.name)}</span></div>`;
      }
      return `<div class="room" data-room="${i}" role="button" tabindex="0"><span class="rn">${hgcEsc(r.name)}</span>
        <span class="rt">${hgcDeg(this._temp(r))}</span><span class="rh" style="${col ? `--h:${col}` : ''}">${hgcEsc(hint)}</span></div>`;
    }).join('');
    const on = this._lamps.filter((id) => h.states[id]?.state === 'on');
    const names = on.map((id) => h.states[id].attributes.friendly_name || id);
    const lampIcon = tiles ? '<span class="chip"><ha-icon icon="mdi:lightbulb-on"></ha-icon></span>' : '<ha-icon icon="mdi:lightbulb-on-outline"></ha-icon>';
    const lamps = on.length ? `<div class="row">${lampIcon}<div class="t"><div class="tt">${on.length === 1 ? hgcEsc(names[0]) + ' ist an' : on.length + ' Lampen an'}</div>${on.length > 1 ? `<div class="ts">${hgcEsc(names.slice(0, 3).join(', '))}${on.length > 3 ? ' …' : ''}</div>` : ''}</div><div class="btn" data-act="off" role="button" tabindex="0"><ha-icon icon="mdi:power"></ha-icon>Alle aus</div></div>` : '';
    this._root.innerHTML = tiles
      ? `${c.title ? `<div class="head">${hgcEsc(c.title)}</div>` : ''}<div class="grid">${rooms}</div>${lamps ? `<div class="blk">${lamps}</div>` : ''}`
      : `<div class="blk"><div class="bt">${hgcEsc(c.title)}</div><div class="grid">${rooms}</div>${lamps}</div>`;
  }

  _onClick(e) {
    if (e.target.closest('[data-act="off"]')) {
      const on = this._lamps.filter((id) => this._hass.states[id]?.state === 'on');
      if (on.length) this._hass.callService('light', 'turn_off', { entity_id: on });
      this.dispatchEvent(new CustomEvent('haptic', { bubbles: true, composed: true, detail: 'light' }));
      return;
    }
    const el = e.target.closest('[data-room]'); if (!el) return;
    const r = this._config.rooms[Number(el.dataset.room)]; if (!r) return;
    if (r.navigate) {
      history.pushState(null, '', r.navigate);
      window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
      return;
    }
    const id = r.climate || r.temperature;
    if (id) this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: id } }));
  }
}



// ---------------------------------------------------------------------
// Visual editor
// ---------------------------------------------------------------------
const ROOM_COLORS = [
  { value: 'auto', label: 'Automatisch' }, { value: '#FFB020', label: 'Gelb' }, { value: '#8C7BFF', label: 'Violett' },
  { value: '#4F8CFF', label: 'Blau' }, { value: '#FF5FA2', label: 'Pink' }, { value: '#34C759', label: 'Grün' },
  { value: '#C86BFF', label: 'Lila' }, { value: '#2EC4B6', label: 'Türkis' }, { value: '#FF7A45', label: 'Orange' },
];

export class PaneRoomsCardEditor extends PaneEditor {
  labels() {
    return {
      title: 'Titel', tiles: 'Farbige Kacheln', lights_label: 'Label der Lampen', look: 'Look',
      name: 'Name', area: 'Bereich', climate: 'Thermostat', temperature: 'Temperatur-Sensor', windows: 'Fenster',
      media: 'Medien', navigate: 'Antippen öffnet', color: 'Farbe', heating_status: 'Heizungs-Status',
    };
  }

  helpers() {
    return {
      lights_label: 'Lampen mit diesem Label zählen für „N Lampen an“ und „Alle aus“.',
      area: 'Eingeschaltete Lampen in diesem Bereich zeigen „Licht an“.',
      temperature: 'Leer = aktuelle Temperatur des Thermostats.',
      heating_status: 'Text wie ‚Manuell 22,0 °C bis 18:00‘ zeigt ‚Hand 22° bis 18:00‘.',
      navigate: 'Zum Beispiel #raum-wohnzimmer für ein Pop-up. Leer = Details von Thermostat oder Sensor.',
    };
  }

  sections() {
    const c = this._config || {};
    const top = { ...c, tiles: !!c.tiles, look: c.look || 'theme' };
    return [
      {
        title: 'Karte',
        schema: [
          { name: 'title', selector: { text: {} } },
          { type: 'grid', name: '', schema: [
            { name: 'tiles', selector: { boolean: {} } },
            { name: 'look', selector: { select: { mode: 'dropdown', options: [{ value: 'theme', label: 'Vom Theme' }, { value: 'glass', label: 'Glass' }, { value: 'solid', label: 'Solid' }] } } },
          ] },
          { name: 'lights_label', selector: { label: {} } },
        ],
        data: () => top,
        set: (v) => {
          const next = { ...this._config, ...v };
          if (!next.tiles) delete next.tiles;
          if (next.look === 'theme') delete next.look;
          const rooms = next.rooms;
          const out = PaneEditor.clean(next);
          out.rooms = rooms || [];
          this.emit(out);
        },
      },
      {
        key: 'rooms',
        title: 'Räume',
        list: {
          items: () => c.rooms || [],
          set: (rooms) => this.emit({ ...this._config, rooms }),
          create: () => ({ name: 'Neuer Raum' }),
          addLabel: '+ Raum hinzufügen',
          title: (r) => r.name,
          subtitle: (r) => r.climate || r.temperature || '',
          icon: () => 'mdi:floor-plan',
          schema: () => [
            { name: 'name', required: true, selector: { text: {} } },
            { type: 'grid', name: '', schema: [
              { name: 'area', selector: { area: {} } },
              { name: 'color', selector: { select: { mode: 'dropdown', custom_value: true, options: ROOM_COLORS } } },
            ] },
            { name: 'climate', selector: { entity: { domain: 'climate' } } },
            { name: 'temperature', selector: { entity: { domain: 'sensor', device_class: 'temperature' } } },
            { name: 'heating_status', selector: { entity: { domain: 'sensor' } } },
            { name: 'windows', selector: { entity: { domain: 'binary_sensor', multiple: true } } },
            { name: 'media', selector: { entity: { domain: 'media_player', multiple: true } } },
            { name: 'navigate', selector: { text: {} } },
          ],
          data: (r) => ({ color: 'auto', ...r, media: (r.media || []).map((m) => m.entity || m) }),
          merge: (r, v) => {
            const names = Object.fromEntries((r.media || []).map((m) => [m.entity || m, m.name]));
            const next = PaneEditor.clean({ ...v });
            if (next.color === 'auto') delete next.color;
            if (Array.isArray(next.windows) && !next.windows.length) delete next.windows;
            if (Array.isArray(next.media)) {
              if (!next.media.length) delete next.media;
              else next.media = next.media.map((id) => (names[id] ? { entity: id, name: names[id] } : { entity: id }));
            }
            return next;
          },
        },
      },
    ];
  }
}
