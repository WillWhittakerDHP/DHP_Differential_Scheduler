/**
 * Template Variable Resolver
 *
 * Resolves `{variable}` placeholders in EventInstance template strings
 * using a context object built from appointment/property/user data.
 *
 *
 * Usage:
 *   resolveTemplate("{service} at {streetAddress}", { service: "Buyer's Inspection", streetAddress: "123 Main St" })
 *   // → "Buyer's Inspection at 123 Main St"
 */

import { createLogger } from '../../utils/logger.js'

const logger = createLogger('TemplateResolver')

/** Regex matches `{variableName}` — word characters only (letters, digits, underscores). */
const TEMPLATE_VAR_PATTERN = /\{(\w+)\}/g

export interface TemplateResolverOptions {
  /** When true, unresolved placeholders are removed. When false (default), they stay as `{varName}`. */
  stripUnresolved?: boolean
}

/**
 * Resolve a single template string against a context object.
 *
 * @returns The resolved string, or the original template if it is null/empty.
 */
export function resolveTemplate(
  template: string | null | undefined,
  context: Record<string, string>,
  options: TemplateResolverOptions = {}
): string {
  if (!template) return ''

  const { stripUnresolved = false } = options

  return template.replace(TEMPLATE_VAR_PATTERN, (match, variableName: string) => {
    const value = context[variableName]

    if (value !== undefined && value !== null && value !== '') {
      return value
    }

    if (stripUnresolved) {
      logger.debug(`Template variable {${variableName}} not found in context — stripped`)
      return ''
    }

    logger.debug(`Template variable {${variableName}} not found in context — kept as placeholder`)
    return match
  })
}

/**
 * Resolve all three EventInstance template fields (title, description, location)
 * in a single call.
 *
 * @returns An object with `summary`, `description`, and `location` ready for CreateEventParams.
 */
export function resolveEventTemplates(
  templates: {
    titleTemplate: string | null
    descriptionTemplate: string | null
    locationTemplate: string | null
  },
  context: Record<string, string>,
  options: TemplateResolverOptions = {}
): { summary: string; description: string; location: string } {
  return {
    summary: resolveTemplate(templates.titleTemplate, context, options),
    description: resolveTemplate(templates.descriptionTemplate, context, options),
    location: resolveTemplate(templates.locationTemplate, context, options),
  }
}

/**
 * List all `{variable}` placeholders found in a template string.
 * Useful for admin UI previews and documentation.
 */
export function extractTemplateVariables(template: string | null | undefined): string[] {
  if (!template) return []

  const variables: string[] = []
  let match: RegExpExecArray | null
  const regex = new RegExp(TEMPLATE_VAR_PATTERN.source, 'g')

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}
