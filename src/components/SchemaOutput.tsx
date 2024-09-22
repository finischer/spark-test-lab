import { useCallback, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { SparkStructType } from "../types/spark";
import { Toast } from "@/hooks/use-toast";

interface SchemaOutputProps {
  rightJSON: SparkStructType | undefined;
  toast: (props: Toast) => void; // Replace 'any' with the correct type from your toast library
}

export default function SchemaOutput({ rightJSON, toast }: SchemaOutputProps) {
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
    return !!rightJSON;
  }, [rightJSON]);

  return (
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
  );
}
