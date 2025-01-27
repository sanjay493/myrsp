"use client";
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FileText } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const fetchData = async (params) => {
  const response = await fetch("/api/delay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) throw new Error("Failed to fetch data");

  const { data } = await response.json();
  return data;
};

export default function DelayForm() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [isUnit, setIsUnit] = useState(false);

  // State for initialDate, finalDate, unit
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [unit, setUnit] = useState("");

  // Handle fetch for user-supplied data
  const handleFetchData = async () => {
    try {
      const params = isUnit ? { unit } : { initialDate, finalDate };
      const fetchedData = await fetchData(params);
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setError("Failed to fetch data. Please try again.");
    }
  };

  // Group data by unit
  const groupByUnit = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.unit]) acc[item.unit] = [];
      acc[item.unit].push({ date: item.rpt_date, remark: item.remark });
      return acc;
    }, {});
  };

  // Group data by rpt_date
  const groupByDate = (data) => {
    return data.reduce((acc, item) => {
      const date = new Date(item.rpt_date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push({ unit: item.unit, remark: item.remark });
      return acc;
    }, {});
  };
  // Fetch default data
  const fetchDefaultData = async (params) => {
    try {
      const fetchedData = await fetchData(params);
  
      // Sort data by rpt_date in descending order
      const sortedData = fetchedData.sort(
        (a, b) => new Date(b.rpt_date) - new Date(a.rpt_date)
      );
  
      setData(sortedData);
    } catch (err) {
      console.error("Error fetching default data:", err.message);
      setError("Failed to load default data. Please try again.");
    }
  };
  

  useEffect(() => {
    const now = new Date();
  
    if (isUnit) {
      const defaultInitialDate = new Date(now - 10 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]; // 10 days ago
      const defaultFinalDate = now.toISOString().split("T")[0]; // Today's date
  
      // Fetch last 10 days' data for all units
      fetchDefaultData({ initialDate: defaultInitialDate, finalDate: defaultFinalDate });
    } else {
      const defaultInitialDate = new Date(now - 10 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]; // 10 days ago
      const defaultFinalDate = now.toISOString().split("T")[0]; // Today's date
  
      // Fetch data for the default date range
      fetchDefaultData({ initialDate: defaultInitialDate, finalDate: defaultFinalDate });
    }
  }, [isUnit]);
  
  // Group the data based on the toggle state
  const groupedData = isUnit ? groupByUnit(data) : groupByDate(data);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
    <div className="flex flex-row items-center bg-white shadow-md rounded-lg p-4 space-x-4">
          {/* <Button
            
            onClick={() => {
              setIsUnit(!isUnit);
              setData([]); // Clear data on toggle
            }}
           
          > <FileText className="mr-2" />
            Toggle to {isUnit ? "Date Range" : "Unit"}
          </Button> */}
        
          <div className="flex items-center space-x-2">
  <Switch
    id="toggle-mode"
    checked={isUnit}
    onCheckedChange={(checked) => {
      setIsUnit(checked);
      setData([]); // Clear data on toggle
    }}
  />
  <Label htmlFor="toggle-mode">
    Toggle to {isUnit ? "Date Range" : "Unit"}
  </Label>
</div>

        <div className="flex items-center space-x-4">
        {isUnit ? (
  <>
    <select
      value={unit}
      onChange={(e) => setUnit(e.target.value)}
      className="p-2 border border-gray-300 rounded shadow focus:ring focus:ring-blue-300"
    >
      <option value="">Select Unit</option>
      <option value="General">General</option>
      <option value="SP-1">SP-1</option>
      <option value="SP-2">SP-2</option>
      <option value="SP-3">SP-3</option>
      <option value="Old COBs">Old COBs</option>
      <option value="COB-6">COB-6</option>
      <option value="BF-1">BF-1</option>
      <option value="BF-5">BF-5</option>
      <option value="SMS-1">SMS-1</option>
      <option value="SMS-1 Converter P">SMS-1 Converter P</option>
      <option value="SMS-1 Converter Q">SMS-1 Converter Q</option>
      <option value="SMS-1 CCM-1">SMS-1 CCM-1</option>
      <option value="SMS-2">SMS-2</option>
      <option value="SMS-2 Converter A">SMS-2 Converter A</option>
      <option value="SMS-2 Converter B">SMS-2 Converter B</option>
      <option value="SMS-2 Converter C">SMS-2 Converter C</option>
      <option value="SMS-2 Caster-1">SMS-2 Caster-1</option>
      <option value="SMS-2 Caster-2">SMS-2 Caster-2</option>
      <option value="SMS-2 Caster-3">SMS-2 Caster-3</option>
      <option value="PM">PM</option>
      <option value="NPM">NPM</option>
      <option value="HSM-1">HSM-1</option>
      <option value="HSM-2 RHF-1">HSM-2 RHF-1</option>
      <option value="HSM-2 RHF-2">HSM-2 RHF-2</option>
      <option value="HSM-2">HSM-2</option>
      <option value="Others">Others</option>
      <option value="STG-2">STG-2</option>
      <option value="Galvanising line-1">Galvanising line-1</option>
      <option value="Galvanising line-2">Galvanising line-2</option>
      {/* Add more units as needed */}
    </select>
  </>
) : (
  <>
   <ReactDatePicker
                selected={initialDate}
                onChange={(date) => setInitialDate(date)}
                placeholderText="Initial Date"
                dateFormat="yyyy-MM-dd"
                className="p-2 border border-gray-300 rounded shadow focus:ring focus:ring-blue-300"
              />
              <ReactDatePicker
                selected={finalDate}
                onChange={(date) => setFinalDate(date)}
                placeholderText="Final Date"
                dateFormat="yyyy-MM-dd"
                className="p-2 border border-gray-300 rounded shadow focus:ring focus:ring-blue-300"
              />
  </>
)}

          <Button
           
            onClick={handleFetchData}
            
          >
            <FileText />
            Submit
          </Button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display Grouped Data */}
      {Object.keys(data).length > 0 ? (
         <div className="mt-6 bg-white p-4 shadow-md rounded-lg">
         <table className="table-auto border-collapse border border-gray-300 w-full">
           <thead>
             <tr className="bg-gray-200">
               <th className="border border-gray-300 px-4 py-2">
                  {isUnit ? "Unit" : "Date"}
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  {isUnit ? "Date" : "Unit"}
                </th>
                <th className="border border-gray-300 px-4 py-2">Remark</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedData).map((key) => (
                <React.Fragment key={key}>
                  <tr>
                    <td
                      className="border border-gray-300 px-4 py-2 font-bold"
                      rowSpan={groupedData[key].length}
                    >
                      {key}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {isUnit
                        ? new Date(groupedData[key][0].date).toLocaleDateString()
                        : groupedData[key][0].unit}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {groupedData[key][0].remark}
                    </td>
                  </tr>
                  {groupedData[key].slice(1).map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {isUnit
                          ? new Date(item.date).toLocaleDateString()
                          : item.unit}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.remark}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
