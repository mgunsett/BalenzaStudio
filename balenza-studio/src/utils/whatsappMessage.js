import { formatPrice } from "./formatters";

export const generateWhatsAppMessage = (order) => {
  const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

  const lines = order.items
    .map((i) => `• ${i.product.name} (Talle ${i.size}) x${i.quantity} → ${formatPrice(i.product.price * i.quantity)}`)
    .join("\n");

  const discount = order.subtotal * 0.1;
  const total    = order.subtotal - discount;

  const message = encodeURIComponent(
    `¡Hola BALENZA Studio! 👋\n\n` +
    `Quiero coordinar el pago por *transferencia* de mi pedido:\n\n` +
    `${lines}\n\n` +
    `Subtotal: ${formatPrice(order.subtotal)}\n` +
    `Descuento 10%: -${formatPrice(discount)}\n` +
    `*Total a abonar: ${formatPrice(total)}*\n\n` +
    `*Datos de envío:*\n` +
    `${order.shipping.name} ${order.shipping.lastName}\n` +
    `DNI: ${order.shipping.dni}\n` +
    `📍 ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.province}\n` +
    `📱 ${order.shipping.phone}\n` +
    `📧 ${order.shipping.email}`
  );

  return `https://wa.me/${WA_NUMBER}?text=${message}`;
};
