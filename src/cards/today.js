import { PaneCard } from '../core/base.js';
import { PaneEditor } from '../core/editor.js';

// Pane Today Card: greeting, weather and a calm "today" list (calendar,
// waste, energy, appliances, status ...), with `view: running` the
// "running now" list of appliances and devices, or with `view: night` the
// check before bed (open windows, lights on, waste).
//
// timeline: true      # today as a timeline with times (events, sunset, rain start)
// max_timeline: 6
// outfit: true        # 5-9 o'clock: what to wear, from the daily forecast
// Successor of the today-glass-card; its configs work unchanged.

const TDC_DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const TDC_MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const tdcMon = (d) => { const m = TDC_MONTHS[d.getMonth()]; return m.length <= 4 ? m : m.slice(0, 3) + '.'; };
const TDC_COND = { 'clear-night': ['Klar', 'mdi:weather-night'], cloudy: ['Bedeckt', 'mdi:weather-cloudy'], fog: ['Nebel', 'mdi:weather-fog'],
  hail: ['Hagel', 'mdi:weather-hail'], lightning: ['Gewitter', 'mdi:weather-lightning'], 'lightning-rainy': ['Gewitter', 'mdi:weather-lightning-rainy'],
  partlycloudy: ['Heiter bis wolkig', 'mdi:weather-partly-cloudy'], pouring: ['Starkregen', 'mdi:weather-pouring'], rainy: ['Regen', 'mdi:weather-rainy'],
  snowy: ['Schnee', 'mdi:weather-snowy'], 'snowy-rainy': ['Schneeregen', 'mdi:weather-snowy-rainy'], sunny: ['Sonnig', 'mdi:weather-sunny'],
  windy: ['Windig', 'mdi:weather-windy'], 'windy-variant': ['Windig', 'mdi:weather-windy-variant'], exceptional: ['Unwetter', 'mdi:alert'] };
const TDC_COLORS = { indigo: '#7986cb', cyan: '#4dd0e1', teal: '#4db6ac', green: '#81c784', yellow: '#fdd835', pink: '#f06292', brown: '#a1887f', blue: '#64b5f6', red: '#e57373', orange: '#ffb74d', purple: '#ba68c8' };

const tdcEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TDC_INK = 'var(--text-1, var(--primary-text-color, #fff))';
const TDC_INK2 = 'var(--text-2, var(--secondary-text-color, rgba(255,255,255,.65)))';
// Glass look: blocks and the weather pill become glass panes. The solid look
// (TDC_STYLE alone) stays exactly as it was.
const TDC_GLASS = `
  .card:not(.solid) .blk, .card:not(.solid) .colorful .wxpill {
    background: linear-gradient(160deg, color-mix(in srgb, #fff 16%, transparent), color-mix(in srgb, #fff 5%, transparent) 45%, color-mix(in srgb, #fff 8%, transparent));
    -webkit-backdrop-filter: var(--pane-backdrop, blur(22px) saturate(170%)); backdrop-filter: var(--pane-backdrop, blur(22px) saturate(170%));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, #fff 20%, transparent), inset 0 1px 0 color-mix(in srgb, #fff 45%, transparent), 0 14px 32px rgba(6, 10, 30, 0.22); }
  .card:not(.solid) .colorful .row > ha-icon:first-child { box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 35%, transparent); }
`;

