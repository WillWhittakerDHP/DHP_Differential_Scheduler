export type FieldsByLayout<FieldKey extends string = string> = {
  inline: FieldKey[]
  stacked: FieldKey[]
  hidden: FieldKey[]
}

export function filterFieldsInConfigOrder<FieldKey extends string>(
  allFields: readonly FieldKey[],
  config: readonly FieldKey[]
): FieldKey[] {
  const fieldSet = new Set(allFields.map(String))
  return config.filter((fieldKey) => fieldSet.has(String(fieldKey)))
}

/**
 * Split a list of fields into inline/stacked/hidden using layout configs.
 * 
 * PATTERN: Fields not in inlineFields or stackedFields are categorized as hidden
 */
export function categorizeFieldsByLayout(
  fields: readonly string[],
  inlineConfig: readonly string[],
  stackedConfig: readonly string[]
): FieldsByLayout {
  const inlineSet = new Set(inlineConfig.map(String))
  const stackedSet = new Set(stackedConfig.map(String))

  const inline = fields.filter((fieldKey) => inlineSet.has(String(fieldKey)))
  const stacked = fields.filter((fieldKey) => stackedSet.has(String(fieldKey)))
  const hidden = fields.filter((fieldKey) => {
    const fieldKeyStr = String(fieldKey)
    return !inlineSet.has(fieldKeyStr) && !stackedSet.has(fieldKeyStr)
  })

  return { inline, stacked, hidden }
}


