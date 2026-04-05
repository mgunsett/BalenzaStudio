import { useState, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Badge, Button, Select, Image,
  Divider, SimpleGrid, Spinner,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getOrderById, updateOrderStatus } from "../../services/firebase/orders";
import { formatPrice, formatDate } from "../../utils/formatters";
import { ORDER_STATUS } from "../../utils/constants";
import { generateWhatsAppMessage } from "../../utils/whatsappMessage";
import toast from "react-hot-toast";

const InfoRow = ({ label, value }) => (
  <HStack justify="space-between" py={2} borderBottom="0.5px solid rgba(160,120,90,0.08)">
    <Text fontFamily="body" fontSize="xs" color="brand.muted" letterSpacing="0.05em">{label}</Text>
    <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={400} textAlign="right" maxW="60%">{value}</Text>
  </HStack>
);

const OrderDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [order,    setOrder]   = useState(null);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [newStatus,setNewStatus] = useState("");

  useEffect(() => {
    getOrderById(id)
      .then((o) => {
        if (!o) { navigate("/admin/ordenes"); return; }
        setOrder(o);
        setNewStatus(o.status);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await updateOrderStatus(id, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      toast.success("Estado actualizado");
    } catch { toast.error("Error"); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Box py={20} display="flex" justifyContent="center">
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Box>
    );
  }
  if (!order) return null;

  const waLink = generateWhatsAppMessage({
    items: order.items?.map((i) => ({
      product: { name: i.name, price: i.price },
      size: i.size,
      quantity: i.quantity,
    })) || [],
    shipping: order.shipping || {},
    subtotal: order.totals?.subtotal || 0,
  });

  return (
    <VStack align="stretch" spacing={6} maxW="860px">
      {/* Header */}
      <HStack justify="space-between">
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            Detalle
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="2xl" color="brand.dark">
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
        </VStack>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          color="brand.muted"
          fontSize="xs"
          onClick={() => navigate("/admin/ordenes")}
        >
          Volver
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {/* Estado */}
        <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
          <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={4}>
            Estado del pedido
          </Text>
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Badge
                colorScheme={ORDER_STATUS[order.status]?.color || "gray"}
                fontSize="xs"
                borderRadius="full"
                px={3} py={1}
              >
                {ORDER_STATUS[order.status]?.label || order.status}
              </Badge>
              <Text fontFamily="body" fontSize="xs" color="brand.muted">
                {formatDate(order.createdAt)}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                size="sm"
                flex={1}
                bg="brand.white"
                border="0.5px solid rgba(160,120,90,0.3)"
                borderRadius="sm"
                fontFamily="body"
                fontSize="xs"
                _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
              >
                {Object.entries(ORDER_STATUS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="primary"
                fontSize="xs"
                px={4}
                isLoading={saving}
                onClick={handleSaveStatus}
                isDisabled={newStatus === order.status}
              >
                Actualizar
              </Button>
            </HStack>
            <HStack>
              <Text fontFamily="body" fontSize="xs" color="brand.muted">Método de pago:</Text>
              <Badge variant="subtle" fontSize="2xs">
                {order.paymentMethod === "transfer" ? "Transferencia" : "MercadoPago"}
              </Badge>
            </HStack>
            {order.mpPaymentId && (
              <Text fontFamily="body" fontSize="2xs" color="brand.muted">
                ID MP: {order.mpPaymentId}
              </Text>
            )}
            {/* WhatsApp rápido */}
            <Button
              size="sm"
              bg="wa.green"
              color="white"
              fontSize="xs"
              leftIcon={<ExternalLink size={13} />}
              onClick={() => window.open(waLink, "_blank")}
              _hover={{ bg: "wa.greenDark" }}
              borderRadius="md"
            >
              Contactar por WhatsApp
            </Button>
          </VStack>
        </Box>

        {/* Datos del cliente */}
        <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
          <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={4}>
            Cliente & Envío
          </Text>
          <VStack align="stretch" spacing={0}>
            <InfoRow label="Nombre"    value={`${order.shipping?.name} ${order.shipping?.lastName}`} />
            <InfoRow label="DNI"       value={order.shipping?.dni} />
            <InfoRow label="Email"     value={order.shipping?.email} />
            <InfoRow label="Teléfono"  value={order.shipping?.phone} />
            <InfoRow label="Dirección" value={order.shipping?.address} />
            <InfoRow label="Ciudad"    value={order.shipping?.city} />
            <InfoRow label="Provincia" value={order.shipping?.province} />
            <InfoRow label="CP"        value={order.shipping?.zip} />
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Productos */}
      <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
        <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={4}>
          Productos del pedido
        </Text>
        <VStack align="stretch" spacing={0}>
          {order.items?.map((item, i) => (
            <HStack
              key={i}
              py={3}
              spacing={4}
              borderBottom="0.5px solid rgba(160,120,90,0.08)"
              align="center"
            >
              <Image
                src={item.image || `https://placehold.co/48x60/EDE0D4/7A6555`}
                alt={item.name}
                w="48px" h="60px"
                objectFit="cover"
                borderRadius="md"
                bg="brand.beige"
                flexShrink={0}
              />
              <VStack align="flex-start" spacing={0} flex={1}>
                <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={500}>{item.name}</Text>
                <Text fontFamily="body" fontSize="xs" color="brand.muted">
                  Talle {item.size} · {item.quantity} unidad{item.quantity > 1 ? "es" : ""}
                </Text>
              </VStack>
              <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                {formatPrice(item.price * item.quantity)}
              </Text>
            </HStack>
          ))}
        </VStack>

        <Divider borderColor="rgba(160,120,90,0.12)" my={4} />

        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text fontFamily="body" fontSize="sm" color="brand.muted">Subtotal</Text>
            <Text fontFamily="body" fontSize="sm" color="brand.dark">{formatPrice(order.totals?.subtotal || 0)}</Text>
          </HStack>
          {order.totals?.discount > 0 && (
            <HStack justify="space-between">
              <Text fontFamily="body" fontSize="sm" color="brand.success">Descuento transferencia</Text>
              <Text fontFamily="body" fontSize="sm" color="brand.success">−{formatPrice(order.totals.discount)}</Text>
            </HStack>
          )}
          <HStack justify="space-between" pt={2} borderTop="0.5px solid rgba(160,120,90,0.12)">
            <Text fontFamily="heading" fontSize="lg" color="brand.dark">Total</Text>
            <Text fontFamily="body" fontSize="lg" fontWeight={600} color="brand.dark">
              {formatPrice(order.totals?.total || 0)}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default OrderDetail;