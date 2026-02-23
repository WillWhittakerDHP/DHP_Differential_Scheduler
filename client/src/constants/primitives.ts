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

export type GlobalFieldKey<GE extends GlobalEntityKey> =
  GE extends GlobalEntityKey ? keyof GlobalEntity<GE> : never;

