/**
 * Default location: DB had a single `default_location_label` before `default_location_address`.
 * Short values (e.g. "Home") are nicknames; long comma/digit lines are usually Places formatted addresses.
 */

export function legacyDbLabelIsProbablyFormattedAddress(label: string): boolean {
  const t = label.trim()
  if (t.length < 10) return false
  if (t.includes(',')) return true
  return /\d/.test(t) && t.length >= 12
}

/** When we have a saved place_id, fetch formatted address if the current text is empty or not a full line. */
export function shouldHydrateAddressFromPlaceId(addressText: string): boolean {
  const t = addressText.trim()
  if (t.length === 0) return true
  return !legacyDbLabelIsProbablyFormattedAddress(t)
}
