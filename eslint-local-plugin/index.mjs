/**
 * Local ESLint rules for Differential_Scheduler (client + server).
 * WHY: Policy requires explicit project logger calls in catch blocks — not empty blocks or comment-only placeholders.
 */

const SEVERITY_METHODS = new Set(['warn', 'error', 'info', 'debug'])

/** Server: these helpers log inside (see routerErrorHandler). */
const DELEGATE_ERROR_HANDLERS = new Set([
  'handleRouteError',
  'handleGeneralError',
  'handleSequelizeValidationError',
])

/**
 * @param {import('estree').Expression | import('estree').Super} callee
 * @returns {string | null}
 */
function getCalleeRootName(callee) {
  if (callee.type === 'Identifier') {
    return callee.name
  }
  if (callee.type === 'MemberExpression' && !callee.optional) {
    if (callee.property.type === 'Identifier') {
      return callee.property.name
    }
    if (callee.property.type === 'Literal' && typeof callee.property.value === 'string') {
      return callee.property.value
    }
  }
  return null
}

/**
 * @param {import('estree').MemberExpression} callee
 * @returns {boolean}
 */
function isLoggerSeverityCall(callee) {
  if (callee.type !== 'MemberExpression' || callee.optional === true) {
    return false
  }
  const prop = callee.property
  const name =
    prop.type === 'Identifier'
      ? prop.name
      : prop.type === 'Literal' && typeof prop.value === 'string'
        ? prop.value
        : null
  if (name === null || !SEVERITY_METHODS.has(name)) {
    return false
  }
  const obj = callee.object
  if (obj.type === 'Identifier' && obj.name === 'logger') {
    return true
  }
  if (
    obj.type === 'MemberExpression' &&
    !obj.optional &&
    obj.property.type === 'Identifier' &&
    obj.property.name === 'logger'
  ) {
    return true
  }
  return false
}

/**
 * @param {import('estree').Node} node
 * @returns {boolean}
 */
function containsExplicitCatchHandling(node) {
  if (!node || typeof node !== 'object') {
    return false
  }
  if (node.type === 'CallExpression') {
    const name = getCalleeRootName(node.callee)
    if (name !== null && DELEGATE_ERROR_HANDLERS.has(name)) {
      return true
    }
    if (isLoggerSeverityCall(node.callee)) {
      return true
    }
  }
  for (const key of Object.keys(node)) {
    if (key === 'parent') {
      continue
    }
    const val = node[key]
    if (Array.isArray(val)) {
      for (const item of val) {
        if (containsExplicitCatchHandling(item)) {
          return true
        }
      }
    } else if (val && typeof val === 'object' && typeof val.type === 'string') {
      if (containsExplicitCatchHandling(val)) {
        return true
      }
    }
  }
  return false
}

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'eslint-plugin-scheduler-local',
    version: '1.0.0',
  },
  rules: {
    'require-logger-in-catch': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Require a project logger call (logger.warn/error/info/debug) inside every catch block.',
        },
        schema: [],
        messages: {
          missingLogger:
            'Catch blocks must log or delegate explicitly: call logger.warn/error/info/debug (from createLogger), or on the server call handleRouteError / handleGeneralError / handleSequelizeValidationError. Comments-only or empty catches are not sufficient.',
        },
      },
      create(context) {
        return {
          CatchClause(node) {
            if (!containsExplicitCatchHandling(node.body)) {
              context.report({
                node: node.body,
                messageId: 'missingLogger',
              })
            }
          },
        }
      },
    },
  },
}

export default plugin
