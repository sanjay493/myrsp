"use client";

import { useState, useEffect } from "react";

const YrlyProdnManager = () => {
  const [prodnData, setProdnData] = useState([]);
  const [years, setYears] = useState([]); // To store all unique fiscal years dynamically

  const fetchProdn = async () => {
    try {
      const response = await fetch("/api/yrlyProdnWithCapUt"); // API endpoint for merged data
      const data = await response.json();

      // Extract unique fiscal years dynamically from the data
      const allYears = new Set();
      data.data.forEach((unit) => {
        unit.productionData.forEach((prod) => {
          allYears.add(prod.fy_year);
        });
      });

      setYears([...allYears].sort()); // Sort years for proper display order
      setProdnData(data.data); // Merged data from the backend
    } catch (error) {
      console.error("Error fetching Prodn:", error);
    }
  };

  useEffect(() => {
    fetchProdn();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Annual Production Report</h1>

      <div className="overflow-auto">
        <table className="table-auto w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">Unit</th>
              <th className="border border-gray-400 px-4 py-2">Capacity(MTPA)</th>
              {/* Dynamically generate year columns */}
              {years.map((year) => (
                <th key={year} className="border border-gray-400 px-4 py-2">
                  {year} (Prodn / %CU)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prodnData.map((unit) => (
              <tr key={unit.unit} className="hover:bg-gray-100">
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {unit.unit}
                </td>
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {unit.capacity}
                </td>
                {years.map((year) => {
                  const production = unit.productionData.find(
                    (prod) => prod.fy_year === year
                  );
                  return (
                    <td
                      key={year}
                      className="border border-gray-400 px-4 py-2 text-center"
                    >
                      {production ? (
                        <>
                         <div className="flex flex-col items-center">
                         <span>{production.prodn}</span>
                          {production.percentCU !== null && production.percentCU !== undefined && (
                            <span
                              className={`ml-2 font-semibold ${production.percentCU > 90
                                  ? "text-green-600"
                                  : production.percentCU > 70
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                            >
                               {production.percentCU}%
                            </span>
                          )}
                          </div>
                        </>
                      ) : (
                        "-"
                        
                      )}

                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default YrlyProdnManager;
