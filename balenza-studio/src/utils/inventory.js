// src/utils/inventory.js
import { SIZES } from "./constants";

/**
 * getTotalStock — suma todo el stock de un producto (variantStock o sizes)
 */
export const getTotalStock = (product) => {
  if (product?.variantStock && Object.keys(product.variantStock).length > 0) {
    return Object.values(product.variantStock).reduce((total, colorMap) => {
      return total + Object.values(colorMap || {}).reduce((s, v) => s + (Number(v) || 0), 0);
    }, 0);
  }
  return Object.values(product?.sizes || {}).reduce((s, v) => s + (Number(v) || 0), 0);
};

/**
 * getSizeStock — stock total para un talle específico
 */
export const getSizeStock = (product, sizeKey) => {
  if (product?.variantStock?.[sizeKey]) {
    return Object.values(product.variantStock[sizeKey]).reduce(
      (s, v) => s + (Number(v) || 0),
      0
    );
  }
  return product?.sizes?.[sizeKey] || 0;
};

/**
 * getVariantStock — stock para talle+color específico
 */
export const getVariantStock = (product, sizeKey, colorKey = "__default") => {
  if (product?.variantStock) {
    return product.variantStock[sizeKey]?.[colorKey] || 0;
  }
  if (colorKey === "__default") return product?.sizes?.[sizeKey] || 0;
  return 0;
};

/**
 * normalizeVariantStock — convierte sizes → variantStock si es necesario
 * Si ya tiene variantStock lo retorna tal cual.
 * Si no, convierte sizes: { XS: 5 } → variantStock: { XS: { __default: 5 } }
 */
export const normalizeVariantStock = (product, colors = []) => {
  if (product?.variantStock && Object.keys(product.variantStock).length > 0) {
    return product.variantStock;
  }
  const colKeys = colors.length > 0 ? colors : ["__default"];
  const result = {};
  SIZES.forEach((size) => {
    result[size] = {};
    colKeys.forEach((c) => {
      result[size][c] = c === "__default" ? (product?.sizes?.[size] || 0) : 0;
    });
  });
  return result;
};

/**
 * buildInventoryPayload — construye el payload para Firestore
 * A partir de variantStock, deriva también sizes (suma por talle)
 */
export const buildInventoryPayload = (variantStock) => {
  const sizes = {};
  Object.entries(variantStock).forEach(([sizeKey, colorMap]) => {
    sizes[sizeKey] = Object.values(colorMap || {}).reduce(
      (s, v) => s + (Number(v) || 0),
      0
    );
  });
  return { variantStock, sizes };
};

/**
 * getAvailableColorsForSize — colores con stock > 0 para un talle específico
 */
export const getAvailableColorsForSize = (product, sizeKey) => {
  if (!product?.variantStock) return [];
  const colorMap = product.variantStock[sizeKey] || {};
  return Object.entries(colorMap)
    .filter(([, v]) => Number(v) > 0)
    .map(([k]) => k)
    .filter((k) => k !== "__default");
};

/**
 * initVariantStock — crea un variantStock vacío para talles y colores dados
 */
export const initVariantStock = (colors = []) => {
  const colKeys = colors.length > 0 ? colors : ["__default"];
  const result = {};
  SIZES.forEach((size) => {
    result[size] = {};
    colKeys.forEach((c) => { result[size][c] = 0; });
  });
  return result;
};
