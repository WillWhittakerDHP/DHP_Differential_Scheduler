export type FieldsByLayout<FieldKey extends string | number = string> = {
  inline: FieldKey[]
  stacked: FieldKey[]
  hidden: FieldKey[]
}
