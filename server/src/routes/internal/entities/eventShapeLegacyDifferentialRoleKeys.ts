/**
 * FEATURE_20 §5.3 — `event_shapes` no longer store differential role; placement_kind + anchor_edge replace it.
 * Legacy clients may still send these keys; entity routes reject them on write and strip them on read/sanitize.
 */
export const EVENT_SHAPE_LEGACY_DIFFERENTIAL_ROLE_CAMEL = 'differentialRole' as const
export const EVENT_SHAPE_LEGACY_DIFFERENTIAL_ROLE_SNAKE = 'differential_role' as const
