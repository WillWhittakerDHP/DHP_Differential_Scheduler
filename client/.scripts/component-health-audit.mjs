#!/usr/bin/env node
/* eslint-disable security/detect-non-literal-regexp */
/**
 * Component Health Audit
 *
 * Measures structural quality of Vue components: prop APIs, template complexity,
 * coupling, and parent-child composition patterns. Answers "is this component well-composed?"
 *
 * 10 rules: 4 script regex + 4 template regex + 2 cross-file.
 * No new dependencies — template analysis uses regex + lightweight stack-based tracking.
 *
 * Output:
 * - client/.audit-reports/component-health-audit.json
 * - client/.audit-reports/component-health-audit.md
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
  getAuditReportHeaderLines,
  listAuditFiles,
  resolveAuditPaths,
  writeAuditReports,
  toRepoPath as toRepoPathUtil,
  parseChangedOnlyFlag,
  loadCentralAllowlist,
  isMatchAllowed,
  parseInlineExceptions,
  CONFIDENCE_LEVELS,
} from './shared-audit-utils.mjs'
import { extractVueScriptWithLineOffset } from './shared-ast-facade.mjs'
import { extractVueTemplateSectionWithOffset } from './shared-ast-facade.mjs'

const AUDIT_TYPE = 'component-health'

const RULE_META = [
  { ruleId: 'excessive-prop-count', label: 'Excessive Prop Count', severity: 'P1', weight: 2, description: 'Component accepts too many props; consider decomposition or a config/options object.', recommendedFix: 'Group related props into a single config object or extract sub-components.' },
  { ruleId: 'excessive-emit-count', label: 'Excessive Emit Count', severity: 'P2', weight: 1, description: 'Component declares too many events; consider grouping or provide/inject.', recommendedFix: 'Group related events or use provide/inject for deep communication.' },
  { ruleId: 'component-coupling', label: 'Component Coupling', severity: 'P1', weight: 2, description: 'Component imports many sibling components; high coupling surface.', recommendedFix: 'Extract sub-compositions or use slots to reduce direct imports.' },
  { ruleId: 'emit-relay', label: 'Event Relay', severity: 'info', weight: 0, description: 'Component relays child events to parent unchanged.', recommendedFix: 'Consider provide/inject or direct composable access instead of passthrough events.' },
  { ruleId: 'template-directive-depth', label: 'Template Directive Depth', severity: 'P1', weight: 2, description: 'Template has deeply nested v-if/v-for directives.', recommendedFix: 'Extract nested conditional/iteration blocks into sub-components or computed properties.' },
  { ruleId: 'oversized-template', label: 'Oversized Template', severity: 'P2', weight: 1, description: 'Template section exceeds 200 lines.', recommendedFix: 'Extract logical sections into sub-components.' },
  { ruleId: 'complex-template-expression', label: 'Complex Template Expression', severity: 'P2', weight: 1, description: 'Template expression exceeds 80 characters.', recommendedFix: 'Extract to a computed property or method.' },
  { ruleId: 'deep-slot-wrapper', label: 'Deep Slot Wrapper', severity: 'info', weight: 0, description: 'Named slot buried in deep nesting.', recommendedFix: 'Flatten component structure to expose slots at shallower depth.' },
  { ruleId: 'unused-named-slot', label: 'Unused Named Slot', severity: 'P2', weight: 1, description: 'Named slot defined but never filled by any parent.', recommendedFix: 'Remove the unused slot or document why it exists for future use.' },
  { ruleId: 'constant-prop-value', label: 'Constant Prop Value', severity: 'info', weight: 0, description: 'Prop always receives the same literal value across all parents.', recommendedFix: 'Make the value a default or remove the prop entirely.' },
]

const RULE_WEIGHTS = Object.fromEntries(RULE_META.map(r => [r.ruleId, r.weight]))

const PROP_COUNT_THRESHOLD = 8
const EMIT_COUNT_THRESHOLD = 8
const COUPLING_THRESHOLD = 5
const DIRECTIVE_DEPTH_THRESHOLD = 3
const TEMPLATE_SIZE_THRESHOLD = 200
const EXPRESSION_LENGTH_THRESHOLD = 80
const SLOT_DEPTH_THRESHOLD = 4
const CONSTANT_PROP_MIN_USAGES = 3

function toRepoPath(absPath, projectRoot) {
  return toRepoPathUtil(absPath, projectRoot)
}

/** Convert PascalCase to kebab-case */
function toKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** Extract component name from file path */
function componentNameFromPath(filePath) {
  return path.basename(filePath, '.vue')
}

