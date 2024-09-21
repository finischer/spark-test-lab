import { SparkDataTypeString as EnumSparkDataType } from "@/enums/spark";

export type SparkDataType =
  | SparkStructType
  | SparkArrayType
  | EnumSparkDataType.STRING
  | EnumSparkDataType.LONG
  | EnumSparkDataType.INTEGER
  | EnumSparkDataType.FLOAT
  | EnumSparkDataType.DOUBLE
  | EnumSparkDataType.NULL
  | EnumSparkDataType.BOOLEAN;

export type SparkArrayType = {
  containsNull: boolean;
  elementType: SparkDataType;
  type: EnumSparkDataType.ARRAY;
  metadata: object;
};

export type SparkStructType = {
  fields: SparkStructField[];
  type: EnumSparkDataType.STRUCT;
};

export type SparkStructField = {
  name: string;
  type: SparkDataType;
  nullable: boolean;
  metadata: object;
};
