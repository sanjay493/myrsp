"use client";

import { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const styleRow=["Eq COB","Total Sinter","Total Hotmetal","Total Crude Steel","Saleable Steel"	]

export default function DataDisplay() {
  const [data, setData] = useState([]);
  const [mth1, setMth1] = useState(new Date());
  const [mth2, setMth2] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (mth) => {
    const year = mth.slice(0, 4);
    const month = mth.slice(4, 6);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Format months to `yyyyMM`
      const formattedMth1 = mth1.toISOString().slice(0, 7).replace("-", "");
      const formattedMth2 = mth2.toISOString().slice(0, 7).replace("-", "");

      if (!formattedMth1 || !formattedMth2) {
        throw new Error("Please provide valid months.");
      }

      const response = await fetch("/api/getMthsProdnPerf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mth1: formattedMth1, mth2: formattedMth2 }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data automatically when `mth1` or `mth2` changes
  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleFormSubmit} className="text-center mb-6">
        <div className="flex gap-4 items-center justify-center mb-4">
          <div>
            <label htmlFor="mth1" className="block font-bold text-lg">
              Select Starting Month-Year:
            </label>
            <ReactDatePicker
              id="mth1"
              selected={mth1}
              onChange={setMth1}
              dateFormat="yyyyMM"
              showMonthYearPicker
              className="border rounded p-2 text-center"
              maxDate={mth2} // Prevent selecting a date later than `mth2`
            />
          </div>
          <div>
            <label htmlFor="mth2" className="block font-bold text-lg">
              Select Ending Month-Year:
            </label>
            <ReactDatePicker
              id="mth2"
              selected={mth2}
              onChange={setMth2}
              dateFormat="yyyyMM"
              showMonthYearPicker
              className="border rounded p-2 text-center"
              minDate={mth1} // Prevent selecting a date earlier than `mth1`
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading || !mth1 || !mth2}
          >
            {loading ? "Loading..." : "Fetch Data"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {data.length > 0 ? (
        <div className="w-full mx-auto my-0 overflow-x-auto">
          {/* Dynamic Heading */}
          <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-4">
      {mth1.getFullYear() === mth2.getFullYear() && mth1.getMonth() === mth2.getMonth() ? (
        // If mth1 and mth2 are the same
        `Production Performance for ${mth1.toLocaleString("default", {
          month: "short",
        })}'${mth1.getFullYear().toString().slice(-2)}`
      ) : (
        // If mth1 and mth2 are different
      `Production Performance from ${mth1.toLocaleString("default", { month: "short" })}'${mth1.getFullYear().toString().slice(-2)} to ${mth2.toLocaleString("default", { month: "short" })}'${mth2.getFullYear().toString().slice(-2)}`
      )}</h2>
        <table className="w-full border-collapse my-5 text-center text-sm md:text-base">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-1 bg-gray-600 border text-pretty text-center font-bold text-white w-40">Unit</th>
              <th className="p-1 bg-gray-600 border text-pretty text-center font-bold text-white w-40">APP</th>
              <th className="p-1 bg-gray-600 border text-pretty text-center font-bold text-white w-40">Actual</th>
              <th className="p-1 bg-gray-600 border text-pretty text-center font-bold text-white w-40">FF%</th>
              <th className="p-1 bg-gray-600 border text-pretty text-center font-bold text-white w-40">CPLY</th>
              <th className="p-1 bg-gray-600 border text-pretty text-center font-bold text-white w-40">Growth%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}  className={`border border-gray-300 px-4 py-2 ${
                styleRow.includes(item.unit) ? "font-bold bg-blue-200" : ""
              }`}>
                <td className="border border-gray-300 px-4 py-2">{item.unit}</td>
                <td className="border border-gray-300 px-4 py-2">{item.app.toFixed(0)}</td>
                <td className="border border-gray-300 px-4 py-2">{item.actual.toFixed(0)}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.app ? ((item.actual * 100) / item.app).toFixed(0) : "-"}
                </td>
                <td className="border border-gray-300 px-4 py-2">{item.cply.toFixed(0)}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.cply
                    ? (((item.actual - item.cply) * 100) / item.cply).toFixed(0)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        !loading && <p className="text-gray-500">No data available. Adjust the inputs to fetch data.</p>
      )}
    </div>
  );
}