// ─── Script Regex Rules ───────────────────────────────────────────────────────

function countPropsInBlock(block) {
  const lines = block.split('\n')
  let count = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed === '{' || trimmed === '}') continue
    if (/^\w+[\s]*[?]?\s*:/.test(trimmed) || /^\w+[\s]*[?]?\s*;/.test(trimmed)) {
      count++
    }
  }
  return count
}

function scanScriptRegex(scriptContent, startLine) {
  const findings = []
  const lines = scriptContent.split('\n')

  // excessive-prop-count: find defineProps or interface Props
  const definePropsMatch = scriptContent.match(/defineProps\s*<\s*\{([\s\S]*?)\}\s*>\s*\(\s*\)/s)
    ?? scriptContent.match(/defineProps\s*\(\s*\{([\s\S]*?)\}\s*\)/s)
  const interfacePropsMatch = scriptContent.match(/interface\s+Props\s*\{([\s\S]*?)\}/s)

  const propsBlock = definePropsMatch?.[1] ?? interfacePropsMatch?.[1]
  if (propsBlock) {
    const propCount = countPropsInBlock(propsBlock)
    if (propCount >= PROP_COUNT_THRESHOLD) {
      const matchSource = definePropsMatch ?? interfacePropsMatch
      const beforeMatch = scriptContent.slice(0, matchSource.index)
      const lineNumber = startLine + beforeMatch.split('\n').length - 1
      findings.push({
        ruleId: 'excessive-prop-count',
        lineNumber,
        snippet: `defineProps (${propCount} properties)`,
        message: `Component accepts ${propCount} props; consider decomposition or a config/options object.`,
        fixHint: 'Group related props into a config object or extract sub-components.',
        confidence: CONFIDENCE_LEVELS.MEDIUM,
        isFileLevel: true,
        detail: { propCount },
      })
    }
  }

  // excessive-emit-count
  const defineEmitsTypeMatch = scriptContent.match(/defineEmits\s*<\s*\{([\s\S]*?)\}\s*>\s*\(\s*\)/s)
  const defineEmitsArrayMatch = scriptContent.match(/defineEmits\s*\(\s*\[([\s\S]*?)\]\s*\)/s)
  if (defineEmitsTypeMatch) {
    const block = defineEmitsTypeMatch[1]
    const eventCount = (block.match(/\(\s*e\s*:/g) ?? block.match(/[\w]+\s*:/g) ?? []).length
    if (eventCount >= EMIT_COUNT_THRESHOLD) {
      const beforeMatch = scriptContent.slice(0, defineEmitsTypeMatch.index)
      const lineNumber = startLine + beforeMatch.split('\n').length - 1
      findings.push({
        ruleId: 'excessive-emit-count',
        lineNumber,
        snippet: `defineEmits (${eventCount} events)`,
        message: `Component declares ${eventCount} events; consider grouping related events or using provide/inject.`,
        fixHint: 'Group related events or use provide/inject.',
        confidence: CONFIDENCE_LEVELS.MEDIUM,
        isFileLevel: true,
        detail: { emitCount: eventCount },
      })
    }
  } else if (defineEmitsArrayMatch) {
    const items = defineEmitsArrayMatch[1].split(',').filter(s => s.trim().length > 0)
    if (items.length >= EMIT_COUNT_THRESHOLD) {
      const beforeMatch = scriptContent.slice(0, defineEmitsArrayMatch.index)
      const lineNumber = startLine + beforeMatch.split('\n').length - 1
      findings.push({
        ruleId: 'excessive-emit-count',
        lineNumber,
        snippet: `defineEmits (${items.length} events)`,
        message: `Component declares ${items.length} events; consider grouping related events or using provide/inject.`,
        fixHint: 'Group related events or use provide/inject.',
        confidence: CONFIDENCE_LEVELS.MEDIUM,
        isFileLevel: true,
        detail: { emitCount: items.length },
      })
    }
  }

  // component-coupling: count .vue imports
  let vueImportCount = 0
  for (let i = 0; i < lines.length; i++) {
    if (/import\s+.*['"].*\.vue['"]/.test(lines[i])) {
      vueImportCount++
    }
  }
  if (vueImportCount >= COUPLING_THRESHOLD) {
    findings.push({
      ruleId: 'component-coupling',
      lineNumber: startLine,
      snippet: `${vueImportCount} .vue imports`,
      message: `Component imports ${vueImportCount} sibling components; high coupling surface.`,
      fixHint: 'Extract sub-compositions or use slots to reduce direct imports.',
      confidence: CONFIDENCE_LEVELS.HIGH,
      isFileLevel: true,
      detail: { importCount: vueImportCount },
    })
  }

  return findings
}

/** Extract emit names from defineEmits */
function extractEmitNames(scriptContent) {
  const names = []
  const typeMatch = scriptContent.match(/defineEmits\s*<\s*\{([\s\S]*?)\}\s*>\s*\(\s*\)/s)
  if (typeMatch) {
    const re = /\(\s*e\s*:\s*['"]([^'"]+)['"]/g
    let m
    while ((m = re.exec(typeMatch[1])) !== null) names.push(m[1])
    return names
  }
  const arrayMatch = scriptContent.match(/defineEmits\s*\(\s*\[([\s\S]*?)\]\s*\)/s)
  if (arrayMatch) {
    const re = /['"]([^'"]+)['"]/g
    let m
    while ((m = re.exec(arrayMatch[1])) !== null) names.push(m[1])
  }
  return names
}

// ─── Template Regex Rules ─────────────────────────────────────────────────────

function scanTemplateRegex(templateContent, startLine) {
  const findings = []
  const lines = templateContent.split('\n')

  // oversized-template
  if (lines.length > TEMPLATE_SIZE_THRESHOLD) {
    findings.push({
      ruleId: 'oversized-template',
      lineNumber: startLine,
      snippet: `Template is ${lines.length} lines`,
      message: `Template is ${lines.length} lines; extract sub-components to improve readability.`,
      fixHint: 'Extract logical sections into sub-components.',
      confidence: CONFIDENCE_LEVELS.HIGH,
      isFileLevel: true,
      detail: { lineCount: lines.length },
    })
  }

  // template-directive-depth (stack-based)
  let maxDirectiveDepth = 0
  let maxDirectiveDepthLine = startLine
  const directiveStack = []
  const directiveRe = /\bv-(if|else-if|for)\b/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (directiveRe.test(trimmed)) {
      const isSelfClosing = /\/\s*>/.test(trimmed)
      if (!isSelfClosing) {
        const tagMatch = trimmed.match(/^<(\/?)([\w.-]+)/)
        if (tagMatch && !tagMatch[1]) {
          directiveStack.push(tagMatch[2])
          if (directiveStack.length > maxDirectiveDepth) {
            maxDirectiveDepth = directiveStack.length
            maxDirectiveDepthLine = startLine + i
          }
        }
      }
    }

    // Close tags that are on the directive stack
    const closeMatch = trimmed.match(/^<\/([\w.-]+)/)
    if (closeMatch) {
      const tagName = closeMatch[1]
      const idx = directiveStack.lastIndexOf(tagName)
      if (idx !== -1) directiveStack.splice(idx, 1)
    }
  }

  if (maxDirectiveDepth >= DIRECTIVE_DEPTH_THRESHOLD) {
    findings.push({
      ruleId: 'template-directive-depth',
      lineNumber: maxDirectiveDepthLine,
      snippet: `Directive nesting depth ${maxDirectiveDepth}`,
      message: `Template directive nesting depth ${maxDirectiveDepth}; extract sub-components or use computed properties to flatten.`,
      fixHint: 'Break nested v-if/v-for blocks into child components.',
      confidence: CONFIDENCE_LEVELS.MEDIUM,
      isFileLevel: true,
      detail: { directiveDepth: maxDirectiveDepth },
    })
  }

  // complex-template-expression
  const interpolationRe = /\{\{([^}]{80,})\}\}/g
  const bindingRe = /:[\w.-]+="([^"]{80,})"/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let m
    interpolationRe.lastIndex = 0
    while ((m = interpolationRe.exec(line)) !== null) {
      const exprLen = m[1].trim().length
      if (exprLen >= EXPRESSION_LENGTH_THRESHOLD) {
        findings.push({
          ruleId: 'complex-template-expression',
          lineNumber: startLine + i,
          snippet: m[0].slice(0, 80) + '...',
          message: `Complex template expression (${exprLen} chars); extract to computed property or method.`,
          fixHint: 'Move expression to a computed property.',
          confidence: CONFIDENCE_LEVELS.MEDIUM,
          isFileLevel: false,
          detail: { expressionLength: exprLen },
        })
      }
    }
    bindingRe.lastIndex = 0
    while ((m = bindingRe.exec(line)) !== null) {
      const exprLen = m[1].trim().length
      if (exprLen >= EXPRESSION_LENGTH_THRESHOLD) {
        findings.push({
          ruleId: 'complex-template-expression',
          lineNumber: startLine + i,
          snippet: m[0].slice(0, 80) + '...',
          message: `Complex template expression (${exprLen} chars); extract to computed property or method.`,
          fixHint: 'Move expression to a computed property.',
          confidence: CONFIDENCE_LEVELS.MEDIUM,
          isFileLevel: false,
          detail: { expressionLength: exprLen },
        })
      }
    }
  }

  // deep-slot-wrapper
  let elementDepth = 0
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const openTag = trimmed.match(/^<([\w.-]+)/)
    if (openTag && !trimmed.startsWith('</')) {
      elementDepth++
      if (/\bslot\b/.test(openTag[1]) || /<slot\s+name=/.test(trimmed)) {
        if (elementDepth >= SLOT_DEPTH_THRESHOLD) {
          const nameMatch = trimmed.match(/name=["']([^"']+)["']/)
          findings.push({
            ruleId: 'deep-slot-wrapper',
            lineNumber: startLine + i,
            snippet: trimmed.slice(0, 80),
            message: `Named slot${nameMatch ? ` '${nameMatch[1]}'` : ''} buried in deep nesting (depth ${elementDepth}); consider flattening component structure.`,
            fixHint: 'Flatten component structure to expose slots at shallower depth.',
            confidence: CONFIDENCE_LEVELS.LOW,
            isFileLevel: false,
            detail: { slotDepth: elementDepth, slotName: nameMatch?.[1] ?? null },
          })
        }
      }
      if (/\/\s*>/.test(trimmed)) elementDepth--
    }
    if (trimmed.startsWith('</')) elementDepth = Math.max(0, elementDepth - 1)
  }

  return findings
}

