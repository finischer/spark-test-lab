import { JSDataTypeString, SparkDataTypeString } from "@/enums/spark";
import { dTypeMap, handleArrayType, handleFloatValue, handleIntegerValue } from "./dataTypes";
import { SparkArrayType, SparkDataType, SparkStructField, SparkStructType } from "@/types/spark";
import { UnknownArray, UnknownObject } from "@/types/common";

export const getSparkDataType = (jsDataType: JSDataTypeString): SparkDataTypeString => {
  console.log("JS Type: ", jsDataType);
  return dTypeMap[jsDataType];
};

export const inferType = (value: unknown) => {
  if (Array.isArray(value)) {
    return JSDataTypeString.ARRAY;
  }

  const handleNumber = (value: number) => {
    if (Number.isInteger(value)) {
      return handleIntegerValue(value as number);
    }
    return handleFloatValue(value as number);
  };

  const valueType = typeof value;

  if (value === null) return JSDataTypeString.NULL;

  switch (valueType) {
    case "string":
      return JSDataTypeString.STRING;
    case "bigint":
      return handleNumber(value as number);
    case "number":
      return handleNumber(value as number);
    case "object":
      return JSDataTypeString.STRUCT;
    case "boolean":
      return JSDataTypeString.BOOLEAN;
    default:
      return JSDataTypeString.NULL;
  }

  //   const ignoredTypes = ["function", "undefined", "symbol"]
  //   if(ignoredTypes.includes(valueType)){
  //     throw new Error(`Type ${valueType} is not accetable`)
  //   }
};

export const inferSchema = (value: UnknownObject) => {
  return inferSchemaFromStruct(value);
};

export const inferSchemaFromArray = (array: UnknownArray): SparkArrayType => {
  const elementDataType = handleArrayType(array);

  const newArraySchema = (elementType: SparkDataType, containsNull: boolean) => {
    const arraySchema: SparkArrayType = {
      type: SparkDataTypeString.ARRAY,
      containsNull,
      metadata: {},
      elementType,
    };

    return arraySchema;
  };

  if (elementDataType === SparkDataTypeString.STRUCT) {
    const structSchema = inferSchemaFromStruct(array[0] as UnknownObject);
    return newArraySchema(structSchema, array === null);
  } else if (elementDataType === SparkDataTypeString.ARRAY) {
    const arraySchema = inferSchemaFromArray(array[0] as UnknownArray);
    return newArraySchema(arraySchema, array === null);
  }

  return newArraySchema(elementDataType, array === null);
};

export const inferSchemaFromStruct = (obj: UnknownObject) => {
  const sparkSchema: SparkStructType = {
    fields: [],
    type: SparkDataTypeString.STRUCT,
  };

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const type = inferType(value);

    const sparkDataType = getSparkDataType(type);
    let schema: SparkDataType = sparkDataType as SparkDataType;

    // handle complex types
    if (sparkDataType === SparkDataTypeString.STRUCT) {
      schema = inferSchemaFromStruct(value as UnknownObject);
    } else if (sparkDataType === SparkDataTypeString.ARRAY) {
      schema = inferSchemaFromArray(value as UnknownArray);
    }

    const field: SparkStructField = {
      name: key,
      type: schema,
      nullable: value === null,
      metadata: {},
    };

    sparkSchema.fields.push(field);
  });

  return sparkSchema;
};
