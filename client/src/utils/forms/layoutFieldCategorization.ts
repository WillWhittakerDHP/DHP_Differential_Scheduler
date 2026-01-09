export type FieldsByLayout<FieldKey extends string = string> = {
  inline: FieldKey[]
  stacked: FieldKey[]
  hidden: FieldKey[]
}

/**
 * Keep only fields that are present in `allFields`, in the order they appear in `config`.
 *
 * LEARNING: Pure helper for stable layout ordering.
 * WHY: Inline/stacked configs define both inclusion and order.
 */
export function filterFieldsInConfigOrder<FieldKey extends string>(
  allFields: readonly FieldKey[],
  config: readonly FieldKey[]
): FieldKey[] {
  const fieldSet = new Set(allFields.map(String))
  // NOTE: keep the output typed as FieldKey while using string normalization for matching.
  return config.filter((fieldKey) => fieldSet.has(String(fieldKey)))
}

/**
 * Split a list of fields into inline/stacked/hidden using layout configs.
 * 
 * LEARNING: Changed from inline/stacked/regular to inline/stacked/hidden
 * WHY: Fields not explicitly in inlineFields or stackedFields should be treated as hidden (via omitFields)
 *      No implicit "regular" category - all fields must be explicitly categorized
 * PATTERN: Fields not in inlineFields or stackedFields are categorized as hidden
 */
export function categorizeFieldsByLayout(
  fields: readonly string[],
  inlineConfig: readonly string[],
  stackedConfig: readonly string[],
  omitFieldsConfig?: readonly string[]
): FieldsByLayout {
  const inlineSet = new Set(inlineConfig.map(String))
  const stackedSet = new Set(stackedConfig.map(String))
  // omitFieldsConfig is available for filtering if needed in future
  void omitFieldsConfig

  const inline = fields.filter((fieldKey) => inlineSet.has(String(fieldKey)))
  const stacked = fields.filter((fieldKey) => stackedSet.has(String(fieldKey)))
  // Fields not in inlineFields or stackedFields are categorized as hidden
  // These should already be filtered out via omitFields, but we categorize them here for clarity
  const hidden = fields.filter((fieldKey) => {
    const fieldKeyStr = String(fieldKey)
    return !inlineSet.has(fieldKeyStr) && !stackedSet.has(fieldKeyStr)
  })

  return { inline, stacked, hidden }
}


