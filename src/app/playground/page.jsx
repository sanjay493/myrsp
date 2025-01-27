"use client";

import React, { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MultiUnitGraph from "@/components/custom/MultiUnitGraph";

const Playground = () => {
  const Comparisons2 = [
    { label: "BF-1", value: "BF-1" },
    { label: "BF-5", value: "BF-5" },
    { label: "SMS-1", value: "SMS-1" },
    { label: "SMS-2", value: "SMS-2" },
    { label: "HSM-2", value: "HSM-2" },
    { label: "NPM", value: "NPM" },
    { label: "PM", value: "PM" },
    { label: "SP-1", value: "SP-1" },
    { label: "SP-2", value: "SP-2" },
    { label: "SP-3", value: "SP-3" },
  ];

  const financialYears = [
    "2024-25",
    "2023-24",
    "2022-23",
    "2021-22",
    "2020-21",
  ];

  const [graphType, setGraphType] = useState("bar");
  const [duration, setDuration] = useState("monthly");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [comparisonUnit, setComparisonUnit] = useState([]);
  const [startFy, setStartFy] = useState(financialYears[0]);
  const [endFy, setEndFy] = useState(financialYears[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (dateType, value) => {
    if (duration === "annual") {
      if (dateType === "start") setStartFy(value);
      if (dateType === "end") setEndFy(value);
    } else {
      if (dateType === "start") setStartDate(value);
      if (dateType === "end") setEndDate(value);
    }
  };
  

  const getDatePicker = (dateType, selectedDate) => {
    if (duration === "annual") {
      return (
        <select
          value={dateType === "start" ? startFy : endFy}
          onChange={(e) => handleDateChange(dateType, e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {financialYears.map((fy) => (
            <option key={fy} value={fy}>
              {fy}
            </option>
          ))}
        </select>
      );
    }
  
    // For other durations
    const commonProps = {
      selected: selectedDate,
      onChange: (date) => handleDateChange(dateType, date),
      className: "p-2 border rounded w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
    };
  
    if (duration === "daily") {
      return <DatePicker {...commonProps} dateFormat="yyyy-MM-dd" placeholderText="Select a date" />;
    }
    if (duration === "monthly") {
      return <DatePicker {...commonProps} dateFormat="yyyyMM" showMonthYearPicker placeholderText="Select a month" />;
    }
  };
  
  const formatDate = (date) => {
    if (!date) return "";
  
    if (duration === "annual") {
      return date; // For annual, `date` is already a string like "2024-25"
    }
  
    // Adjust date to the previous day for other durations
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate());
  
    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
    const day = String(adjustedDate.getDate()).padStart(2, "0");
  
    if (duration === "daily") {
      return `${year}-${month}-${day}`;
    }
    if (duration === "monthly") {
      return `${year}${month}`;
    }
  };
  
  



  const fetchData = async () => {
    if (!comparisonUnit.length) {
      alert("Please select at least one unit.");
      return;
    }
    if (duration !== "annual" && (!startDate || !endDate)) {
      alert("Please select valid start and end dates.");
      return;
    }
  
    setLoading(true);
  
    try {
      const requestBody = {
        units: comparisonUnit,
        startDate: duration === "annual" ? startFy : formatDate(startDate),
        endDate: duration === "annual" ? endFy : formatDate(endDate),
      };
  
      const response = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="p-6 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Production Performance Playground</h2>

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 p-2 border rounded-lg bg-gray-50 shadow-md">
            <div className="flex flex-col gap-4">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="p-3 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>

              {/* Start Period */}
              {getDatePicker("start", startDate)}

              {/* End Period */}
              {getDatePicker("end", endDate)}
            </div>
          </div>

          <div className="flex-1 p-2 border rounded-lg bg-gray-50 shadow-md">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setGraphType("line")}
                className={`p-3 rounded ${
                  graphType === "line" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                Line Graph
              </button>
              <button
                onClick={() => setGraphType("bar")}
                className={`p-3 rounded ${
                  graphType === "bar" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                Bar Graph
              </button>
            </div>
          </div>

          <div className="flex-auto p-2 border rounded-lg bg-gray-50 shadow-md">
            <div className="mb-6 border p-4 rounded-lg shadow-sm border-red-600">
              <h2 className="font-bold text-lg mb-2 text-blue-600">Select Units</h2>
              <div className="flex flex-wrap gap-2">
                {Comparisons2.map((unit) => (
                  <label key={unit.value} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      value={unit.value}
                      onChange={(e) =>
                        setComparisonUnit((prev) =>
                          e.target.checked
                            ? [...prev, e.target.value]
                            : prev.filter((u) => u !== e.target.value)
                        )
                      }
                      className="accent-blue-500"
                    />
                    <span className="text-gray-800">{unit.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>

      {loading ? (
        <p className="text-center mt-6">Loading...</p>
      ) : data.length > 0 ? (
        <MultiUnitGraph combinedDataForAllUnits={data} graphType={graphType} />
      ) : null}
    </>
  );
};

export default Playground;
