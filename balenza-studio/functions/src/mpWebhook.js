const { MercadoPagoConfig, Payment } = require("mercadopago");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const mpWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== "payment") return res.sendStatus(200);

    const paymentId = data?.id;
    if (!paymentId) return res.sendStatus(400);

    // Obtener detalles del pago desde MP
    const client  = new Payment(mp);
    const payment = await client.get({ id: paymentId });

    const orderId = payment.external_reference;
    const status  = payment.status;

    if (!orderId) return res.sendStatus(200);

    // Si el pago fue aprobado → descontar stock + actualizar orden
    if (status === "approved") {
      const orderSnap = await db.collection("orders").doc(orderId).get();
      if (!orderSnap.exists) return res.sendStatus(404);

      const order = orderSnap.data();

      // Transacción atómica para descontar stock
      await db.runTransaction(async (t) => {
        for (const item of order.items) {
          const productRef = db.collection("products").doc(item.productId);
          const productSnap = await t.get(productRef);

          if (!productSnap.exists) continue;

          const sizes = productSnap.data().sizes || {};
          const current = sizes[item.size] || 0;
          const newStock = Math.max(0, current - item.quantity);

          t.update(productRef, {
            [`sizes.${item.size}`]: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Actualizar orden
        t.update(db.collection("orders").doc(orderId), {
          status:      "approved",
          mpPaymentId: String(paymentId),
          updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      console.log(`✅ Orden ${orderId} aprobada. Stock descontado.`);
    }

    if (status === "rejected" || status === "cancelled") {
      await db.collection("orders").doc(orderId).update({
        status:    "cancelled",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error en webhook MP:", error);
    return res.sendStatus(500);
  }
};

module.exports = { mpWebhook };