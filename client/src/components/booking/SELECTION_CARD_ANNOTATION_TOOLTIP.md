# Selection card annotation tooltip (Vuetify 4)

## What this is

`CARD_TOOLTIP` annotation copy is shown with **`VTooltip`** after a configurable **`openDelay`** (`wizard_settings.selection_card_tooltip_open_delay_ms`, default 3000 ms in `useSelectionCardAnnotationTooltipOpenDelayMs`).

## Best-practice layout (Vuetify overlay activator)

Vuetify wires **`mouseenter` / `mouseleave`** on the **activator node** you pass from `#activator` (`useActivator` in Vuetify’s `VOverlay`). That node must be the **same box the user perceives as “the card”** (including padding and border). If the painted card is a **`VLabel`** (or `VCard`) but the activator is only an **inner** child, hover can hit **padding on the outer component** (CSS `:hover` still fires) **without** hitting the activator — the tooltip timer never runs or resets unpredictably.

**Recommended pattern:**

1. **`VTooltip` wraps the card root**, not the reverse.
2. Activator is **one** block element (`div` or the surface component) with:
   - `v-bind="tooltipActivatorProps"` from the `#activator` slot **first**
   - then **`:class` / `:style`** for the same classes you use for the non-tooltip card (border, padding, `minHeight`, flex layout).
3. Avoid **`mergeProps(tipProps, …)` on `VLabel`** unless you fully understand class/style merge order; prefer **explicit** `v-bind` + `:class` + `:style`.

## Simpler alternatives (when to consider)

- **`v-tooltip` directive** (Vuetify): `useDirectiveComponent(VTooltip, …)` mounts a tooltip into the host element; it is best for **simple text** on **stable** hosts. Selection cards are structurally heavy, so the **slot activator** pattern stays the default here.
- **Native `title`**: no delay control; not suitable for the 3s business rule.

## Troubleshooting

### Tooltip only on the first card (or one service)

`VTooltip` is mounted only when **`cardTooltip`** resolves to non-empty text (`canWrapSelectionTooltip` in `SelectionCard.vue`; **`custom`** selection component is excluded). Copy comes from **`buildBookingBlockAnnotationUi(blockInstanceId, …)`** — annotation **assignments are per block instance**. If only one service instance has a `CARD_TOOLTIP` annotation (or the only matching row is for the current user-type context), **only that card** will show a tooltip. This is data/configuration, not a single shared “first card” bug.

To show tooltips on more cards, add **annotation instances** with shape `ui_slot = cardTooltip` and **edges** linking them to each relevant **block instance** (or extend the transformer with a documented shape-level fallback — not implemented by default).

### Delay feels like 5 seconds instead of 3

The open delay is **`wizard_settings.selection_card_tooltip_open_delay_ms`** when set; otherwise **`DEFAULT_SELECTION_CARD_TOOLTIP_OPEN_DELAY_MS` (3000)**. A stored value of **5000** produces a **5 s** wait. Check **Admin → Business Controls → Wizard → Selection card tooltip delay**. Values are parsed with `parseSelectionCardTooltipOpenDelayMs` (supports numeric strings from APIs).

## References

- Vuetify 4 `VTooltip` / `VOverlay` — activator props, `openDelay`, `openOnHover` (defaults in `client/node_modules/vuetify/lib/components/VTooltip/VTooltip.js`).
- Project defaults: `client/src/plugins/5.vuetify/defaults.ts` (`VTooltip`).
