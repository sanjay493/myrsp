"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const MyResponsiveLine = ({ data }) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 10, right: 10, bottom: 50, left: 60 }}
    xScale={{ type: "point" }}
    // colors={{ scheme: 'pastel1' }}
    yScale={{
      type: "linear",
      min: "auto",
      max: "auto",
      stacked: false, // Use stacked: false for a bump chart
      reverse: false,
    }}
    yFormat=" >-.2f"
    axisTop={null}
    axisRight={null}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Date",
      legendOffset: 36,
      legendPosition: "middle",

    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Production",
      legendOffset: -50,
      legendPosition: "middle",
    }}
    pointSize={10}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabel="y"
    pointLabelYOffset={-12}
    enableCrosshair={true}
    useMesh={true}
    enableSlices="x"
    colors={{ scheme: "category10" }} // Use a color scheme for better visualization
  />
);

export default function BfShopSmsChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  const fetchBfShopData = async () => {
    try {
      const response = await fetch("/api/graph_hm_cs_ss"); // Adjust the URL if necessary
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      // console.log("Fetched data:", result.data);
      return result.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
      return [];
    }
  };

  // Transform data for the bump chart
  const transformDataForBump = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const categories = [
      { key: "bfShopOndtProdn", label: "Hot Metal" },
      { key: "smsSumOndtProdn", label: "Crude Steel" },
      { key: "finishedSteelOndtProdn", label: "Finished Steel" },
    ];
    const dateFormatter = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
     
    });

    return categories.map((category) => ({
      _id: category.key, // Add an _id field for each category
      id: category.label,
      data: data
        .filter((item) => item.rpt_date && item[category.key] !== undefined) // Ensure valid data
        .map((item) => ({
          x: dateFormatter.format(new Date(item.rpt_date)), // Format date to 'DD MMM'
          y: item[category.key],
        })),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchBfShopData();
      const formattedData = transformDataForBump(data);
      // console.log("Transformed data:", formattedData);
      setChartData(formattedData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hot Metal || Crude Steel || Saleable SteelProduction Trends</CardTitle>
        {/* <CardDescription>Visualize production trends over time for Hot Metal, Crude Steel, and Finished Steel.</CardDescription> */}
      </CardHeader>
      <CardContent className="grid gap-2 h-[250px] py-0 pt-0">
        {loading ? (
          <div>Loading data...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : chartData.length > 0 ? (
          <MyResponsiveLine data={chartData} />
        ) : (
          <div>No data available to display.</div>
        )}
      </CardContent>
    </Card>
  );
}