// ─── Emit Relay Detection (script + template cross-analysis) ──────────────────

function scanEmitRelay(scriptContent, templateContent, startLine) {
  const emitNames = extractEmitNames(scriptContent)
  if (emitNames.length === 0) return []

  const findings = []
  for (const emitName of emitNames) {
    const kebab = toKebab(emitName)
    const relayPatterns = [
      new RegExp(`@${kebab}\\s*=\\s*"\\s*emit\\s*\\(\\s*'${emitName}'`),
      new RegExp(`@${kebab}\\s*=\\s*"\\s*\\$emit\\s*\\(\\s*'${emitName}'`),
      new RegExp(`@${emitName}\\s*=\\s*"\\s*emit\\s*\\(\\s*'${emitName}'`),
      new RegExp(`@${emitName}\\s*=\\s*"\\s*\\$emit\\s*\\(\\s*'${emitName}'`),
    ]

    const lines = templateContent.split('\n')
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of relayPatterns) {
        if (pattern.test(lines[i])) {
          findings.push({
            ruleId: 'emit-relay',
            lineNumber: startLine + i,
            snippet: lines[i].trim().slice(0, 80),
            message: `Event relay detected for '${emitName}'; consider provide/inject or direct composable access.`,
            fixHint: 'Replace event relay with provide/inject or composable.',
            confidence: CONFIDENCE_LEVELS.MEDIUM,
            isFileLevel: false,
            detail: { emitName },
          })
          break
        }
      }
    }
  }
  return findings
}

