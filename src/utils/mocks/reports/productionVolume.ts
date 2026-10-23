import { addDays, format } from "date-fns";

interface MockOption {
  id: string;
  name: string;
}

interface ProductionVolumeRawRow {
  date: string;
  productId: string;
  batch: string;
  lineId: string;
  line: string;
  shapeId: string;
  shape: string;
  kg: number;
}

interface ProductionMassBalanceOrder {
  id: string;
  batch: string;
  closeDate: string;
  status: "finalizada";
  productIds: string[];
  products: string;
  lineId: string;
  line: string;
  shapeIds: string[];
  shapes: string;
  formulation: string;
  kgTheoretical: number;
  kgProduced: number;
  kgWaste: number;
  wastePct: number;
  kgMpExtra: number;
  yieldPct: number;
}

const LINES: MockOption[] = [
  { id: "line-alimento", name: "Alimento" },
  { id: "line-fermento", name: "Fermento" },
  { id: "line-organico", name: "Orgánico" }
];

const SHAPES: MockOption[] = [
  { id: "shape-jalea", name: "Jalea" },
  { id: "shape-polvo", name: "Polvo" },
  { id: "shape-liquido", name: "Líquido" }
];

const PRODUCTS: MockOption[] = [
  { id: "producto-jalea-mora", name: "Jalea de mora 250 g" },
  { id: "producto-fermento-base", name: "Fermento base 1 kg" },
  { id: "producto-organico-polvo", name: "Orgánico en polvo 500 g" },
  { id: "producto-kombucha", name: "Kombucha jengibre 500 ml" }
];

const PRODUCTS_BY_LINE: Record<string, MockOption[]> = {
  "line-alimento": [PRODUCTS[0], PRODUCTS[3]],
  "line-fermento": [PRODUCTS[1]],
  "line-organico": [PRODUCTS[2]]
};

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000;

  return value - Math.floor(value);
};

const buildRows = (): ProductionVolumeRawRow[] => {
  const rows: ProductionVolumeRawRow[] = [];
  const start = new Date(2024, 0, 1);
  const end = new Date(2026, 9, 31);

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const date = format(cursor, "yyyy-MM-dd");
    const dayIndex = Math.floor((cursor.getTime() - start.getTime()) / 86400000);

    LINES.forEach((line, lineIndex) => {
      SHAPES.forEach((shape, shapeIndex) => {
        const seed = dayIndex * 97 + lineIndex * 31 + shapeIndex * 13;

        if (pseudoRandom(seed) < 0.35) return;

        const lineProducts = PRODUCTS_BY_LINE[line.id];
        const product = lineProducts[(dayIndex + shapeIndex) % lineProducts.length];
        const batch = `L${format(cursor, "yyMM")}-${lineIndex + 1}`;
        const kg = 20 + Math.round(pseudoRandom(seed + 7) * 1800) / 10;

        rows.push({
          date,
          productId: product.id,
          batch,
          lineId: line.id,
          line: line.name,
          shapeId: shape.id,
          shape: shape.name,
          kg
        });
      });
    });
  }

  return rows;
};

const roundMock = (value: number, digits = 3) => {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
};

const hashValue = (value: string) =>
  Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 100000, 7);

const productName = (id: string) => PRODUCTS.find(product => product.id === id)?.name ?? id;

const buildMassBalanceOrders = (): ProductionMassBalanceOrder[] => {
  const groups = new Map<string, ProductionVolumeRawRow[]>();

  PRODUCTION_VOLUME_MOCK_ROWS.forEach(row => {
    const key = `${row.batch}|${row.lineId}`;
    const group = groups.get(key);

    if (group) group.push(row);
    else groups.set(key, [row]);
  });

  return Array.from(groups.entries())
    .map(([key, rows], index) => {
      const first = rows[0];
      const kgProduced = roundMock(rows.reduce((total, row) => total + row.kg, 0));
      const wastePct = roundMock(2 + (hashValue(key) % 61) / 10, 1);
      const kgTheoretical = roundMock(kgProduced / (1 - wastePct / 100));
      const kgWaste = roundMock(Math.max(kgTheoretical - kgProduced, 0));
      const productIds = Array.from(new Set(rows.map(row => row.productId)));
      const shapeIds = Array.from(new Set(rows.map(row => row.shapeId)));

      return {
        id: String(1000 + index),
        batch: first.batch,
        closeDate: rows.reduce((latest, row) => (row.date > latest ? row.date : latest), first.date),
        status: "finalizada" as const,
        productIds,
        products: productIds.map(productName).join(", "),
        lineId: first.lineId,
        line: first.line,
        shapeIds,
        shapes: Array.from(new Set(rows.map(row => row.shape))).join(", "),
        formulation: `V${1 + (hashValue(`${key}-form`) % 3)}`,
        kgTheoretical,
        kgProduced,
        kgWaste,
        wastePct,
        kgMpExtra: roundMock(kgProduced * ((hashValue(`${key}-extra`) % 31) / 1000)),
        yieldPct: roundMock(100 - wastePct, 1)
      };
    })
    .sort((a, b) => b.closeDate.localeCompare(a.closeDate) || a.id.localeCompare(b.id));
};

export const PRODUCTION_VOLUME_MOCK_ROWS = buildRows();

export const PRODUCTION_MASS_BALANCE_MOCK_ORDERS = buildMassBalanceOrders();

export const PRODUCTION_VOLUME_META = {
  lines: LINES,
  shapes: SHAPES,
  products: PRODUCTS,
  batches: Array.from(new Set(PRODUCTION_VOLUME_MOCK_ROWS.map(row => row.batch))).sort(),
  years: Array.from(new Set(PRODUCTION_VOLUME_MOCK_ROWS.map(row => Number(row.date.slice(0, 4)))))
    .filter(year => Number.isInteger(year) && year > 0)
    .sort((a, b) => b - a),
  formulations: Array.from(new Set(PRODUCTION_MASS_BALANCE_MOCK_ORDERS.map(order => order.formulation))).sort()
};
