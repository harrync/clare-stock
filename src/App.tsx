import React, { useState } from "react";
import Papa from "papaparse";

interface CSVRow {
  [key: string]: string;
}

interface ComputationResult {
  record: string;
  name: string;
  stockCount: number;
  price: number;
  total: number;
}

export default function CSVComparator() {
  const [file1Data, setFile1Data] = useState<CSVRow[]>([]);
  const [file2Data, setFile2Data] = useState<CSVRow[]>([]);
  const [computedResults, setComputedResults] = useState<ComputationResult[]>(
    []
  );

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFileData: React.Dispatch<React.SetStateAction<CSVRow[]>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setFileData(results.data);
      },
    });
  };

  const computeTotalStockValue = () => {
    const key = "Record";
    const nameKey = "Name";
    const stockKey = "STOCK COUNT";
    const priceKey = "PRICE WITHOUT MARK UP WITHOUT VAT";

    const file1Map = new Map(file1Data.map((row) => [row[key], row]));
    const file2Map = new Map(file2Data.map((row) => [row[key], row]));

    const results: ComputationResult[] = [];

    for (const [recordId, stockRow] of file1Map.entries()) {
      const priceRow = file2Map.get(recordId);
      if (priceRow) {
        const name = stockRow[nameKey] || "";
        const stockCount = parseFloat(
          stockRow[stockKey]?.replace(/,/g, "") || "0"
        );
        if (stockCount === 0) continue;
        const price = parseFloat(priceRow[priceKey]?.replace(/,/g, "") || "0");
        const total = stockCount * price;

        results.push({ record: recordId, name, stockCount, price, total });
      }
    }

    setComputedResults(results);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(
      computedResults.map(({ record, name, stockCount, price, total }) => ({
        Record: record,
        Name: name,
        "STOCK COUNT": stockCount,
        "PRICE WITHOUT MARK UP WITHOUT VAT": price.toFixed(2),
        Total: total.toFixed(2),
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "computed_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-6 m-auto max-w-4xl">
      <h1 className="text-2xl font-bold">CSV Stock Value Calculator</h1>

      <div className="space-y-2 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          Stock count CSV:
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e, setFile1Data)}
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col gap-2">
          Stock Costs CSV:
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e, setFile2Data)}
            className="border p-2 rounded"
          />
        </label>
      </div>

      <button
        onClick={computeTotalStockValue}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
      >
        Compute Total Stock Value
      </button>

      {computedResults.length > 0 && (
        <div className="mt-4 border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Stock Value Results</h2>
          <button
            onClick={downloadCSV}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Download CSV
          </button>
          <table className="w-full table-auto text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Record</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Stock Count</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {computedResults.map(
                ({ record, name, stockCount, price, total }) => (
                  <tr key={record}>
                    <td className="border px-2 py-1">{record}</td>
                    <td className="border px-2 py-1">{name}</td>
                    <td className="border px-2 py-1">{stockCount}</td>
                    <td className="border px-2 py-1">{price.toFixed(2)}</td>
                    <td className="border px-2 py-1">{total.toFixed(2)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
