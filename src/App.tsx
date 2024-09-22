"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SparkStructType } from "./types/spark";
import { SchemaSettings, UnknownObject } from "./types/common";
import { stringToJson } from "./utils/json";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCachedRandomUser, adaptSchema, Action } from "./api/user";
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
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleLeftJSONChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setLeftJSON(inputValue);
    updateSchema(inputValue);
  };

  const handleLeftJSONBlur = () => {
    try {
      const parsedJSON = JSON.parse(leftJSON as string);
      const formattedJSON = JSON.stringify(parsedJSON, null, 2);
      setLeftJSON(formattedJSON);
      userCache("UPDATE", parsedJSON);
      updateSchema(formattedJSON);
    } catch (err: unknown) {
      console.error(err);
      setError("Invalid JSON");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      setLeftJSON(newValue);
      updateSchema(newValue);
      // Set cursor position after inserted tabs
      setTimeout(() => {
        if (leftTextareaRef.current) {
          leftTextareaRef.current.selectionStart = leftTextareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
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
      JSON.parse(typeof leftJSON === "string" ? leftJSON : JSON.stringify(leftJSON));
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
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Input data</h2>
            <Button
              onClick={() => fetchAndSetNewData("REFRESH")}
              size="sm"
              variant="outline"
              className="bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          <Textarea
            ref={leftTextareaRef}
            value={typeof leftJSON === "string" ? leftJSON : JSON.stringify(leftJSON, null, 2)}
            onChange={handleLeftJSONChange}
            onBlur={handleLeftJSONBlur}
            onKeyDown={handleKeyDown}
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
