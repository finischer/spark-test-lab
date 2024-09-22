export type UnknownObject = { [key: string]: unknown };
export type UnknownArray = unknown[];

export interface SchemaSettings {
  allowNullValues: boolean;
  allowComplexTypes: boolean;
}
