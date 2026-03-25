/**
 * WHY: Sequelize / pg errors carry useful fields on `parent`; surface them in structured logs.
 */

export function loggableErrorFields(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    const out: Record<string, unknown> = {
      name: err.name,
      message: err.message,
    }
    const anyErr = err as Error & {
      parent?: { code?: string; detail?: string; constraint?: string; table?: string; column?: string }
    }
    if (anyErr.parent !== undefined && anyErr.parent !== null) {
      const p = anyErr.parent
      if (p.code !== undefined) {
        out.pgCode = p.code
      }
      if (p.detail !== undefined) {
        out.pgDetail = p.detail
      }
      if (p.constraint !== undefined) {
        out.pgConstraint = p.constraint
      }
      if (p.table !== undefined) {
        out.pgTable = p.table
      }
      if (p.column !== undefined) {
        out.pgColumn = p.column
      }
    }
    return out
  }
  return { nonError: String(err) }
}
