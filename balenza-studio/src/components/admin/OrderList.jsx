// ═══════════════════════════════════════════════════════════════
// src/components/admin/OrderList.jsx
// Vista mixta: lista + panel de detalle lateral (desktop)
// Usa: getAllOrders, updateOrderStatus
// Estructura de orden: order.shipping.name, order.totals.total
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import {
  Box, Text, Flex, Badge, Select, Input, HStack, VStack,
  Spinner, Divider, Image,
  Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Search, ShoppingCart, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../../services/firebase/orders";
import { ORDER_STATUS } from "../../utils/constants";
import { formatPrice, formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

// ── Panel de detalle ─────────────────────────────────────────────────
const DetailPanel = ({ order, onStatusChange, updating }) => {
  if (!order) {
    return (
      <Flex h="100%" align="center" justify="center" direction="column" gap={3}>
        <ShoppingCart size={44} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
        <Text fontFamily="body" fontSize="sm" color="brand.muted" textAlign="center">
          Seleccioná una orden para ver el detalle
        </Text>
      </Flex>
    );
  }

  const st = ORDER_STATUS[order.status] || { label: order.status, color: "gray" };

  return (
    <VStack align="stretch" spacing={5} overflowY="auto" pb={4}>
      {/* ID + estado */}
      <Box>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
          Orden
        </Text>
        <Text fontFamily="heading" fontWeight={300} fontSize="2xl" color="brand.dark" letterSpacing="0.04em">
          #{order.id.slice(0, 8).toUpperCase()}
        </Text>
        <HStack mt={1}>
          <Badge colorScheme={st.color} fontSize="xs" borderRadius="full" px={2} fontFamily="body">
            {st.label}
          </Badge>
          <Text fontFamily="body" fontSize="xs" color="brand.muted">{formatDate(order.createdAt)}</Text>
        </HStack>
      </Box>

      {/* Cambiar estado */}
      <Box>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1.5}>
          Cambiar estado
        </Text>
        <Select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          isDisabled={updating}
          size="sm"
          bg="brand.white"
          border="0.5px solid rgba(160,120,90,0.3)"
          borderRadius="lg"
          fontFamily="body"
          fontSize="sm"
          _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
        >
          {Object.entries(ORDER_STATUS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </Select>
      </Box>

      <Divider borderColor="rgba(160,120,90,0.15)" />

      {/* Datos del cliente */}
      <Box>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={2}>
          Cliente
        </Text>
        <VStack align="stretch" spacing={1.5}>
          {[
            { label: "Nombre",    val: `${order.shipping?.name || ""} ${order.shipping?.lastName || ""}`.trim() || "—" },
            { label: "DNI",       val: order.shipping?.dni   || "—" },
            { label: "Email",     val: order.shipping?.email || "—" },
            { label: "Teléfono",  val: order.shipping?.phone || "—" },
            { label: "Dirección", val: order.shipping?.address ? `${order.shipping.address}, ${order.shipping.city || ""}, ${order.shipping.province || ""}` : "—" },
          ].map(({ label, val }) => (
            <Flex key={label} justify="space-between" gap={2}>
              <Text fontFamily="body" fontSize="xs" color="brand.muted" flexShrink={0}>{label}</Text>
              <Text fontFamily="body" fontSize="xs" color="brand.dark" textAlign="right" noOfLines={2}>{val}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>

      <Divider borderColor="rgba(160,120,90,0.15)" />

      {/* Productos */}
      <Box>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={2}>
          Productos
        </Text>
        <VStack spacing={2.5} align="stretch">
          {(order.items || []).map((item, i) => (
            <HStack key={i} spacing={3}>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  w="36px" h="44px"
                  objectFit="cover"
                  borderRadius="md"
                  flexShrink={0}
                  bg="brand.beige"
                />
              )}
              <VStack align="flex-start" spacing={0} flex={1}>
                <Text fontFamily="body" fontSize="xs" fontWeight={500} color="brand.dark" noOfLines={1}>
                  {item.name}
                </Text>
                <Text fontFamily="body" fontSize="2xs" color="brand.muted">
                  T.{item.size} · ×{item.quantity}
                </Text>
              </VStack>
              <Text fontFamily="body" fontSize="xs" fontWeight={500} color="brand.brown" flexShrink={0}>
                {formatPrice((item.price || 0) * (item.quantity || 1))}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      <Divider borderColor="rgba(160,120,90,0.15)" />

      {/* Totales */}
      <VStack align="stretch" spacing={1}>
        {order.totals?.subtotal != null && order.totals.subtotal !== order.totals?.total && (
          <Flex justify="space-between">
            <Text fontFamily="body" fontSize="xs" color="brand.muted">Subtotal</Text>
            <Text fontFamily="body" fontSize="xs" color="brand.dark">{formatPrice(order.totals.subtotal)}</Text>
          </Flex>
        )}
        {order.totals?.discount > 0 && (
          <Flex justify="space-between">
            <Text fontFamily="body" fontSize="xs" color="brand.success">Descuento</Text>
            <Text fontFamily="body" fontSize="xs" color="brand.success" fontWeight={500}>
              −{formatPrice(order.totals.discount)}
            </Text>
          </Flex>
        )}
        <Flex justify="space-between">
          <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">Total</Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.brown">
            {formatPrice(order.totals?.total || 0)}
          </Text>
        </Flex>
      </VStack>
    </VStack>
  );
};

// ── OrderList principal ──────────────────────────────────────────────
const OrderList = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState(null);
  const [updating,     setUpdating]     = useState(false);
  const { isOpen, onOpen, onClose }     = useDisclosure();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelected((prev) => prev?.id === orderId ? { ...prev, status: newStatus } : prev);
      toast.success("Estado actualizado");
    } catch { toast.error("Error al actualizar"); }
    finally { setUpdating(false); }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = !filterStatus || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      o.id.toLowerCase().includes(q) ||
      `${o.shipping?.name || ""} ${o.shipping?.lastName || ""}`.toLowerCase().includes(q) ||
      (o.shipping?.email || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleSelect = (order) => {
    setSelected(order);
    if (window.innerWidth < 1024) onOpen();
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            Ventas
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark" letterSpacing="0.04em">
            Órdenes
          </Text>
        </VStack>
        <Box
          cursor="pointer"
          color="brand.muted"
          _hover={{ color: "brand.dark" }}
          onClick={load}
          title="Recargar"
        >
          <RefreshCw size={18} strokeWidth={1.5} />
        </Box>
      </Flex>

      <Flex gap={5} align="flex-start">
        {/* Columna lista */}
        <Box flex={1} minW={0}>
          {/* Filtros */}
          <HStack spacing={3} mb={4} flexWrap="wrap" gap={2}>
            <Box position="relative" flex={1} minW="180px">
              <Search
                size={14}
                color="var(--chakra-colors-brand-muted)"
                style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
              />
              <Input
                pl={8}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, ID..."
                bg="brand.cream"
                border="0.5px solid rgba(160,120,90,0.3)"
                borderRadius="lg"
                fontFamily="body"
                fontSize="sm"
                h="40px"
                _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                _placeholder={{ color: "brand.muted" }}
              />
            </Box>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              w="170px"
              bg="brand.cream"
              border="0.5px solid rgba(160,120,90,0.3)"
              borderRadius="lg"
              fontFamily="body"
              fontSize="sm"
              h="40px"
              color="brand.dark"
              _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
            >
              <option value="">Todos los estados</option>
              {Object.entries(ORDER_STATUS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </Select>
          </HStack>

          <Text fontFamily="body" fontSize="xs" color="brand.muted" mb={3}>
            {loading ? "Cargando..." : `${filtered.length} orden${filtered.length !== 1 ? "es" : ""}`}
          </Text>

          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner size="lg" color="brand.brown" thickness="1px" />
            </Flex>
          ) : (
            <VStack spacing={2} align="stretch">
              {filtered.map((order) => {
                const st         = ORDER_STATUS[order.status] || { label: order.status, color: "gray" };
                const isSelected = selected?.id === order.id;
                return (
                  <Flex
                    key={order.id}
                    bg={isSelected ? "rgba(160,120,90,0.06)" : "brand.cream"}
                    borderRadius="xl"
                    border="0.5px solid"
                    borderColor={isSelected ? "brand.brown" : "rgba(160,120,90,0.15)"}
                    p={4}
                    align="center"
                    gap={4}
                    cursor="pointer"
                    onClick={() => handleSelect(order)}
                    _hover={{ borderColor: "brand.sand", shadow: "sm" }}
                    transition="all 0.15s"
                    flexWrap="wrap"
                  >
                    <VStack align="flex-start" spacing={0} flex={1} minW="120px">
                      <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted" noOfLines={1}>
                        {order.shipping?.name} {order.shipping?.lastName}
                      </Text>
                    </VStack>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted" flexShrink={0}>
                      {formatDate(order.createdAt)}
                    </Text>
                    <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark" flexShrink={0}>
                      {formatPrice(order.totals?.total || 0)}
                    </Text>
                    <Badge
                      colorScheme={st.color}
                      fontSize="2xs"
                      borderRadius="full"
                      px={2}
                      fontFamily="body"
                      flexShrink={0}
                    >
                      {st.label}
                    </Badge>
                  </Flex>
                );
              })}
              {filtered.length === 0 && !loading && (
                <Flex direction="column" align="center" py={12} gap={3}>
                  <ShoppingCart size={40} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
                  <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.muted">
                    No hay órdenes
                  </Text>
                </Flex>
              )}
            </VStack>
          )}
        </Box>

        {/* Panel lateral — desktop */}
        <Box
          display={{ base: "none", lg: "block" }}
          w="300px"
          flexShrink={0}
          bg="brand.cream"
          borderRadius="xl"
          border="0.5px solid rgba(160,120,90,0.15)"
          p={5}
          position="sticky"
          top="24px"
          maxH="calc(100vh - 120px)"
          overflowY="auto"
        >
          <DetailPanel
            order={selected}
            onStatusChange={handleStatusChange}
            updating={updating}
          />
        </Box>
      </Flex>

      {/* Drawer mobile */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="sm">
        <DrawerOverlay bg="rgba(44,26,14,0.45)" />
        <DrawerContent bg="brand.cream">
          <DrawerCloseButton color="brand.muted" _hover={{ color: "brand.dark" }} />
          <DrawerBody pt={10}>
            <DetailPanel
              order={selected}
              onStatusChange={handleStatusChange}
              updating={updating}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default OrderList;