// ─── Cross-File Rules ─────────────────────────────────────────────────────────

function collectNamedSlots(templateContent) {
  const slots = []
  const re = /<slot\s+name=["']([^"']+)["']/g
  let m
  while ((m = re.exec(templateContent)) !== null) {
    slots.push(m[1])
  }
  return slots
}

function scanUnusedNamedSlots(filePath, templateContent, allFileContents, startLine, _projectRoot) {
  const slotsCollected = collectNamedSlots(templateContent)
  const slots = [...new Set(slotsCollected)]
  if (slots.length === 0) return []

  const componentName = componentNameFromPath(filePath)
  const kebabName = toKebab(componentName)
  const findings = []

  for (const slotName of slots) {
    let filled = false
    for (const [otherPath, otherContent] of allFileContents) {
      if (otherPath === filePath) continue
      const importPattern = new RegExp(`import\\s+.*${componentName}.*from\\s+`)
      const tagPattern = new RegExp(`<(${componentName}|${kebabName})\\b`)
      if (!importPattern.test(otherContent) && !tagPattern.test(otherContent)) continue

      const slotUsage = new RegExp(`(#${slotName}\\b|v-slot:${slotName}\\b)`)
      if (slotUsage.test(otherContent)) {
        filled = true
        break
      }
    }

    if (!filled) {
      findings.push({
        ruleId: 'unused-named-slot',
        lineNumber: startLine,
        snippet: `<slot name="${slotName}">`,
        message: `Named slot '${slotName}' defined but never filled by any parent component.`,
        fixHint: 'Remove the unused slot or document it for future use.',
        confidence: CONFIDENCE_LEVELS.LOW,
        isFileLevel: false,
        detail: { slotName },
      })
    }
  }
  return findings
}

