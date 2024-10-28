import { data as skillsData } from "./data";
import { Link, Node } from "./types";
import { getCircularPosition, getLabelAlign, getLabelPosition, wrapText } from "./utilities";

export const generateNodesAndLinks = (innerRadius: number, outerRadius: number) => {
  const nodes: Node[] = [];
  const links: Link[] = [];
  const uniqueSkills = new Set<string>();
  const uniquePositions = new Set<string>();

  // Собираем уникальные навыки и позиции
  skillsData.forEach((role) => {
    uniquePositions.add(role.name);
    role.mainSkills.forEach((skill) => uniqueSkills.add(skill));
    role.otherSkills.forEach((skill) => uniqueSkills.add(skill));
  });

  const totalSkills = uniqueSkills.size;
  const totalRoles = skillsData.length;

  // Добавляем позиции (внутренний круг)
  let positionIndex = 0;
  let previousPosition: string | null = null;

  uniquePositions.forEach((role) => {
    const position = getCircularPosition(positionIndex, totalRoles, innerRadius);
    const labelPos = getLabelPosition(position.angle);
    const labelAlign = getLabelAlign(labelPos);

    nodes.push({
      id: role,
      name: role,
      value: 30,
      category: 0,
      ...position,
      itemStyle: {
        color: "#ADADAD",
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: true,
        fontSize: 10,
        fontWeight: "bold",
        color: "#333",
        position: labelPos,
        align: labelAlign,
        distance: 20,
        width: 120,
        overflow: 'break',
        lineHeight: 16,
        padding: [4, 8],
        formatter: (params: { name: string }) => wrapText(params.name),
      },
    });

    if (previousPosition) {
      links.push({
        source: previousPosition,
        target: role,
        lineStyle: { color: "#ADADAD", width: 4, curveness: 0.15 },
      });
    }

    previousPosition = role;
    positionIndex++;
  });

  // Закрываем внутренний круг
  if (positionIndex > 1) {
    links.push({
      source: previousPosition!,
      target: Array.from(uniquePositions)[0],
      lineStyle: { color: "#ADADAD", width: 4, curveness: 0.15 },
    });
  }

  // Добавляем навыки (внешний круг)
  let skillIndex = 0;
  let previousSkill: string | null = null;

  uniqueSkills.forEach((skill) => {
    const position = getCircularPosition(skillIndex, totalSkills, outerRadius);
    const labelPos = getLabelPosition(position.angle);
    const labelAlign = getLabelAlign(labelPos);

    nodes.push({
      id: skill,
      name: skill,
      value: 20,
      category: 1,
      ...position,
      itemStyle: { color: "#FF7A00" },
      label: {
        show: true,
        fontSize: 10,
        fontWeight: "bold",
        color: "#333",
        position: labelPos,
        align: labelAlign,
        distance: 20,
        width: 63,
        overflow: 'break',
        lineHeight: 16,
        padding: [4, 8],
        formatter: (params: { name: string }) => wrapText(params.name),
      },
    });

    if (previousSkill) {
      links.push({
        source: previousSkill,
        target: skill,
        lineStyle: { color: "#ADADAD", width: 4, curveness: 0.05 },
      });
    }

    previousSkill = skill;
    skillIndex++;
  });

  // Закрываем внешний круг
  if (skillIndex > 1) {
    links.push({
      source: previousSkill!,
      target: Array.from(uniqueSkills)[0],
      lineStyle: { color: "#ADADAD", width: 4, curveness: 0.05 },
    });
  }

  return { nodes, links };
};

export const getRelatedLinks = (nodeName: string, nodeCategory: number): Link[] => {
  const newLinks: Link[] = [];

  if (nodeCategory === 0) {
    // Роль выбрана - показываем связи с навыками
    const selectedRole = skillsData.find((role) => role.name === nodeName);
    if (selectedRole) {
      selectedRole.mainSkills.forEach((skill) => {
        newLinks.push({
          source: nodeName,
          target: skill,
          lineStyle: { color: "#ff6b00", width: 2, curveness: 0.2 },
        });
      });
      selectedRole.otherSkills.forEach((skill) => {
        newLinks.push({
          source: nodeName,
          target: skill,
          lineStyle: { color: "#8F59B9", width: 2, curveness: 0.2 },
        });
      });
    }
  } else {
    // Навык выбран - показываем связи с ролями
    skillsData.forEach((role) => {
      if (role.mainSkills.includes(nodeName)) {
        newLinks.push({
          source: role.name,
          target: nodeName,
          lineStyle: { color: "#ff6b00", width: 2, curveness: 0.2 },
        });
      }
      if (role.otherSkills.includes(nodeName)) {
        newLinks.push({
          source: role.name,
          target: nodeName,
          lineStyle: { color: "#8F59B9", width: 2, curveness: 0.2 },
        });
      }
    });
  }

  return newLinks;
};
