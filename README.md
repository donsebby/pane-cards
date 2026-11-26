# Pane Cards

A family of Home Assistant cards that look like one: the same header, the same
tiles, the same state colours – in **glass** or **solid**, decided by your theme.
Every option is in the visual editor; YAML is only needed for templates.

> Work in progress. First card: **Pane Tile Card**. More (thermostat, weather,
> calendar, shopping list, chart, vacuum) move in one by one.

## Installation

**HACS:** add this repository as a custom repository (category *Dashboard*) and
install *Pane Cards*. The resource is added automatically.

Pair it with the [Pane theme](https://github.com/donsebby/pane-theme) (Pane Glass or
Pane Solid) – or set the variables below in your own theme.

## Pane Tile Card

One card, many rows. Each row is a **switch**, **bar**, **ring** or **number** for
one entity: lights (dim by dragging), switches, sensors, numbers, counters.

```yaml
type: custom:pane-tile-card
title: Living room
icon: mdi:sofa
header_action: all_off   # optional power button in the header
columns: 2               # 1 = list, 2-4 = grid
rows:
  - entity: light.dining_table
    type: bar
  - entity: switch.tv_plug
    power_entity: sensor.tv_plug_power
  - entity: sensor.washer_progress
    type: gauge
    color: ok
```

| Option | Values |
|---|---|
| `title`, `icon`, `icon_color` | header; `icon_color` like `color` below |
| `subtitle` | empty: automatic (“3 of 6 on”), `none`, text or template |
| `header_action` | `all_off` – turns off every light and switch of the card |
| `columns` | `1` (list) to `4` |
| `look` | `glass` or `solid`; without it the theme decides |
| `frame` | default: own panel, none inside a pop-up; `true` always, `false` never |
| `glow` | `false` – calmer, no glow on active tiles |
| `stat_size` | `large` – bigger numbers |

Per row: `entity`, `type` (`toggle`, `bar`, `gauge`, `stat`), `name`, `icon`,
`color`, `min`, `max`, `hide_track`, `power_entity`, `state_text`, `progress`,
`value`, `line`, `tap_action`, `hold_action`.

**Colours** mean state: `warm` (light, sun), `heat`, `accent`, `ok`, `alert`, any
Home Assistant colour name (`red`, `amber` …) or a CSS colour. Without one, lights
show their own colour and everything else the accent.

**Templates:** `name`, `icon`, `color`, `state_text`, `progress`, `value` and the
header fields accept `[[[ return … ]]]` with `states`, `hass`, `entity` and `fmt`
(formatted state) in scope.

Configs of the *Liquid Glass Tile Card v2* work unchanged (`type:
custom:liquid-glass-tile-card-v2` is accepted as long as the old card is not
installed).

## Theme variables

| Variable | Meaning |
|---|---|
| `pane-look` | `glass` or `solid` |
| `pane-glass` / `pane-surface` | card background in glass / solid |
| `pane-border`, `pane-blur`, `pane-backdrop`, `pane-radius`, `pane-tile` | edge, blur, corners, tiles |
| `pane-warm`, `pane-heat`, `pane-accent`, `pane-ok`, `pane-alert` | the five state colours |

## Changelog

### 0.1.1
- No panel of its own inside a pop-up (`frame` now defaults to automatic).

### 0.1.0
- First version: shared core (look from the theme, header, templates, actions,
  visual editor building blocks) and the Pane Tile Card.
