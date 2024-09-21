import { JSDataTypeString, SparkDataTypeString } from "@/enums/spark";
import { getSparkDataType, inferType } from "./spark";
import { UnknownArray } from "@/types/common";

const INT32_BITS = 32;
const INT64_BITS = 64;
const MAX_FLOAT_PRECISION = 7;

export const MIN_INT32 = Math.pow(2, INT32_BITS) * -1;
export const MAX_INT32 = Math.pow(2, INT32_BITS) - 1;

export const MIN_INT64 = Math.pow(2, INT64_BITS) * -1;
export const MAX_INT64 = Math.pow(2, INT64_BITS) - 1;

export const dTypeMap = {
  [JSDataTypeString.STRING]: SparkDataTypeString.STRING,
  [JSDataTypeString.INT_32]: SparkDataTypeString.INTEGER,
  [JSDataTypeString.INT_64]: SparkDataTypeString.LONG,
  [JSDataTypeString.DOUBLE]: SparkDataTypeString.DOUBLE,
  [JSDataTypeString.FLOAT]: SparkDataTypeString.FLOAT,
  [JSDataTypeString.BOOLEAN]: SparkDataTypeString.BOOLEAN,
  [JSDataTypeString.ARRAY]: SparkDataTypeString.ARRAY,
  [JSDataTypeString.STRUCT]: SparkDataTypeString.STRUCT,
  [JSDataTypeString.NULL]: SparkDataTypeString.NULL,
};

export const isInt32 = (num: number) => {
  return MIN_INT32 <= num && num <= MAX_INT32;
};

export const isInt64 = (num: number) => {
  return MIN_INT64 <= num && num <= MAX_INT64;
};

export const handleIntegerValue = (value: number) => {
  if (isInt32(value)) {
    return JSDataTypeString.INT_32;
  } else if (isInt64(value)) {
    return JSDataTypeString.INT_64;
  }

  throw new Error("Value is not in integer range of 4 bytes or 8 bytes");
};

export const handleFloatValue = (value: number) => {
  const precision = value.toString().split(".").at(-1)?.length || 0;

  return precision > MAX_FLOAT_PRECISION ? JSDataTypeString.DOUBLE : JSDataTypeString.FLOAT;
};

export const handleArrayType = (array: UnknownArray) => {
  const elementType = SparkDataTypeString.STRING;

  if (array.length === 0) return elementType;
  if (Array.isArray(array[0])) return SparkDataTypeString.ARRAY;

  const jsType = inferType(array[0]);

  return getSparkDataType(jsType);
};
