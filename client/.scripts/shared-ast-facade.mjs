/**
 * Shared AST Facade for audit scripts.
 *
 * Provides ts-morph–based parsing, Vue <script> extraction with line mapping,
 * and traversal helpers.
 *
 * Used by: type-escape, type-import, loop-mutation, error-handling, naming-convention audits.
 */

import path from 'node:path'
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
  const ext = path.extname(filePath)
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

export { loadTsMorph }
