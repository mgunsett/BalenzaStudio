export const CATEGORIES = [
  { slug: "remeras",    label: "Remeras",    emoji: "👕" },
  { slug: "pantalones", label: "Pantalones", emoji: "👖" },
  { slug: "camperas",   label: "Camperas",   emoji: "🧥" },
];

export const SIZES = ["XS", "S", "M", "L", "XL"];

export const ORDER_STATUS = {
  pending:          { label: "Pendiente",        color: "yellow" },
  approved:         { label: "Aprobado",          color: "green"  },
  transfer_pending: { label: "Transferencia",     color: "blue"   },
  shipped:          { label: "Enviado",           color: "purple" },
  cancelled:        { label: "Cancelado",         color: "red"    },
};

export const TRANSFER_DISCOUNT = 0.10;

export const SHIPPING_COSTS = {
  local:  0,
  nearby: 3500,
  far:    11000,
};

export const NEARBY_CITIES = [
  "SANTA FE",
  "SANTO TOME",
  "RINCON",
  "COLASTINE",
  "ESPERANZA",
  "SAUCE VIEJO",
];

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/balenzastudio",
  facebook:  "https://facebook.com/balenzastudio",
  tiktok:    "https://tiktok.com/@balenzastudio",
};
