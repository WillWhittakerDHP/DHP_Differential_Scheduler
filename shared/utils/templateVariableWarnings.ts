/**
 * WHY: Flag unknown `{tokens}` using the same rules as template extraction (single source: EVENT_TEMPLATE_VARIABLES).
 */
import { EVENT_TEMPLATE_VARIABLES } from '../constants/templateVariables.js'
import { extractTemplateVariables } from './eventTemplateResolver.js'

const KNOWN = new Set<string>(EVENT_TEMPLATE_VARIABLES.map((v) => v.name))

export function findUnknownVariablesInTemplate(template: string | null | undefined): string[] {
  if (!template) return []
  return extractTemplateVariables(template).filter((v) => !KNOWN.has(v))
}

export function templateFieldUnknownWarnings(template: string | null | undefined): string[] {
  const unknown = findUnknownVariablesInTemplate(template)
  return unknown.length > 0
    ? [`Unknown variable(s): ${unknown.map((x) => `{${x}}`).join(', ')}`]
    : []
}
