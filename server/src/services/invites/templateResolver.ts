
import { createLogger } from '../../utils/logger.js'

const logger = createLogger('TemplateResolver')

/** Regex matches `{variableName}` — word characters only (letters, digits, underscores). */
const TEMPLATE_VAR_PATTERN = /\{(\w+)\}/g

export interface TemplateResolverOptions {
  /** When true, unresolved placeholders are removed. When false (default), they stay as `{varName}`. */
  stripUnresolved?: boolean
  /** Named placeholders are removed (replaced with empty string) regardless of context value. */
  stripPlaceholderNames?: ReadonlySet<string>
}

export function resolveTemplate(
  template: string | null | undefined,
  context: Record<string, string>,
  options: TemplateResolverOptions = {}
): string {
  if (!template) return ''

  const { stripUnresolved = false, stripPlaceholderNames } = options

  return template.replace(TEMPLATE_VAR_PATTERN, (match, variableName: string) => {
    if (stripPlaceholderNames?.has(variableName)) {
      logger.debug(`Template variable {${variableName}} stripped per stripPlaceholderNames`)
      return ''
    }

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
