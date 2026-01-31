/**
 * LEARNING: Form Field Configuration Types
 * WHY: Type-safe form field configuration definitions
 * PATTERN: Types matching React structure for consistency
 */

import type { GlobalEntityKey } from '../../constants/entities'
import type { GlobalFieldKey } from '../../constants/primitives'
import type { GlobalRelationshipKey } from '../../constants/relationships'
import { RelationshipSelectModeEnum, RelationshipSelectTypeEnum, TypeSelectEnum, PrimitiveTypeEnum, PrimitiveModeEnum } from './formDataEnums'

/**
 * Primitive form field configuration
 */
export type PrimitiveFormField<GE extends GlobalEntityKey = GlobalEntityKey> = {
  primitiveType: PrimitiveTypeEnum;
  primitiveMode: PrimitiveModeEnum;
  globalField: GlobalFieldKey<GE>;
  placeholder: string;
  min?: number;
  max?: number;
  step?: number;
  expandable?: boolean;
};

export type PrimitiveFieldType<GE extends GlobalEntityKey> = Partial<Record<GlobalFieldKey<GE>, PrimitiveFormField<GE>>>;

/**
 * Relationship field type
 */
type ChildFieldKey = GlobalFieldKey<"blockInstance"> | GlobalFieldKey<"partInstance"> | GlobalFieldKey<"blockShape"> | GlobalFieldKey<"partShape">;

export type RelationshipFieldType<
  GE extends GlobalEntityKey = GlobalEntityKey,
  R extends GlobalRelationshipKey = GlobalRelationshipKey
> = {
  targetMode: "relationship";
  targetKey: R; 
  globalField: GlobalFieldKey<GE>;

  selectedParentKey: GE;
  selectedChildKey: GlobalEntityKey;
  selectedChildPath: GlobalFieldKey<GE>[];

  candidateParentKey: GlobalEntityKey;
  candidateParentPath: GlobalFieldKey<GE>[];
  candidateChildKey: GlobalEntityKey;
  candidateChildPath?: GlobalFieldKey<GE>[];

  selectType: RelationshipSelectTypeEnum;
  selectMode: RelationshipSelectModeEnum;
  groupByKey?: ChildFieldKey;
  placeholder?: string;
  modeToggle?: {
    enabled: boolean;
    controlField: string;
  };
  dependencyImpact?: {
    affectedEntityKey: GlobalEntityKey;
    affectedField: string;
    linkingField: string;
    displayNames: {
      removedItems: string;
      affectedEntities: string;
      affectedField: string;
    };
  };
};

/**
 * Virtual field type (type-based select)
 */
export type VirtualFieldType<
  GE extends GlobalEntityKey = GlobalEntityKey,
> = {
  targetMode: "property";
  targetKey: "blockShape" | "partShape";
  globalField: GlobalFieldKey<GE>;

  selectedParentKey: GE;
  selectedChildKey: GlobalEntityKey;
  selectedChildPath: GlobalFieldKey<GE>[];

  candidateParentKey: GlobalEntityKey;
  candidateParentPath: GlobalFieldKey<GE>[];
  candidateChildKey: GlobalEntityKey;
  candidateChildPath: GlobalFieldKey<GE>[];

  selectType: TypeSelectEnum;
  selectMode: RelationshipSelectModeEnum;
  groupByKey?: GlobalFieldKey<GlobalEntityKey>;
  placeholder?: string;
  modeToggle?: {
    enabled: boolean;
    controlField: string;
  };
};

export type SelectableFormFieldType<GE extends GlobalEntityKey = GlobalEntityKey> =
  | RelationshipFieldType<GE, GlobalRelationshipKey>
  | VirtualFieldType<GE>;
  
export type SelectableFieldTypeSuite = {
  [GE in GlobalEntityKey]: Partial<Record<GlobalFieldKey<GE>, SelectableFormFieldType<GE>>>;
};

/**
 * Validation rule
 */
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validate?: (value: unknown) => boolean | string;
  message?: string;
}

/**
 * Form field config - combines primitive and select configs
 */
 
export type FormFieldConfig<GE extends GlobalEntityKey, _FieldKey extends GlobalFieldKey<GE>> = {
  primitiveInput?: PrimitiveFormField<GE>;
  typeSelect?: VirtualFieldType<GE>;
  relationshipSelect?: RelationshipFieldType<GE>;
  validationRules?: ValidationRule[];
  getOrderingValidationRules?(): ValidationRule[];
};

export type FormFieldConfigMap = {
  [GE in GlobalEntityKey]: {
    [FieldKey in GlobalFieldKey<GE>]?: FormFieldConfig<GE, FieldKey>;
  };
};