function scanConstantPropValue(filePath, scriptContent, allFileContents, startLine, _projectRoot) {
  const definePropsMatch = scriptContent.match(/defineProps\s*<\s*\{([\s\S]*?)\}\s*>\s*\(\s*\)/s)
    ?? scriptContent.match(/defineProps\s*\(\s*\{([\s\S]*?)\}\s*\)/s)
  const interfacePropsMatch = scriptContent.match(/interface\s+Props\s*\{([\s\S]*?)\}/s)
  const propsBlock = definePropsMatch?.[1] ?? interfacePropsMatch?.[1]
  if (!propsBlock) return []

  const propNames = []
  for (const line of propsBlock.split('\n')) {
    const m = line.trim().match(/^(\w+)\s*[?]?\s*:/)
    if (m) propNames.push(m[1])
  }
  if (propNames.length === 0) return []

  const componentName = componentNameFromPath(filePath)
  const kebabName = toKebab(componentName)

  const findings = []
  for (const propName of propNames) {
    const kebabProp = toKebab(propName)
    const values = []
    let _parentCount = 0

    for (const [otherPath, otherContent] of allFileContents) {
      if (otherPath === filePath) continue
      const tagPattern = new RegExp(`<(${componentName}|${kebabName})\\b`)
      if (!tagPattern.test(otherContent)) continue
      _parentCount++

      // static: prop-name="literal" (exclude dynamic :prop="expr" — character before match must not be :)
      const staticRe = new RegExp(`(?:${propName}|${kebabProp})\\s*=\\s*"([^"]*)"`, 'g')
      let m
      while ((m = staticRe.exec(otherContent)) !== null) {
        const charBefore = m.index > 0 ? otherContent[m.index - 1] : ' '
        if (charBefore !== ':' && charBefore !== '.') values.push(m[1])
      }
      // dynamic constant: :prop-name="'literal'"
      const dynamicRe = new RegExp(`:(?:${propName}|${kebabProp})\\s*=\\s*"\\s*'([^']*)'\\s*"`, 'g')
      while ((m = dynamicRe.exec(otherContent)) !== null) {
        values.push(m[1])
      }
    }

    if (values.length >= CONSTANT_PROP_MIN_USAGES) {
      const allSame = values.every(v => v === values[0])
      if (allSame) {
        findings.push({
          ruleId: 'constant-prop-value',
          lineNumber: startLine,
          snippet: `${propName}="${values[0]}" (${values.length} usages)`,
          message: `Prop '${propName}' always receives '${values[0]}'; consider making it a default or removing the prop.`,
          fixHint: 'Set as default value or remove the prop.',
          confidence: CONFIDENCE_LEVELS.LOW,
          isFileLevel: false,
          detail: { propName, constantValue: values[0], usageCount: values.length },
        })
      }
    }
  }
  return findings
}

