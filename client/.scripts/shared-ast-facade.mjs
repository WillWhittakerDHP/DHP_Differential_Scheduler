/**
 * Shared AST Facade for audit scripts.
 *
 * Provides ts-morph–based parsing, Vue <script> extraction with line mapping,
 * traversal helpers, and (Phase B) TypeChecker-backed semantic analysis.
 *
 * Used by: type-escape, type-import, loop-mutation, error-handling, naming-convention audits.
 */

import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

let _Project = null
let _SyntaxKind = null

async function loadTsMorph() {
  if (_Project) return { Project: _Project, SyntaxKind: _SyntaxKind }
  const tsMorph = await import('ts-morph')
  _Project = tsMorph.Project
  _SyntaxKind = tsMorph.SyntaxKind ?? (await import('typescript')).SyntaxKind
  return { Project: _Project, SyntaxKind: _SyntaxKind }
}

// ─── Phase B: Typed project and TypeChecker (cached per tsconfig path) ─────
let _typedProjectCache = null
let _typedProjectKey = null

/**
 * Create a project that loads tsconfig and exposes TypeChecker. Cached per process per tsConfigPath.
 * Use for semantic validation; keep createSourceFileFromContent() for fast parsing (fixtures, golden runner).
 *
 * @param {string} [tsConfigPath] - Path to tsconfig.json (default: resolve client/tsconfig.json from cwd)
 * @returns {Promise<{ project: import('ts-morph').Project, typeChecker: import('typescript').TypeChecker }>}
 */
export async function createTypedProject(tsConfigPath) {
  const cwd = process.cwd()
  const resolved = tsConfigPath
    ? path.resolve(cwd, tsConfigPath)
    : path.join(cwd, 'tsconfig.json')
  const key = resolved
  if (_typedProjectCache && _typedProjectKey === key) {
    const prog = _typedProjectCache.getProgram()
    return { project: _typedProjectCache, typeChecker: prog.getTypeChecker() }
  }
  if (!fs.existsSync(resolved)) {
    throw new Error(`createTypedProject: tsconfig not found: ${resolved}`)
  }
  const { Project } = await loadTsMorph()
  const project = new Project({ tsConfigFilePath: resolved })
  const program = project.getProgram()
  const typeChecker = program.getTypeChecker()
  _typedProjectCache = project
  _typedProjectKey = key
  return { project, typeChecker }
}

/**
 * Get the resolved type string for an AST node. Node must be from a source file in a typed project.
 *
 * @param {import('ts-morph').Node} node - ts-morph Node (must have .compilerNode)
 * @param {import('typescript').TypeChecker} typeChecker - From createTypedProject()
 * @returns {string} Type string (e.g. "string", "number", "any")
 */
