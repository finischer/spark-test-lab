import { useCallback, useEffect, useMemo, useState } from "react";
import { inferSchema } from "./utils/spark";
import { Textarea } from "@/components/ui/textarea";
import { SparkStructType } from "./types/spark";
import { UnknownObject } from "./types/common";
import { stringToJson } from "./utils/json";
import { Button } from "./components/ui/button";
import { Copy } from "lucide-react";
import { Checkbox } from "./components/ui/checkbox";

function App() {
  const [leftJSON, setLeftJSON] = useState('{\n  "example": "Edit this JSON"\n}');
  const [rightJSON, setRightJSON] = useState<SparkStructType>();
  const [error, setError] = useState("");
  const [allowNull, setAllowNull] = useState(true);
  const [allowComplex, setAllowComplex] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users/10")
      .then((res) => res.json())
      .then((res) => {
        setLeftJSON(res);
        setRightJSON(inferSchema(res as UnknownObject));
      });
  }, []);

  useEffect(() => {
    if (!leftJSON) return;

    const json = stringToJson<SparkStructType>(JSON.stringify(leftJSON));
    if (!json) return;

    const sparkSchema = inferSchema(json);
    setRightJSON(sparkSchema);
  }, [leftJSON]);

  const handleLeftJSONChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    try {
      const parsedJSON = JSON.parse(inputValue);
      setLeftJSON(parsedJSON);
      setError("");
    } catch (err: unknown) {
      console.error(err);
      setError("Invalid JSON in the left textarea");
      setLeftJSON(inputValue);
    }
  };

  const handleCopy = useCallback(() => {
    if (!rightJSON) return;

    navigator.clipboard
      .writeText(JSON.stringify(rightJSON))
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  }, [rightJSON]);

  const isJSONValid = useMemo(() => {
    try {
      JSON.parse(JSON.stringify(leftJSON));
      return true;
    } catch {
      return false;
    }
  }, [leftJSON]);

  return (
    <div className="flex flex-col space-y-4 p-4">
      <h1 className="text-2xl font-bold text-center">JSON Comparison</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="flex space-x-4 justify-center">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowNull"
            checked={allowNull}
            onCheckedChange={(checked) => setAllowNull(checked as boolean)}
          />
          <label htmlFor="allowNull">Allow null values</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowComplex"
            checked={allowComplex}
            onCheckedChange={(checked) => setAllowComplex(checked as boolean)}
          />
          <label htmlFor="allowComplex">Allow complex types</label>
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Input data</h2>
          <Textarea
            value={typeof leftJSON === "string" ? leftJSON : JSON.stringify(leftJSON, null, 2)}
            onChange={handleLeftJSONChange}
            className="h-[600px] font-mono"
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
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
          <Textarea
            value={JSON.stringify(rightJSON, null, 2)}
            readOnly
            className="h-[600px] font-mono bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
