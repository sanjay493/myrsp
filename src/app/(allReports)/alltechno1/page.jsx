"use client";

import React, { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { exportToExcel } from '@/components/custom/exportToExcel';
import * as XLSX from 'xlsx';

function TechnoMetricsDashboard() {
  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [technoParameters, setTechnoParameters] = useState([]);
  const [filteredMetrics, setFilteredMetrics] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [yearmonthsRange, setYearmonthsRange] = useState(["202404", "202411"]);
  const [fyYearRange, setFyYearRange] = useState(["2023-24", "2024-25"]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/alltechno");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        // Remove duplicate techno parameters
        const uniqueTechnoParameters = Array.from(
          new Map(data.technoParameters.map((param) => [param.metric, param]))
            .values()
        );
        setTechnoParameters(uniqueTechnoParameters);

        // Extract unique units
        const uniqueUnits = [
          ...new Set(
            uniqueTechnoParameters.flatMap((param) => param.units)
          ),
        ];
        setUnits(uniqueUnits);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data from server.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter metrics based on selected units whenever `selectedUnits` changes
    const metrics = technoParameters.filter((param) =>
      param.units.some((unit) => selectedUnits.includes(unit))
    );
    setFilteredMetrics(metrics);
  }, [selectedUnits, technoParameters]);

  const handleUnitSelection = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setSelectedUnits(selectedOptions);
  };

  const handleMetricSelection = (event) => {
    const { value, checked } = event.target;
    setSelectedMetrics((prev) =>
      checked ? [...prev, value] : prev.filter((metric) => metric !== value)
    );
  };

  const handleSubmit = async () => {
    if (!selectedUnits.length) {
      alert("Please select at least one unit.");
      return;
    }
    if (!selectedMetrics.length) {
      alert("Please select at least one metric.");
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        units: selectedUnits,
        yearmonthsRange: yearmonthsRange.filter(Boolean),
        fyYearRange: fyYearRange.filter(Boolean),
        technoParameters: selectedMetrics,
      };

      const response = await fetch("/api/alltechno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log(result.data);
      setData(result.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const uniquePeriods = Array.from(
    new Set(
      data?.flatMap((unitData) =>
        unitData.metrics.flatMap((metric) =>
          metric.values.map((value) => value.period.fyear || value.period.mth)
        )
      )
    )
  ).sort();

  function formatMonth(yyyymm) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = yyyymm.slice(0, 4);
    const month = parseInt(yyyymm.slice(4, 6), 10);
    const shortMonth = monthNames[month - 1];
    const shortYear = year.slice(2);
    return `${shortMonth}'${shortYear}`;
  }
  const handleDownload = () => {
    if (!data || data.length === 0) {
        alert("No data to download.");
        return;
    }

    // Create headers for the Excel sheet
    const headers = ["Unit", "Description", "Measuring Unit", ...uniquePeriods];
    
    // Prepare worksheet data with headers
    const worksheetData = [headers];

    // Prepare data rows, including merging "Unit" cells
    const merges = [];
    let currentRow = 1; // Start after headers


    data.forEach((unitData) => {
        unitData.metrics.forEach((metric, metricIndex) => {
            const row = [
                metricIndex === 0 ? unitData.unit : "", // Only first metric row gets the unit name
                metric.description,
                metric.measuringUnit,
                ...uniquePeriods.map((period) => {
                    const valueObj = metric.values.find(
                        (value) =>
                            (value.period.fyear || value.period.mth) === period
                    );
                    return valueObj ? valueObj.value : "-";
                }),
            ];
            worksheetData.push(row);

            // Add merge information for "Unit" column
            if (metricIndex === 0 && unitData.metrics.length > 1) {
                merges.push({
                    s: { r: currentRow, c: 0 }, // Start cell (row, col)
                    e: { r: currentRow + unitData.metrics.length - 1, c: 0 }, // End cell
                });
            }

            currentRow += 1;
        });
    });

    // Create worksheet and apply merges
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    if (merges.length) {
        worksheet["!merges"] = merges;
    }

    // Apply styles for headers
    const headerRow = worksheetData[0];
    headerRow.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
        if (!worksheet[cellAddress]) return;
        worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4CAF50" } }, // Green background
            alignment: { horizontal: "center", vertical: "center" },
        };
    });

    // Adjust column widths
    worksheet["!cols"] = headers.map(() => ({ wpx: 120 })); // Set all columns to 120px

    // Create workbook and export
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Displayed Data");
    XLSX.writeFile(workbook, "DisplayedData.xlsx");
};



  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Techno Dashboard</h1>

      {/* Unit Selection */}
      <div className="mb-6 border p-4 rounded-lg shadow-sm border-red-600">
        <h2 className="font-bold text-lg mb-2 text-blue-600">Select Units</h2>
        <div className="grid grid-cols-4 gap-2">
          {units.map((unit) => (
            <label
              key={unit}
              className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200"
            >
              <input
                type="checkbox"
                value={unit}
                onChange={(e) =>
                  setSelectedUnits((prev) =>
                    e.target.checked
                      ? [...prev, e.target.value]
                      : prev.filter((u) => u !== e.target.value)
                  )
                }
                className="accent-blue-500"
              />
              <span className="text-gray-800">{unit}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Techno Parameter Options */}
      {selectedUnits.length > 0 && (
        <div className="mt-6 border p-4 rounded-lg shadow-sm border-red-600 mb-6">
          <h2 className="font-bold text-lg mb-2">Select Techno Parameters</h2>
          <div className="grid grid-cols-3 gap-4">
            {filteredMetrics.map((param) => (
              <label
                key={param.metric}
                className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200"
              >
                <input
                  type="checkbox"
                  value={param.metric}
                  onChange={handleMetricSelection}
                  className="accent-blue-500"
                />
                <span className="text-gray-800">{param.description}</span>
              </label>
            ))}
          </div>
        </div>
      )}

    
      <div className="grid grid-cols-2 md:grid-col-1 gap-4 mb-6 border p-4 rounded-lg shadow-sm border-red-600">
         {/* Year-Month Range Selection */}
      <div className="mb-4">
        <h2 className="font-bold">Select Year-Month Range</h2>
        <div className="flex gap-4">
          <label>
            Start Month:
            <ReactDatePicker
        selected={
          yearmonthsRange[0] ? new Date(yearmonthsRange[0].slice(0, 4), yearmonthsRange[0].slice(4) - 1) : null
        }
        onChange={(date) => {
          const formattedDate = date
            ? `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`
            : "";
          setYearmonthsRange([formattedDate, yearmonthsRange[1]]);
        }}
        dateFormat="yyyyMM"
        showMonthYearPicker
        className="border rounded p-2"
      />
    </label>
    <label>
      End Month:
      <ReactDatePicker
        selected={
          yearmonthsRange[1] ? new Date(yearmonthsRange[1].slice(0, 4), yearmonthsRange[1].slice(4) - 1) : null
        }
        onChange={(date) => {
          const formattedDate = date
            ? `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`
            : "";
          setYearmonthsRange([yearmonthsRange[0], formattedDate]);
        }}
        dateFormat="yyyyMM"
        showMonthYearPicker
        className="border rounded p-2"
      />
           
          </label>
        </div>
      </div>
{/* Financial year range Selection */}
<div className="mb-4">
  <h2 className="font-bold">Select Financial Year Range</h2>
  <div className="flex gap-4">
    <label>
      Start :
      <select
        value={fyYearRange[0]}
        onChange={(e) => setFyYearRange([e.target.value, fyYearRange[1]])}
        className="border rounded px-2 py-1"
      >
        <option value="" disabled>Select Start Year</option>
        {Array.from({ length: 25 }, (_, i) => {
          const startYear = 2007 + i;
          const endYear = startYear + 1;
          return (
            <option key={startYear} value={`${startYear}-${endYear % 100}`}>
              FY {startYear}-{endYear % 100}
            </option>
          );
        })}
      </select>
    </label>
    <label>
      End :
      <select
        value={fyYearRange[1]}
        onChange={(e) => setFyYearRange([fyYearRange[0], e.target.value])}
        className="border rounded px-2 py-1"
      >
        <option value="" disabled>Select End Year</option>
        {Array.from({ length: 25 }, (_, i) => {
          const startYear = 2007 + i;
          const endYear = startYear + 1;
          return (
            <option key={startYear} value={`${startYear}-${endYear % 100}`}>
              FY {startYear}-{endYear % 100}
            </option>
          );
        })}
      </select>
    </label>
  </div>
</div>

      
      </div>
       
      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Fetching..." : "Fetch Data"}
      </button>

      {/* Data Table */}
      {data && data.length > 0 && !loading && (
        <div className="mt-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Results</h2>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="table-auto w-full border-collapse border border-gray-300 bg-white">
              <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Unit
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    Measuring Unit
                  </th>
                  {uniquePeriods.map((period) => (
                    <th
                      key={period}
                      className="border border-gray-300 px-4 py-3 text-center"
                    >
                      {period.length === 6 ? formatMonth(period) : period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((unitData) =>
                  unitData.metrics.map((metric, metricIndex) => (
                    <tr key={`${unitData.unit}-${metricIndex}`}>
                      {metricIndex === 0 && (
                        <td
                          rowSpan={unitData.metrics.length}
                          className="border border-gray-300 px-4 py-3 font-medium text-gray-800"
                        >
                          {unitData.unit}
                        </td>
                      )}
                      <td className="border border-gray-300 px-4 py-3 text-gray-600">
                        {metric.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-600">
                        {metric.measuringUnit}
                      </td>
                      {uniquePeriods.map((period) => {
                        const valueObj = metric.values.find(
                          (value) =>
                            (value.period.fyear || value.period.mth) === period
                        );
                        return (
                          <td
                            key={`${metricIndex}-${period}`}
                            className="border border-gray-300 px-4 py-3 text-gray-600 text-center"
                          >
                            {valueObj ? valueObj.value.toFixed(2)  : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Download Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnoMetricsDashboard;
