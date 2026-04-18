"use client";

import { useEffect, useRef, useState } from "react";

const FACE_MESH_SCRIPT_ID = "mediapipe-face-mesh-script";
const TOP_OVERLAY_SPACE = 130;
const MESH_NODE_INDICES = [
  10, 338, 297, 332, 284, 263, 362, 1, 33, 133, 55, 70, 67, 234, 454, 61, 291,
  152, 103, 17,
];

const MESH_EDGES = [
  [10, 338],
  [338, 297],
  [297, 332],
  [332, 284],
  [284, 263],
  [263, 362],
  [362, 1],
  [1, 133],
  [133, 33],
  [33, 55],
  [55, 70],
  [70, 67],
  [67, 10],
  [332, 133],
  [284, 1],
  [55, 133],
  [33, 1],
  [263, 1],
  [33, 61],
  [1, 61],
  [1, 291],
  [61, 152],
  [291, 152],
  [61, 17],
  [291, 17],
  [17, 152],
  [70, 103],
  [103, 67],
  [234, 61],
  [454, 291],
  [234, 33],
  [454, 263],
  [234, 152],
  [454, 152],
];

const CHEEK_NODE_INDICES = [
  93, 132, 58, 172, 136, 150, 323, 361, 288, 397, 365, 379,
];

const CHEEK_EDGES = [
  // Left cheek scaffold
  [33, 93],
  [93, 132],
  [132, 58],
  [58, 172],
  [172, 150],
  [150, 136],
  [136, 234],
  [234, 33],
  [93, 133],
  [132, 1],
  [58, 61],
  [172, 17],
  [150, 152],
  [136, 61],
  [234, 133],
  [132, 61],
  [58, 17],

  // Right cheek scaffold
  [263, 323],
  [323, 361],
  [361, 288],
  [288, 397],
  [397, 379],
  [379, 365],
  [365, 454],
  [454, 263],
  [323, 362],
  [361, 1],
  [288, 291],
  [397, 17],
  [379, 152],
  [365, 291],
  [454, 362],
  [361, 291],
  [288, 17],
];

const ALL_MESH_NODE_INDICES = [
  ...new Set([...MESH_NODE_INDICES, ...CHEEK_NODE_INDICES]),
];
const ALL_MESH_EDGES = [...MESH_EDGES, ...CHEEK_EDGES];

const HAIR_ROW_POINT_COUNT = 9;
const HAIR_MESH_ROWS = [
  { lift: 0.0, spread: 1.04, arch: 0.02, sideDrop: 0.2 },
  { lift: 0.09, spread: 1.1, arch: 0.05, sideDrop: 0.18 },
  { lift: 0.18, spread: 1.16, arch: 0.08, sideDrop: 0.14 },
  { lift: 0.28, spread: 1.22, arch: 0.11, sideDrop: 0.1 },
  { lift: 0.36, spread: 1.18, arch: 0.13, sideDrop: 0.08 },
];

function createHairMeshPoints(
  minX,
  maxX,
  minY,
  faceWidth,
  faceHeight,
  imageTopY,
  imageBottomY,
) {
  const hairRows = HAIR_MESH_ROWS.map((row) => {
    const expandedHalfWidth = (faceWidth * row.spread) / 2;
    const centerX = (minX + maxX) / 2;
    const leftX = centerX - expandedHalfWidth;
    const rightX = centerX + expandedHalfWidth;
    const points = [];
    const baseY = minY - faceHeight * row.lift;

    for (let i = 0; i < HAIR_ROW_POINT_COUNT; i += 1) {
      const t = i / (HAIR_ROW_POINT_COUNT - 1);
      const edgeWeight = Math.abs(t - 0.5) / 0.5;
      const archLift = (1 - edgeWeight) * row.arch * faceHeight;
      const sideDrop = edgeWeight * row.sideDrop * faceHeight;
      points.push({
        x: leftX + (rightX - leftX) * t,
        y: clamp(baseY - archLift + sideDrop, imageTopY + 8, imageBottomY - 8),
      });
    }

    return points;
  });

  return hairRows;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toHexChannel(channel) {
  return clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0");
}

function rgbToHex(r, g, b) {
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return null;
  }

  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) {
    return null;
  }

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function sampleSkinHex(
  ctx,
  centerX,
  centerY,
  radius,
  canvasWidth,
  canvasHeight,
) {
  const r = Math.max(2, Math.round(radius));
  const left = clamp(Math.round(centerX - r), 0, canvasWidth - 1);
  const top = clamp(Math.round(centerY - r), 0, canvasHeight - 1);
  const right = clamp(Math.round(centerX + r), 0, canvasWidth - 1);
  const bottom = clamp(Math.round(centerY + r), 0, canvasHeight - 1);

  const width = Math.max(1, right - left + 1);
  const height = Math.max(1, bottom - top + 1);

  let data;
  try {
    data = ctx.getImageData(left, top, width, height).data;
  } catch {
    return null;
  }

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 16) {
      continue;
    }
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
    count += 1;
  }

  if (count === 0) {
    return null;
  }

  return rgbToHex(totalR / count, totalG / count, totalB / count);
}

