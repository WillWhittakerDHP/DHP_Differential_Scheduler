import type { GlobalEntityKey } from "./entities";
import type { GlobalEntity } from "@/types/entities";
import type { DifferentialRole } from "@shared/types/differentialRole";

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

/** Legacy map type; scheduling role overrides for blocks were removed — AppointmentShape may still carry merged runtime keys. */
export type DifferentialEventRoleOverridesMap = Record<string, DifferentialRole>

export type ValidAdminValue =
  | string
  | number
  | boolean
  | string[]
  | AnnotationInstanceContentRowPayload
  | DifferentialEventRoleOverridesMap
  | undefined;

export type GlobalFieldKey<GE extends GlobalEntityKey> =
  GE extends GlobalEntityKey ? keyof GlobalEntity<GE> : never;

