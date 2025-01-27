"use client";

import React, { useState, useEffect } from "react";

const Records = () => {
    const [dataComb, setDataComb] = useState([]); // State for the combined data
    const [loading, setLoading] = useState(true); // State to manage loading
    const [error, setError] = useState(null); // State for errors

    // Helper function to format month strings
    const formatMonth = (monthStr) => {
        if (!monthStr || monthStr.length !== 6) return "";
        const year = monthStr.slice(0, 4);
        const month = monthStr.slice(4);
        const date = new Date(year, parseInt(month) - 1);
        return `${date.toLocaleString("default", { month: "short" })}'${year}`;
    };

    // Helper function to check if a period is in 2024
    const isAfter2024 = (periodStr) => {
        if (!periodStr) return false; // Handle empty or null strings
    
        // Default comparison date: 2024-04-01
        const comparisonDate = new Date(2024, 3, 1); // Months are zero-based in JavaScript Date
    
        let dateToCheck;
    
        // Format: "yyyy-mm-dd"
        if (periodStr.includes("-") && periodStr.length === 10) {
            dateToCheck = new Date(periodStr);
        } 
        // Format: "yyyy-yyyy" or "yyyy/yyyy"
        else if (periodStr.includes("/") || periodStr.includes("-")) {
            const year = periodStr.split(/[-/]/)[0];
            dateToCheck = new Date(year, 0, 1); // Assume January 1st for this format
        } 
        // Format: "yyyymm"
        else if (periodStr.length === 6) {
            const year = periodStr.slice(0, 4);
            const month = parseInt(periodStr.slice(4, 6), 10) - 1; // Convert 1-based to 0-based month
            dateToCheck = new Date(year, month, 1);
        } 
        // Format: "yyyy"
        else if (periodStr.length === 4) {
            const year = parseInt(periodStr, 10);
            dateToCheck = new Date(year, 0, 1); // Assume January 1st for year-only format
        } else {
            return false; // Invalid format
        }
    
        // Return true if the date is greater than 2024-04-01
        return dateToCheck > comparisonDate;
    };
    


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response_yr = await fetch("http://localhost:3000/api/yrlyHighest");
                if (!response_yr.ok) {
                    throw new Error("Failed to fetch yearly data");
                }
                const response_mth = await fetch("http://localhost:3000/api/mthlyHighest");
                if (!response_mth.ok) {
                    throw new Error("Failed to fetch monthly data");
                }
                const response_daily = await fetch("http://localhost:3000/api/dailyHighest");
                if (!response_daily.ok) {
                    throw new Error("Failed to fetch daily data");
                }

                const data_yr = await response_yr.json();
                const data_mth = await response_mth.json();
                const data_daily = await response_daily.json();

                if (Array.isArray(data_yr.data)) {
                    const data_comb = data_yr.data.map((yrItem) => {
                        const mthItem = data_mth.data.find((mthItem) => mthItem.unit === yrItem.unit);
                        const dailyItem = data_daily.data.find((dailyItem) => dailyItem.unit === yrItem.unit);

                        return {
                            unit: yrItem.unit,
                            fy_year: yrItem.fy_year,
                            fy_prodn: yrItem.prodn.toFixed(0),
                            mth: mthItem ? mthItem.mth : null,
                            mth_prodn: mthItem ? mthItem.prodn : null,
                            rpt_date: dailyItem ? dailyItem.rpt_date : null,
                            daily_prodn: dailyItem ? dailyItem.prodn : null,
                        };
                    });

                    setDataComb(data_comb);
                } else {
                    console.error("data_yr is not an array", data_yr);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center mt-6 text-gray-600">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-6 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="mx-auto max-w-4xl p-4">
            <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                Annual, Monthly, and Daily Records
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="text-sm uppercase font-semibold bg-indigo-200">
                        <tr>
                            <th className="py-3 px-4 text-left">Unit</th>
                            <th className="py-3 px-4 text-left">Annual Production</th>
                            <th className="py-3 px-4 text-left">Monthly Production</th>
                            <th className="py-3 px-4 text-left">Daily Production</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataComb.map((item, index) => (
                            <tr key={index} className={`${"bg-white"} hover:bg-gray-200`}>
                                <td className="py-2 px-4 font-medium text-gray-800">{item.unit}
                                </td>
                                <td className={`py-2 px-4 ${
                                        isAfter2024(item.fy_year) ? "bg-yellow-200 font-semibold" : "py-2 px-4 font-medium text-gray-800"
                                    }`}>
                                    <div className="">
                                        {item.fy_prodn || "-"}
                                    </div>
                                    <div className="text-sm text-gray-500 ">
                                        {item.fy_year || ""}
                                    </div>
                                </td>
                                <td
                                    className={`py-2 px-4 ${
                                        isAfter2024(item.mth) ? "bg-yellow-200 font-semibold" : "py-2 px-4 font-medium text-gray-800"
                                    }`}
                                >
                                    {console.log(item.mth,isAfter2024(item.mth))}
                                    <div className="">
                                        {item.mth_prodn || "-"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatMonth(item.mth) || ""}
                                    </div>
                                </td>
                                <td className={`py-2 px-4 ${
                                        isAfter2024(item.rpt_date) ? "bg-yellow-200 font-semibold" : "py-2 px-4 font-medium text-gray-800"
                                    }`}>
                                    <div className="">
                                        {item.daily_prodn || "-"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {item.rpt_date || ""}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Records;