function sampleLandmarkClusterHex(
  ctx,
  landmarks,
  indices,
  radius,
  width,
  height,
  yOffset,
) {
  const samples = [];

  for (const index of indices) {
    const point = landmarks[index];
    if (!point) {
      continue;
    }

    const hex = sampleSkinHex(
      ctx,
      point.x * width,
      point.y * height + yOffset,
      radius,
      width,
      height + yOffset,
    );
    if (!hex) {
      continue;
    }

    const rgb = hexToRgb(hex);
    if (rgb) {
      samples.push(rgb);
    }
  }

  if (samples.length === 0) {
    return null;
  }

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  for (const sample of samples) {
    totalR += sample.r;
    totalG += sample.g;
    totalB += sample.b;
  }

  return rgbToHex(
    totalR / samples.length,
    totalG / samples.length,
    totalB / samples.length,
  );
}

function samplePointClusterHex(ctx, points, radius, canvasWidth, canvasHeight) {
  const samples = [];

  for (const point of points) {
    if (!point) {
      continue;
    }

    const hex = sampleSkinHex(
      ctx,
      point.x,
      point.y,
      radius,
      canvasWidth,
      canvasHeight,
    );
    if (!hex) {
      continue;
    }

    const rgb = hexToRgb(hex);
    if (rgb) {
      samples.push(rgb);
    }
  }

  if (samples.length === 0) {
    return null;
  }

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  for (const sample of samples) {
    totalR += sample.r;
    totalG += sample.g;
    totalB += sample.b;
  }

  return rgbToHex(
    totalR / samples.length,
    totalG / samples.length,
    totalB / samples.length,
  );
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawForeheadHexArrow(
  ctx,
  anchorX,
  anchorY,
  faceWidth,
  faceHeight,
  imageTopY,
  canvasWidth,
  canvasHeight,
  hex,
  directionX = 1,
  verticalLift = 0.45,
  labelRow = -1,
  forceSide = "auto",
) {
  const minMargin = 14;
  const tipX = clamp(
    anchorX + faceWidth * 0.34 * directionX,
    minMargin,
    canvasWidth - minMargin,
  );
  const tipY = clamp(
    anchorY - faceHeight * verticalLift,
    minMargin,
    imageTopY - 14,
  );

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 3;

  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  // Arrow origin marker on forehead.
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(anchorX, anchorY, 4, 0, 2 * Math.PI);
  ctx.fill();

  const headSize = Math.max(6, Math.min(faceWidth, faceHeight) * 0.06);
  const dx = tipX - anchorX;
  const dy = tipY - anchorY;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX - ux * headSize + px * (headSize * 0.55),
    tipY - uy * headSize + py * (headSize * 0.55),
  );
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX - ux * headSize - px * (headSize * 0.55),
    tipY - uy * headSize - py * (headSize * 0.55),
  );
  ctx.stroke();
  ctx.shadowBlur = 0;

  const labelFontSize = Math.max(
    16,
    Math.round(Math.min(faceWidth, faceHeight) * 0.11),
  );
  ctx.font = `600 ${labelFontSize}px ui-sans-serif, system-ui, -apple-system`;
  const textWidth = ctx.measureText(hex.toUpperCase()).width;
  const swatchSize = labelFontSize * 0.75;
  const labelPaddingX = 12;
  const labelPaddingY = 8;
  const gap = 8;
  const labelWidth = labelPaddingX * 2 + swatchSize + gap + textWidth;
  const labelHeight = labelPaddingY * 2 + labelFontSize;

  const preferredSide =
    forceSide === "auto" ? (directionX >= 0 ? "right" : "left") : forceSide;
  const proposedLabelX =
    preferredSide === "left" ? tipX - labelWidth - 10 : tipX + 10;
  const labelX = clamp(
    proposedLabelX,
    minMargin,
    canvasWidth - labelWidth - minMargin,
  );
  const rowLabelY = minMargin + labelRow * (labelHeight + 8);
  const labelY = clamp(
    labelRow >= 0 ? rowLabelY : tipY - labelHeight / 2,
    minMargin,
    imageTopY - labelHeight - 10,
  );

  drawRoundedRect(ctx, labelX, labelY, labelWidth, labelHeight, 8);
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const swatchX = labelX + labelPaddingX;
  const swatchY = labelY + (labelHeight - swatchSize) / 2;
  drawRoundedRect(ctx, swatchX, swatchY, swatchSize, swatchSize, 4);
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
  ctx.stroke();

  ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
  ctx.textBaseline = "middle";
  ctx.fillText(
    hex.toUpperCase(),
    swatchX + swatchSize + gap,
    labelY + labelHeight / 2,
  );
}

