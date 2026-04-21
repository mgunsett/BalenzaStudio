// src/components/admin/AdminStats.jsx
// Requiere: npm install recharts
import { useEffect, useState, useMemo } from "react";
import {
  Box, SimpleGrid, Flex, Text, VStack, HStack, Spinner,
  Select, Badge, Divider, Image, Progress,
} from "@chakra-ui/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, ResponsiveContainer,
} from "recharts";
import {
  Package, ShoppingCart, DollarSign, Clock,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
} from "lucide-react";
import { getAllOrders } from "../../services/firebase/orders";
import { getProducts }  from "../../services/firebase/products";
import { formatPrice, formatDate } from "../../utils/formatters";
import { ORDER_STATUS } from "../../utils/constants";

// ── Helpers de fecha ────────────────────────────────────────────────
const toDate = (ts) => {
  if (!ts) return new Date(0);
  if (ts.toDate) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

const dayKey = (d) =>
  `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;

const weekKey = (d) => {
  const w = new Date(d);
  w.setDate(w.getDate() - w.getDay());
  return `${w.getDate()}/${w.getMonth() + 1}`;
};

const monthKey = (d) =>
  d.toLocaleString("es-AR", { month: "short", year: "2-digit" });

// ── Stat card ────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, trend, index = 0 }) => {
  const isUp   = trend > 0;
  const isDown = trend < 0;

  return (
    <Box
      bg="brand.cream"
      borderRadius="xl"
      border="0.5px solid rgba(160,120,90,0.18)"
      p={5}
      position="relative"
      overflow="hidden"
      _hover={{ borderColor: "brand.sand", transform: "translateY(-2px)", shadow: "sm" }}
      transition="all 0.22s"
    >
      <Box
        position="absolute"
        top={-3} right={-3}
        w="72px" h="72px"
        borderRadius="full"
        bg="brand.beige"
        opacity={0.5}
      />

      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box
          w="38px" h="38px"
          borderRadius="lg"
          bg="brand.beige"
          border="0.5px solid rgba(160,120,90,0.2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon size={17} color="var(--chakra-colors-brand-brown)" strokeWidth={1.5} />
        </Box>
        {trend !== undefined && trend !== null && (
          <HStack spacing={1}>
            {isUp   && <TrendingUp   size={12} color="var(--chakra-colors-brand-success)" />}
            {isDown && <TrendingDown size={12} color="var(--chakra-colors-brand-error)"   />}
            <Text
              fontFamily="body"
              fontSize="2xs"
              fontWeight={600}
              color={isUp ? "brand.success" : isDown ? "brand.error" : "brand.muted"}
            >
              {trend > 0 ? "+" : ""}{trend}%
            </Text>
          </HStack>
        )}
      </Flex>

      <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted" mb={1}>
        {label}
      </Text>
      <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark" letterSpacing="0.02em" lineHeight={1}>
        {value}
      </Text>
      {sub && (
        <Text fontFamily="body" fontSize="xs" color="brand.muted" mt={1.5}>{sub}</Text>
      )}
    </Box>
  );
};

// ── Tooltip personalizado del gráfico ────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      bg="brand.dark"
      borderRadius="lg"
      px={3}
      py={2}
      shadow="md"
    >
      <Text fontFamily="body" fontSize="xs" color="rgba(237,224,212,0.65)" mb={0.5}>{label}</Text>
      <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.sand" letterSpacing="0.04em">
        {formatPrice(payload[0].value)}
      </Text>
    </Box>
  );
};

// ── Componente principal ─────────────────────────────────────────────
const AdminStats = () => {
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [period,   setPeriod]   = useState("30");
  const [gran,     setGran]     = useState("day"); // day | week | month

  useEffect(() => {
    Promise.all([
      getProducts({ includeInactive: true }),
      getAllOrders(),
    ])
      .then(([p, o]) => { setProducts(p); setOrders(o); })
      .finally(() => setLoading(false));
  }, []);

  // ── Filtrado por período ─────────────────────────────────────────
  const { current, previous } = useMemo(() => {
    const days   = Number(period);
    const now    = new Date();
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - days);
    const prev   = new Date(cutoff); prev.setDate(prev.getDate() - days);
    return {
      current:  orders.filter((o) => toDate(o.createdAt) >= cutoff),
      previous: orders.filter((o) => { const d = toDate(o.createdAt); return d >= prev && d < cutoff; }),
    };
  }, [orders, period]);

  // ── Métricas ────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const approved = (arr) => arr.filter((o) => o.status === "approved");
    const revenue  = (arr) => approved(arr).reduce((s, o) => s + (o.totals?.total || o.total || 0), 0);

    const revCur = revenue(current);
    const revPrv = revenue(previous);
    const revTrend = revPrv > 0 ? Math.round(((revCur - revPrv) / revPrv) * 100) : null;

    const ordTrend = previous.length > 0
      ? Math.round(((current.length - previous.length) / previous.length) * 100)
      : null;

    const avg = approved(current).length
      ? revCur / approved(current).length
      : 0;

    const pending  = orders.filter((o) => o.status === "pending" || o.status === "transfer_pending");
    const noStock  = products.filter((p) => Object.values(p.sizes || {}).every((s) => s === 0));
    const lowStock = products.filter((p) => Object.values(p.sizes || {}).some((s) => s > 0 && s <= 3));

    return { revCur, revTrend, ordTrend, avg, pending, noStock, lowStock };
  }, [current, previous, products, orders]);

  // ── Datos del gráfico ────────────────────────────────────────────
  const chartData = useMemo(() => {
    const keyFn = gran === "day" ? dayKey : gran === "week" ? weekKey : monthKey;
    const map   = new Map();
    const now   = new Date();
    for (let i = Number(period) - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const k = keyFn(d);
      if (!map.has(k)) map.set(k, 0);
    }
    current
      .filter((o) => o.status === "approved")
      .forEach((o) => {
        const k = keyFn(toDate(o.createdAt));
        map.set(k, (map.get(k) || 0) + (o.totals?.total || o.total || 0));
      });
    return Array.from(map.entries()).map(([name, ventas]) => ({ name, ventas }));
  }, [current, gran, period]);

  // ── Ranking de productos ────────────────────────────────────────
  const topProducts = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.productId || item.name;
        const cur = map.get(key) || { name: item.name, image: item.image, qty: 0, revenue: 0 };
        cur.qty     += item.quantity || 1;
        cur.revenue += (item.price || 0) * (item.quantity || 1);
        map.set(key, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const maxQty = topProducts[0]?.qty || 1;

  if (loading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner size="lg" color="brand.brown" thickness="1px" speed="0.8s" />
      </Flex>
    );
  }

  return (
    <VStack align="stretch" spacing={7}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            Resumen
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark" letterSpacing="0.04em">
            Dashboard
          </Text>
        </VStack>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          w="160px"
          size="sm"
          bg="brand.cream"
          border="0.5px solid rgba(160,120,90,0.3)"
          borderRadius="lg"
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
      </Flex>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} gap={4}>
        <StatCard
          label="Facturación"
          value={formatPrice(metrics.revCur)}
          trend={metrics.revTrend}
          sub={`vs período anterior`}
          icon={DollarSign}
          index={0}
        />
        <StatCard
          label="Órdenes"
          value={current.length}
          trend={metrics.ordTrend}
          sub="vs período anterior"
          icon={ShoppingCart}
          index={1}
        />
        <StatCard
          label="Ticket promedio"
          value={formatPrice(metrics.avg)}
          sub="Por orden aprobada"
          icon={TrendingUp}
          index={2}
        />
        <StatCard
          label="Pendientes"
          value={metrics.pending.length}
          sub="Requieren atención"
          icon={Clock}
          index={3}
        />
      </SimpleGrid>

      {/* ── Gráfico + Alertas ───────────────────────────────────── */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} gap={5}>

        {/* Gráfico de ventas */}
        <Box
          gridColumn={{ xl: "span 2" }}
          bg="brand.cream"
          borderRadius="xl"
          border="0.5px solid rgba(160,120,90,0.18)"
          p={5}
        >
          <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
            <VStack align="flex-start" spacing={0}>
              <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.muted">
                Evolución de ventas
              </Text>
              <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
                Ingresos
              </Text>
            </VStack>
            <HStack spacing={1}>
              {[
                { key: "day",   label: "Día" },
                { key: "week",  label: "Sem" },
                { key: "month", label: "Mes" },
              ].map((g) => (
                <Box
                  key={g.key}
                  px={3} py={1}
                  borderRadius="full"
                  bg={gran === g.key ? "brand.brown" : "brand.beige"}
                  color={gran === g.key ? "brand.white" : "brand.muted"}
                  fontSize="2xs"
                  fontFamily="body"
                  fontWeight={600}
                  letterSpacing="0.05em"
                  cursor="pointer"
                  onClick={() => setGran(g.key)}
                  transition="all 0.15s"
                  _hover={{ opacity: 0.85 }}
                >
                  {g.label}
                </Box>
              ))}
            </HStack>
          </Flex>

          {chartData.some((d) => d.ventas > 0) ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balenzaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#A0785A" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#A0785A" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,120,90,0.12)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#7A6555" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#7A6555" }}
                  axisLine={false}
                  tickLine={false}
                  width={46}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#A0785A"
                  strokeWidth={2}
                  fill="url(#balenzaGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#A0785A", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Flex h="210px" align="center" justify="center">
              <Text fontFamily="body" fontSize="sm" color="brand.muted">
                Sin ventas aprobadas en este período
              </Text>
            </Flex>
          )}
        </Box>

        {/* Panel de alertas */}
        <Box
          bg="brand.cream"
          borderRadius="xl"
          border="0.5px solid rgba(160,120,90,0.18)"
          p={5}
        >
          <VStack align="flex-start" spacing={0} mb={4}>
            <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.muted">
              Inventario
            </Text>
            <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
              Alertas
            </Text>
          </VStack>

          <VStack spacing={3} align="stretch">
            {/* Sin stock */}
            <Flex
              bg={metrics.noStock.length > 0 ? "rgba(192,57,43,0.06)" : "rgba(92,138,110,0.06)"}
              borderRadius="lg"
              p={3}
              align="center"
              gap={3}
              border="0.5px solid"
              borderColor={metrics.noStock.length > 0 ? "rgba(192,57,43,0.2)" : "rgba(92,138,110,0.2)"}
            >
              {metrics.noStock.length > 0
                ? <AlertTriangle size={15} color="var(--chakra-colors-brand-error)" />
                : <CheckCircle  size={15} color="var(--chakra-colors-brand-success)" />
              }
              <VStack spacing={0} align="flex-start" flex={1}>
                <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">Sin stock</Text>
                <Text fontFamily="body" fontSize="xs" color="brand.muted">
                  {metrics.noStock.length} producto{metrics.noStock.length !== 1 ? "s" : ""}
                </Text>
              </VStack>
              <Badge
                bg={metrics.noStock.length > 0 ? "brand.error" : "brand.success"}
                color="white"
                borderRadius="full"
                px={2}
                fontSize="2xs"
                fontFamily="body"
              >
                {metrics.noStock.length}
              </Badge>
            </Flex>

            {/* Stock bajo */}
            <Flex
              bg="rgba(196,168,130,0.1)"
              borderRadius="lg"
              p={3}
              align="center"
              gap={3}
              border="0.5px solid rgba(196,168,130,0.3)"
            >
              <AlertTriangle size={15} color="var(--chakra-colors-brand-sand)" />
              <VStack spacing={0} align="flex-start" flex={1}>
                <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">Stock bajo (≤3)</Text>
                <Text fontFamily="body" fontSize="xs" color="brand.muted">
                  {metrics.lowStock.length} producto{metrics.lowStock.length !== 1 ? "s" : ""}
                </Text>
              </VStack>
              <Badge
                bg="brand.sand"
                color="brand.dark"
                borderRadius="full"
                px={2}
                fontSize="2xs"
                fontFamily="body"
              >
                {metrics.lowStock.length}
              </Badge>
            </Flex>

            <Divider borderColor="rgba(160,120,90,0.15)" />

            {/* Pendientes recientes */}
            <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted">
              Pendientes recientes
            </Text>
            {metrics.pending.length === 0 ? (
              <Text fontFamily="body" fontSize="sm" color="brand.muted">Sin pendientes 🎉</Text>
            ) : (
              metrics.pending.slice(0, 4).map((o) => (
                <Flex key={o.id} justify="space-between" align="center">
                  <VStack spacing={0} align="flex-start">
                    <Text fontFamily="body" fontSize="xs" fontWeight={500} color="brand.dark">
                      #{o.id.slice(0, 7).toUpperCase()}
                    </Text>
                    <Text fontFamily="body" fontSize="2xs" color="brand.muted">
                      {o.shipping?.name} {o.shipping?.lastName}
                    </Text>
                  </VStack>
                  <Text fontFamily="body" fontSize="xs" fontWeight={500} color="brand.brown">
                    {formatPrice(o.totals?.total || o.total || 0)}
                  </Text>
                </Flex>
              ))
            )}
          </VStack>
        </Box>
      </SimpleGrid>

      {/* ── Ranking de productos ─────────────────────────────────── */}
      <Box
        bg="brand.cream"
        borderRadius="xl"
        border="0.5px solid rgba(160,120,90,0.18)"
        p={5}
      >
        <VStack align="flex-start" spacing={0} mb={5}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.muted">
            Más vendidos
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
            Ranking de productos
          </Text>
        </VStack>

        {topProducts.length === 0 ? (
          <Text fontFamily="body" fontSize="sm" color="brand.muted">Sin datos de ventas todavía.</Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {topProducts.map((p, i) => (
              <Flex key={i} align="center" gap={4}>
                <Text
                  fontFamily="heading"
                  fontWeight={300}
                  fontSize="2xl"
                  color={i === 0 ? "brand.brown" : "brand.sand"}
                  w="24px"
                  flexShrink={0}
                  letterSpacing="0"
                >
                  {i + 1}
                </Text>
                {p.image ? (
                  <Image src={p.image} alt={p.name} w="40px" h="50px" objectFit="cover" borderRadius="md" flexShrink={0} />
                ) : (
                  <Box w="40px" h="50px" bg="brand.beige" borderRadius="md" flexShrink={0}
                    display="flex" alignItems="center" justifyContent="center">
                    <Package size={16} color="var(--chakra-colors-brand-muted)" strokeWidth={1.5} />
                  </Box>
                )}
                <VStack flex={1} spacing={1} align="stretch">
                  <Flex justify="space-between" align="baseline">
                    <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark" noOfLines={1}>
                      {p.name}
                    </Text>
                    <HStack spacing={3} flexShrink={0}>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted">{p.qty} u.</Text>
                      <Text fontFamily="body" fontSize="xs" fontWeight={500} color="brand.brown">
                        {formatPrice(p.revenue)}
                      </Text>
                    </HStack>
                  </Flex>
                  <Progress
                    value={(p.qty / maxQty) * 100}
                    size="xs"
                    borderRadius="full"
                    bg="brand.beige"
                    sx={{
                      "& > div": {
                        background: i === 0
                          ? "var(--chakra-colors-brand-brown)"
                          : "var(--chakra-colors-brand-sand)",
                      },
                    }}
                  />
                </VStack>
              </Flex>
            ))}
          </VStack>
        )}
      </Box>

      {/* ── Últimas órdenes ─────────────────────────────────────── */}
      <Box
        bg="brand.cream"
        borderRadius="xl"
        border="0.5px solid rgba(160,120,90,0.18)"
        p={5}
      >
        <VStack align="flex-start" spacing={0} mb={4}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.muted">
            Actividad reciente
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
            Últimas órdenes
          </Text>
        </VStack>
        <VStack spacing={0} align="stretch">
          {orders.slice(0, 8).map((order, i) => {
            const st = ORDER_STATUS[order.status];
            return (
              <Flex
                key={order.id}
                align="center"
                justify="space-between"
                py={3}
                borderBottom={i < 7 ? "0.5px solid rgba(160,120,90,0.1)" : "none"}
                gap={3}
                flexWrap="wrap"
              >
                <VStack align="flex-start" spacing={0}>
                  <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">
                    {order.shipping?.name} {order.shipping?.lastName} · {formatDate(order.createdAt)}
                  </Text>
                </VStack>
                <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                  {formatPrice(order.totals?.total || order.total || 0)}
                </Text>
                <Badge
                  colorScheme={st?.color || "gray"}
                  fontSize="2xs"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontFamily="body"
                >
                  {st?.label || order.status}
                </Badge>
              </Flex>
            );
          })}
          {orders.length === 0 && (
            <Text fontFamily="body" fontSize="sm" color="brand.muted" py={4} textAlign="center">
              Sin órdenes todavía.
            </Text>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default AdminStats;
