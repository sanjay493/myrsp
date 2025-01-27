// components/custom/monthly-performance-form.jsx
"use client";

import { useState, useEffect } from "react";
import TableDispalyMthPerformance from "./table-display-mth-performance";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../ui/button";
import { FileText } from 'lucide-react';

export default function MonthlyPerformanceForm() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount for the current month
  useEffect(() => {
    fetchData(selectedDate);
  }, []);

  const fetchData = async (date) => {
    setLoading(true);
    setError(null);

    try {
      const formattedDate = date.toISOString().slice(0, 7).replace("-", ""); // Convert to `yyyyMM`
      console.log(formattedDate);
      const response = await fetch("/api/monthly-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mth: formattedDate }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user input and fetch data for the selected month
  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData(selectedDate);
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <label htmlFor="monthPicker" className="block font-bold">
            Select Month-Year:
          </label>
          <ReactDatePicker
            id="monthPicker"
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyyMM"
            showMonthYearPicker
            className="border rounded p-2"
          />
          {/* <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            
          </button> */}
          <Button > <FileText />  Fetch Data</Button>
        </div>
      </form>

      {loading ? (
        <p className="text-center my-8">Loading data...</p>
      ) : error ? (
        <p className="text-center my-8 text-red-600">{error}</p>
      ) : data.length > 0 ? (
        <TableDispalyMthPerformance data={data} />
      ) : (
        <p className="text-center my-8">No data available for the selected month.</p>
      )}
    </div>
  );
}