// ─── Blast-Radius Enrichment ──────────────────────────────────────────────────

function countComponentParents(filePath, allFileContents) {
  const componentName = componentNameFromPath(filePath)
  const kebabName = toKebab(componentName)
  const parents = new Set()

  for (const [otherPath, otherContent] of allFileContents) {
    if (otherPath === filePath) continue
    const importRe = new RegExp(`import\\s+.*from\\s+['"].*${componentName}\\.vue['"]`)
    const tagRe = new RegExp(`<(${componentName}|${kebabName})\\b`)
    if (importRe.test(otherContent) || tagRe.test(otherContent)) {
      parents.add(otherPath)
    }
  }
  return parents.size
}

// ─── Repair Waves ─────────────────────────────────────────────────────────────

function buildRepairWaves(findings) {
  const local = findings.filter(f => f.parentCount === 0)
  const lowFanIn = findings.filter(f => f.parentCount >= 1 && f.parentCount <= 3)
  const highFanIn = findings.filter(f => f.parentCount >= 4)
  return { local, lowFanIn, highFanIn }
}

// ─── File Scoring ─────────────────────────────────────────────────────────────

function scoreFile(fileFindings) {
  return fileFindings.reduce((sum, f) => sum + (RULE_WEIGHTS[f.ruleId] ?? 0), 0)
}

function priorityFromScore(score) {
  if (score >= 6) return 'P0'
  if (score >= 3) return 'P1'
  return 'P2'
}

// ─── Markdown Report ──────────────────────────────────────────────────────────

