/**
 * Phase B spike: minimal ESLint custom rule for "as any" (type-escape).
 * Reports TSAsExpression when typeAnnotation is TSAnyKeyword.
 * Used only for CUSTOM_RULE_SPIKE.md evaluation; not part of production audit.
 */
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (ruleName) => `https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/${ruleName}.md`
);

export default createRule({
  name: 'audit-as-any',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow type assertion to any (Phase B spike rule)',
    },
    schema: [],
    messages: {
      asAny: 'Type assertion to `any` ({{loc}})',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      TSAsExpression(node) {
        if (node.typeAnnotation?.type === AST_NODE_TYPES.TSAnyKeyword) {
          context.report({
            node: node.typeAnnotation,
            messageId: 'asAny',
            data: {
              loc: `${node.loc?.start?.line ?? 0}:${node.loc?.start?.column ?? 0}`,
            },
          });
        }
      },
    };
  },
});
