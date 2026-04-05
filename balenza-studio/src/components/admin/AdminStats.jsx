import { useRef, useEffect, useState } from "react";
import {
  Box, SimpleGrid, VStack, HStack, Text, Spinner, Select,
  Divider, Badge,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import {
  ShoppingCart, Package, DollarSign, Users, TrendingUp, Clock,
} from "lucide-react";
import { getAllOrders } from "../../services/firebase/orders";
import { getProducts } from "../../services/firebase/products";
import { formatPrice, formatDate } from "../../utils/formatters";
import { ORDER_STATUS } from "../../utils/constants";

// ── Stat card ──────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = "brand.brown", index }) => {
  const cardRef = useRef(null);
  const numRef  = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: index * 0.08 }
    );
  }, [index]);

  return (
    <Box
      ref={cardRef}
      bg="brand.cream"
      borderRadius="xl"
      border="0.5px solid rgba(160,120,90,0.15)"
      p={5}
      position="relative"
      overflow="hidden"
    >
      {/* Ícono decorativo de fondo */}
      <Box
        position="absolute"
        right={-2} bottom={-2}
        opacity={0.04}
      >
        <Icon size={80} />
      </Box>

      <VStack align="flex-start" spacing={3}>
        <Box
          w="40px" h="40px"
          borderRadius="lg"
          bg="brand.beige"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="0.5px solid rgba(160,120,90,0.2)"
        >
          <Icon size={18} color={`var(--chakra-colors-${color.replace(".", "-")})`} strokeWidth={1.5} />
        </Box>

        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
            {label}
          </Text>
          <Text ref={numRef} fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark" letterSpacing="0.02em">
            {value}
          </Text>
          {sub && (
            <Text fontFamily="body" fontSize="xs" color="brand.muted" mt={0.5}>
              {sub}
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

// ── Componente principal ───────────────────────
const AdminStats = () => {
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [period,   setPeriod]   = useState("30"); // días

  useEffect(() => {
    Promise.all([getAllOrders(), getProducts({})])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box py={20} display="flex" justifyContent="center">
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Box>
    );
  }

  // Filtrar por período
  const cutoff    = new Date();
  cutoff.setDate(cutoff.getDate() - Number(period));
  const recent    = orders.filter((o) => {
    const d = o.createdAt?.toDate?.() || new Date(o.createdAt);
    return d >= cutoff;
  });

  const approved  = recent.filter((o) => o.status === "approved");
  const pending   = orders.filter((o) => o.status === "pending" || o.status === "transfer_pending");
  const revenue   = approved.reduce((s, o) => s + (o.totals?.total || 0), 0);
  const avgTicket = approved.length ? revenue / approved.length : 0;

  // Stock bajo (cualquier talle con stock <= 2)
  const lowStock  = products.filter((p) =>
    Object.values(p.sizes || {}).some((s) => s > 0 && s <= 2)
  );
  const noStock   = products.filter((p) =>
    Object.values(p.sizes || {}).every((s) => s === 0)
  );

  const STATS = [
    {
      icon: DollarSign,
      label: "Facturación",
      value: formatPrice(revenue),
      sub: `Últimos ${period} días`,
      color: "brand.brown",
    },
    {
      icon: ShoppingCart,
      label: "Ventas aprobadas",
      value: approved.length,
      sub: `de ${recent.length} órdenes`,
      color: "brand.brown",
    },
    {
      icon: TrendingUp,
      label: "Ticket promedio",
      value: formatPrice(avgTicket),
      sub: "Por orden aprobada",
      color: "brand.brown",
    },
    {
      icon: Clock,
      label: "Pendientes",
      value: pending.length,
      sub: "Requieren atención",
      color: "brand.error",
    },
    {
      icon: Package,
      label: "Productos activos",
      value: products.length,
      sub: `${noStock.length} sin stock`,
      color: "brand.brown",
    },
    {
      icon: Users,
      label: "Stock bajo",
      value: lowStock.length,
      sub: "Productos con ≤ 2 unidades",
      color: "brand.sand",
    },
  ];

  return (
    <VStack align="stretch" spacing={8}>
      {/* Header */}
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            Resumen
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">
            Dashboard
          </Text>
        </VStack>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          w="160px"
          size="sm"
          bg="brand.white"
          border="0.5px solid rgba(160,120,90,0.3)"
          borderRadius="sm"
          fontFamily="body"
          fontSize="xs"
          color="brand.dark"
          _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 3 meses</option>
          <option value="365">Este año</option>
        </Select>
      </HStack>

      {/* Stats grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        {STATS.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </SimpleGrid>

      {/* Alertas de stock */}
      {(lowStock.length > 0 || noStock.length > 0) && (
        <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
          <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={4}>
            ⚠ Alertas de stock
          </Text>
          <VStack align="stretch" spacing={2}>
            {noStock.slice(0, 5).map((p) => (
              <HStack key={p.id} justify="space-between" py={2} borderBottom="0.5px solid rgba(160,120,90,0.08)">
                <Text fontFamily="body" fontSize="sm" color="brand.dark" noOfLines={1}>{p.name}</Text>
                <Badge bg="brand.error" color="white" fontSize="2xs" borderRadius="full" px={2}>Sin stock</Badge>
              </HStack>
            ))}
            {lowStock.filter((p) => !noStock.find((n) => n.id === p.id)).slice(0, 5).map((p) => (
              <HStack key={p.id} justify="space-between" py={2} borderBottom="0.5px solid rgba(160,120,90,0.08)">
                <Text fontFamily="body" fontSize="sm" color="brand.dark" noOfLines={1}>{p.name}</Text>
                <Badge bg="brand.sand" color="brand.dark" fontSize="2xs" borderRadius="full" px={2}>Stock bajo</Badge>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Últimas órdenes */}
      <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
        <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={4}>
          Últimas órdenes
        </Text>
        <VStack align="stretch" spacing={0}>
          {orders.slice(0, 8).map((order) => {
            const st = ORDER_STATUS[order.status];
            return (
              <HStack
                key={order.id}
                justify="space-between"
                py={3}
                borderBottom="0.5px solid rgba(160,120,90,0.08)"
                flexWrap="wrap"
                gap={2}
              >
                <VStack align="flex-start" spacing={0}>
                  <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={500}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">
                    {order.shipping?.name} {order.shipping?.lastName}
                  </Text>
                </VStack>
                <Text fontFamily="body" fontSize="xs" color="brand.muted">
                  {formatDate(order.createdAt)}
                </Text>
                <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                  {formatPrice(order.totals?.total || 0)}
                </Text>
                <Badge
                  fontSize="2xs"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  colorScheme={st?.color || "gray"}
                >
                  {st?.label || order.status}
                </Badge>
              </HStack>
            );
          })}
        </VStack>
      </Box>
    </VStack>
  );
};

export default AdminStats;