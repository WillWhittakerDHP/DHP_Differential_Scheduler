
const _block = ['top', 'bottom'] as const
const _inline = ['start', 'end', 'left', 'right'] as const

type Block = (typeof _block)[number]
type Inline = (typeof _inline)[number]

export type VuetifyAnchor =
  | Block
  | Inline
  | 'center'
  | 'center center'
  | `${Block} ${Inline | 'center'}`
  | `${Inline} ${Block | 'center'}`