const TDC_STYLE = `
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
  /* Waste due: fixed title, one chip per bin on its own line (no truncated "Gelber Sack + …") */
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
  /* style: colorful – coloured icon squares, compact weather pill, big greeting */
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
// Conditions that count as rain/snow for the timeline and the umbrella hint.
const TDC_WET = ['rainy', 'pouring', 'lightning-rainy', 'snowy', 'snowy-rainy', 'hail'];
const TDC_SNOW = ['snowy', 'snowy-rainy'];
// What to wear for the day's high, plus an umbrella when it rains.
export function tdcOutfit(fc) {
  const hi = Number(fc?.temperature);
  if (!fc || !Number.isFinite(hi)) return null;
  let item = hi <= 3 ? 'Winterjacke + Mütze' : hi <= 10 ? 'warme Jacke' : hi <= 16 ? 'Jacke' : hi <= 21 ? 'Pulli' : 'T-Shirt';
  const wet = Number(fc.precipitation) >= 1 || TDC_WET.includes(fc.condition);
  if (wet) item += ' · Schirm';
  return { item, coat: hi <= 16 };
}
const tdcDeg = (v) => (v == null || !Number.isFinite(Number(v)) ? '' : String(Math.round(Number(v))).replace('-', '−') + '°');

export class PaneTodayCard extends PaneCard {
  static get styles() { return TDC_STYLE + TDC_GLASS; }

  static getStubConfig(hass) {
    const weather = Object.keys(hass?.states || {}).find((e) => e.startsWith('weather.'));
    const calendars = Object.keys(hass?.states || {}).filter((e) => e.startsWith('calendar.')).slice(0, 2).map((entity) => ({ entity }));
    return { weather, calendars };
  }

  defaultFrame() { return false; }

  build() {
    this._config = { max_events: 3, ...this._config };
    if (!this._root) {
      this._root = document.createElement('div');
      this._root.className = 'root';
      this.bodyEl.appendChild(this._root);
      this._root.addEventListener('click', (e) => this._onClick(e));
    }
    this._events = null; this._eventsAt = 0; this._fcAt = 0; this._sig = null;
  }

  // Calendar and forecast are fetched now and then; the card renders only
  // when one of the watched entities changed (plus once a minute for times).
  update() {
    const hass = this._hass;
    if (Date.now() - this._eventsAt > 15 * 60000) this._loadEvents();
    if (Date.now() - this._fcAt > 30 * 60000) this._loadForecast();
    const sig = this._watched().map((id) => hass.states[id]?.last_updated).join('|');
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
    this._timer = setInterval(() => this._render(), 60000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
  }

  static getConfigElement() { return document.createElement(PaneTodayCard.editorTag); }

  getCardSize() { return 5; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  _watched() {
    const c = this._config, ids = [c.weather, 'sun.sun'];
    (c.calendars || []).forEach((x) => ids.push(x.entity));
    const w = c.waste || {}; (w.entities || []).forEach((x) => ids.push(x.entity)); if (w.done_entity) ids.push(w.done_entity);
    const e = c.energy || {}; ids.push(e.pv_today, e.pv_tomorrow, e.battery);
    ((c.packages || {}).items || []).forEach((x) => ids.push(x.entity));
    (c.appliances || []).forEach((a) => ids.push(a.state, a.finish, a.remaining, a.door, a.power));
    if (c.goodnight) { this._gnWindows().forEach((x) => ids.push(x.entity)); this._gnLights().forEach((x) => ids.push(x)); }
    const b = c.bath || {}; ids.push(b.script, b.status);
    if (c.warning) ids.push(c.warning.entity, c.warning.detail);
    (c.hints || []).forEach((x) => { ids.push(x.entity); (x.detail || []).forEach((d) => ids.push(d.entity)); });
    (c.status || []).forEach((x) => ids.push(x.entity, x.when, ...(x.entities || []).map((e) => e.entity || e)));
    if ((c.packages || {}).entity) ids.push(c.packages.entity);
    if (c.updates && this._hass) Object.keys(this._hass.states).forEach((e) => { if (e.startsWith('update.')) ids.push(e); });
    return ids.filter(Boolean);
  }
  _calSignature() { return (this._config.calendars || []).map((x) => this._hass.states[x.entity]?.last_changed).join('|'); }

  async _loadEvents() {
    const cals = this._config.calendars || [];
    if (!cals.length || !this._hass) return;
    this._eventsAt = Date.now(); this._calSig = this._calSignature();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 2);
    const q = `?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
    const out = [];
    await Promise.all(cals.map(async (cal) => {
      try {
        const list = await this._hass.callApi('GET', `calendars/${cal.entity}${q}`);
        for (const ev of list || []) {
          const allDay = !!ev.start.date;
          const s = allDay ? new Date(ev.start.date + 'T00:00:00') : new Date(ev.start.dateTime);
          const en = allDay ? new Date(ev.end.date + 'T00:00:00') : new Date(ev.end.dateTime);
          out.push({ title: ev.summary || '(ohne Titel)', start: s, end: en, allDay, color: TDC_COLORS[cal.color] || cal.color || '#90a4ae' });
        }
      } catch (e) { /* calendar unavailable */ }
    }));
    this._events = out.sort((a, b) => (a.allDay === b.allDay ? a.start - b.start : a.allDay ? -1 : 1));
    this._render();
  }

  async _loadForecast() {
    const id = this._config.weather;
    if (!id || !this._hass?.states[id]) return;
    this._fcAt = Date.now();
    const get = (type) => this._hass.callWS({ type: 'call_service', domain: 'weather', service: 'get_forecasts',
      service_data: { type }, target: { entity_id: id }, return_response: true });
    try {
      const res = await get('daily');
      this._fcList = res?.response?.[id]?.forecast || [];
      this._fc = this._fcList[0] || null;
      this._render();
    } catch (e) { /* no forecast */ }
    // Hourly only for the timeline (rain start).
    if (this._config.timeline) {
      try {
        const res = await get('hourly');
        this._fcHourly = res?.response?.[id]?.forecast || [];
        this._render();
      } catch (e) { /* no hourly forecast */ }
    }
  }

  _num(id, d = 1) { const v = parseFloat(this._hass.states[id]?.state); return Number.isFinite(v) ? v.toFixed(d).replace('.', ',') : '–'; }

  _wasteRow() {
    const w = this._config.waste;
    if (!w || !w.entities) return '';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const items = [];
    w.entities.forEach((cfg) => {
      const st = this._hass.states[cfg.entity]; if (!st) return;
      const next = Object.keys(st.attributes).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort()
        .map((k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }).find((d) => d >= today);
      if (next) items.push({ cfg, days: Math.round((next - today) / 86400000), date: next });
    });
    const vis = items.filter((x) => x.cfg.show_within_days == null || x.days <= x.cfg.show_within_days).sort((a, b) => a.days - b.days);
    this._wasteDue = null; this._wasteAct = false;
    if (!vis.length) return '';
    const days = vis[0].days;
    const hero = vis.filter((x) => x.days === days);
    const wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const whenS = (x) => (x.days === 0 ? 'heute' : x.days === 1 ? 'morgen' : x.days < 7 ? wd[x.date.getDay()] : `${x.date.getDate()}. ${tdcMon(x.date)}`);
    // Following pickups, bins on the same day in one entry: "Rest + Bio · 8. Dez."
    const groups = [];
    vis.filter((x) => x.days !== days).forEach((x) => {
      const g = groups.find((gg) => gg.days === x.days);
      if (g) g.items.push(x); else if (groups.length < 2) groups.push({ days: x.days, items: [x] });
    });
    const next = groups.map((g) => `<span class="nx">${g.items.map((x) => `<i style="--c:${x.cfg.color || '#9e9e9e'}"></i>`).join('')}${g.items.map((x) => tdcEsc(x.cfg.short || x.cfg.name)).join(' + ')} · ${whenS(g.items[0])}</span>`).join('');
    const nextHtml = next ? `<div class="nxl">${next}</div>` : '';
    const names = hero.map((x) => x.cfg.name).join(' + ');
    const hour = new Date().getHours();
    const from = w.evening_from ?? 17, until = w.morning_until ?? 9;
    const due = (days === 1 && hour >= from) || (days === 0 && hour < until);
    let done = false;
    const btn = w.done_entity && this._hass.states[w.done_entity];
    if (due && btn) {
      const since = new Date(hero[0].date); since.setDate(since.getDate() - 1); since.setHours(from, 0, 0, 0);
      const pressed = new Date(btn.state); done = !isNaN(pressed) && pressed >= since;
    }
    const alert = due && !done;
    const when = days <= 1 ? whenS(hero[0]) : days < 7 ? TDC_DAYS[hero[0].date.getDay()] : `in ${days} Tagen`;
    const color = hero[0].cfg.color || '#9e9e9e';
    this._wasteDue = alert ? `${names} ${days === 1 ? 'heute Abend' : 'jetzt'} rausstellen.` : null;
    this._wasteAct = alert;
    if (alert) {
      const cols = hero.map((x) => x.cfg.color || '#9e9e9e');
      const stripe = cols.length > 1 ? `linear-gradient(${cols.map((c2, i) => `${c2} ${(i * 100) / cols.length}% ${((i + 1) * 100) / cols.length}%`).join(', ')})` : cols[0];
      const title = 'Müll rausstellen';
      const sub = days === 1 ? 'Abholung morgen früh' : 'Abholung heute';
      const chips = `<div class="bins">${hero.map((x) => `<span class="chip" style="--b:${x.cfg.color || '#9e9e9e'}"><i></i>${tdcEsc(x.cfg.name)}</span>`).join('')}</div>`;
      return `<div class="row act waste" data-nav="${w.navigate || ''}" style="--c:${color};--stripe:${stripe}"><ha-icon icon="mdi:trash-can-outline"></ha-icon>
        <div class="t"><div class="tt">${title}</div><div class="ts">${sub}</div></div>
        ${w.done_entity ? '<div class="btn" data-act="waste-done"><ha-icon icon="mdi:check"></ha-icon>Erledigt</div>' : ''}${chips}</div>`;
    }
    return `<div class="row" data-nav="${w.navigate || ''}" style="--c:${color}"><ha-icon icon="mdi:trash-can-outline"></ha-icon>
      <div class="t">${names} <small>· ${when}${done ? ' · rausgestellt' : ''}</small>${nextHtml}</div></div>`;
  }

  _eventRows() {
    const c = this._config;
    if (!c.calendars) return [];
    if (this._events === null) return [`<div class="row"><ha-icon icon="mdi:calendar-blank-outline"></ha-icon><div class="t"><small>Termine laden …</small></div></div>`];
    const now = new Date();
    const today0 = new Date(); today0.setHours(0, 0, 0, 0);
    const tom0 = new Date(today0); tom0.setDate(tom0.getDate() + 1);
    const tom1 = new Date(tom0); tom1.setDate(tom1.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (e) => (e.allDay ? 'Ganztägig' : `${pad(e.start.getHours())}:${pad(e.start.getMinutes())}`);
    let list = this._events.filter((e) => e.start < tom0 && e.end > now);
    let label = '';
    if (this._evening()) { list = this._events.filter((e) => (e.start >= tom0 && e.start < tom1) || (e.allDay && e.start < tom1 && e.end > tom0)); }
    else if (!list.length) { list = this._events.filter((e) => e.start >= tom0 && e.start < tom1 || (e.allDay && e.start < tom1 && e.end > tom0)); label = 'Morgen '; }
    const rows = list.slice(0, c.max_events).map((e) => `<div class="row" data-nav="${c.calendar_navigate || ''}" style="--c:${e.color}">
      <span class="dot"></span><div class="t">${tdcEsc(e.title)}</div><div class="m">${label}${fmt(e)}</div></div>`);
    if (!rows.length) return [];
    if (list.length > c.max_events) rows.push(`<div class="row" data-nav="${c.calendar_navigate || ''}"><span class="dot" style="--c:transparent"></span><div class="t"><small>+ ${list.length - c.max_events} weitere</small></div></div>`);
    return rows;
  }

  // Timeline (timeline: true): today's events that are not over, sunset and
  // the start of rain as rows with their time; all-day first, then by time.
  _timelineRows() {
    const c = this._config, h = this._hass, now = new Date();
    const tom0 = new Date(); tom0.setHours(0, 0, 0, 0); tom0.setDate(tom0.getDate() + 1);
    const items = [];
    let todayEvents = 0;
    if (c.calendars && this._events === null) return [`<div class="row"><ha-icon icon="mdi:calendar-blank-outline"></ha-icon><div class="t"><small>Termine laden …</small></div></div>`];
    (this._events || []).filter((e) => e.start < tom0 && e.end > now).forEach((e) => {
      todayEvents += 1;
      const time = e.allDay ? '' : e.start <= now ? 'jetzt' : this._hm(e.start);
      items.push({ allDay: e.allDay, at: e.start, html: `<div class="row tl" data-nav="${c.calendar_navigate || ''}" style="--c:${e.color}"><span class="tm">${time}</span><span class="dot"></span><div class="t">${tdcEsc(e.title)}</div></div>` });
    });
    const sideRow = (at, icon, color, text) => ({ allDay: false, at, html: `<div class="row tl" data-nav="${c.weather_navigate || ''}" style="--c:${color}"><span class="tm">${this._hm(at)}</span><ha-icon icon="${icon}"></ha-icon><div class="t">${text}</div></div>` });
    const set = new Date(h.states['sun.sun']?.attributes?.next_setting);
    if (!isNaN(set) && set > now && set < tom0) items.push(sideRow(set, 'mdi:weather-sunset-down', '#FFB74D', 'Sonnenuntergang'));
    const ws = h.states[c.weather];
    if (!(ws && TDC_WET.includes(ws.state))) {
      const wet = (f) => Number(f.precipitation) >= 0.3 || TDC_WET.includes(f.condition);
      const f = (this._fcHourly || []).find((x) => { const t = new Date(x.datetime); return t > now && t < tom0 && wet(x); });
      if (f) {
        const snow = TDC_SNOW.includes(f.condition);
        items.push(sideRow(new Date(f.datetime), snow ? 'mdi:weather-snowy' : 'mdi:weather-rainy', snow ? '#90CAF9' : '#64B5F6', snow ? 'Schnee ab' : 'Regen ab'));
      }
    }
    items.sort((a, b) => (a.allDay === b.allDay ? a.at - b.at : a.allDay ? -1 : 1));
    const max = c.max_timeline ?? 6;
    const rows = items.slice(0, max).map((x) => x.html);
    if (items.length > max) rows.push(`<div class="row tl"><span class="tm"></span><span class="dot" style="--c:transparent"></span><div class="t"><small>+ ${items.length - max} weitere</small></div></div>`);
    // Nothing left today in the calendars: tomorrow's events as before.
    if (!todayEvents) rows.push(...this._eventRows());
    return rows;
  }

  // outfit: true - between 5 and 9 o'clock what to wear, from today's daily forecast.
  _outfitRow(hour) {
    if (!this._config.outfit || hour < 5 || hour >= 9) return '';
    const o = tdcOutfit(this._fc); if (!o) return '';
    const lo = this._fc.templow != null ? `${tdcDeg(this._fc.templow)} bis ` : 'bis ';
    return `<div class="row" data-nav="${this._config.weather_navigate || ''}" style="--c:#4FC3F7"><ha-icon icon="${o.coat ? 'mdi:coat-rack' : 'mdi:tshirt-crew'}"></ha-icon><div class="t">Anziehen: ${tdcEsc(o.item)} <small>· ${lo}${tdcDeg(this._fc.temperature)}</small></div></div>`;
  }

  _evening() { return new Date().getHours() >= (this._config.evening_from ?? 18); }

  _hm(d) { return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }

  // Appliances: running -> "fertig um HH:MM", finished -> "fertig – ausräumen" until the door opened.
  _applianceRows() {
    const h = this._hass, out = [], run = [], warn = [];
    (this._config.appliances || []).forEach((a) => {
      const st = h.states[a.state]; if (!st) return;
      let s = String(st.state).toLowerCase();
      // power: a smart plug as fallback when the appliance's own integration is offline
      // or lags behind - above power_above watts (default 20) it counts as running.
      const pw = a.power && parseFloat(h.states[a.power]?.state);
      const byPower = Number.isFinite(pw) && pw > (a.power_above ?? 20) && !(a.run || []).includes(s);
      if (byPower) s = (a.run || ['run'])[0];
      if ((a.run || []).includes(s)) {
        let fin = null;
        const ts = !byPower && a.finish && h.states[a.finish];
        if (ts && !isNaN(new Date(ts.state))) fin = new Date(ts.state);
        const rem = !byPower && a.remaining && h.states[a.remaining];
        if (!fin && rem && Number.isFinite(parseFloat(rem.state)) && Date.now() - new Date(rem.last_changed) < 15 * 60000) {
          fin = new Date(new Date(rem.last_changed).getTime() + parseFloat(rem.state) * 3600000);
        }
        const when = fin && fin > new Date() ? ` <small>· fertig um ${this._hm(fin)}</small>` : ' <small>· läuft</small>';
        run.push(`<div class="row" data-nav="${this._navOrMore(a, a.state)}" style="--c:${a.color || '#90a4ae'}"><ha-icon icon="${a.icon || 'mdi:washing-machine'}"></ha-icon><div class="t">${a.name}${when}</div></div>`);
      } else if ((a.done || []).includes(s)) {
        const doneAt = new Date(st.last_changed);
        const door = a.door && h.states[a.door];
        const emptied = door ? new Date(door.last_changed) > doneAt : Date.now() - doneAt > (a.done_hours ?? 2) * 3600000;
        if (!emptied) {
          const row = `<div class="row act" data-nav="${this._navOrMore(a, a.state)}" style="--c:${a.color || '#4CD08A'}"><ha-icon icon="${a.icon || 'mdi:washing-machine'}"></ha-icon><div class="t"><div class="tt">${a.name} ausräumen</div><div class="ts">fertig seit ${this._hm(doneAt)} Uhr</div></div></div>`;
          out.push(row); warn.push(a.name);
        }
      }
    });
    this._applianceWarn = warn;
    this._applianceRun = run;
    return out;
  }

  _visible(x) { return !x.admin_only || this._hass.user?.is_admin; }

  // Tap target: the configured navigate path, otherwise the entity's more-info dialog.
  _navOrMore(x, id) { return x.navigate || (id && x.more_info !== false ? 'more-info:' + (x.more_info || id) : ''); }

  // Hints: one action row per active warning entity, the detail lists what triggered it.
  _hintRows(gn) {
    const h = this._hass;
    return (this._config.hints || []).filter((x) => this._visible(x) && h.states[x.entity]?.state === 'on' && !(x.night_skip && gn && gn.open)).map((x) => {
      const names = (x.detail || []).filter((d) => {
        const st = h.states[d.entity]; if (!st) return false;
        if (d.above != null) return parseFloat(st.state) > d.above;
        const v = String(st.state).toLowerCase();
        if (d.not_states) return !d.not_states.includes(v) && !['unavailable', 'unknown'].includes(v);
        return (d.states || ['on']).includes(String(st.state).toLowerCase());
      }).map((d) => tdcEsc(d.name));
      const list = names.length > 3 ? `${names.slice(0, 2).join(', ')} und ${names.length - 2} weitere` : names.join(', ');
      const sub = names.length ? list : (x.text ? tdcEsc(x.text) : '');
      return `<div class="row act" data-nav="${x.navigate || ''}" style="--c:${x.color || '#FF8A65'}"><ha-icon icon="${x.icon || 'mdi:alert-outline'}"></ha-icon><div class="t"><div class="tt">${tdcEsc(x.title)}</div>${sub ? `<div class="ts">${sub}</div>` : ''}</div></div>`;
    });
  }

  // Status: calm rows for things that are running right now (vacuum, printer, media).
  // kind: 'all' (default), 'calm' (running things only) or 'alerts' (alert rows + updates).
  _statusRows(kind = 'all') {
    const h = this._hass, out = [];
    (this._config.status || []).forEach((x) => {
      if (!this._visible(x)) return;
      // entities: several players, the first active one wins (playing before paused).
      // paused only counts for paused_minutes after the last change, so a sleeping box does not linger.
      // entities: ids or { entity, name } – the name then replaces the row name for that device
      const ids = (x.entities || [x.entity]).map((e) => e.entity || e);
      const names = Object.fromEntries((x.entities || []).filter((e) => e.entity).map((e) => [e.entity, e.name]));
      const want = x.states || [];
      const fresh = (st) => st.state !== 'paused' || x.paused_minutes == null || Date.now() - new Date(st.last_changed) < x.paused_minutes * 60000;
      let st = null;
      if (x.when) { if (h.states[x.when]?.state !== 'on') return; st = h.states[ids[0]]; }
      else {
        const cand = ids.map((id) => h.states[id]).filter((v) => v && want.includes(String(v.state).toLowerCase()) && fresh(v));
        st = cand.find((v) => v.state !== 'paused') || cand[0];
      }
      if (!st) return;
      const s = String(st.state).toLowerCase();
      const alert = (x.alert_states || []).includes(s);
      const a = st.attributes || {};
      let text = (x.attribute && a[x.attribute]) || h.formatEntityState?.(st) || st.state;
      if (x.attribute && a[x.attribute] && s === 'paused') text += ' · pausiert';
      const row = `<div class="row${alert ? ' act' : ''}" data-nav="${this._navOrMore(x, st.entity_id)}" style="--c:${alert ? '#FF6B5E' : (x.color || '#90a4ae')}"><ha-icon icon="${x.icon || 'mdi:information-outline'}"></ha-icon><div class="t">${tdcEsc(names[st.entity_id] || x.name)} <small>· ${tdcEsc(text)}</small></div></div>`;
      if (kind === 'calm' && alert) return;
      if (kind === 'alerts' && !alert) return;
      if (alert) out.unshift(row); else out.push(row);
    });
    const u = this._config.updates;
    if (u && this._visible(u) && kind !== 'calm') {
      const n = Object.keys(h.states).filter((e) => e.startsWith('update.') && h.states[e].state === 'on').length;
      if (n) out.push(`<div class="row" data-nav="${u.navigate || ''}" style="--c:#42A5F5"><ha-icon icon="mdi:package-up"></ha-icon><div class="t">${n === 1 ? '1 Update' : n + ' Updates'} <small>· verfügbar</small></div></div>`);
    }
    return out;
  }

  _bathRow() {
    const b = this._config.bath; if (!b || !b.script) return '';
    const now = new Date(), m = now.getHours() * 60 + now.getMinutes();
    const from = (b.from ?? 18) * 60, until = Math.round((b.until ?? 21.5) * 60);
    if (m < from || m > until) return '';
    const running = this._hass.states[b.script]?.state === 'on';
    const status = b.status ? this._hass.states[b.status]?.state : '';
    const sub = status && !['unknown', 'unavailable'].includes(status) ? `<div class="ts">${tdcEsc(status)}</div>` : '';
    return `<div class="row act" style="--c:#FF7A45"><ha-icon icon="mdi:shower-head"></ha-icon><div class="t"><div class="tt">Bad aufheizen</div>${sub}</div>${running ? '<div class="m">läuft</div>' : '<div class="btn" data-act="bath"><ha-icon icon="mdi:play"></ha-icon>Starten</div>'}</div>`;
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
    return g.windows_label ? this._byLabel(g.windows_label).map((e) => ({ entity: e, name: this._areaName(e) })) : (g.windows || []);
  }
  _gnLights() {
    const g = this._config.goodnight || {};
    return g.lights_label ? this._byLabel(g.lights_label) : (g.lights || []);
  }

  // Night check: open windows and lights on, as action rows. Returns null outside
  // the window; force (view: night) skips the window.
  _goodnight(force = false) {
    const g = this._config.goodnight || (force ? {} : null); if (!g) return null;
    const hr = new Date().getHours(), from = g.from ?? 21, until = g.until ?? 1;
    const inWin = from > until ? (hr >= from || hr < until) : (hr >= from && hr < until);
    if (!inWin && !force) return null;
    const h = this._hass, rows = [];
    const open = this._gnWindows().filter((w) => h.states[w.entity]?.state === 'on').map((w) => tdcEsc(w.name));
    if (open.length) rows.push(`<div class="row act" style="--c:#2EC4B6"><ha-icon icon="mdi:window-open-variant"></ha-icon><div class="t"><div class="tt">${open.length === 1 ? 'Fenster offen' : open.length + ' Fenster offen'}</div><div class="ts">${open.join(', ')}</div></div></div>`);
    const on = this._gnLights().filter((l) => h.states[l]?.state === 'on');
    if (on.length && g.show_lights !== false) {
      const names = on.map((l) => h.states[l].attributes.friendly_name || l);
      rows.push(`<div class="row act" style="--c:#FFB020"><ha-icon icon="mdi:lightbulb-on-outline"></ha-icon><div class="t"><div class="tt">${on.length === 1 ? tdcEsc(names[0]) + ' ist an' : on.length + ' Lampen an'}</div>${on.length > 1 ? `<div class="ts">${tdcEsc(names.slice(0, 3).join(', '))}${on.length > 3 ? ' …' : ''}</div>` : ''}</div><div class="btn" data-act="lights-off"><ha-icon icon="mdi:power"></ha-icon>Aus</div></div>`);
    }
    return { rows, open: open.length, lights: on.length };
  }

  // view: running - only what is running right now (appliances, robots, media).
  _renderRunning() {
    this._applianceRows();
    const rows = [...(this._applianceRun || []), ...this._statusRows('calm')];
    this.style.display = rows.length ? '' : 'none';
    this._root.innerHTML = rows.length ? `<div class="blk"><div class="bt">${tdcEsc(this._config.title || 'Läuft gerade')}</div>${rows.join('')}</div>` : '';
  }

  // view: night - the house before bed: open windows, lights on, waste. Never hidden.
  _renderNight() {
    const gn = this._goodnight(true);
    const rows = [...gn.rows];
    if (!rows.length) rows.push('<div class="row" style="--c:#4CD08A"><ha-icon icon="mdi:check-circle"></ha-icon><div class="t">Alles zu <small>· Fenster zu, Lampen aus</small></div></div>');
    const waste = this._wasteRow(); if (waste) rows.push(waste);
    this.style.display = '';
    this._root.classList.toggle('colorful', this._config.style === 'colorful');
    this._root.innerHTML = `<div class="blk"><div class="bt">${tdcEsc(this._config.title || 'Haus für die Nacht')}</div>${rows.join('')}</div>`;
  }

  _render() {
    if (!this._hass || !this._root) return;
    if (this._config.view === 'running') { this._renderRunning(); return; }
    if (this._config.view === 'night') { this._renderNight(); return; }
    const c = this._config, h = this._hass, now = new Date(), hour = now.getHours();
    const first = c.show_name === false ? '' : (h.user?.name || '').split(' ')[0];
    const greet = hour < 5 ? 'Gute Nacht' : hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend';
    const evening = this._evening();
    // Hero: temperature, condition, high/low.
    let wx = '', wxPill = '';
    const ws = h.states[c.weather];
    if (ws) {
      const night = h.states['sun.sun']?.state === 'below_horizon';
      let [label, icon] = TDC_COND[ws.state] || [ws.state, 'mdi:weather-cloudy'];
      if (night && ws.state === 'sunny') [label, icon] = TDC_COND['clear-night'];
      if (night && ws.state === 'partlycloudy') icon = 'mdi:weather-night-partly-cloudy';
      const fc = evening ? (this._fcList || [])[1] : this._fc;
      const hl = fc && fc.temperature != null ? `${evening ? 'Morgen ' : ''}${tdcDeg(fc.temperature)} / ${tdcDeg(fc.templow)}` : '';
      wxPill = `<div class="wxpill" data-nav="${c.weather_navigate || ''}"><ha-icon icon="${icon}"></ha-icon>${tdcDeg(ws.attributes.temperature)} · ${label}</div>`;
      wx = `<div class="wxrow" data-nav="${c.weather_navigate || ''}"><div class="temp">${tdcDeg(ws.attributes.temperature)}</div>
        <div class="cond"><b><ha-icon icon="${icon}"></ha-icon>${label}</b>${hl ? `<span>${hl}</span>` : ''}</div></div>`;
    }
    // Rows: things to do now, and information for today/tomorrow.
    const acts = [], info = [];
    const gn = this._goodnight();
    if (gn) acts.push(...gn.rows);
    const waste = this._wasteRow();
    if (waste) (this._wasteAct ? acts : info).push(waste);
    acts.push(...this._applianceRows());
    acts.push(...this._hintRows(gn));
    const bath = this._bathRow(); if (bath) acts.push(bath);
    // hide_running: running things live in their own card (view: running); alerts stay here.
    if (c.hide_running) acts.push(...this._statusRows('alerts'));
    else acts.push(...(c.show_running_appliances ? this._applianceRun || [] : []), ...this._statusRows());
    const max = c.max_now ?? 4;
    let nowRows = acts;
    if (acts.length > max + 1) {
      nowRows = this._more ? acts.concat(`<div class="row more" data-act="more"><ha-icon icon="mdi:chevron-up"></ha-icon><div class="t">Weniger</div></div>`)
        : acts.slice(0, max).concat(`<div class="row more" data-act="more"><ha-icon icon="mdi:chevron-down"></ha-icon><div class="t">+ ${acts.length - max} weitere</div></div>`);
    }
    // Timeline (daytime only): after the waste row; evening keeps "Demnächst".
    if (c.timeline && !evening) info.push(...this._timelineRows());
    else info.unshift(...this._eventRows());
    const outfit = this._outfitRow(hour); if (outfit) info.unshift(outfit);
    if (evening) {
      const fc1 = (this._fcList || [])[1];
      if (fc1 && fc1.templow != null && fc1.templow <= 1) info.push(`<div class="row" style="--c:#90caf9"><ha-icon icon="mdi:snowflake"></ha-icon><div class="t">Morgen früh ${tdcDeg(fc1.templow).replace('°', ' °C')} <small>· ${fc1.templow <= 0 ? 'Scheiben kratzen' : 'kalt'}</small></div></div>`);
    }
    const pk = c.packages;
    if (pk && pk.items) {
      const on = pk.items.filter((x) => h.states[x.entity]?.state === 'on').map((x) => x.name);
      if (on.length) info.push(`<div class="row" data-nav="${pk.navigate || ''}" style="--c:#bcaaa4"><ha-icon icon="mdi:package-variant-closed"></ha-icon><div class="t">${on.join(', ')} <small>· kommt heute</small></div></div>`);
    }
    if (pk && pk.entity) {
      const n = parseInt(h.states[pk.entity]?.state, 10);
      if (n > 0) info.push(`<div class="row" data-nav="${pk.navigate || ''}" style="--c:#bcaaa4"><ha-icon icon="mdi:package-variant-closed"></ha-icon><div class="t">${n === 1 ? '1 Paket' : n + ' Pakete'} <small>· unterwegs</small></div></div>`);
    }
    const en = c.energy && (!c.energy.admin_only || h.user?.is_admin) ? c.energy : null;
    let pvSay = '';
    if (en) {
      const late = hour >= 16;
      const kwh = this._num(late ? en.pv_tomorrow : en.pv_today);
      const bat = en.battery ? `<div class="m">Akku ${this._num(en.battery, 0)} %</div>` : '';
      info.push(`<div class="row" data-nav="${en.navigate || ''}" style="--c:#ffd166"><ha-icon icon="mdi:solar-power-variant"></ha-icon><div class="t">PV ${late ? 'morgen' : 'heute'} <small>· ca. ${kwh} kWh</small></div>${bat}</div>`);

    }
    const say = this._sentence({ gn, pvSay, evening });
    // Evening: the rows look ahead (tomorrow and later), so no single day in the title.
    const infoTitle = evening ? 'Demnächst' : (c.title || 'Heute');
    const colorful = c.style === 'colorful';
    this._root.classList.toggle('colorful', colorful);
    const dateTxt = `${TDC_DAYS[now.getDay()]}, ${now.getDate()}. ${TDC_MONTHS[now.getMonth()]}`;
    this._root.innerHTML = `
      <div class="hero">
        ${colorful ? `<div class="top"><div class="date">${dateTxt}</div>${wxPill}</div>` : `<div class="date">${dateTxt}</div>
        ${wx}`}
        <div class="greet">${greet}${first ? ', ' + tdcEsc(first) : ''}</div>
        <div class="say">${tdcEsc(say)}</div>
      </div>
      ${nowRows.length ? `<div class="blk"><div class="bt">Jetzt</div>${nowRows.join('')}</div>` : ''}
      ${info.length ? `<div class="blk"><div class="bt">${infoTitle}</div>${info.join('')}</div>` : ''}`;
  }

  // One sentence for the day, fixed priority: warning > appliance done > waste > next event > night check > PV.
  _sentence({ gn, pvSay, evening }) {
    const c = this._config, h = this._hass;
    const wr = c.warning && h.states[c.warning.entity];
    if (wr && wr.state === 'on') {
      const d = c.warning.detail && h.states[c.warning.detail];
      const head = d && (d.attributes.warning_1_headline || d.attributes.headline);
      // "Amtliche WARNUNG vor STRENGEM FROST" -> "Warnung vor strengem Frost."
      const m = head && /vor\s+(.+)$/i.exec(head);
      let warn = 'Achtung, Wetterwarnung.';
      if (m) { const w = m[1].trim().toLowerCase().split(/\s+/); w[w.length - 1] = w[w.length - 1].charAt(0).toUpperCase() + w[w.length - 1].slice(1); warn = `Warnung vor ${w.join(' ')}.`; }
      else if (head) warn = `Achtung: ${head}.`;
      const rest = this._sentenceRest({ gn, pvSay, evening });
      return rest ? `${warn} ${rest}` : warn;
    }
    return this._sentenceRest({ gn, pvSay, evening }) || (evening ? 'Morgen steht nichts an.' : 'Heute steht nichts an.');
  }

  _sentenceRest({ gn, pvSay, evening }) {
    const done = this._applianceWarn || [];
    if (done.length) return done.length === 1 ? `${done[0]} ist fertig und kann ausgeräumt werden.` : `${done.join(' und ')} sind fertig.`;
    if (this._wasteDue) return this._wasteDue;
    if (gn && gn.open) return gn.open === 1 ? 'Ein Fenster ist noch offen.' : `${gn.open} Fenster sind noch offen.`;
    const ev = this._nextEvent(evening);
    if (ev) return ev;
    if (gn && !gn.lights) return 'Alles zu. Gute Nacht.';
    if (pvSay) return pvSay;
    return '';
  }

  _nextEvent(evening) {
    if (!this._events) return '';
    const now = new Date();
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    const t1 = new Date(t0); t1.setDate(t1.getDate() + 1);
    const t2 = new Date(t1); t2.setDate(t2.getDate() + 1);
    const pick = (a, b) => this._events.find((e) => (e.allDay ? e.start < b && e.end > a : e.start >= a && e.start < b) && e.end > now);
    const today = evening ? null : pick(t0, t1);
    if (today) return today.allDay ? `Heute: ${today.title}.` : `Um ${this._hm(today.start)} Uhr: ${today.title}.`;
    const tom = pick(t1, t2);
    if (tom) return tom.allDay ? `Morgen: ${tom.title}.` : `Morgen um ${this._hm(tom.start)} Uhr: ${tom.title}.`;
    return '';
  }

  _onClick(e) {
    if (e.target.closest('[data-act="more"]')) { this._more = !this._more; this._render(); return; }
    if (e.target.closest('[data-act="waste-done"]')) {
      const id = this._config.waste.done_entity;
      this._hass.callService(id.split('.')[0], 'press', { entity_id: id });
      this.dispatchEvent(new CustomEvent('haptic', { bubbles: true, composed: true, detail: 'success' }));
      return;
    }
    if (e.target.closest('[data-act="lights-off"]')) {
      const on = this._gnLights().filter((l) => this._hass.states[l]?.state === 'on');
      if (on.length) this._hass.callService('light', 'turn_off', { entity_id: on });
      this.dispatchEvent(new CustomEvent('haptic', { bubbles: true, composed: true, detail: 'success' }));
      return;
    }
    if (e.target.closest('[data-act="bath"]')) {
      this._hass.callService('script', 'turn_on', { entity_id: this._config.bath.script });
      this.dispatchEvent(new CustomEvent('haptic', { bubbles: true, composed: true, detail: 'success' }));
      return;
    }
    const el = e.target.closest('[data-nav]');
    const nav = el && el.dataset.nav;
    if (!nav) return;
    if (nav.startsWith('more-info:')) {
      this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: nav.slice(10) } }));
      this.dispatchEvent(new CustomEvent('haptic', { bubbles: true, composed: true, detail: 'light' }));
      return;
    }
    const oldURL = location.href;
    history.pushState(null, '', nav);
    if (nav.startsWith('#')) window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: location.href }));
    else window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
    this.dispatchEvent(new CustomEvent('haptic', { bubbles: true, composed: true, detail: 'light' }));
  }
}





