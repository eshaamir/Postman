import React, { useState } from "react";
import axios from "axios";

function Postman() {
  const [responseDetails, setResponseDetails] = useState({
    status: "",
    time: "",
    size: "",
  });
  const [responseHeaders, setResponseHeaders] = useState<
    Record<string, string>
  >({});
  const [jsonResponse, setJsonResponse] = useState<any[]>([]);
  const [jsonRequestBody, setJsonRequestBody] = useState("{\n  \n}");
  const [isJsonMode, setIsJsonMode] = useState(true);
  const [formData, setFormData] = useState([{ key: "", value: "" }]);
  const methodSelect = document.querySelector(
    "[data-method]"
  ) as HTMLSelectElement | null;
  const methodValue = methodSelect?.value || "GET";

  const sendRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = (document.querySelector("[data-url]") as HTMLInputElement)
      .value;
    const method = (
      document.querySelector("[data-method]") as HTMLSelectElement
    ).value;

    let data;
    if (isJsonMode) {
      try {
        data = jsonRequestBody ? JSON.parse(jsonRequestBody) : undefined;
      } catch (error) {
        alert("Invalid JSON format");
        return;
      }
    } else {
      data = formData.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
    }

    try {
      const startTime = new Date().getTime();
      const response = await axios({
        url,
        method,
        data: ["GET", "DELETE"].includes(method) ? undefined : data,
        headers: { "Content-Type": "application/json" },
      });
      const endTime = new Date().getTime();

      const responseData = response.data;
      setJsonResponse(responseData);

      setResponseDetails({
        status: response.status.toString(),
        time: `${endTime - startTime} ms`,
        size: JSON.stringify(responseData).length.toString(),
      });

      setResponseHeaders(
        Object.fromEntries(
          Object.entries(response.headers).map(([key, value]) => [
            key,
            String(value),
          ])
        )
      );
    } catch (error: any) {
      setResponseDetails({
        status: "Error",
        time: "N/A",
        size: "N/A",
      });
      setJsonResponse([{ message: error.response?.data || error.message }]);
      console.error("Request Error:", error);
    }
  };

  const handleFormDataChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updatedFormData = [...formData];
    updatedFormData[index][field] = value;
    setFormData(updatedFormData);
  };

  const addLineNumbers = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => `${index + 1}. ${line}`).join("\n");
  };

  // Method colors mapping
  const methodColors: Record<string, string> = {
    GET: "bg-green-500 hover:bg-green-600",
    POST: "bg-blue-500 hover:bg-blue-600",
    PUT: "bg-yellow-500 hover:bg-yellow-600",
    PATCH: "bg-purple-500 hover:bg-purple-600",
    DELETE: "bg-red-500 hover:bg-red-600",
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col min-w-[800px]">
      <form
        onSubmit={sendRequest}
        className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200"
      >
        <div className="flex items-center space-x-4 mb-6">
          <select
            className={`border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 cursor-pointer focus:outline-none w-32 font-medium text-white ${methodColors[methodValue]}`}
            data-method
            defaultValue="GET"
          >
            <option value="GET" className="bg-green-500">
              GET
            </option>
            <option value="POST" className="bg-blue-500">
              POST
            </option>
            <option value="PUT" className="bg-yellow-500">
              PUT
            </option>
            <option value="PATCH" className="bg-purple-500">
              PATCH
            </option>
            <option value="DELETE" className="bg-red-500">
              DELETE
            </option>
          </select>
          <input
            data-url
            required
            type="url"
            className="flex-grow border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="https://example.com/api"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-200 font-medium"
          >
            Send Request
          </button>
        </div>

        <div className="mb-4 flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setIsJsonMode(true)}
            className={`${
              isJsonMode
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } px-4 py-2 rounded-md focus:outline-none transition-all duration-200 font-medium`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => setIsJsonMode(false)}
            className={`${
              !isJsonMode
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } px-4 py-2 rounded-md focus:outline-none transition-all duration-200 font-medium`}
          >
            Form Data
          </button>
        </div>

        {isJsonMode ? (
          <div className="mt-4">
            <textarea
              value={jsonRequestBody}
              onChange={(e) => setJsonRequestBody(e.target.value)}
              placeholder='{\n  "key": "value"\n}'
              className="w-full h-48 border border-gray-300 p-4 rounded-lg bg-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
            />
          </div>
        ) : (
          <div className="mt-4">
            {formData.map((pair, index) => (
              <div key={index} className="flex items-center mb-2 space-x-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={pair.key}
                  onChange={(e) =>
                    handleFormDataChange(index, "key", e.target.value)
                  }
                  className="border border-gray-300 rounded px-3 py-2 w-1/2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={pair.value}
                  onChange={(e) =>
                    handleFormDataChange(index, "value", e.target.value)
                  }
                  className="border border-gray-300 rounded px-3 py-2 w-1/2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedFormData = [...formData];
                    updatedFormData.splice(index, 1);
                    setFormData(updatedFormData);
                  }}
                  className="ml-2 p-2 text-red-600 rounded-md border border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData([...formData, { key: "", value: "" }])}
              className="text-green-600 mt-2 px-4 py-2 rounded-md border border-green-600 hover:bg-green-600 hover:text-white transition-all duration-200"
            >
              + Add Field
            </button>
          </div>
        )}
      </form>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Response</h3>
          <div className="flex space-x-4 text-sm">
            <span
              className={`px-3 py-1 rounded-full ${
                responseDetails.status === "Error"
                  ? "bg-red-100 text-red-800"
                  : responseDetails.status
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Status: {responseDetails.status || "N/A"}
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Time: {responseDetails.time || "N/A"}
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              Size: {responseDetails.size || "N/A"}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h4 className="font-bold text-gray-700">Response Body</h4>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {addLineNumbers(JSON.stringify(jsonResponse, null, 2))}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h4 className="font-bold text-gray-700">Response Headers</h4>
            </div>
            <div className="max-h-64 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {JSON.stringify(responseHeaders, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Postman;
