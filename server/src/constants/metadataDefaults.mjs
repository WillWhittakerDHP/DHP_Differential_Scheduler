/**
 * Metadata Default Values (ES Module version)
 * 
 * LEARNING: ES Module version for .mjs scripts
 * WHY: .mjs scripts can't import TypeScript directly, need ES module version
 * PATTERN: Mirrors TypeScript constants file for use in scripts
 * 
 * NOTE: These defaults are specific to shape_layout_config table structure
 *       See: server/src/db/migrations/20260115_create_shape_layout_config_table.mjs
 */

/**
 * Default visibility value for shape layout configs
 */
export const VISIBILITY_DEFAULT = 'hidden'

/**
 * Default layout value for shape layout configs
 */
export const LAYOUT_DEFAULT = 'stacked'

/**
 * Default render_as value for shape layout configs
 */
export const RENDER_AS_DEFAULT = 'field'

/**
 * Default panel value for shape layout configs
 */
export const PANEL_DEFAULT = 'none'

/**
 * Default order value for shape layout configs
 */
export const ORDER_DEFAULT = 0

/**
 * Default bulk_edit value for shape layout configs
 */
export const BULK_EDIT_DEFAULT = false
