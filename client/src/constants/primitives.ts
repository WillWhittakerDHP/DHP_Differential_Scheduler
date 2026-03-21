import type { GlobalEntityKey } from "./entities";
import type { GlobalEntity } from "@/types/entities";

export type ValidPrimitiveValues =
  | string
  | number
  | boolean
  | string[];

/** Payload slice for annotation instance `contentRows` on entity save. */
export type AnnotationInstanceContentRowPayload = ReadonlyArray<{
  userTypeBlockInstanceId: string | null
  text: string
}>

export type ValidAdminValue =
  | string
  | number
  | boolean
  | string[]
  | AnnotationInstanceContentRowPayload
  | undefined;

export type GlobalFieldKey<GE extends GlobalEntityKey> =
  GE extends GlobalEntityKey ? keyof GlobalEntity<GE> : never;

