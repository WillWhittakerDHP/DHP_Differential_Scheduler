import type { GlobalEntityKey } from "./entities";
import type { GlobalEntity } from "@/types/entities";

export type ValidPrimitiveValues =
  | string
  | number
  | boolean
  | string[];

export type ValidAdminValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | undefined;

/**
 * Global field key type
 * Derived directly from GlobalEntity type - API-driven, not hard-coded
 * 
 * LEARNING: Type extraction from entity types enables type safety
 * WHY: Field keys come from the API (GlobalEntity), not hard-coded config
 * PATTERN: Type-level key extraction bridges runtime API data and compile-time types
 */
/**
 * LEARNING: `keyof (A | B)` produces only the keys common to both A and B.
 * WHY: Many call sites use union entity keys (e.g. "blockInstance" | "blockShape" | ...),
 *      and we still need the full union of valid keys across those entities.
 * PATTERN: Distribute over the entity-key union first, then take keyof.
 */
export type GlobalFieldKey<GE extends GlobalEntityKey> =
  GE extends GlobalEntityKey ? keyof GlobalEntity<GE> : never;

