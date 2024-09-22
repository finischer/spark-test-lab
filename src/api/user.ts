import { SparkArrayType, SparkStructType } from "./../types/spark";
import { SparkDataTypeString } from "@/enums/spark";
import { SchemaSettings, UnknownObject } from "@/types/common";

type CachedUser = {
  raw: UnknownObject | null;
  adapted: UnknownObject | null;
};

export type Action = "UPDATE" | "GET" | "REFRESH";

export const getCachedRandomUser = () => {
  const cachedUser: CachedUser = {
    raw: null,
    adapted: null,
  };

  return async (action: Action = "GET", newRawUser: UnknownObject | null = null) => {
    if (cachedUser.raw && action !== "REFRESH") {
      if (action === "UPDATE" && newRawUser) {
        cachedUser.raw = newRawUser;
      }
      return cachedUser.raw;
    }

    const randomNumber = 1 + Math.floor(Math.random() * 9);
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${randomNumber}`);
    const user = (await res.json()) as UnknownObject;
    cachedUser.raw = user;
    return user;
  };
};

export const adaptSchema = (schema: SparkStructType, obj: UnknownObject, settings: SchemaSettings) => {
  for (const field of schema.fields) {
    const key = field.name;
    const fieldType = field.type;

    let convertedFieldType = field.type as SparkDataTypeString;

    if (typeof fieldType === "object") {
      const nestedType = fieldType as SparkArrayType | SparkStructType;

      if (nestedType.type === SparkDataTypeString.ARRAY) {
        convertedFieldType = SparkDataTypeString.ARRAY;
      } else if (nestedType.type === SparkDataTypeString.STRUCT) {
        convertedFieldType = SparkDataTypeString.STRUCT;
        // obj = adaptSchema(nestedType, obj, settings);
      }
    }

    if (!settings.includedDataTypes.includes(convertedFieldType)) {
      delete obj[key];
    }
  }

  return obj;
};
