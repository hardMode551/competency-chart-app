export const getCircularPosition = (
  index: number,
  total: number,
  radius: number
) => {
  const angle = (index / total) * 2 * Math.PI;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    angle: (angle * 180) / Math.PI,
  };
};

export const getLabelPosition = (angle: number): string => {
  angle = ((angle % 360) + 360) % 360;
  if (angle <= 45 || angle > 315) return "right";
  if (angle > 45 && angle <= 135) return "bottom";
  if (angle > 135 && angle <= 225) return "left";
  return "top";
};

export const getLabelAlign = (position: string): string => {
  switch (position) {
    case "left":
      return "right";
    case "right":
      return "left";
    default:
      return "center";
  }
};

export const wrapText = (text: string | undefined): string => {
  // Проверяем, является ли текст строкой
  if (typeof text !== "string") {
    console.warn("wrapText: expected a string but received:", text);
    return ""; // или вернуть текст по умолчанию
  }

  const maxLength = 15;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if (currentLine.length + word.length > maxLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine.length === 0 ? "" : " ") + word;
    }
  });

  if (currentLine.length > 0) lines.push(currentLine);
  return lines.join("\n");
};
