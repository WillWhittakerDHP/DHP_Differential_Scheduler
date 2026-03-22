/**
 * WHY: Immediate client-side preview using the same example strings documented for each variable.
 */
import { EVENT_TEMPLATE_VARIABLES } from '../constants/templateVariables.js'

export function buildSampleInviteContextFromTemplateVariables(): Record<string, string> {
  return EVENT_TEMPLATE_VARIABLES.reduce<Record<string, string>>((acc, v) => {
    acc[v.name] = v.example
    return acc
  }, {})
}
