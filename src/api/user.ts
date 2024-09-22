import { sparkSchema } from "./../classes/SparkSchema";
import { SparkArrayType, SparkStructType } from "./../types/spark";
import { SparkDataTypeString } from "@/enums/spark";
import { SchemaSettings, UnknownObject } from "@/types/common";

export const getRandomUser = async (settings: SchemaSettings) => {
  const randomNumber = 1 + Math.floor(Math.random() * 9);

  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${randomNumber}`);

  const user = await res.json();

  const schema = sparkSchema.infer(user);
  const userReduced = adaptSchema(schema, user, settings);

  return userReduced;
};

const adaptSchema = (schema: SparkStructType, obj: UnknownObject, settings: SchemaSettings) => {
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
