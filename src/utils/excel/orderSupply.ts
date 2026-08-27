import * as XLSX from "xlsx-js-style";
import type { CellStyle, WorkSheet } from "xlsx-js-style";

import type { IOrderSupply } from "@/types/pages/order";
import { formatDate } from "@/utils/format";

const HEADER_STYLE: CellStyle = {
  font: { bold: true, color: { rgb: "FFFFFFFF" } },
  fill: { fgColor: { rgb: "FF2E7D32" } },
  alignment: { horizontal: "center", vertical: "center" }
};

const SECTION_TITLE_STYLE: CellStyle = {
  font: { bold: true, sz: 13 }
};

const PROVIDER_STYLE: CellStyle = {
  font: { bold: true, sz: 12 },
  fill: { fgColor: { rgb: "FFE0E0E0" } }
};

const applyRowStyle = (sheet: WorkSheet, rowIndex: number, colCount: number, style: CellStyle) => {
  for (let col = 0; col < colCount; col++) {
    const address = XLSX.utils.encode_cell({ r: rowIndex, c: col });

    if (!sheet[address]) sheet[address] = { t: "s", v: "" };
    sheet[address].s = style;
  }
};

export const exportOrderSupplyToExcel = (orderSupply: IOrderSupply) => {
  const workbook = XLSX.utils.book_new();

  const resumenHeaders = ["Fecha de creación", "Usuario", "Total en kg", "Total en unidades"];

  const resumenRow = [
    orderSupply.dateCreated ? formatDate(orderSupply.dateCreated) : "-",
    orderSupply.userName,
    orderSupply.totalQuantityInKg,
    orderSupply.totalQuantityInUnits
  ];

  const productHeaders = ["Id", "Producto", "Unidades"];
  const productRows = (orderSupply.products ?? []).map(product => [product.id, product.fullName, product.units]);

  const productsSheetData: (string | number)[][] = [
    ["Resumen"],
    resumenHeaders,
    resumenRow,
    [],
    ["Productos"],
    productHeaders,
    ...productRows
  ];

  const productsSheet = XLSX.utils.aoa_to_sheet(productsSheetData);

  applyRowStyle(productsSheet, 0, 1, SECTION_TITLE_STYLE);
  applyRowStyle(productsSheet, 1, resumenHeaders.length, HEADER_STYLE);
  applyRowStyle(productsSheet, 4, 1, SECTION_TITLE_STYLE);
  applyRowStyle(productsSheet, 5, productHeaders.length, HEADER_STYLE);

  XLSX.utils.book_append_sheet(workbook, productsSheet, "Productos");

  const materialHeaders = ["Material", "Cantidad disponible", "Cantidad faltante", "Cantidad total orden"];

  const materialsSheetData: (string | number)[][] = [];
  const providerRows: number[] = [];
  const headerRows: number[] = [];
  const merges: XLSX.Range[] = [];

  (orderSupply.materialsByProvider ?? []).forEach((provider, index) => {
    if (index > 0) materialsSheetData.push([]);

    const providerRowIndex = materialsSheetData.length;

    materialsSheetData.push([
      `Proveedor: ${provider.providerName}    Dirección: ${provider.providerAddress ?? "-"}    Teléfono: ${provider.providerPhone ?? "-"}`
    ]);
    providerRows.push(providerRowIndex);
    merges.push({
      s: { r: providerRowIndex, c: 0 },
      e: { r: providerRowIndex, c: materialHeaders.length - 1 }
    });

    const headerRowIndex = materialsSheetData.length;

    materialsSheetData.push(materialHeaders);
    headerRows.push(headerRowIndex);

    (provider.materials ?? []).forEach(material => {
      materialsSheetData.push([
        material.name,
        material.quantityAvailable,
        material.quantityMissing,
        material.quantityTotalOrder
      ]);
    });
  });

  const materialsSheet = XLSX.utils.aoa_to_sheet(materialsSheetData);

  materialsSheet["!merges"] = merges;
  providerRows.forEach(row => applyRowStyle(materialsSheet, row, 1, PROVIDER_STYLE));
  headerRows.forEach(row => applyRowStyle(materialsSheet, row, materialHeaders.length, HEADER_STYLE));

  XLSX.utils.book_append_sheet(workbook, materialsSheet, "Materiales por proveedor");

  XLSX.writeFile(workbook, `aprovisionamiento-${orderSupply.batch}.xlsx`);
};
