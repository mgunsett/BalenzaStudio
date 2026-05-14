// src/components/admin/AdminStats.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Box, SimpleGrid, Flex, Text, VStack, HStack, Spinner,
  Select, Badge, Alert, AlertIcon, AlertDescription,
  Image, Progress,
} from "@chakra-ui/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, ResponsiveContainer,
} from "recharts";
import {
  Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown,
  Tag, AlertTriangle,
} from "lucide-react";
import { getAllOrders } from "../../services/firebase/orders";
import { getProducts }  from "../../services/firebase/products";
import { formatPrice, formatDate } from "../../utils/formatters";
import { getTotalStock } from "../../utils/inventory";
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
const StatCard = ({ label, value, sub, icon: Icon, trend }) => {
  const isUp   = trend > 0;
  const isDown = trend < 0;

  return (
    <Box
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="brand.sand"
      p={5}
      position="relative"
      overflow="hidden"
      _hover={{ transform: "translateY(-2px)", shadow: "sm" }}
      transition="all 0.22s"
    >
      <Box
        position="absolute"
        top={-3} right={-3}
        w="72px" h="72px"
        borderRadius="full"
        bg="brand.beige"
        opacity={0.4}
      />
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box
          w="38px" h="38px"
          borderRadius="lg"
          bg="brand.beige"
          border="0.5px solid rgba(160,120,90,0.2)"
          display="flex" alignItems="center" justifyContent="center"
          flexShrink={0}
        >
          <Icon size={17} color="var(--chakra-colors-brand-brown)" strokeWidth={1.5} />
        </Box>
        {trend !== undefined && trend !== null && (
          <HStack spacing={1}>
            {isUp   && <TrendingUp   size={12} color="var(--chakra-colors-brand-success)" />}
            {isDown && <TrendingDown size={12} color="var(--chakra-colors-brand-error)"   />}
            <Text
              fontFamily="body" fontSize="2xs" fontWeight={600}
              color={isUp ? "brand.success" : isDown ? "brand.error" : "brand.muted"}
            >
              {trend > 0 ? "+" : ""}{trend}%
            </Text>
          </HStack>
        )}
      </Flex>
      <Text
        fontFamily="body" fontSize="2xs" letterSpacing="0.2em"
        textTransform="uppercase" color="brand.muted" mb={1}
      >
        {label}
      </Text>
      <Text
        fontFamily="heading" fontWeight={300} fontSize="3xl"
        color="brand.dark" letterSpacing="0.02em" lineHeight={1}
      >
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
    <Box bg="brand.dark" borderRadius="lg" px={3} py={2} shadow="md">
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
  const [gran,     setGran]     = useState("day");

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

  // Granularidad automática basada en período
  useEffect(() => {
    const days = Number(period);
    if (days <= 14)      setGran("day");
    else if (days <= 90) setGran("week");
    else                 setGran("month");
  }, [period]);

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

    const avgCur = approved(current).length ? revCur / approved(current).length : 0;
    const avgPrv = approved(previous).length ? revPrv / approved(previous).length : 0;
    const avgTrend = avgPrv > 0 ? Math.round(((avgCur - avgPrv) / avgPrv) * 100) : null;

    const unitsCur = approved(current).reduce((s, o) =>
      s + (o.items || []).reduce((u, i) => u + (i.quantity || 1), 0), 0);
    const unitsPrv = approved(previous).reduce((s, o) =>
      s + (o.items || []).reduce((u, i) => u + (i.quantity || 1), 0), 0);
    const unitsTrend = unitsPrv > 0 ? Math.round(((unitsCur - unitsPrv) / unitsPrv) * 100) : null;

    return { revCur, revTrend, ordTrend, avgCur, avgTrend, unitsCur, unitsTrend };
  }, [current, previous]);

  // ── Productos con stock bajo ────────────────────────────────────
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.active !== false && getTotalStock(p) < 5),
    [products]
  );

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
      <Flex justify="center" align="center" h="60vh">
        <Spinner size="lg" color="brand.brown" thickness="1px" speed="0.8s" />
      </Flex>
    );
  }

  return (
    <VStack align="stretch" spacing={8} py={0}>

      {/* ── SECCIÓN 1: Header + Selector ────────────────────────── */}
      <Flex justify="space-between" align="flex-end" flexWrap="wrap" gap={4}>
        <VStack align="flex-start" spacing={0}>
          <Text
            fontFamily="body"
            fontSize="2xs"
            letterSpacing="0.25em"
            textTransform="uppercase"
            color="brand.brown"
          >
            Panel de control
          </Text>
          <Text
            fontFamily="heading"
            fontWeight={300}
            fontSize="4xl"
            letterSpacing="0.05em"
            color="brand.dark"
            lineHeight={1}
          >
            Dashboard
          </Text>
        </VStack>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          w="180px"
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
          <option value="90">Últimos 90 días</option>
        </Select>
      </Flex>

      {/* ── SECCIÓN 2: KPI Cards ────────────────────────────────── */}
      <SimpleGrid columns={{ base: 2, md: 2, xl: 4 }} gap={4}>
        <StatCard
          label="Ingresos"
          value={formatPrice(metrics.revCur)}
          trend={metrics.revTrend}
          sub="vs período anterior"
          icon={DollarSign}
        />
        <StatCard
          label="Órdenes"
          value={current.length}
          trend={metrics.ordTrend}
          sub="vs período anterior"
          icon={ShoppingCart}
        />
        <StatCard
          label="Ticket promedio"
          value={formatPrice(metrics.avgCur)}
          trend={metrics.avgTrend}
          sub="Por orden aprobada"
          icon={TrendingUp}
        />
        <StatCard
          label="Unidades vendidas"
          value={metrics.unitsCur}
          trend={metrics.unitsTrend}
          sub="vs período anterior"
          icon={Tag}
        />
      </SimpleGrid>

      {/* ── SECCIÓN 3: Gráfico + Top Productos ──────────────────── */}
      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap={5}>

        {/* Gráfico de ventas */}
        <Box
          bg="brand.cream"
          borderRadius="xl"
          border="0.5px solid rgba(160,120,90,0.18)"
          p={5}
        >
          <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
            <VStack align="flex-start" spacing={0}>
              <Text
                fontFamily="body" fontSize="2xs" letterSpacing="0.25em"
                textTransform="uppercase" color="brand.muted"
              >
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
                  fontSize="2xs" fontFamily="body" fontWeight={600}
                  letterSpacing="0.05em" cursor="pointer"
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
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balenzaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#A0785A" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#A0785A" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(160,120,90,0.12)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#7A6555" }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#7A6555" }}
                  axisLine={false} tickLine={false}
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
            <Flex h="220px" align="center" justify="center">
              <Text fontFamily="body" fontSize="sm" color="brand.muted">
                Sin ventas aprobadas en este período
              </Text>
            </Flex>
          )}
        </Box>

        {/* Top 5 productos */}
        <Box
          bg="brand.cream"
          borderRadius="xl"
          border="0.5px solid rgba(160,120,90,0.18)"
          p={5}
        >
          <VStack align="flex-start" spacing={0} mb={5}>
            <Text
              fontFamily="body" fontSize="2xs" letterSpacing="0.25em"
              textTransform="uppercase" color="brand.muted"
            >
              Más vendidos
            </Text>
            <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
              Top 5 productos
            </Text>
          </VStack>

          {topProducts.length === 0 ? (
            <Flex align="center" justify="center" h="180px">
              <Text fontFamily="body" fontSize="sm" color="brand.muted">
                Sin datos de ventas todavía
              </Text>
            </Flex>
          ) : (
            <VStack spacing={4} align="stretch">
              {topProducts.map((p, i) => (
                <Flex key={i} align="center" gap={3}>
                  <Text
                    fontFamily="heading" fontWeight={300} fontSize="2xl"
                    color={i === 0 ? "brand.brown" : "brand.sand"}
                    w="24px" flexShrink={0} letterSpacing="0"
                  >
                    {i + 1}
                  </Text>
                  {p.image ? (
                    <Image
                      src={p.image} alt={p.name}
                      w="40px" h="50px" objectFit="cover"
                      borderRadius="md" flexShrink={0}
                    />
                  ) : (
                    <Flex
                      w="40px" h="50px" bg="brand.beige" borderRadius="md"
                      flexShrink={0} align="center" justify="center"
                    >
                      <Package size={16} color="var(--chakra-colors-brand-muted)" strokeWidth={1.5} />
                    </Flex>
                  )}
                  <VStack flex={1} spacing={1} align="stretch">
                    <Flex justify="space-between" align="baseline">
                      <Text
                        fontFamily="body" fontSize="sm" fontWeight={500}
                        color="brand.dark" noOfLines={1}
                      >
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
      </SimpleGrid>

      {/* ── ALERTS: Stock bajo ───────────────────────────────────── */}
      {lowStockProducts.length > 0 && (
        <Box
          bg="rgba(196,168,130,0.1)"
          borderRadius="xl"
          border="0.5px solid rgba(196,168,130,0.4)"
          p={5}
        >
          <HStack spacing={3} mb={3}>
            <AlertTriangle size={18} color="var(--chakra-colors-brand-sand)" strokeWidth={1.5} />
            <VStack align="flex-start" spacing={0}>
              <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                Stock bajo — {lowStockProducts.length} producto{lowStockProducts.length !== 1 ? "s" : ""}
              </Text>
              <Text fontFamily="body" fontSize="xs" color="brand.muted">
                Productos activos con menos de 5 unidades en total
              </Text>
            </VStack>
          </HStack>
          <Flex wrap="wrap" gap={2}>
            {lowStockProducts.map((p) => (
              <Badge
                key={p.id}
                bg={getTotalStock(p) === 0 ? "rgba(192,57,43,0.1)" : "rgba(196,168,130,0.2)"}
                color={getTotalStock(p) === 0 ? "brand.error" : "brand.brown"}
                borderRadius="full"
                px={3}
                py={1}
                fontFamily="body"
                fontSize="xs"
                border="0.5px solid"
                borderColor={getTotalStock(p) === 0 ? "rgba(192,57,43,0.3)" : "rgba(196,168,130,0.4)"}
              >
                {p.name} · {getTotalStock(p)} u.
              </Badge>
            ))}
          </Flex>
        </Box>
      )}

    </VStack>
  );
};

export default AdminStats;