// ---------------------------------------------------------------------
// Visual editor. Greeting, weather, calendars, waste, energy, good night,
// appliances and status are fully editable; the rarer parts (bath,
// packages, hints, warning, updates) stay in the code editor for now.
// ---------------------------------------------------------------------
const CAL_COLORS = Object.keys(TDC_COLORS).map((k) => ({ value: k, label: k }));
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

export class PaneTodayCardEditor extends PaneEditor {
  labels() {
    return {
      view: 'Ansicht', title: 'Titel', max_events: 'Termine höchstens', style: 'Stil', look: 'Look',
      weather: 'Wetter', weather_navigate: 'Wetter antippen öffnet', calendar_navigate: 'Kalender antippen öffnet',
      entity: 'Entität', color: 'Farbe', name: 'Name', short: 'Kurzname', icon: 'Icon', show_within_days: 'Erst zeigen ab (Tage vorher)',
      done_entity: 'Knopf „rausgestellt“', navigate: 'Antippen öffnet', evening_from: 'Abends ab (Uhr)', morning_until: 'Morgens bis (Uhr)',
      pv_today: 'PV-Prognose heute', pv_tomorrow: 'PV-Prognose morgen', battery: 'Akku-Ladestand', admin_only: 'Nur für Admins',
      state: 'Status-Entität', run: 'Läuft bei Status', done: 'Fertig bei Status', finish: 'Ende (Zeitpunkt)', remaining: 'Restzeit',
      power: 'Leistung', power_above: 'Läuft ab (W)', door: 'Tür', done_hours: 'Fertig zeigen (Stunden)', states: 'Zeigen bei Status',
      timeline: 'Zeitleiste', max_timeline: 'Zeitleiste höchstens', max_now: '„Jetzt“ höchstens', outfit: 'Anziehtipp morgens',
      from: 'Ab (Uhr)', until: 'Bis (Uhr)', windows_label: 'Label der Fenster', lights_label: 'Label der Lampen', show_lights: 'Lampen zeigen',
    };
  }

