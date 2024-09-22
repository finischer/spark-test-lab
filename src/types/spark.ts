import { SparkDataTypeString } from "@/enums/spark";

export type SparkDataType =
  | SparkStructType
  | SparkArrayType
  | SparkDataTypeString.STRING
  | SparkDataTypeString.LONG
  | SparkDataTypeString.INTEGER
  | SparkDataTypeString.FLOAT
  | SparkDataTypeString.DOUBLE
  | SparkDataTypeString.NULL
  | SparkDataTypeString.BOOLEAN;

export type SparkArrayType = {
  containsNull: boolean;
  elementType: SparkDataType;
  type: SparkDataTypeString.ARRAY;
  metadata: object;
};

export type SparkStructType = {
  fields: SparkStructField[];
  type: SparkDataTypeString.STRUCT;
};

export type SparkStructField = {
  name: string;
  type: SparkDataType;
  nullable: boolean;
  metadata: object;
};
