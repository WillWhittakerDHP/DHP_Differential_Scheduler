import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'

export function isFormContextReadyForFieldContexts(form: FormContext | undefined): boolean {
  if (!form) {
    return false
  }
  return form.values !== undefined && form.values !== null && typeof form.values === 'object'
}

export function metadataReadyFromProvided(
  metadata: Record<string, FieldMetadataEntry> | undefined,
  hasProvidedMetadataRef: boolean
): boolean {
  const hasMetadata = !!metadata && Object.keys(metadata).length > 0
  return hasMetadata || hasProvidedMetadataRef
}

export function combineUniqueFieldKeys<GE extends GlobalEntityKey>(
  baseKeys: GlobalFieldKey<GE>[],
  metadataKeys: string[]
): GlobalFieldKey<GE>[] {
  return Array.from(new Set([...baseKeys, ...metadataKeys])) as GlobalFieldKey<GE>[]
}