  helpers() {
    return {
      view: 'Heute: Begrüßung, Wetter und Liste. Läuft gerade: nur Geräte und Status. Haus für die Nacht: offene Fenster, Lampen, Müll.',
      timeline: 'Heute mit Uhrzeit: Termine, Sonnenuntergang und Regenbeginn.',
      outfit: 'Zwischen 5 und 9 Uhr ein Tipp aus der Tagesvorhersage.',
      from: 'Nur Ansicht Heute: von wann bis wann geprüft wird (Standard 21 bis 1 Uhr).',
      run: 'Status-Werte, bei denen das Gerät als laufend gilt, z. B. running.',
    };
  }

  _set(path, value) {
    const next = { ...this._config };
    if (path) {
      const v = PaneEditor.clean(value || {});
      if (Object.keys(v).length) next[path] = v; else delete next[path];
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
      key: `${path || ''}.${key}`, title,
      list: {
        items: get, set: put, create, addLabel,
        title: titleOf, subtitle: subtitleOf, icon: () => icon,
        schema: () => schema,
        data: (r) => ({ ...r }),
        merge: (r, v) => PaneEditor.clean({ ...v }),
      },
    };
  }

  sections() {
    const c = this._config || {};
    const running = c.view === 'running', night = c.view === 'night', today = !running && !night;
    const entity = (domain, extra = {}) => ({ entity: { ...(domain ? { domain } : {}), ...extra } });
    const out = [{
      title: 'Ansicht',
      schema: [
        { type: 'grid', name: '', schema: [
          { name: 'view', selector: { select: { mode: 'dropdown', options: [{ value: 'today', label: 'Heute' }, { value: 'running', label: 'Läuft gerade' }, { value: 'night', label: 'Haus für die Nacht' }] } } },
          { name: 'look', selector: { select: { mode: 'dropdown', options: [{ value: 'theme', label: 'Vom Theme' }, { value: 'glass', label: 'Glass' }, { value: 'solid', label: 'Solid' }] } } },
        ] },
        ...(!today ? [{ name: 'title', selector: { text: {} } }] : [
          { type: 'grid', name: '', schema: [
            { name: 'style', selector: { select: { mode: 'dropdown', options: [{ value: 'calm', label: 'Ruhig' }, { value: 'colorful', label: 'Farbig' }] } } },
            { name: 'max_events', selector: { number: { min: 0, max: 10, mode: 'box' } } },
          ] },
          { name: 'timeline', selector: { boolean: {} } },
          { type: 'grid', name: '', schema: [
            { name: 'max_timeline', selector: { number: { min: 1, max: 20, mode: 'box' } } },
            { name: 'max_now', selector: { number: { min: 1, max: 20, mode: 'box' } } },
          ] },
        ]),
      ],
      signature: () => (running ? 'r' : night ? 'n' : 't'),
      data: () => ({ ...c, view: c.view || 'today', look: c.look || 'theme', style: c.style || 'calm', timeline: !!c.timeline }),
      set: (v) => {
        const next = { ...this._config, ...v };
        if (next.view === 'today') delete next.view;
        if (next.look === 'theme') delete next.look;
        if (next.style === 'calm') delete next.style;
        if (next.title === '') delete next.title;
        if (!next.timeline) delete next.timeline;
        ['max_timeline', 'max_now'].forEach((k) => { if (next[k] === '' || next[k] == null) delete next[k]; });
        this.emit(next);
      },
    }];
    const goodnight = {
      title: 'Gute Nacht',
      schema: [
        { type: 'grid', name: '', schema: [
          { name: 'from', selector: { number: { min: 0, max: 23, mode: 'box' } } },
          { name: 'until', selector: { number: { min: 0, max: 23, mode: 'box' } } },
        ] },
        { type: 'grid', name: '', schema: [
          { name: 'windows_label', selector: { label: {} } },
          { name: 'lights_label', selector: { label: {} } },
        ] },
        { name: 'show_lights', selector: { boolean: {} } },
      ],
      data: () => ({ ...obj(c.goodnight), show_lights: obj(c.goodnight).show_lights !== false }),
      set: (v) => this._set('goodnight', { ...v, show_lights: v.show_lights === false ? false : undefined }),
    };
    const wasteSections = () => {
      out.push(this._listSection('entities', 'Müll', 'waste', {
        create: () => ({ entity: '' }), addLabel: '+ Tonne hinzufügen', icon: 'mdi:trash-can-outline',
        titleOf: (r) => r.name || r.entity || 'Neue Tonne', subtitleOf: (r) => r.entity || '',
        schema: [
          { name: 'entity', required: true, selector: entity('sensor') },
          { type: 'grid', name: '', schema: [{ name: 'name', selector: { text: {} } }, { name: 'short', selector: { text: {} } }] },
          { type: 'grid', name: '', schema: [{ name: 'color', selector: { text: {} } }, { name: 'icon', selector: { icon: {} } }] },
          { name: 'show_within_days', selector: { number: { min: 0, max: 30, mode: 'box' } } },
        ],
      }));
      out.push({
        title: '',
        schema: [
          { name: 'done_entity', selector: entity('input_button') },
          { name: 'navigate', selector: { text: {} } },
          { type: 'grid', name: '', schema: [
            { name: 'evening_from', selector: { number: { min: 0, max: 23, mode: 'box' } } },
            { name: 'morning_until', selector: { number: { min: 0, max: 23, mode: 'box' } } },
          ] },
        ],
        data: () => obj(c.waste),
        set: (v) => this._set('waste', { ...obj(this._config.waste), ...v }),
      });
    };
    if (night) { out.push(goodnight); wasteSections(); }
    if (today) {
      out.push({
        title: 'Wetter',
        schema: [
          { name: 'weather', selector: entity('weather') },
          { name: 'weather_navigate', selector: { text: {} } },
          { name: 'outfit', selector: { boolean: {} } },
        ],
        data: () => ({ ...c, outfit: !!c.outfit }),
        set: (v) => {
          const next = PaneEditor.clean({ ...this._config, ...v });
          if (!next.outfit) delete next.outfit;
          this.emit(next);
        },
      });
      out.push(this._listSection('calendars', 'Kalender', null, {
        create: () => ({ entity: '' }), addLabel: '+ Kalender hinzufügen', icon: 'mdi:calendar',
        titleOf: (r) => r.entity || 'Neuer Kalender', subtitleOf: (r) => r.color || '',
        schema: [{ name: 'entity', required: true, selector: entity('calendar') },
          { name: 'color', selector: { select: { mode: 'dropdown', custom_value: true, options: CAL_COLORS } } }],
      }));
      out.push({
        title: '',
        schema: [{ name: 'calendar_navigate', selector: { text: {} } }],
        data: () => c,
        set: (v) => this.emit(PaneEditor.clean({ ...this._config, ...v })),
      });
      wasteSections();
      out.push({
        title: 'Energie',
        schema: [
          { type: 'grid', name: '', schema: [
            { name: 'pv_today', selector: entity('sensor') }, { name: 'pv_tomorrow', selector: entity('sensor') },
          ] },
          { name: 'battery', selector: entity('sensor') },
          { name: 'admin_only', selector: { boolean: {} } },
        ],
        data: () => obj(c.energy),
        set: (v) => this._set('energy', { ...v, admin_only: v.admin_only || undefined }),
      });
      out.push(goodnight);
    }
    if (night) return out;
    out.push(this._listSection('appliances', 'Geräte', null, {
      create: () => ({ name: 'Neues Gerät' }), addLabel: '+ Gerät hinzufügen', icon: 'mdi:washing-machine',
      titleOf: (r) => r.name, subtitleOf: (r) => r.state || '',
      schema: [
        { type: 'grid', name: '', schema: [{ name: 'name', required: true, selector: { text: {} } }, { name: 'icon', selector: { icon: {} } }] },
        { name: 'state', selector: entity() },
        { type: 'grid', name: '', schema: [{ name: 'run', selector: { text: { multiple: true } } }, { name: 'done', selector: { text: { multiple: true } } }] },
        { type: 'grid', name: '', schema: [{ name: 'finish', selector: entity('sensor') }, { name: 'remaining', selector: entity('sensor') }] },
        { type: 'grid', name: '', schema: [{ name: 'power', selector: entity('sensor') }, { name: 'power_above', selector: { number: { min: 0, mode: 'box' } } }] },
        { type: 'grid', name: '', schema: [{ name: 'door', selector: entity('binary_sensor') }, { name: 'done_hours', selector: { number: { min: 0, max: 24, mode: 'box' } } }] },
        { type: 'grid', name: '', schema: [{ name: 'color', selector: { text: {} } }, { name: 'navigate', selector: { text: {} } }] },
      ],
    }));
    out.push(this._listSection('status', 'Status', null, {
      create: () => ({ entity: '' }), addLabel: '+ Status hinzufügen', icon: 'mdi:robot-vacuum',
      titleOf: (r) => r.name || r.entity || 'Neuer Status', subtitleOf: (r) => r.entity || '',
      schema: [
        { name: 'entity', required: true, selector: entity() },
        { type: 'grid', name: '', schema: [{ name: 'name', selector: { text: {} } }, { name: 'icon', selector: { icon: {} } }] },
        { name: 'states', selector: { text: { multiple: true } } },
        { type: 'grid', name: '', schema: [{ name: 'color', selector: { text: {} } }, { name: 'navigate', selector: { text: {} } }] },
      ],
    }));
    out[out.length - 1].hint = 'Bad, Pakete, Hinweise, Warnung und Updates bisher nur im Code-Editor.';
    return out;
  }
}
