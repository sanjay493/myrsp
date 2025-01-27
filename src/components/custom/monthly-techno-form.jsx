"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fetchData = async (params) => {
  const response = await fetch("/api/monthly-techno", {
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

export default function MonthlyTechnoForm() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [isYearInput, setIsYearInput] = useState(false); // Toggle state

  // State for months
  const [initialMonth, setInitialMonth] = useState("");
  const [finalMonth, setFinalMonth] = useState("");

  // State for years
  const [initialYear, setInitialYear] = useState("");
  const [finalYear, setFinalYear] = useState("");

  // Fetch default data
  const fetchDefaultData = async (params) => {
    try {
      console.log("Default Parameters:", params); // Debug log

      // Convert years to strings if they are integers
      if (params.initialYear !== undefined) {
        params.initialYear = params.initialYear.toString();
        params.finalYear = params.finalYear.toString();
      }

      const fetchedData = await fetchData(params);
      setData(groupDataByUnit(fetchedData));
    } catch (err) {
      console.error("Error fetching default data:", err.message);
      setError("Failed to load default data. Please try again.");
    }
  };

  // Handle fetch for user-supplied data
  const handleFetchData = async () => {
    let params;

    if (isYearInput) {
      // Validate year inputs
      if (!/^\d{4}$/.test(initialYear) || !/^\d{4}$/.test(finalYear)) {
        setError("Years must be in the format yyyy.");
        return;
      }

      params = { initialYear: initialYear.toString(), finalYear: finalYear.toString() }; // Ensure string format
    } else {
      // Validate month inputs
      if (!/^\d{6}$/.test(initialMonth) || !/^\d{6}$/.test(finalMonth)) {
        setError("Months must be in the format yyyymm.");
        return;
      }

      params = { initialMonth, finalMonth };
    }

    try {
      console.log("User Input Parameters:", params); // Debug log
      setError(""); // Clear previous errors
      const fetchedData = await fetchData(params);
      setData(groupDataByUnit(fetchedData));
    } catch (err) {
      console.error("Error fetching user-requested data:", err.message);
      setError("Failed to fetch data. Please check your input.");
    }
  };

  // Group data by unit for table rendering
  const groupDataByUnit = (data) => {
    const grouped = {};
    data.forEach((item) => {
      if (!grouped[item.Equip]) {
        grouped[item.Equip] = {};
      }
      grouped[item.Equip][item.mth || item.yyyy] = item; // Handle both mth and yyyy
    });
    return grouped;
  };

  // Load default data on component mount or toggle switch
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    if (isYearInput) {
      // Default yearly data: last 5 years
      fetchDefaultData({ initialYear: (year - 5).toString(), finalYear: year.toString() });
    } else {
      // Default monthly data: April to current month of the current fiscal year
      const defaultInitialMonth = `${month >= "04" ? year : year - 1}04`;
      const defaultFinalMonth = `${year}${month}`;
      fetchDefaultData({ initialMonth: defaultInitialMonth, finalMonth: defaultFinalMonth });
    }
  }, [isYearInput]);


  // Field Mappings for Table Headers
  const fieldMappings = {
    mth: "Month",
    Equip: "Units",
    production: "Production",
    productivity_WV: "Productivity (W. V)",
    AVPerc: "Availability",
    UtPerc: "Utilization",
    cokeRate: "Coke Rate",
    cdiRate: "CDI Rate",
    nutCokeRate: "Nut Coke Rate",
    fuelRate: "Fuel Rate",
    carbonRate: "Carbon Rate",
    pelletRate_dry: "Pellet Rate (Dry)",
    IBRM_Rate_dry: "IBRM Rate (Dry)",
    sinterPercinBurden_dry: "Sinter% in Burden (Dry)",
    pelletPercinBurden_dry: "Pellet% in Burden (Dry)",
    slagRate: "Slag Rate",
    avgHBT: "Average HBT",
    oxygenEnrichmentPerc: "O2 Enrichment",
    siAvg: "Average Si",
    sAvg:"Average S",
  };

  return (
    <div className="">
      <div className="flex flex-row items-center outline outline-2 outline-stone-200 fade-out-5">
        <div className="flex items-center space-x-4 p-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsYearInput(!isYearInput);
              setData([]); // Clear data on toggle
            }}
            className="px-4 py-2"
          >
            Toggle to {isYearInput ? "Month Input" : "Year Input"}
          </Button>
        </div>
        <div className="flex items-center space-x-4 p-4">
          {isYearInput ? (
            <>
              <Input
                type="text"
                value={initialYear}
                onChange={(e) => setInitialYear(e.target.value)}
                placeholder="Initial Year (yyyy)"
                className="p-2 border rounded"
              />
              <Input
                type="text"
                value={finalYear}
                onChange={(e) => setFinalYear(e.target.value)}
                placeholder="Final Year (yyyy)"
                className="p-2 border rounded"
              />
            </>
          ) : (
            <>
              <Input
                type="text"
                value={initialMonth}
                onChange={(e) => setInitialMonth(e.target.value)}
                placeholder="Initial Month (yyyymm)"
                className="p-2 border rounded"
              />
              <Input
                type="text"
                value={finalMonth}
                onChange={(e) => setFinalMonth(e.target.value)}
                placeholder="Final Month (yyyymm)"
                className="p-2 border rounded"
              />
            </>
          )}
          <Button
            variant="ghost"
            onClick={handleFetchData}
            className="px-4 py-2"
          >
            Submit
          </Button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {Object.keys(data).length > 0 ? (
        <table className="w-full border-collapse my-5 text-left text-sm md:text-base">
          <thead>
            <tr>
              <th>Techno Parameters Unitwise</th>
            </tr>
            <tr>
              <th></th>
              {Object.keys(data[Object.keys(data)[0]]).map((period) => (
                <th key={period} className="text-left">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([unit, periodData]) => (
              <React.Fragment key={unit}>
                <tr>
                  <td colSpan={Object.keys(periodData).length + 1}>
                    <strong>{unit}</strong>
                  </td>
                </tr>
                {Object.entries(periodData[Object.keys(periodData)[0]]).map(
                  ([field, _], index) =>
                    field !== "_id" &&
                    field !== "Equip" &&
                    field !== "mth" &&
                    field !== "yyyy" && (
                      <tr key={index}>
                        <td>{fieldMappings[field] || field}</td>
                        {Object.keys(periodData).map((period) => (
                          <td key={period}>{periodData[period][field] || ""}</td>
                        ))}
                      </tr>
                    )
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
