'use client';

import React, { useState, useEffect } from "react";
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Optional: Add a button component

const MyResponsiveBar = ({ data, keys, indexBy, xLegend, yLegend }) => {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      
      margin={{ top: 0, right: 50, bottom: 20, left: 0 }}
      padding={0.15}
      groupMode="grouped" // Makes bars appear side by side
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={({ id }) => {
        if (id === 'APP') return '#F6BD60'; // Red for 'APP'
        if (id === 'Act') return '#F5CAC3'; // Green for 'actual'
        if (id === 'MRate') return '#F28482'; // Blue for the third category
        return '#9e9e9e'; // Default color for any unexpected category
      }}
      axisTop={null}
      axisRight={null}
      // axisLeft={null}
      enableGridY={false}
      axisBottom={{
        tickSize: 5,
        tickPadding: 1,
        tickRotation: 0,
        legend: xLegend,
        legendPosition: 'end',
        legendOffset: 40,
      }}
      axisLeft={{
        // tickSize: 0,
        // tickPadding: 0,
        // tickRotation: 0,
        legend: yLegend,
        legendPosition: 'middle',
        legendOffset: -55,
      }}
      tooltip={({ id, value, indexValue }) => (
        <div
          style={{
            padding: '2px 2px',
            background: '#222',
            color: '#fff',
            borderRadius: '3px',
          }}
        >
          <strong>{indexValue}</strong>: {id} - {value} T
        </div>
      )}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: 'color',
        modifiers: [['darker', 3]],
      }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'top-right',
          direction: 'column',
          justify: false,
          translateX: 50,
          translateY: 0,
          itemsSpacing: 1,
          itemWidth: 50,
          itemHeight: 30,
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
      ariaLabel="Comparative bar chart for production data"
      barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in ${e.indexValue}`}
    />
  );
};
const ProductionBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/mrate"); // Replace with your actual API endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      return result.data.categories;
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      return [];
    }
  };

  const transformDataForBarChart = (categories) => {
    if (!categories || !Array.isArray(categories)) return [];
  
    // Predefined order of categories
    const predefinedOrder = ["HotMetal", "Crude Steel", "Saleable Steel"]; // Replace with actual category names
  
    // Map and sort data
    return categories
      .map((item) => ({
        Name: item.name || "Unknown",
        APP: item.app || 0,
        Act: item.ondt_prodn || 0,
        MRate: parseFloat((item.mrate || 0).toFixed(0)),
      }))
      .sort((a, b) => {
        const indexA = predefinedOrder.indexOf(a.Name);
        const indexB = predefinedOrder.indexOf(b.Name);
        return indexA - indexB; // Sort based on the predefined order
      });
  
   
  };
  

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchData();
    const formattedData = transformDataForBarChart(data);
    console.log(formattedData);
    setChartData(formattedData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadData();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card className="w-full">
      <CardHeader className="py-0 pt-0">
        <CardTitle className="py-0 pt-0 text-xs text-center">App || OnDate || Monthly Rate Produnction</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 h-[100px] py-0 pt-0">
        <MyResponsiveBar
          data={chartData}
          keys={['APP', 'Act', 'MRate']} // Ensure keys match your data
          indexBy="Name" // Ensure indexBy matches your mapped key
          xLegend="Categories"
          yLegend="Prodn (Tons)"
          
        />
      </CardContent>
    </Card>
  );
};

export default ProductionBarChart;
