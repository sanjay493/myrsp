
'use client';

import React, { useState, useEffect } from "react";
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Functional Component for Reusable ResponsiveBar
const MyResponsiveBar = ({ data, keys, indexBy, xLegend, yLegend }) => {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      margin={{ top: 20, right: 20, bottom: 50, left: 50 }} // Adjusted margins
      padding={0.3}
      // groupMode="grouped" // Set to "grouped" for side-by-side bars
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={{ scheme: 'nivo' }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: xLegend,
        legendPosition: 'middle',
        legendOffset: 40,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: yLegend,
        legendPosition: 'middle',
        legendOffset: -40,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: 'color',
        modifiers: [['darker', 1.6]],
      }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 30,
          itemHeight: 20,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: 'hover',
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      role="application"
      ariaLabel="Nivo bar chart demo"
      barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in ${e.indexValue}`}
    />
  );
};

// Main Component using the Functional Component
const HMChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlowData = async () => {
    try {
      const response = await fetch("/api/hm"); // Adjust the URL if necessary
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      return [];
    }
  };

  const transformDataForBarChart = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => ({
        rpt_date: new Date(item.rpt_date).getDate().toString(), // Extract day from date
        BF_1: parseFloat((item.BF1 / 1000 || 0).toFixed(1)), // Convert to two decimal points
        BF_5: parseFloat((item.BF5 / 1000 || 0).toFixed(1)), // Convert to two decimal points
    }));
};


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchBlowData();
      const formattedData = transformDataForBarChart(data);
      setChartData(formattedData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hot Metal (BF-1 || BF-5) Production Trends</CardTitle>
        {/* <CardDescription>
          Visualize production trends for Hot Metal
        </CardDescription> */}
      </CardHeader>
      <CardContent className="grid gap-2 h-[250px] py-0 pt-0">
        <MyResponsiveBar
          data={chartData}
          keys={['BF_1', 'BF_5']}
          indexBy="rpt_date"
          xLegend="Day"
          yLegend="Hot Metal Production"
        />
      </CardContent>
    </Card>
  );
};

export default HMChart;


