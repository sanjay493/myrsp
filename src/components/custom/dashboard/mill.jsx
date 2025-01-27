"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const MyResponsiveLine = ({ data }) => (
  <ResponsiveLine
    data={data}
    margin={{ top: 10, right: 10, bottom: 40, left: 60 }}
    xScale={{ type: "point" }}
    yScale={{
      type: "linear",
      min: "auto",
      max: "auto",
      stacked: false,
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
    enableCrosshair={false}
    useMesh={false}
    enableSlices="x"
    colors={{ scheme: "set2" }} // Updated to "set2" for better visualization
  
  />
);

export default function MillChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  const fetchMillsData = async () => {
    try {
      const response = await fetch("/api/mill");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      return result.data || []; // Ensure it always returns an array
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      return [];
    }
  };

  // Transform data for the line chart
  const transformDataForLine = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const categories = [
      { key: "PM", label: "Plate Mill" },
      { key: "NPM", label: "New Plate Mill" },
      { key: "HSM2", label: "Hot Strip Mill" },
    ];
    const dateFormatter = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
    
     
    });
    return categories.map((category) => ({
      _id: category.key, // Add an _id field for each category
      id: category.label,
      data: data
        .filter((item) => item.rpt_date && item[category.key] !== undefined)
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
      const data = await fetchMillsData();
      const formattedData = transformDataForLine(data);
      setChartData(formattedData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mills (PM | NPM | HSM-2) Production Trends</CardTitle>
        {/* <CardDescription>Visualize production trends over time for Mills.</CardDescription> */}
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
