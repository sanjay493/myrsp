import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const MainUnitPerfBlock = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch("/api/mrate"); // Replace with your actual API endpoint
        const result = await response.json();
        if (response.ok) {
          setPerformanceData(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryData = (category) =>
    performanceData.find((item) => item.category === category) || {
      mrate: 0,
      ondt_prodn: 0,
      desprate:0,
      ondt_desp:0
    };

  const hotMetal = getCategoryData("BF-Shop");
  const crudeSteel = getCategoryData("Crude Steel");
  const salableSteel = getCategoryData("Salable Steel");

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }


  const StatCard = ({ title, production, rate, growth, growthType }) => {
    return (
      <Card className="w-full shadow-md rounded-lg border border-gray-200">
      <CardContent className="grid gap-2 p-1">
        {/* Title */}
        <h3 className="text-lg font-semibold text-blue-600">{title}</h3>
        
        {/* Production Value */}
        <p className="text-lg text-gray-800 p-0 m-0">
          <span className="font-medium text-gray-600">On Date: </span>
          <span className="font-semibold text-red-500">{production.toLocaleString()} T</span>
        </p>
        
        {/* Monthly Rate */}
        <p className="text-lg text-gray-800 p-0 m-0">
          <span className="font-medium text-gray-600">Monthly Rate: </span>
          <span className="font-semibold text-blue-500">{Math.round(rate).toLocaleString()} T</span>
        </p>
        
        {/* Growth */}
        <span
          className={`text-sm font-medium ${
            growthType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {growthType === 'positive' ? `${growth}% Growth` : `${growth}% Decline`}
        </span>
      </CardContent>
    </Card>
    
    );
  };
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 lg:grid-cols-4">
     <StatCard
      title="Hot Metal"
      production={hotMetal.ondt_prodn}
      rate={hotMetal.mrate}
      growth={hotMetal.growth}
      growthType={hotMetal.growth >= 0 ? 'positive' : 'negative'}
    />
    <StatCard
      title="Crude Steel"
      production={crudeSteel.ondt_prodn}
      rate={crudeSteel.mrate}
      growth={crudeSteel.growth}
      growthType={crudeSteel.growth >= 0 ? 'positive' : 'negative'}
    />
    <StatCard
      title="Salable Steel"
      production={salableSteel.ondt_prodn}
      rate={salableSteel.mrate}
      growth={salableSteel.growth}
      growthType={salableSteel.growth >= 0 ? 'positive' : 'negative'}
    />
    <StatCard
      title="Steel Despatch"
      production={salableSteel.ondt_desp}
      rate={salableSteel.desprate}
      growth={salableSteel.growth}
      growthType={salableSteel.growth >= 0 ? 'positive' : 'negative'}
    />
       
        
        
      </div>
  );
};

export default MainUnitPerfBlock;
