import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { UnknownObject } from "../types/common";
import { Action } from "../api/user";

interface JSONInputProps {
  leftJSON: UnknownObject | string;
  setLeftJSON: React.Dispatch<React.SetStateAction<UnknownObject | string>>;
  updateSchema: (inputJSON: string) => void;
  fetchAndSetNewData: (action: Action) => Promise<void>;
  userCache: (action: Action, data?: UnknownObject) => Promise<UnknownObject>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export default function JSONInput({
  leftJSON,
  setLeftJSON,
  updateSchema,
  fetchAndSetNewData,
  userCache,
  setError,
}: JSONInputProps) {
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
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
  );
}
