export interface Node {
    id: string;
    name: string;
    value: number;
    x?: number;
    y?: number;
    angle?: number;
    category: number;
    itemStyle?: { color: string; borderColor?: string; borderWidth?: number };
    label: {
      show: boolean;
      fontSize: number;
      fontWeight: string;
      color: string;
      position?: string;
      align?: string;
      distance?: number;
      width?: number;
      overflow?: string;
      lineHeight?: number;
      padding?: number[];
      formatter?: (params: { name: string }) => string;
    };
  }
  
  export interface Link {
    source: string;
    target: string;
    coords?: [number, number][];
    lineStyle?: {
      color?: string;
      width?: number;
      opacity?: number;
      curveness?: number;
      type?: string;
    };
  }