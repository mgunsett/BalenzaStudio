// ═══════════════════════════════════════════════════════════════
// src/components/admin/OrderDetail.jsx
// Página individual para /admin/ordenes/:id
// Usa: getOrderById, updateOrderStatus — param "id" (no orderId)
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  Box, Text, Flex, Badge, Button, Select, Spinner,
  VStack, HStack, Table, Thead, Tbody, Tr, Th, Td,
  Image, SimpleGrid,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getOrderById, updateOrderStatus } from "../../services/firebase/orders";
import { ORDER_STATUS } from "../../utils/constants";
import { formatPrice, formatDate } from "../../utils/formatters";
import { generateWhatsAppMessage } from "../../utils/whatsappMessage";
import toast from "react-hot-toast";

const InfoRow = ({ label, value }) => (
  <HStack
    justify="space-between"
    py={2}
    borderBottom="0.5px solid rgba(160,120,90,0.08)"
    _last={{ borderBottom: "none" }}
  >
    <Text fontFamily="body" fontSize="xs" color="brand.muted">{label}</Text>
    <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={400} textAlign="right" maxW="60%">
      {value || "—"}
    </Text>
  </HStack>
);

const OrderDetail = () => {
  const { id }      = useParams();   // ← "id" como en AdminPage
  const navigate    = useNavigate();
  const [order,     setOrder]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [newStatus, setNewStatus] = useState("");

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
      <Flex justify="center" align="center" py={20}>
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Flex>
    );
  }
  if (!order) return null;

  // WhatsApp link — usa la utilidad existente
  let waLink = null;
  try {
    waLink = generateWhatsAppMessage({
      items:    (order.items || []).map((i) => ({
        product:  { name: i.name, price: i.price },
        size:     i.size,
        quantity: i.quantity,
      })),
      shipping: order.shipping || {},
      subtotal: order.totals?.subtotal || 0,
    });
  } catch {}

  const st = ORDER_STATUS[order.status] || { label: order.status, color: "gray" };

  return (
    <VStack align="stretch" spacing={6} maxW="900px">
      {/* Header */}
      <Flex align="center" gap={3} flexWrap="wrap">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => navigate("/admin/ordenes")}
          fontFamily="body"
          fontSize="xs"
          color="brand.muted"
          _hover={{ color: "brand.dark", bg: "brand.beige" }}
        >
          Volver
        </Button>
        <Box h="20px" w="0.5px" bg="rgba(160,120,90,0.2)" />
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            Detalle
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="2xl" color="brand.dark" letterSpacing="0.04em">
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
        </VStack>
        <HStack ml="auto" spacing={2}>
          <Badge colorScheme={st.color} fontSize="xs" borderRadius="full" px={3} py={1} fontFamily="body">
            {st.label}
          </Badge>
          <Text fontFamily="body" fontSize="xs" color="brand.muted">{formatDate(order.createdAt)}</Text>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {/* Estado */}
        <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
          <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.05em" mb={4}>
            Estado del pedido
          </Text>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={2}>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                size="sm"
                flex={1}
                bg="brand.white"
                border="0.5px solid rgba(160,120,90,0.3)"
                borderRadius="lg"
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
                fontSize="xs"
                letterSpacing="0.1em"
                px={4}
                isLoading={saving}
                isDisabled={newStatus === order.status}
                onClick={handleSaveStatus}
                bg="brand.dark"
                color="brand.white"
                _hover={{ bg: "brand.brown" }}
                borderRadius="lg"
              >
                Actualizar
              </Button>
            </HStack>

            <InfoRow label="Método de pago" value={order.paymentMethod === "transfer" ? "Transferencia" : "MercadoPago"} />
            {order.mpPaymentId && <InfoRow label="ID MP" value={order.mpPaymentId} />}

            {waLink && (
              <Button
                size="sm"
                bg="wa.green"
                color="white"
                fontSize="xs"
                leftIcon={<ExternalLink size={13} />}
                onClick={() => window.open(waLink, "_blank")}
                _hover={{ bg: "wa.greenDark" }}
                borderRadius="lg"
                fontFamily="body"
              >
                Contactar por WhatsApp
              </Button>
            )}
          </VStack>
        </Box>

        {/* Cliente */}
        <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
          <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.05em" mb={4}>
            Cliente & Envío
          </Text>
          <VStack align="stretch" spacing={0}>
            <InfoRow label="Nombre"    value={`${order.shipping?.name || ""} ${order.shipping?.lastName || ""}`.trim()} />
            <InfoRow label="DNI"       value={order.shipping?.dni}      />
            <InfoRow label="Email"     value={order.shipping?.email}    />
            <InfoRow label="Teléfono"  value={order.shipping?.phone}    />
            <InfoRow label="Dirección" value={order.shipping?.address}  />
            <InfoRow label="Ciudad"    value={order.shipping?.city}     />
            <InfoRow label="Provincia" value={order.shipping?.province} />
            <InfoRow label="CP"        value={order.shipping?.zip}      />
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Productos */}
      <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
        <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.05em" mb={4}>
          Productos del pedido
        </Text>
        <Box overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                {["Producto", "Talle", "Cant.", "Precio", "Subtotal"].map((h) => (
                  <Th
                    key={h}
                    fontFamily="body"
                    fontSize="2xs"
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                    color="brand.muted"
                    py={3}
                    borderColor="rgba(160,120,90,0.15)"
                    isNumeric={["Cant.", "Precio", "Subtotal"].includes(h)}
                  >
                    {h}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {(order.items || []).map((item, i) => (
                <Tr key={i} _hover={{ bg: "brand.beige" }} transition="background 0.1s">
                  <Td borderColor="rgba(160,120,90,0.08)">
                    <HStack spacing={3}>
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          boxSize="40px"
                          objectFit="cover"
                          borderRadius="md"
                          flexShrink={0}
                        />
                      )}
                      <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">{item.name}</Text>
                    </HStack>
                  </Td>
                  <Td borderColor="rgba(160,120,90,0.08)">
                    <Badge bg="brand.beige" color="brand.dark" fontSize="xs" borderRadius="md" px={2} fontFamily="body">
                      {item.size || "—"}
                    </Badge>
                  </Td>
                  <Td isNumeric fontFamily="body" fontSize="sm" borderColor="rgba(160,120,90,0.08)">{item.quantity}</Td>
                  <Td isNumeric fontFamily="body" fontSize="sm" borderColor="rgba(160,120,90,0.08)">{formatPrice(item.price || 0)}</Td>
                  <Td isNumeric fontFamily="body" fontSize="sm" fontWeight={500} color="brand.brown" borderColor="rgba(160,120,90,0.08)">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Totales */}
        <VStack align="flex-end" spacing={1} mt={4} pt={4} borderTop="0.5px solid rgba(160,120,90,0.12)">
          {order.totals?.subtotal != null && order.totals.subtotal !== order.totals?.total && (
            <HStack>
              <Text fontFamily="body" fontSize="sm" color="brand.muted">Subtotal</Text>
              <Text fontFamily="body" fontSize="sm" color="brand.dark" minW="100px" textAlign="right">
                {formatPrice(order.totals.subtotal)}
              </Text>
            </HStack>
          )}
          {order.totals?.discount > 0 && (
            <HStack>
              <Text fontFamily="body" fontSize="sm" color="brand.success">Descuento</Text>
              <Text fontFamily="body" fontSize="sm" color="brand.success" minW="100px" textAlign="right">
                −{formatPrice(order.totals.discount)}
              </Text>
            </HStack>
          )}
          <HStack>
            <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">Total</Text>
            <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.brown" minW="100px" textAlign="right">
              {formatPrice(order.totals?.total || 0)}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};


export default OrderDetail;