function renderMarkdownReport(payload) {
  const lines = []
  lines.push(...getAuditReportHeaderLines())
  lines.push('# Component Health Audit')
  lines.push('')
  lines.push(`Generated: ${payload.generatedAt}`)
  lines.push('')
  lines.push('## Overview')
  lines.push('')
  lines.push(`- Components scanned: **${payload.totalScanned}**`)
  lines.push(`- Findings: **${payload.findings.length}**`)
  lines.push(`- Files with findings: **${payload.files.length}**`)
  lines.push('')

  lines.push('## Ruleset')
  lines.push('')
  lines.push('| Rule | Severity | Weight | Description |')
  lines.push('| --- | --- | ---: | --- |')
  for (const r of payload.ruleset) {
    lines.push(`| ${r.ruleId} | ${r.severity} | ${r.weight} | ${r.description} |`)
  }
  lines.push('')

  const byRule = {}
  for (const f of payload.findings) {
    byRule[f.ruleId] = (byRule[f.ruleId] || 0) + 1
  }
  const sortedRules = Object.entries(byRule).sort((a, b) => b[1] - a[1])
  if (sortedRules.length > 0) {
    lines.push('## By rule')
    lines.push('')
    lines.push('| Rule | Severity | Count |')
    lines.push('| --- | --- | ---: |')
    for (const [ruleId, count] of sortedRules) {
      const meta = RULE_META.find(r => r.ruleId === ruleId)
      lines.push(`| ${ruleId} | ${meta?.severity ?? '?'} | ${count} |`)
    }
    lines.push('')
  }

  const waves = payload.repairWaves
  lines.push('## Repair Waves')
  lines.push('')
  lines.push(`- **Wave 1 — Local** (parentCount = 0): ${waves.local.length} finding(s)`)
  lines.push(`- **Wave 2 — Low fan-in** (parentCount 1–3): ${waves.lowFanIn.length} finding(s)`)
  lines.push(`- **Wave 3 — High fan-in** (parentCount ≥ 4): ${waves.highFanIn.length} finding(s)`)
  lines.push('')

  if (payload.files.length > 0) {
    const MAX = 40
    lines.push(`## Top ${Math.min(payload.files.length, MAX)} files by score`)
    lines.push('')
    lines.push('| File | Priority | Score | Parents |')
    lines.push('| --- | --- | ---: | ---: |')
    for (const f of payload.files.slice(0, MAX)) {
      lines.push(`| \`${f.file}\` | ${f.priority} | ${f.score} | ${f.parentCount ?? 0} |`)
    }
    if (payload.files.length > MAX) {
      lines.push(`| *...and ${payload.files.length - MAX} more* | | | |`)
    }
    lines.push('')
  }

  if (payload.findings.length > 0) {
    const MAX = 60
    lines.push(`## All findings (first ${MAX})`)
    lines.push('')
    lines.push('| File | Line | Rule | Message | Parents |')
    lines.push('| --- | ---: | --- | --- | ---: |')
    for (const f of payload.findings.slice(0, MAX)) {
      const msg = f.message.length > 60 ? f.message.slice(0, 57) + '...' : f.message
      lines.push(`| \`${f.file}\` | ${f.lineNumber} | ${f.ruleId} | ${msg} | ${f.parentCount ?? 0} |`)
    }
    if (payload.findings.length > MAX) {
      lines.push(`| *...and ${payload.findings.length - MAX} more* | | | | |`)
    }
    lines.push('')
  }

  lines.push('## Notes')
  lines.push('')
  lines.push('- **P1 rules** (weight 2): excessive-prop-count, component-coupling, template-directive-depth — structural issues impacting maintainability.')
  lines.push('- **P2 rules** (weight 1): excessive-emit-count, oversized-template, complex-template-expression, unused-named-slot — readability/cleanup signals.')
  lines.push('- **Info rules** (weight 0): emit-relay, deep-slot-wrapper, constant-prop-value — informational signals for future optimization.')
  lines.push('- Repair waves: Wave 1 (local) = zero cascade risk; Wave 2 (low fan-in) = 1–3 parents to update; Wave 3 (high fan-in) = multi-file coordination needed.')
  lines.push('')

  return lines.join('\n')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const paths = resolveAuditPaths(AUDIT_TYPE)
  const { projectRoot, clientSrc } = paths
  const allowlist = loadCentralAllowlist(AUDIT_TYPE)
  const changedOnly = parseChangedOnlyFlag(process.argv, projectRoot)

  const scanDirs = [
    path.join(clientSrc, 'components'),
    path.join(clientSrc, 'views'),
    path.join(clientSrc, 'layouts'),
  ]
  const allFiles = listAuditFiles(AUDIT_TYPE, scanDirs)

  const filesToScan = changedOnly.enabled
    ? allFiles.filter(f => changedOnly.changedFiles.has(toRepoPath(f, projectRoot)))
    : allFiles

  // Pre-load all .vue file contents for cross-file rules
  const allFileContents = new Map()
  for (const f of allFiles) {
    try {
      allFileContents.set(f, fs.readFileSync(f, 'utf8'))
    } catch {
      // skip unreadable files
    }
  }

  const allFindings = []

  for (const absPath of filesToScan) {
    const content = allFileContents.get(absPath)
    if (!content) continue

    const repoPath = toRepoPath(absPath, projectRoot)
    const inlineExceptions = parseInlineExceptions(content, AUDIT_TYPE)

    const scriptInfo = extractVueScriptWithLineOffset(content)
    const templateInfo = extractVueTemplateSectionWithOffset(content)

    let fileFindings = []

    // Script rules
    if (scriptInfo) {
      fileFindings.push(...scanScriptRegex(scriptInfo.scriptContent, scriptInfo.startLineInFile))
    }

    // Template rules
    if (templateInfo) {
      fileFindings.push(...scanTemplateRegex(templateInfo.templateContent, templateInfo.startLineInFile))
    }

    // Emit relay (requires both script + template)
    if (scriptInfo && templateInfo) {
      fileFindings.push(...scanEmitRelay(scriptInfo.scriptContent, templateInfo.templateContent, templateInfo.startLineInFile))
    }

    // Cross-file: unused-named-slot
    if (templateInfo) {
      fileFindings.push(...scanUnusedNamedSlots(absPath, templateInfo.templateContent, allFileContents, templateInfo.startLineInFile, projectRoot))
    }

    // Cross-file: constant-prop-value
    if (scriptInfo) {
      fileFindings.push(...scanConstantPropValue(absPath, scriptInfo.scriptContent, allFileContents, scriptInfo.startLineInFile, projectRoot))
    }

    // Filter by allowlist
    fileFindings = fileFindings.filter(f => {
      const result = isMatchAllowed(repoPath, f.ruleId, f.lineNumber, inlineExceptions, allowlist, f.snippet)
      return !result.allowed
    })

    // Enrich with blast radius
    const parentCount = countComponentParents(absPath, allFileContents)
    for (const f of fileFindings) {
      f.file = repoPath
      f.isExported = true
      f.parentCount = parentCount
    }

    allFindings.push(...fileFindings)
  }

  // Build file-level summaries
  const fileMap = new Map()
  for (const f of allFindings) {
    if (!fileMap.has(f.file)) fileMap.set(f.file, [])
    fileMap.get(f.file).push(f)
  }
  const files = [...fileMap.entries()]
    .map(([file, findings]) => {
      const score = scoreFile(findings)
      return { file, score, priority: priorityFromScore(score), parentCount: findings[0]?.parentCount ?? 0 }
    })
    .sort((a, b) => b.score - a.score)

  const repairWaves = buildRepairWaves(allFindings)

  const payload = {
    instructionsForAi: AUDIT_REPORT_AI_INSTRUCTIONS_COMBINED,
    generatedAt: new Date().toISOString(),
    totalScanned: filesToScan.length,
    ruleset: RULE_META.map(r => ({
      ruleId: r.ruleId,
      label: r.label,
      severity: r.severity,
      weight: r.weight,
      description: r.description,
      recommendedFix: r.recommendedFix,
    })),
    findings: allFindings,
    files,
    repairWaves,
  }

  const mdContent = renderMarkdownReport(payload)
  const { outJson, outMd } = writeAuditReports(AUDIT_TYPE, payload, mdContent)
  console.log(`Wrote: ${path.relative(process.cwd(), outJson)}`)
  console.log(`Wrote: ${path.relative(process.cwd(), outMd)}`)
  console.log(`Scanned ${filesToScan.length} components, found ${allFindings.length} finding(s) across ${files.length} file(s).`)
}

main()
