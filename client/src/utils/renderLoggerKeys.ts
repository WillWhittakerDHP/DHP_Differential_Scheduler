/**
 * Render Logger Keys
 * 
 * LEARNING: Shared injection keys for render logger provide/inject
 * WHY: Cannot export from <script setup>, so keys must be in separate module
 * PATTERN: Export Symbol keys from separate module file
 */

// LEARNING: Provide/inject key for render logger
// WHY: Allows InputRenderer to access logger from parent DynamicFormInputs
// PATTERN: Use Symbol for injection key to avoid naming conflicts
export const RENDER_LOGGER_KEY = Symbol('renderLogger')

