"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type RadarDataPoint = {
  axis: string;
  axisHe: string;
  current: number;
  potential: number;
};

interface QuizRadarChartProps {
  radarData: RadarDataPoint[];
  locale?: string;
}

export default function QuizRadarChart({
  radarData,
  locale = "en",
}: QuizRadarChartProps) {
  const chartData = radarData.map((d) => ({
    axis: locale === "he" ? d.axisHe : d.axis,
    current: d.current,
    potential: d.potential,
  }));

  const currentLabel = locale === "he" ? "נוכחי" : "Current";
  const potentialLabel = locale === "he" ? "אחרי שבועיים" : "After 2 Weeks";

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#aaa", fontSize: 12 }}
        />
        <Radar
          name={currentLabel}
          dataKey="current"
          stroke="#555"
          fill="#555"
          fillOpacity={0.3}
        />
        <Radar
          name={potentialLabel}
          dataKey="potential"
          stroke="#F472B6"
          fill="#F472B6"
          fillOpacity={0.4}
        />
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ paddingTop: 12, fontSize: 13, color: "#aaa" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
