# Pane Cards

A family of Home Assistant cards that look like one: the same header, the same
tiles, the same state colours – in **glass** or **solid**, decided by your theme.
Every option is in the visual editor; YAML is only needed for templates.

![Pane Today, Pane Rooms and Pane Tile Card in glass (left) and solid (right)](images/preview.jpg)

> Work in progress. In the pack so far: **Pane Tile Card**, **Pane Today Card** and
> **Pane Rooms Card**. More (thermostat, weather, calendar, shopping list, chart,
> vacuum) move in one by one. Today and Rooms show German texts for now.

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

## Pane Today Card

The start of the day in one card: date, weather, a short sentence about what
matters now, then calendar events, waste pickup, PV forecast, running appliances
and status rows. `view: running` shows only what is running right now.

```yaml
type: custom:pane-today-card
weather: weather.home
calendars:
  - entity: calendar.family
    color: '#64B5F6'
waste:
  entities:
    - entity: sensor.waste_paper   # attributes: YYYY-MM-DD pickup dates
      name: Paper
      color: '#4a90e2'
energy:
  pv_today: sensor.pv_today
  pv_tomorrow: sensor.pv_tomorrow
  battery: sensor.battery
```

Most options are in the visual editor; good-night checks, bathroom, parcels,
notices, warnings and updates are YAML only for now.

## Pane Rooms Card

One tile per room with temperature, what the heating does, open windows and
playing media, plus a row with all lights that are on and an *all off* button.

```yaml
type: custom:pane-rooms-card
title: Home
tiles: true
lights_label: lights        # lights with this label count per area
rooms:
  - name: Living room
    area: living_room
    climate: climate.living_room
    media: [media_player.living_room]
  - name: Bedroom
    area: bedroom
    climate: climate.bedroom
    windows: [binary_sensor.bedroom_window]
```

Configs of *today-glass-card* and *home-glass-card* work unchanged (the old type
names are accepted as long as the old cards are not installed).

## Theme variables

| Variable | Meaning |
|---|---|
| `pane-look` | `glass` or `solid` |
| `pane-glass` / `pane-surface` | card background in glass / solid |
| `pane-border`, `pane-blur`, `pane-backdrop`, `pane-radius`, `pane-tile` | edge, blur, corners, tiles |
| `pane-warm`, `pane-heat`, `pane-accent`, `pane-ok`, `pane-alert` | the five state colours |

## Changelog

### 0.2.0
- New: Pane Today Card (successor of today-glass-card) and Pane Rooms Card (successor of home-glass-card), both with glass and solid look and a visual editor.

### 0.1.1
- No panel of its own inside a pop-up (`frame` now defaults to automatic).

### 0.1.0
- First version: shared core (look from the theme, header, templates, actions,
  visual editor building blocks) and the Pane Tile Card.
