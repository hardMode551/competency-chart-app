import * as echarts from "echarts";
import { Link, Node } from "./types";
import { getRelatedLinks } from "./dataTransform";

// Типизация для оригинальных ссылок
let originalLinks: Link[] = [];

// Типизация для узлов
interface PositionedNode {
  x: number;
  y: number;
  value: number;
  angle?: number;
  name: string;
}

interface LinkWithCoords extends Link {
  coords: [number, number][];
}

interface ClickParamsData {
  name: string;
  category: number;
}

// Функция для расчета точек соединения между узлами
const calculateConnectionPoints = (
  source: PositionedNode,
  target: PositionedNode
): [number, number][] => {
  const sourceAngle = ((source.angle || 0) * Math.PI) / 180;
  const targetAngle = ((target.angle || 0) * Math.PI) / 180;

  // Радиус узлов
  const sourceRadius = source.value / 2;
  const targetRadius = target.value / 2;

  // Нижняя точка источника (должности)
  const sourceX = source.x - Math.sin(sourceAngle) * sourceRadius;
  const sourceY = source.y + Math.cos(sourceAngle) * sourceRadius;

  // Верхняя точка цели (навыка)
  const targetX = target.x + Math.sin(targetAngle) * targetRadius;
  const targetY = target.y - Math.cos(targetAngle) * targetRadius;

  // Контрольная точка для кривой Безье
  const controlPoint = calculateControlPoint(
    [sourceX, sourceY],
    [targetX, targetY],
    source.x,
    source.y
  );

  return [[sourceX, sourceY], controlPoint, [targetX, targetY]];
};

// Функция для расчета контрольной точки кривой Безье
const calculateControlPoint = (
  start: [number, number],
  end: [number, number],
  centerX: number,
  centerY: number
): [number, number] => {
  // Находим среднюю точку между началом и концом
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;

  // Вектор от центра к средней точке
  const vectorX = midX - centerX;
  const vectorY = midY - centerY;

  // Нормализуем вектор и умножаем на желаемое расстояние
  const length = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
  const normalizedX = vectorX / length;
  const normalizedY = vectorY / length;

  // Создаем контрольную точку, смещенную от средней точки
  const controlX = midX + normalizedX * 50;
  const controlY = midY + normalizedY * 50;

  return [controlX, controlY];
};

// Функция для конфигурирования опций графика
export const configureChartOptions = (nodes: Node[], links: Link[]) => {
  originalLinks = links;

  return {
    tooltip: { trigger: "item", formatter: "{b}" },
    series: [
      {
        type: "graph",
        layout: "none",
        data: nodes,
        links: links,
        categories: [{ name: "Main Role" }, { name: "Skill" }],
        symbolSize: [20, 20],
        roam: true,
        edgeSymbol: ["none", "none"],
        emphasis: { focus: "none", lineStyle: { width: 4 } },
      },
    ],
  };
};

// Функция обработки клика по узлу
export const handleNodeClick = (
  params: echarts.ECElementEvent,
  chart: echarts.ECharts,
  lastClickedNode: React.MutableRefObject<string | null>
) => {
  // Проверяем, является ли params.data объектом, и переводим его в ClickParamsData
  if (params.data && typeof params.data === "object" && "name" in params.data) {
    const { name, category } = params.data as ClickParamsData;

    let currentLinks = [...originalLinks];

    if (lastClickedNode.current === name) {
      chart.setOption({ series: [{ links: currentLinks }] });
      lastClickedNode.current = null;
    } else {
      const newLinks = getRelatedLinks(name, category);
      const option = chart.getOption() as {
        series: { data: PositionedNode[] }[];
      };
      const nodes = option.series[0].data;

      if (category === 0) {
        const sourceNode = nodes.find((node) => node.name === name);

        newLinks.forEach((link) => {
          const targetNode = nodes.find((node) => node.name === link.target);

          if (sourceNode && targetNode) {
            const connectionPoints = calculateConnectionPoints(
              sourceNode,
              targetNode
            );

            link.lineStyle = {
              ...link.lineStyle,
              width: 2,
              type: "solid",
            };

            (link as LinkWithCoords).coords = connectionPoints;
          }
        });
      }

      currentLinks = [...currentLinks, ...newLinks].reduce(
        (acc: Link[], link: Link) => {
          if (
            !acc.some(
              (existingLink) =>
                existingLink.source === link.source &&
                existingLink.target === link.target
            )
          ) {
            acc.push(link);
          }
          return acc;
        },
        []
      );

      chart.setOption({
        series: [
          {
            links: currentLinks,
          },
        ],
      });

      lastClickedNode.current = name;
    }
  }
};
