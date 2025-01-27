"use client";
import { Button } from "@/components/ui/button";
import { ArrowBigDownDash } from "lucide-react";
import { FileText } from 'lucide-react';
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
      <h1 className="text-xl font-bold mb-4">Techno Dashboard</h1>

      {/* Unit Selection */}
      <div className="mb-6 border rounded-lg shadow-sm border-red-600 bg-[#f7ede2]">
        <h2 className="font-bold text-sm text-blue-600">Select Units</h2>
        <div className="grid grid-cols-5 gap-2 p-3 ">
          {units.map((unit) => (
            <label
              key={unit}
              className="flex items-center gap-3 bg-[#F28482]  rounded-lg shadow-md cursor-pointer hover:bg-blue-50 transition-all ease-in-out duration-300"
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
                className="mx-3 "
              />
              <span className="text-gray-800 pl-4">{unit}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Techno Parameter Options */}
      {selectedUnits.length > 0 && (
    <div className="mt-6 border p-6 rounded-lg shadow-md border-red-600 mb-6">
    <h2 className="font-bold text-sm mb-4 text-blue-600">Select Techno Parameters</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredMetrics.map((param) => (
        <label
          key={param.metric}
          className="flex items-center gap-2 bg-gray-50  rounded-lg shadow-md cursor-pointer hover:bg-blue-50 transition-all ease-in-out duration-300"
        >
          <input
            type="checkbox"
            value={param.metric}
            onChange={handleMetricSelection}
            className="accent-blue-500 rounded-md"
          />
          <span className="text-gray-700 font-medium">{param.description}</span>
        </label>
      ))}
    </div>
  </div>
  
      )}

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border p-6 rounded-lg shadow-md border-red-600">
  {/* Year-Month Range Selection */}
  <div className="mb-6">
    <h2 className="font-bold text-sm text-gray-800 mb-3">Select Year-Month Range</h2>
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
      <label className="flex-1">
        <span className="block text-gray-700">Start Month:</span>
        <ReactDatePicker
          selected={
            yearmonthsRange[0]
              ? new Date(yearmonthsRange[0].slice(0, 4), yearmonthsRange[0].slice(4) - 1)
              : null
          }
          onChange={(date) => {
            const formattedDate = date
              ? `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`
              : "";
            setYearmonthsRange([formattedDate, yearmonthsRange[1]]);
          }}
          dateFormat="yyyyMM"
          showMonthYearPicker
          className="border rounded p-3 w-full text-gray-800 font-medium"
        />
      </label>
      <label className="flex-1">
        <span className="block text-gray-700">End Month:</span>
        <ReactDatePicker
          selected={
            yearmonthsRange[1]
              ? new Date(yearmonthsRange[1].slice(0, 4), yearmonthsRange[1].slice(4) - 1)
              : null
          }
          onChange={(date) => {
            const formattedDate = date
              ? `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`
              : "";
            setYearmonthsRange([yearmonthsRange[0], formattedDate]);
          }}
          dateFormat="yyyyMM"
          showMonthYearPicker
          className="border rounded p-3 w-full text-gray-800 font-medium"
        />
      </label>
    </div>
  </div>

  {/* Financial Year Range Selection */}
  <div className="mb-6">
    <h2 className="font-bold text-sm text-gray-800 mb-3">Select Financial Year Range</h2>
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
      <label className="flex-1">
        <span className="block text-gray-700">Start:</span>
        <select
          value={fyYearRange[0]}
          onChange={(e) => setFyYearRange([e.target.value, fyYearRange[1]])}
          className="border rounded px-4 py-2 w-full text-gray-800 font-medium"
        >
          <option value="" disabled className="text-gray-500">
            Select Start Year
          </option>
          {Array.from({ length: 25 }, (_, i) => {
            const startYear = 2007 + i;
            const endYear = startYear + 1;
            return (
              <option
                key={startYear}
                value={`${startYear}-${endYear % 100}`}
                className="text-gray-800"
              >
                FY {startYear}-{endYear % 100}
              </option>
            );
          })}
        </select>
      </label>
      <label className="flex-1">
        <span className="block text-gray-700">End:</span>
        <select
          value={fyYearRange[1]}
          onChange={(e) => setFyYearRange([fyYearRange[0], e.target.value])}
          className="border rounded px-4 py-2 w-full text-gray-800 font-medium"
        >
          <option value="" disabled className="text-gray-500">
            Select End Year
          </option>
          {Array.from({ length: 25 }, (_, i) => {
            const startYear = 2007 + i;
            const endYear = startYear + 1;
            return (
              <option
                key={startYear}
                value={`${startYear}-${endYear % 100}`}
                className="text-gray-800"
              >
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
      <Button
  
  className={`px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
  disabled={loading} onClick={handleSubmit}
>
  <FileText className="mr-2" />
  {loading ? "Fetching..." : "Fetch Data"}
</Button>

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
  {data.map((unitData) => (
    <React.Fragment key={unitData.unit}>
      {unitData.metrics.map((metric, metricIndex) => (
        <tr
        
          key={`${unitData.unit}-${metric.length}-${metric.description} || 'unknown'-${metric.metric}`}
          className="border border-gray-300 text-gray-700"
        >
          {/* console.log(key)  key={`${metric.period || 'unknown'}-${period || 'unknown'}`}   */}
          {/* Unit name displayed only for the first metric row */}
          {metricIndex === 0 && (
            <td
              rowSpan={unitData.metrics.length}
              className="border border-gray-300 px-4 py-3 text-left font-medium"
            >
              {unitData.unit}
            </td>
          )}
          <td className="border border-gray-300 px-4 py-3 text-left">
            {metric.description}
          </td>
          <td className="border border-gray-300 px-4 py-3 text-left">
            {metric.measuringUnit}
          </td>
          {uniquePeriods.map((period) => {
            const valueObj = metric.values.find(
              (value) =>
                (value.period.fyear || value.period.mth) === period
            );
            const key = `${metric.period}-${period || 'unknown'}`;
            // console.log(key);
            

            return (
              <td
                key={key}
                className="border border-gray-300 px-4 py-3 text-center"
              >
               {valueObj ? (Number(valueObj.value).toFixed(2)) : "-"}

              </td>
            );
          })}
        </tr>
      ))}
    </React.Fragment>
  ))}
</tbody>

            </table>
            <Button onClick={handleDownload}>
            <ArrowBigDownDash />
                Download Excel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnoMetricsDashboard;
