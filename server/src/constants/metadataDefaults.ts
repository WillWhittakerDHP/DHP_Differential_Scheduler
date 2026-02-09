/**
 * Metadata Default Values
 * 
 * LEARNING: Centralized constants for metadata default values used in scripts and migrations
 * WHY: Eliminates hardcoding audit findings, provides single source of truth for default values
 * PATTERN: Constants matching database schema defaults and script requirements
 * 
 * NOTE: These defaults are specific to shape_layout_config table structure
 *       See: server/src/db/migrations/20260115_create_shape_layout_config_table.mjs
 */

/**
 * Default visibility value for shape layout configs
 * LEARNING: Matches shape_layout_config.visibility ENUM default
 * WHY: Scripts need safe default when field_metadata doesn't specify visibility
 */
export const VISIBILITY_DEFAULT = 'hidden' as const

/**
 * Default layout value for shape layout configs
 * LEARNING: Matches shape_layout_config.layout ENUM default
 * WHY: Scripts need safe default when field_metadata doesn't specify layout
 */
export const LAYOUT_DEFAULT = 'stacked' as const

/**
 * Default render_as value for shape layout configs
 * LEARNING: Matches shape_layout_config.render_as ENUM default ('field')
 * WHY: Scripts need safe default when field_metadata doesn't specify renderAs
 */
export const RENDER_AS_DEFAULT = 'field' as const

/**
 * Default panel value for shape layout configs
 * LEARNING: Matches shape_layout_config.panel ENUM default ('none')
 * WHY: Scripts need safe default when field_metadata doesn't specify panel
 */
export const PANEL_DEFAULT = 'none' as const

/**
 * Default order value for shape layout configs
 * LEARNING: Used when field_metadata doesn't specify order
 * WHY: Scripts need safe default for display order
 */
export const ORDER_DEFAULT = 0

/**
 * Default bulk_edit value for shape layout configs
 * LEARNING: Used when field_metadata doesn't specify bulkEdit
 * WHY: Scripts need safe default for bulk edit flag
 */
export const BULK_EDIT_DEFAULT = false
