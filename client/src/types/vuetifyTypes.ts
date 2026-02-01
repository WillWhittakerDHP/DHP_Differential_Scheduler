
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


