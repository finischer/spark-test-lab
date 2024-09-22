"use client";

import { useCallback, useEffect, useState } from "react";
import { SparkStructType } from "./types/spark";
import { SchemaSettings, UnknownObject } from "./types/common";
import { getCachedRandomUser, adaptSchema, Action } from "./api/user";
import { SparkDataTypeString } from "./enums/spark";
import { sparkSchema } from "./classes/SparkSchema";
import { useToast } from "@/hooks/use-toast";
import SettingsAccordion from "@/components/InputSettings";
import JSONInput from "./components/JSONInput";
import SchemaOutput from "./components/SchemaOutput";

const predefinedDataTypes: SparkDataTypeString[] = [
  SparkDataTypeString.STRING,
  SparkDataTypeString.INTEGER,
  SparkDataTypeString.BOOLEAN,
  SparkDataTypeString.DOUBLE,
  SparkDataTypeString.FLOAT,
  SparkDataTypeString.LONG,
  SparkDataTypeString.STRUCT,
  SparkDataTypeString.ARRAY,
  SparkDataTypeString.NULL,
];

const userCache = getCachedRandomUser();

export default function SparkSchemaGenerator() {
  const [leftJSON, setLeftJSON] = useState<UnknownObject | string>({});
  const [rightJSON, setRightJSON] = useState<SparkStructType>();
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<SchemaSettings>({
    includedDataTypes: [...predefinedDataTypes],
  });
  const { toast } = useToast();

  const fetchAndSetNewData = useCallback(
    async (action: Action = "GET") => {
      try {
        const res = await userCache(action);
        const copyRes = { ...res };
        const schema = sparkSchema.infer(copyRes);
        const userReduced = adaptSchema(schema, copyRes, settings);
        const schemaAdapted = sparkSchema.infer(userReduced);

        setLeftJSON(JSON.stringify(copyRes, null, 2));
        setRightJSON(schemaAdapted);
        setError("");
      } catch (err) {
        console.error("Failed to fetch new data:", err);
        setError("Failed to fetch new data. Please try again.");
      }
    },
    [settings]
  );

  useEffect(() => {
    fetchAndSetNewData();
  }, [fetchAndSetNewData]);

  const updateSchema = useCallback(
    (inputJSON: string) => {
      try {
        const parsedJSON = JSON.parse(inputJSON);
        const schema = sparkSchema.infer(parsedJSON);
        const adaptedSchema = adaptSchema(schema, parsedJSON, settings);
        setRightJSON(sparkSchema.infer(adaptedSchema));
        setError("");
      } catch (err: unknown) {
        console.error(err);
        setError("Invalid JSON");
      }
    },
    [settings]
  );

  const handleDataTypeToggle = (dataType: SparkDataTypeString) => {
    setSettings((prev) => ({
      ...prev,
      includedDataTypes: prev.includedDataTypes.includes(dataType)
        ? prev.includedDataTypes.filter((type) => type !== dataType)
        : [...prev.includedDataTypes, dataType],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col space-y-4 p-4">
      <h1 className="text-2xl font-bold text-center">Spark Schema Generator</h1>
      {error && <p className="text-red-400 text-center py-1">{error}</p>}

      <SettingsAccordion
        settings={settings}
        predefinedDataTypes={predefinedDataTypes}
        onDataTypeToggle={handleDataTypeToggle}
      />

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <JSONInput
          leftJSON={leftJSON}
          setLeftJSON={setLeftJSON}
          updateSchema={updateSchema}
          fetchAndSetNewData={fetchAndSetNewData}
          userCache={userCache}
          setError={setError}
        />
        <SchemaOutput
          rightJSON={rightJSON}
          toast={toast}
        />
      </div>
    </div>
  );
}
