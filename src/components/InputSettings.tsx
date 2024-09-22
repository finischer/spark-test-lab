import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SchemaSettings } from "../types/common";
import { SparkDataTypeString } from "../enums/spark";

interface SettingsAccordionProps {
  settings: SchemaSettings;
  predefinedDataTypes: SparkDataTypeString[];
  onDataTypeToggle: (dataType: SparkDataTypeString) => void;
}

export default function SettingsAccordion({
  settings,
  predefinedDataTypes,
  onDataTypeToggle,
}: SettingsAccordionProps) {
  return (
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
                      onCheckedChange={() => onDataTypeToggle(type)}
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
  );
}
