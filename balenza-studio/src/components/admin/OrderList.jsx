import { useState, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Badge, Select, Input, Button,
  Spinner, Flex, IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "../../services/firebase/orders";
import { formatPrice, formatDate } from "../../utils/formatters";
import { ORDER_STATUS } from "../../utils/constants";
import toast from "react-hot-toast";

const STATUS_COLOR = {
  pending:          "yellow",
  approved:         "green",
  transfer_pending: "blue",
  shipped:          "purple",
  cancelled:        "red",
};

const OrderList = () => {
  const navigate  = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [filtered,setFiltered]= useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("");

  const load = () => {
    setLoading(true);
    getAllOrders()
      .then((o) => { setOrders(o); setFiltered(o); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = orders;
    if (search)  result = result.filter((o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      `${o.shipping?.name} ${o.shipping?.lastName}`.toLowerCase().includes(search.toLowerCase())
    );
    if (status)  result = result.filter((o) => o.status === status);
    setFiltered(result);
  }, [search, status, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Estado actualizado");
      load();
    } catch { toast.error("Error al actualizar"); }
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <VStack align="flex-start" spacing={0}>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
          Ventas
        </Text>
        <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">
          Órdenes
        </Text>
      </VStack>

      {/* Filtros */}
      <HStack spacing={3} flexWrap="wrap" gap={3}>
        <Box position="relative" flex={1} minW="200px">
          <Search
            size={15}
            color="var(--chakra-colors-brand-muted)"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
          />
          <Input
            pl={9}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o ID..."
            bg="brand.white"
            border="0.5px solid rgba(160,120,90,0.3)"
            borderRadius="sm"
            fontFamily="body"
            fontSize="sm"
            h="40px"
            _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
          />
        </Box>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          w="180px"
          bg="brand.white"
          border="0.5px solid rgba(160,120,90,0.3)"
          borderRadius="sm"
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

      <Text fontFamily="body" fontSize="xs" color="brand.muted">
        {loading ? "Cargando..." : `${filtered.length} orden${filtered.length !== 1 ? "es" : ""}`}
      </Text>

      {loading ? (
        <Box py={16} display="flex" justifyContent="center">
          <Spinner size="lg" color="brand.brown" thickness="1px" />
        </Box>
      ) : (
        <VStack align="stretch" spacing={2}>
          {filtered.map((order) => (
            <Box
              key={order.id}
              bg="brand.cream"
              borderRadius="lg"
              border="0.5px solid rgba(160,120,90,0.15)"
              p={4}
              cursor="pointer"
              onClick={() => navigate(`/admin/ordenes/${order.id}`)}
              _hover={{ borderColor: "brand.sand", bg: "brand.white" }}
              transition="all 0.15s"
            >
              <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
                <VStack align="flex-start" spacing={0}>
                  <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">
                    {order.shipping?.name} {order.shipping?.lastName}
                  </Text>
                </VStack>

                <Text fontFamily="body" fontSize="xs" color="brand.muted">
                  {formatDate(order.createdAt)}
                </Text>

                <VStack align="flex-start" spacing={0.5}>
                  {order.items?.slice(0, 2).map((item, i) => (
                    <Text key={i} fontFamily="body" fontSize="xs" color="brand.muted" noOfLines={1}>
                      {item.name} × {item.quantity} (T.{item.size})
                    </Text>
                  ))}
                  {(order.items?.length || 0) > 2 && (
                    <Text fontFamily="body" fontSize="2xs" color="brand.muted">
                      +{order.items.length - 2} más
                    </Text>
                  )}
                </VStack>

                <Text fontFamily="body" fontSize="md" fontWeight={500} color="brand.dark">
                  {formatPrice(order.totals?.total || 0)}
                </Text>

                {/* Estado editable inline */}
                <Select
                  value={order.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(order.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  w="160px"
                  size="sm"
                  bg="brand.white"
                  border="0.5px solid rgba(160,120,90,0.25)"
                  borderRadius="sm"
                  fontFamily="body"
                  fontSize="xs"
                  color="brand.dark"
                  _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                >
                  {Object.entries(ORDER_STATUS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </Select>

                <ChevronRight size={16} color="var(--chakra-colors-brand-muted)" />
              </Flex>
            </Box>
          ))}

          {filtered.length === 0 && !loading && (
            <Box py={16} textAlign="center">
              <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.muted">
                No hay órdenes
              </Text>
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default OrderList;