"use client";

import { useMemo, useState } from "react";

type BrainNode = {
  id: number;
  x: number;
  y: number;
  r: number;
};

type BrainEdge = {
  a: number;
  b: number;
};

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let value = Math.imul(t ^ (t >>> 15), t | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function insideBrainShape(x: number, y: number) {
  const mainLobe = (x - 48) ** 2 / 34 ** 2 + (y - 45) ** 2 / 25 ** 2 <= 1;
  const leftLobe = (x - 30) ** 2 / 18 ** 2 + (y - 53) ** 2 / 19 ** 2 <= 1;
  const rightLobe = (x - 66) ** 2 / 18 ** 2 + (y - 52) ** 2 / 19 ** 2 <= 1;
  const lowerLobe = (x - 50) ** 2 / 30 ** 2 + (y - 62) ** 2 / 18 ** 2 <= 1;
  const stem = (x - 68) ** 2 / 8 ** 2 + (y - 84) ** 2 / 13 ** 2 <= 1;
  const stemTip = (x - 70) ** 2 / 5 ** 2 + (y - 95) ** 2 / 6 ** 2 <= 1;

  return mainLobe || leftLobe || rightLobe || lowerLobe || stem || stemTip;
}

function generateGraph() {
  const random = mulberry32(90210);
  const nodes: BrainNode[] = [];
  let attempts = 0;

  while (nodes.length < 115 && attempts < 14000) {
    attempts += 1;
    const x = 12 + random() * 76;
    const y = 15 + random() * 84;

    if (!insideBrainShape(x, y)) {
      continue;
    }

    const minDistance = y > 80 ? 2.8 : 3.8;
    const tooClose = nodes.some((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.hypot(dx, dy) < minDistance;
    });

    if (tooClose) {
      continue;
    }

    nodes.push({
      id: nodes.length,
      x,
      y,
      r: 0.75 + random() * 1.1,
    });
  }

  const edgeMap = new Map<string, BrainEdge>();

  for (const node of nodes) {
    const neighbors = nodes
      .filter((candidate) => candidate.id !== node.id)
      .map((candidate) => ({
        id: candidate.id,
        distance: Math.hypot(node.x - candidate.x, node.y - candidate.y),
      }))
      .filter((candidate) => candidate.distance < 14.5)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    for (const neighbor of neighbors) {
      const a = Math.min(node.id, neighbor.id);
      const b = Math.max(node.id, neighbor.id);
      edgeMap.set(`${a}-${b}`, { a, b });
    }
  }

  return {
    nodes,
    edges: Array.from(edgeMap.values()),
  };
}

export default function BrainNodesGraph() {
  const { nodes, edges } = useMemo(() => generateGraph(), []);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  return (
    <div className="h-56 w-full md:h-64">
      <svg
        viewBox="0 0 100 100"
        className="block h-full w-full"
        role="img"
        aria-label="Interactive brain node mesh"
      >
        <g>
          {edges.map((edge) => {
            const from = nodes[edge.a];
            const to = nodes[edge.b];
            return (
              <line
                key={`${edge.a}-${edge.b}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.22"
              />
            );
          })}
        </g>

        <g>
          {nodes.map((node) => {
            const isActive = hoveredNodeId === node.id;

            return (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={isActive ? node.r * 1.45 : node.r}
                fill="rgba(255,255,255,0.97)"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
