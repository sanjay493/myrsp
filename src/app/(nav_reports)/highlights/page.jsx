"use client";
import React, { useEffect, useState } from "react";

// Helper function to format month
function formatMonth(yyyymm) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = yyyymm.slice(0, 4);
  const month = parseInt(yyyymm.slice(4, 6), 10);
  const shortMonth = monthNames[month - 1];
  const shortYear = year.slice(2);
  return `${shortMonth}'${shortYear}`;
}

function formatMonthOnly(mm) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = parseInt(mm);
  const shortMonth = monthNames[month - 1];
  return `${shortMonth}`;
}

const Highlights = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/highlights");
      const result = await response.json();
      setData(result);
    }
    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  const { unitWiseBestPerformance, bestCalendarMonthWithComparison } = data;

  // Calendar month order
  const calendarMonthOrder = [
    "04", "05", "06", "07", "08", "09", "10", "11", "12", "01", "02", "03",
  ];

  return (
   
     <>
      <section className="my-2">
        <h2 className="text-lg font-semibold text-center ">Calendar Month-Wise Best Performance</h2>
        <table className="table-auto border-collapse border  w-full">
          <thead>
            <tr className="border  bg-indigo-100">
              <th className="px-4 py-2">Unit</th>
              {calendarMonthOrder.map((month) => (
                <th className="border-white px-4 py-2" key={month}>
                  {formatMonthOnly(month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(bestCalendarMonthWithComparison).map(([unit, records]) => (
              <tr key={unit}>
                <td className="border border-white bg-indigo-100 px-4 py-2 font-bold">{unit}</td>
                {calendarMonthOrder.map((month) => {
                  const record = records.find((entry) => entry.month === month);
                  const isBest = record && record.mth === unitWiseBestPerformance[unit]?.mth;

                  return (
                    <td
                      key={month}
                      className={`border border-gray-300 px-4 py-2 ${
                        isBest ? "bg-yellow-200 font-semibold" : ""
                      }`}
                    >
                      {record ? (
                        <div className="flex flex-col">
                          <span className="text-blue-500">
                            {record.prodn} ({formatMonth(record.mth)})
                          </span>
                          <span className="text-gray-500">
                             {record.secondBestProdn || "N/A"}{" "}
                            {record.secondBestMth ? `(${formatMonth(record.secondBestMth)})` : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
   

</>

  );
};

export default Highlights;
