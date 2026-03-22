/**
 * Re-export shared resolver so invite code keeps the same import path.
 */
export {
  resolveTemplate,
  resolveEventTemplates,
  extractTemplateVariables,
  type TemplateResolverOptions,
} from '@shared/utils/eventTemplateResolver.js'
