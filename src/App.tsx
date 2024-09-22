"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SparkStructType } from "./types/spark";
import { SchemaSettings, UnknownObject } from "./types/common";
import { stringToJson } from "./utils/json";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getRandomUser } from "./api/user";
import { SparkDataTypeString } from "./enums/spark";
import { sparkSchema } from "./classes/SparkSchema";

const predefinedDataTypes: SparkDataTypeString[] = [
  SparkDataTypeString.STRING,
  SparkDataTypeString.INTEGER,
  SparkDataTypeString.BOOLEAN,
  SparkDataTypeString.DOUBLE,
  SparkDataTypeString.FLOAT,
  SparkDataTypeString.LONG,
  SparkDataTypeString.STRUCT,
  SparkDataTypeString.ARRAY,
];

export default function SparkSchemaGenerator() {
  const [leftJSON, setLeftJSON] = useState<UnknownObject | string>({});
  const [rightJSON, setRightJSON] = useState<SparkStructType>();
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<SchemaSettings>({
    allowNullValues: true,
    allowComplexTypes: true,
    includedDataTypes: [...predefinedDataTypes],
  });
  const { toast } = useToast();

  useEffect(() => {
    getRandomUser(settings).then((res) => {
      setLeftJSON(res);

      const schema = sparkSchema.infer(res);

      setRightJSON(schema);
    });
  }, [settings]);

  useEffect(() => {
    if (!leftJSON) return;

    const json = stringToJson<SparkStructType>(JSON.stringify(leftJSON));
    if (!json) return;

    const schema = sparkSchema.infer(json);
    setRightJSON(schema);
  }, [leftJSON, settings]);

  const handleLeftJSONChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    try {
      const parsedJSON = JSON.parse(inputValue);
      setLeftJSON(parsedJSON);
      setError("");
    } catch (err: unknown) {
      console.error(err);
      setError("Invalid JSON");
      setLeftJSON(inputValue);
    }
  };

  const handleCopy = useCallback(() => {
    if (!rightJSON) return;

    navigator.clipboard
      .writeText(JSON.stringify(rightJSON, null, 2))
      .then(() =>
        toast({
          title: "Copied to clipboard! ✅",
        })
      )
      .catch((err) => console.error("Failed to copy: ", err));
  }, [rightJSON, toast]);

  const isJSONValid = useMemo(() => {
    try {
      JSON.parse(JSON.stringify(leftJSON));
      return true;
    } catch {
      return false;
    }
  }, [leftJSON]);

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

      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="settings"
      >
        <AccordionItem value="settings">
          <AccordionTrigger>Input Data Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowNull"
                    checked={settings.allowNullValues}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, allowNullValues: checked as boolean }))
                    }
                    className="border-gray-600"
                  />
                  <Label
                    htmlFor="allowNull"
                    className="text-gray-300"
                  >
                    Allow null values
                  </Label>
                </div>
              </div>
              <div>
                <Label className="text-gray-300 block mb-2">Included Data Types on top Level</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedDataTypes.map((type) => (
                    <div
                      key={type}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`dataType-${type}`}
                        checked={settings.includedDataTypes.includes(type)}
                        onCheckedChange={() => handleDataTypeToggle(type)}
                        className="border-gray-600"
                      />
                      <Label
                        htmlFor={`dataType-${type}`}
                        className="text-gray-300"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Input data</h2>
          <Textarea
            value={typeof leftJSON === "string" ? leftJSON : JSON.stringify(leftJSON, null, 2)}
            onChange={handleLeftJSONChange}
            className="h-[600px] font-mono bg-gray-800 text-gray-100 border-gray-700"
            placeholder="Enter your JSON here"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Spark schema</h2>
            <Button
              onClick={handleCopy}
              disabled={!isJSONValid}
              size="sm"
              variant="outline"
              className="bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
          <Textarea
            value={JSON.stringify(rightJSON, null, 2)}
            readOnly
            className="h-[600px] font-mono bg-gray-800 text-gray-100 border-gray-700"
          />
        </div>
      </div>
    </div>
  );
}
