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
 */
/**
 *      and we still need the full union of valid keys across those entities.
 */
export type GlobalFieldKey<GE extends GlobalEntityKey> =
  GE extends GlobalEntityKey ? keyof GlobalEntity<GE> : never;

