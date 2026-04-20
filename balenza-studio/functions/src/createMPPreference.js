const { MercadoPagoConfig, Preference } = require("mercadopago");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const createMPPreference = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { items, payer, orderId } = req.body;

    if (!items?.length) return res.status(400).json({ error: "Items requeridos" });

    const preferenceData = {
      items: items.map((item) => ({
        id:          item.productId,
        title:       item.name,
        quantity:    item.quantity,
        unit_price:  item.price,
        currency_id: "ARS",
        picture_url: item.image || undefined,
      })),
      payer: {
        name:    payer.name,
        surname: payer.lastName,
        email:   payer.email,
        identification: {
          type:   "DNI",
          number: payer.dni,
        },
        phone: {
          number: payer.phone,
        },
        address: {
          street_name: payer.address,
          zip_code:    payer.zip,
        },
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pago-exitoso?orderId=${orderId}`,
        failure: `${process.env.FRONTEND_URL}/pago-fallido?orderId=${orderId}`,
        pending: `${process.env.FRONTEND_URL}/pago-pendiente?orderId=${orderId}`,
      },
      auto_return:        "approved",
      external_reference: orderId,
      statement_descriptor: "BALENZA Studio",
      notification_url: `${process.env.FUNCTIONS_URL}/mpWebhook`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const client = new Preference(mp);
    const preference = await client.create({ body: preferenceData });

    // Guardar preferenceId en la orden
    await db.collection("orders").doc(orderId).update({
      mpPreferenceId: preference.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ preferenceId: preference.id });
  } catch (error) {
    console.error("Error creando preferencia MP:", error?.message || error);
    console.error("Detalle:", JSON.stringify(error?.cause || error?.response?.data || {}));
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { createMPPreference };