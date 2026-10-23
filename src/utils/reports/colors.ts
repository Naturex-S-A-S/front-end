const LINE_COLORS = [
  "#1E88E5",
  "#43A047",
  "#F4511E",
  "#8E24AA",
  "#FDD835",
  "#00ACC1",
  "#D81B60",
  "#6D4C41",
  "#3949AB",
  "#7CB342",
  "#FB8C00",
  "#5E35B1"
];

const DEFAULT_COLOR = "#9E9E9E";

export function getLineColor(id?: string | number | null): string {
  const value = id == null ? "" : String(id).trim();

  if (!value || value.toLowerCase() === "none") return DEFAULT_COLOR;

  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return LINE_COLORS[Math.abs(hash) % LINE_COLORS.length];
}
