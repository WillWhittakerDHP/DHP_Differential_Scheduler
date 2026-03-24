/**
 * Magic-link flow re-exports (file-cohesion).
 */
export {
  createMagicLinkStrategy,
  issueMagicLinkForEmail,
  magicLinkStrategy,
} from './strategies/magicLinkStrategy.js'
export { redactMagicLinkBodyForLogs, sendMagicLinkDelivery } from './magicLinkDelivery.js'
export {
  buildMagicLinkVerifyUrl,
  magicLinkRequestBodySchema,
  submitMagicLinkRequest,
} from './magicLinkRequest.js'