// Dynamically load MediaPipe FaceMesh from CDN
function loadFaceMeshScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.FaceMesh) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(FACE_MESH_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load FaceMesh script")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = FACE_MESH_SCRIPT_ID;
    script.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load FaceMesh script"));
    document.head.appendChild(script);
  });
}

export default function FaceGrid({ imageSrc }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    let faceMeshInstance = null;

    const drawScene = (results) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      canvas.width = width;
      canvas.height = height + TOP_OVERLAY_SPACE;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw the image
      ctx.clearRect(0, 0, width, canvas.height);
      ctx.fillStyle = "rgba(12, 14, 22, 0.9)";
      ctx.fillRect(0, 0, width, TOP_OVERLAY_SPACE);
      ctx.drawImage(img, 0, TOP_OVERLAY_SPACE, width, height);

      if (results?.multiFaceLandmarks?.length) {
        const landmarks = results.multiFaceLandmarks[0];
        drawFaceGuides(ctx, landmarks, width, height, TOP_OVERLAY_SPACE);
      }

      setLoading(false);
    };

    const drawFaceGuides = (ctx, landmarks, width, height, yOffset) => {
      const xs = landmarks.map((p) => p.x * width);
      const ys = landmarks.map((p) => p.y * height + yOffset);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const faceWidth = maxX - minX;
      const faceHeight = maxY - minY;
      const hairRows = createHairMeshPoints(
        minX,
        maxX,
        minY,
        faceWidth,
        faceHeight,
        yOffset,
        yOffset + height,
      );
      const leftTemple = landmarks[234];
      const rightTemple = landmarks[454];
      const foreheadCenter = landmarks[10] ?? landmarks[151] ?? landmarks[9];

      // ---- Sparse 20-node Connected Mesh ----
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [fromIndex, toIndex] of ALL_MESH_EDGES) {
        const from = landmarks[fromIndex];
        const to = landmarks[toIndex];

        if (!from || !to) {
          continue;
        }

        ctx.moveTo(from.x * width, from.y * height + yOffset);
        ctx.lineTo(to.x * width, to.y * height + yOffset);
      }

      for (const row of hairRows) {
        for (let i = 0; i < row.length - 1; i += 1) {
          ctx.moveTo(row[i].x, row[i].y);
          ctx.lineTo(row[i + 1].x, row[i + 1].y);
        }
      }

      for (let rowIndex = 0; rowIndex < hairRows.length - 1; rowIndex += 1) {
        const currentRow = hairRows[rowIndex];
        const nextRow = hairRows[rowIndex + 1];
        for (let i = 0; i < currentRow.length; i += 1) {
          ctx.moveTo(currentRow[i].x, currentRow[i].y);
          ctx.lineTo(nextRow[i].x, nextRow[i].y);

          if (i < currentRow.length - 1) {
            ctx.moveTo(currentRow[i].x, currentRow[i].y);
            ctx.lineTo(nextRow[i + 1].x, nextRow[i + 1].y);
          }

          if (i > 0) {
            ctx.moveTo(currentRow[i].x, currentRow[i].y);
            ctx.lineTo(nextRow[i - 1].x, nextRow[i - 1].y);
          }
        }
      }

      const bottomHairRow = hairRows[0];
      if (bottomHairRow && leftTemple && rightTemple) {
        const leftTempleX = leftTemple.x * width;
        const leftTempleY = leftTemple.y * height + yOffset;
        const rightTempleX = rightTemple.x * width;
        const rightTempleY = rightTemple.y * height + yOffset;

        ctx.moveTo(leftTempleX, leftTempleY);
        ctx.lineTo(bottomHairRow[0].x, bottomHairRow[0].y);
        ctx.moveTo(rightTempleX, rightTempleY);
        ctx.lineTo(
          bottomHairRow[bottomHairRow.length - 1].x,
          bottomHairRow[bottomHairRow.length - 1].y,
        );
      }

      if (bottomHairRow) {
        const bridgePairs = [
          [234, 0],
          [127, 1],
          [67, 2],
          [10, 4],
          [297, 6],
          [356, 7],
          [454, 8],
        ];

        for (const [landmarkIndex, column] of bridgePairs) {
          const bridgePoint = landmarks[landmarkIndex];
          const hairPoint = bottomHairRow[column];
          if (!bridgePoint || !hairPoint) {
            continue;
          }

          ctx.moveTo(bridgePoint.x * width, bridgePoint.y * height + yOffset);
          ctx.lineTo(hairPoint.x, hairPoint.y);
        }
      }

      if (bottomHairRow && foreheadCenter) {
        const foreheadX = foreheadCenter.x * width;
        const foreheadY = foreheadCenter.y * height + yOffset;
        const centerHair = bottomHairRow[Math.floor(bottomHairRow.length / 2)];
        ctx.moveTo(foreheadX, foreheadY);
        ctx.lineTo(centerHair.x, centerHair.y);
      }
      ctx.stroke();

      // ---- Landmark Dots ----
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      for (const pointIndex of ALL_MESH_NODE_INDICES) {
        const point = landmarks[pointIndex];
        if (!point) {
          continue;
        }

        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height + yOffset, 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      for (const row of hairRows) {
        for (const point of row) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.8, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // ---- Corner Brackets Around Face ----
      const bracketPaddingX = faceWidth * 0.26;
      const bracketPaddingY = faceHeight * 0.24;
      const boxX = minX - bracketPaddingX;
      const boxY = minY - bracketPaddingY;
      const boxW = faceWidth + bracketPaddingX * 2;
      const boxH = faceHeight + bracketPaddingY * 2;
      drawCornerBrackets(ctx, boxX, boxY, boxW, boxH);

      const foreheadAnchor = landmarks[10] ?? landmarks[151] ?? landmarks[9];
      const foreheadSample = landmarks[151] ?? landmarks[9] ?? landmarks[10];
      const fallbackAnchorX = minX + faceWidth * 0.5;
      const fallbackAnchorY = minY + faceHeight * 0.18;
      const anchorX = foreheadAnchor
        ? foreheadAnchor.x * width
        : fallbackAnchorX;
      const anchorY = foreheadAnchor
        ? foreheadAnchor.y * height + yOffset
        : fallbackAnchorY;

      const centerColumn = Math.floor(HAIR_ROW_POINT_COUNT / 2);
      const hairAnchorPoint =
        hairRows[1]?.[centerColumn] ?? hairRows[0]?.[centerColumn] ?? null;
      const hairAnchorX = hairAnchorPoint ? hairAnchorPoint.x : anchorX;
      const hairAnchorY = hairAnchorPoint
        ? hairAnchorPoint.y
        : anchorY - faceHeight * 0.2;
      const hairSamplePoints = [];
      const sampleRows = [1, 2, 3];
      const sampleOffsets = [-2, 0, 2];

      for (const rowIndex of sampleRows) {
        const row = hairRows[rowIndex];
        if (!row) {
          continue;
        }

        for (const offset of sampleOffsets) {
          const point = row[centerColumn + offset];
          if (point) {
            hairSamplePoints.push(point);
          }
        }
      }

      if (hairAnchorPoint) {
        hairSamplePoints.push(hairAnchorPoint);
      }

      const hairHex =
        samplePointClusterHex(
          ctx,
          hairSamplePoints,
          faceWidth * 0.022,
          width,
          height + yOffset,
        ) ?? "#5F4A3F";

      const sampleX = foreheadSample ? foreheadSample.x * width : anchorX;
      const sampleY = foreheadSample
        ? foreheadSample.y * height + yOffset + faceHeight * 0.02
        : anchorY;
      const sampledHex = sampleSkinHex(
        ctx,
        sampleX,
        sampleY,
        faceWidth * 0.035,
        width,
        height + yOffset,
      );
      const skinHex = sampledHex ?? "#C79A7B";

      const lipAnchor = landmarks[13] ?? landmarks[14] ?? landmarks[0];
      const lipAnchorX = lipAnchor ? lipAnchor.x * width : anchorX;
      const lipAnchorY = lipAnchor
        ? lipAnchor.y * height + yOffset
        : anchorY + faceHeight * 0.28;
      const lipHex =
        sampleLandmarkClusterHex(
          ctx,
          landmarks,
          [13, 14, 0, 17, 61, 291],
          faceWidth * 0.022,
          width,
          height,
          yOffset,
        ) ?? "#B76D74";

      drawForeheadHexArrow(
        ctx,
        anchorX,
        anchorY,
        faceWidth,
        faceHeight,
        yOffset,
        width,
        height + yOffset,
        skinHex,
        1,
        0.45,
        0,
        "right",
      );

      drawForeheadHexArrow(
        ctx,
        lipAnchorX,
        lipAnchorY,
        faceWidth,
        faceHeight,
        yOffset,
        width,
        height + yOffset,
        lipHex,
        -1,
        0.72,
        1,
        "left",
      );

      drawForeheadHexArrow(
        ctx,
        hairAnchorX,
        hairAnchorY,
        faceWidth,
        faceHeight,
        yOffset,
        width,
        height + yOffset,
        hairHex,
        1,
        0.34,
        2,
        "right",
      );
    };

    const drawCornerBrackets = (ctx, x, y, width, height) => {
      const len = Math.max(18, Math.min(width, height) * 0.12);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      ctx.beginPath();

      // top-left
      ctx.moveTo(x, y + len);
      ctx.lineTo(x, y);
      ctx.lineTo(x + len, y);

      // top-right
      ctx.moveTo(x + width - len, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + len);

      // bottom-left
      ctx.moveTo(x, y + height - len);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + len, y + height);

      // bottom-right
      ctx.moveTo(x + width - len, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width, y + height - len);

      ctx.stroke();
    };

    const setupFaceMesh = async () => {
      const img = imgRef.current;
      if (!img) return;

      await loadFaceMeshScript();
      if (isCancelled || !window.FaceMesh) return;

      faceMeshInstance = new window.FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMeshInstance.setOptions({
        staticImageMode: true,
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
      });

      faceMeshInstance.onResults(drawScene);

      const processImage = async () => {
        await faceMeshInstance.send({ image: img });
      };

      if (img.complete) {
        processImage();
      } else {
        img.onload = processImage;
      }
    };

    setupFaceMesh();

    return () => {
      isCancelled = true;
      if (faceMeshInstance?.close) {
        faceMeshInstance.close();
      }
    };
  }, [imageSrc]);

  return (
    <div className="relative w-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
          Detecting face...
        </div>
      )}

      {/* Hidden image for processing */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Headshot"
        className="hidden"
        crossOrigin="anonymous"
      />

      {/* Canvas displaying the result */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto object-contain rounded-lg"
      />
    </div>
  );
}
