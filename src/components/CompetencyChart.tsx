import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

import { configureChartOptions, handleNodeClick } from "../utils/chartConfig";
import { generateNodesAndLinks } from "../utils/dataTransform";

import styles from "../styles/competency-chart.module.scss";

const CompetencyChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const lastClickedNode = useRef<string | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const { nodes, links } = generateNodesAndLinks(100, 200);
    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    chart.setOption(configureChartOptions(nodes, links));

    chart.on("click", (params: echarts.ECElementEvent) => {
      handleNodeClick(params, chart, lastClickedNode);
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={chartRef}
      className={styles.chart}
      style={{ width: "100%", height: "800px" }}
    ></div>
  );
};

export default CompetencyChart;
