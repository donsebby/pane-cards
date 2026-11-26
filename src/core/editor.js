// Building blocks for the visual editors. Every Pane card edits everything
// through Home Assistant's own form elements (ha-form with selectors), so
// pickers, icon search, action editors and colour lists look and behave
// exactly like in Home Assistant's built-in cards - no YAML needed.

let formsReady = null;

// ha-form is only loaded once some built-in editor needed it. Loading the
// entities card's editor once pulls it in.
export function ensureForms() {
  if (customElements.get('ha-form')) return Promise.resolve();
  if (!formsReady) {
    formsReady = (async () => {
      try {
        const helpers = await window.loadCardHelpers?.();
        const card = await helpers?.createCardElement({ type: 'entities', entities: [] });
        await card?.constructor?.getConfigElement?.();
      } catch (e) { /* the form below shows a hint instead */ }
    })();
  }
  return formsReady;
}

const EDITOR_STYLE = `
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

// Base class of a card editor. Subclasses describe their sections with
// sections() and get the form wiring, list editing and config-changed
// events from here.
export class PaneEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._forms) this._forms.forEach((f) => { f.hass = hass; });
  }

  connectedCallback() {
    ensureForms().then(() => this._render());
  }

  // Subclasses: [{ title, schema, data(), set(value) } | { title, list }]
  sections() { return []; }

  labels() { return {}; }

  helpers() { return {}; }

  emit(config) {
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  // Drops empty values so a config saved from the editor stays as short as
  // a hand-written one.
  static clean(obj) {
    const out = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === '' || v == null) return;
      if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return;
      out[k] = v;
    });
    return out;
  }

  _form(schema, data, onChange) {
    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.schema = schema;
    form.data = data;
    const labels = this.labels();
    const helpers = this.helpers();
    form.computeLabel = (s) => labels[s.name] ?? s.label ?? s.name;
    form.computeHelper = (s) => helpers[s.name];
    form.addEventListener('value-changed', (e) => {
      e.stopPropagation();
      onChange(e.detail.value);
    });
    this._forms.push(form);
    return form;
  }

  _render() {
    if (!this._config || !this.isConnected) return;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    // Re-render only when the structure changes (another list length,
    // another open item, another row type); value changes go straight to
    // the existing forms so focus and pickers keep their state.
    const sig = JSON.stringify(this.sections().map((s) => (s.list ? [s.list.items().length, this._open?.[s.key], s.list.items().map((it) => s.list.signature?.(it))] : s.signature?.() ?? 0)));
    if (this._sig === sig && this._forms?.length) {
      this._patch();
      return;
    }
    this._sig = sig;
    this._forms = [];
    this._formSetters = [];
    const root = this.shadowRoot;
    root.innerHTML = `<style>${EDITOR_STYLE}</style>`;
    if (!customElements.get('ha-form')) {
      const p = document.createElement('div');
      p.className = 'hint';
      p.textContent = 'Der visuelle Editor lädt noch … falls er nicht erscheint, bitte den Code-Editor verwenden.';
      root.appendChild(p);
      return;
    }
    this._open = this._open || {};
    this.sections().forEach((sec) => {
      const el = document.createElement('div');
      el.className = 'sec';
      if (sec.title) {
        const t = document.createElement('div');
        t.className = 'sec-title';
        t.textContent = sec.title;
        el.appendChild(t);
      }
      if (sec.list) el.appendChild(this._list(sec));
      else {
        const form = this._form(sec.schema, sec.data(), (v) => sec.set(v));
        this._formSetters.push(() => { form.schema = sec.schema; form.data = sec.data(); });
        el.appendChild(form);
      }
      if (sec.hint) {
        const h = document.createElement('div');
        h.className = 'hint';
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
    this._forms.forEach((f) => { f.hass = this._hass; });
  }

  // A list of items (rows, tiles, entities ...): header line per item with
  // move, delete and expand; the open item shows its own form.
  _list(sec) {
    const L = sec.list;
    const wrap = document.createElement('div');
    const items = document.createElement('div');
    items.className = 'items';
    const all = L.items();
    all.forEach((item, idx) => {
      const open = this._open[sec.key] === idx;
      const box = document.createElement('div');
      box.className = `item${open ? ' open' : ''}`;
      const hd = document.createElement('div');
      hd.className = 'item-hd';
      hd.innerHTML = `<ha-icon class="lead"></ha-icon><div class="item-title"></div>
        <button class="ib" data-a="up" type="button" title="Nach oben"><ha-icon icon="mdi:arrow-up"></ha-icon></button>
        <button class="ib" data-a="down" type="button" title="Nach unten"><ha-icon icon="mdi:arrow-down"></ha-icon></button>
        <button class="ib" data-a="del" type="button" title="Entfernen"><ha-icon icon="mdi:delete-outline"></ha-icon></button>
        <button class="ib" data-a="open" type="button" title="Bearbeiten"><ha-icon icon="${open ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon></button>`;
      hd.querySelector('.lead').setAttribute('icon', L.icon?.(item, this._hass) || 'mdi:drag');
      const title = hd.querySelector('.item-title');
      title.textContent = L.title(item, this._hass) || `#${idx + 1}`;
      const sub = L.subtitle?.(item, this._hass);
      if (sub) { const s = document.createElement('small'); s.textContent = sub; title.appendChild(s); }
      hd.querySelector('[data-a="up"]').disabled = idx === 0;
      hd.querySelector('[data-a="down"]').disabled = idx === all.length - 1;
      hd.addEventListener('click', (e) => {
        const a = e.target.closest('button')?.dataset.a || 'open';
        e.stopPropagation();
        if (a === 'open') {
          this._open[sec.key] = open ? null : idx;
          this._sig = null;
          this._render();
        } else if (a === 'up' || a === 'down') {
          const j = a === 'up' ? idx - 1 : idx + 1;
          const next = [...all];
          [next[idx], next[j]] = [next[j], next[idx]];
          if (this._open[sec.key] === idx) this._open[sec.key] = j;
          L.set(next);
        } else if (a === 'del') {
          if (this._open[sec.key] === idx) this._open[sec.key] = null;
          L.set(all.filter((_, k) => k !== idx));
        }
      });
      box.appendChild(hd);
      if (open) {
        const body = document.createElement('div');
        body.className = 'item-body';
        const form = this._form(L.schema(item), L.data(item), (v) => {
          const cur = L.items();
          const next = cur.map((it, k) => (k === idx ? L.merge(it, v) : it));
          L.set(next);
        });
        this._formSetters.push((it) => { form.schema = L.schema(it); form.data = L.data(it); });
        body.appendChild(form);
        box.appendChild(body);
      }
      items.appendChild(box);
    });
    wrap.appendChild(items);
    const add = document.createElement('button');
    add.className = 'add';
    add.type = 'button';
    add.textContent = L.addLabel || '+ Hinzufügen';
    add.addEventListener('click', () => {
      const next = [...L.items(), L.create()];
      this._open[sec.key] = next.length - 1;
      L.set(next);
    });
    wrap.appendChild(add);
    return wrap;
  }
}
