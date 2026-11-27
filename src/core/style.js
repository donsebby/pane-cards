// Shared look of the Pane family. Cards add their own content styles after
// this sheet. Everything visual comes from theme variables with fallbacks,
// so a theme (Pane Glass, Pane Solid or your own) restyles every card at once:
//
//   pane-look        glass | solid          (lg-look is read as well)
//   pane-surface     card background (solid look)
//   pane-glass       card background (glass look)
//   pane-border      thin edge
//   pane-blur        blur behind glass, e.g. 22px
//   pane-backdrop    full backdrop-filter, wins over pane-blur
//   pane-radius      card corner radius (lg-radius is read as well)
//   pane-tile        tile background
//   pane-tile-edge / pane-tile-shadow / pane-tile-backdrop
//                    border, shadow and backdrop of solid tiles (glass solid tiles)
//   pane-warm / pane-heat / pane-accent / pane-ok / pane-alert   state colours

export const INK = 'var(--primary-text-color, #fff)';

export const BASE_STYLE = `
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