export function getTypeOfNode(node, typeChecker) {
  if (!node || !typeChecker) return 'unknown'
  const compilerNode = node.compilerNode
  if (!compilerNode) return 'unknown'
  try {
    const type = typeChecker.getTypeAtLocation(compilerNode)
    return type ? typeChecker.typeToString(type) : 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Get the type string for a type node (e.g. the right-hand side of an AsExpression). Node must be from a typed project.
 *
 * @param {import('ts-morph').Node} typeNode - Type node (e.g. node.getType() from AsExpression)
 * @param {import('typescript').TypeChecker} typeChecker - From createTypedProject()
 * @returns {string}
 */
export function getTypeFromTypeNode(typeNode, typeChecker) {
  if (!typeNode || !typeChecker) return 'unknown'
  const compilerNode = typeNode.compilerNode
  if (!compilerNode) return 'unknown'
  try {
    const type = typeChecker.getTypeFromTypeNode(compilerNode)
    return type ? typeChecker.typeToString(type) : 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Get the symbol for an AST node (identifier, etc.). Node must be from a typed project (createTypedProject).
 *
 * @param {import('ts-morph').Node} node - ts-morph Node (from a project with type checking)
 * @param {import('typescript').TypeChecker} [_typeChecker] - Optional; node.getSymbol() is used when node is from typed project
 * @returns {import('ts-morph').Symbol | undefined}
 */
export function getSymbolAtNode(node, _typeChecker) {
  if (!node) return undefined
  try {
    return typeof node.getSymbol === 'function' ? node.getSymbol() : undefined
  } catch {
    return undefined
  }
}

/**
 * Return true if the symbol's declarations are all type-only (interface, type alias, or import type).
 * Used to distinguish type-only imports from value-capable symbols (e.g. enum, class). Enums are
 * always value-capable (including const enum) so they return false.
 *
 * @param {import('ts-morph').Symbol} symbol - From getSymbolAtNode()
 * @param {{ SyntaxKind: object }} sk - From loadTsMorph().SyntaxKind
 * @returns {boolean}
 */
export function isTypeOnlySymbol(symbol, sk) {
  if (!symbol) return false
  const decls = symbol.getDeclarations()
  if (!decls || decls.length === 0) return false
  for (const decl of decls) {
    const kind = decl.getKind()
    if (kind === sk.InterfaceDeclaration) continue
    if (kind === sk.TypeAliasDeclaration) continue
    if (kind === sk.EnumDeclaration) return false
    if (kind === sk.ClassDeclaration) return false
    if (kind === sk.FunctionDeclaration) return false
    if (kind === sk.VariableDeclaration) return false
    if (kind === sk.ImportSpecifier) {
      const importClause = decl.getParent()
      const importDecl = importClause?.getParent?.()
      if (importDecl?.isTypeOnly?.()) continue
      return false
    }
    return false
  }
  return true
}

/**
 * Get the return type string of a function/method declaration. Node must be from a typed project.
 *
 * @param {import('ts-morph').Node} node - FunctionDeclaration, MethodDeclaration, ArrowFunction, etc.
 * @param {import('typescript').TypeChecker} typeChecker - From createTypedProject()
 * @returns {string}
 */
export function getReturnType(funcNode, typeChecker) {
  if (!funcNode || !typeChecker) return 'unknown'
  const compilerNode = funcNode.compilerNode
  if (!compilerNode) return 'unknown'
  try {
    const sig = typeChecker.getSignatureFromDeclaration(compilerNode)
    if (!sig) return 'unknown'
    const type = typeChecker.getReturnTypeOfSignature(sig)
    return type ? typeChecker.typeToString(type) : 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Clear the typed project cache (e.g. for tests or when tsconfig changes).
 */
export function clearTypedProjectCache() {
  _typedProjectCache = null
  _typedProjectKey = null
}

const parseCache = new Map()
const CACHE_MAX = 500

function cacheKey(filePath, content) {
  const hash = crypto.createHash('sha1').update(content).digest('hex').slice(0, 16)
  return `${filePath}\0${hash}`
}

/**
 * Extract <script> content from Vue SFC and the 1-based line in the file where the script starts.
 *
 * @param {string} vueContent - Full Vue file content
 * @returns {{ scriptContent: string, startLineInFile: number } | null}
 */
export function extractVueScriptWithLineOffset(vueContent) {
  const match = vueContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
  if (!match) return null
  const scriptContent = match[1] ?? ''
  const beforeScript = vueContent.slice(0, match.index)
  const startLineInFile = (beforeScript.match(/\n/g) ?? []).length + 1
  return { scriptContent, startLineInFile }
}

/**
 * Map 1-based line number in script content to 1-based line in original Vue file.
 *
 * @param {number} scriptLine - 1-based line in <script> content
 * @param {number} startLineInFile - 1-based line where <script> starts in file
 * @returns {number}
 */
export function scriptLineToFileLine(scriptLine, startLineInFile) {
  return startLineInFile + scriptLine - 1
}

/**
 * Create a ts-morph SourceFile from content (in-memory). Uses cache when enabled.
 *
 * @param {string} filePath - Absolute or repo-relative path (used for extension / script kind)
 * @param {string} content - Full file or script content
 * @param {{ useCache?: boolean, lineOffset?: number }} [options] - lineOffset: add to reported lines (e.g. Vue script offset)
 * @returns {Promise<{ sourceFile: import('ts-morph').SourceFile, getLine: (node: import('ts-morph').Node) => number }>}
 */
export async function createSourceFileFromContent(filePath, content, options = {}) {
  const { useCache = true, lineOffset = 0 } = options
  const key = useCache ? cacheKey(filePath, content) : null
  if (key && parseCache.has(key)) {
    const cached = parseCache.get(key)
    const getLineRaw = cached.getLineRaw
    return {
      sourceFile: cached.sourceFile,
      getLine(node) {
        const raw = getLineRaw(node)
        return lineOffset ? lineOffset + raw - 1 : raw
      },
    }
  }

  const { Project } = await loadTsMorph()
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: true },
  })
  const _ext = path.extname(filePath)
  const normalizedPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  const sourceFile = project.createSourceFile(normalizedPath, content, { overwrite: true })

  /** 1-based line in content (no offset). Stored in cache so offset can be applied per call. */
  function getLineRaw(node) {
    const pos = node.getStart()
    const lineCol = sourceFile.getLineAndColumnAtPos(pos)
    return (lineCol && lineCol.line != null) ? lineCol.line : 1
  }

  if (key) {
    if (parseCache.size >= CACHE_MAX) {
      const firstKey = parseCache.keys().next().value
      if (firstKey != null) parseCache.delete(firstKey)
    }
    parseCache.set(key, { sourceFile, getLineRaw })
  }

  return {
    sourceFile,
    getLine(node) {
      const raw = getLineRaw(node)
      return lineOffset ? lineOffset + raw - 1 : raw
    },
  }
}

/**
 * Visit each descendant node (depth-first). visit(node) can return false to skip children.
 *
 * @param {import('ts-morph').Node} node
 * @param {(node: import('ts-morph').Node) => void | boolean} visit
 */
export function forEachDescendant(node, visit) {
  if (visit(node) === false) return
  for (const child of node.getChildren()) {
    forEachDescendant(child, visit)
  }
}

/**
 * Clear parse cache (e.g. for tests or memory pressure).
 */
export function clearParseCache() {
  parseCache.clear()
}

/**
 * Extract <template> content from Vue SFC and the 1-based line in the file where the template content starts.
 * Counterpart to extractVueScriptWithLineOffset for template-aware audits.
 *
 * @param {string} vueContent - Full Vue file content
 * @returns {{ templateContent: string, startLineInFile: number } | null}
 */
export function extractVueTemplateSectionWithOffset(vueContent) {
  const templateStart = vueContent.indexOf('<template')
  if (templateStart === -1) return null
  const afterTemplateTag = vueContent.indexOf('>', templateStart) + 1
  const lastTemplateClose = vueContent.lastIndexOf('</template>')
  if (lastTemplateClose === -1) return null
  const startLineInFile = vueContent.slice(0, afterTemplateTag).split('\n').length
  return {
    templateContent: vueContent.slice(afterTemplateTag, lastTemplateClose),
    startLineInFile,
  }
}

export { loadTsMorph }
