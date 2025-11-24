export type ChartSeries = {
  key: string;   
  label: string; 
};

export type ChartDataPoint = {
  x: string; 
  [key: string]: number | string;
};

export type ChartSpec = {
  title: string;
  description?: string;
  type: "line" | "bar";
  xLabel: string;
  yLabel: string;
  xType: "time" | "category";
  series: ChartSeries[];
  data: ChartDataPoint[];
};