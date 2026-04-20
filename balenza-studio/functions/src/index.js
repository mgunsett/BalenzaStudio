const { onRequest } = require("firebase-functions/v2/https");
const { createMPPreference } = require("./createMPPreference");
const { mpWebhook }          = require("./mpWebhook");
const { instagramFeed }      = require("./instagramFeed");

// Crear preferencia de pago (llamada desde frontend React)
exports.createMPPreference = onRequest(
  { region: "southamerica-east1", cors: true },
  createMPPreference
);

// Webhook de MercadoPago (POST desde MP al aprobar un pago)
exports.mpWebhook = onRequest(
  { region: "southamerica-east1" },
  mpWebhook
);

// Feed de Instagram (GET, público, con caché en Firestore)
exports.instagramFeed = onRequest(
  { region: "southamerica-east1", cors: true },
  instagramFeed
);