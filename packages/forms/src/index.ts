import "./styles/base.css";

// --- Foundation (Phase 0) ---
export type {
  FormFieldType,
  FormFieldValidation,
  FormFieldOption,
  FormFieldConditional,
  FormField,
  FormSchema,
  FormData,
  FormSubmitResult,
  TaskFormField,
  CamundaVariables,
} from "./types";

// --- Model-Layer (pure Logik) ---
export {
  taskFormToSchema,
  camundaTypeName,
  camundaTypeToFieldType,
  camundaSubmitType,
  formDataToCamundaVariables,
  camundaTypeOf,
  validateForm,
  validateField,
  VALIDATION_MESSAGES,
  evalConditional,
  getPath,
  setPath,
  flattenFields,
  dataFields,
  isDataField,
  PRESENTATIONAL_TYPES,
} from "./model";

// --- ③ FormRenderer (Stream C) ---
export { FormRenderer } from "./renderer/FormRenderer";
export type {
  FormRendererProps,
  FormRendererSubmit,
  SubmitVariableFormat,
} from "./renderer/FormRenderer";

// --- ④ FormBuilder (Stream C) ---
export { FormBuilder } from "./builder/FormBuilder";
export type {
  FormBuilderProps,
  FormBuilderMode,
  BuilderFieldType,
} from "./builder/FormBuilder";
export {
  BUILDER_FIELD_TYPES,
  FIELD_TYPE_LABELS,
  createField,
  emptySchema,
  insertField,
  removeFieldAt,
  moveField,
  updateFieldAt,
} from "./builder/builder-model";
