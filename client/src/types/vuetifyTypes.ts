/**
 * Vuetify Types (local mirror)
 *
 * WHY: Some Vuetify internal deep-import paths are blocked by package `exports`, which prevents
 *      TypeScript from importing types like `Anchor` from `vuetify/lib/...` directly (TS2307).
 *      We mirror the relevant type definitions here to keep our components strongly typed without
 *      relying on forbidden deep imports.
 *
 * SOURCE: Mirrors Vuetify's `Anchor` type shape.
 */

const block = ['top', 'bottom'] as const
const inline = ['start', 'end', 'left', 'right'] as const

type Block = (typeof block)[number]
type Inline = (typeof inline)[number]

export type VuetifyAnchor =
  | Block
  | Inline
  | 'center'
  | 'center center'
  | `${Block} ${Inline | 'center'}`
  | `${Inline} ${Block | 'center'}`


