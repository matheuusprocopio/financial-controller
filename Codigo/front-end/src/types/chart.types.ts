export type ChartSeries = {
  key: string;   // nome da chave numérica no data (ex: "gastos")
  label: string; // rótulo exibido na legenda (ex: "Gastos")
};

export type ChartDataPoint = {
  x: string; // eixo X (data ou categoria)
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