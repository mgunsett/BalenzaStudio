// src/components/admin/MovementList.jsx
// Historial de movimientos de stock
// Filtros: producto, tipo, rango de fechas
// Tabla: Fecha | Producto | Talle | Color | Tipo | Cantidad | Razón
// Resumen: Accordion agrupado por producto
import { useEffect, useState, useMemo } from "react";
import {
  Box, VStack, HStack, Text, Spinner, Flex, Select, Input, Badge,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  SimpleGrid, Stat, StatLabel, StatNumber,
} from "@chakra-ui/react";
import { ListOrdered, TrendingUp, TrendingDown, SlidersHorizontal } from "lucide-react";
import { getMovements } from "../../services/firebase/stockMovements";
import { getProducts } from "../../services/firebase/products";
import toast from "react-hot-toast";

/* ─────────────────── helpers ─────────────────── */
const TYPE_META = {
  in:         { label: "Entrada",  scheme: "green" },
  out:        { label: "Salida",   scheme: "red"   },
  adjustment: { label: "Ajuste",   scheme: "blue"  },
};

const fmtDateTime = (ts) => {
  const d = ts?.toDate?.() ?? (ts instanceof Date ? ts : null);
  if (!d) return "—";
  return (
    d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  );
};

const colorLabel = (key) =>
  !key || key === "__default" ? <Text as="span" color="brand.muted">—</Text> : key;

/* ─────────────────── component ─────────────────── */
const MovementList = () => {
  const [movements,      setMovements]      = useState([]);
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);

  // Filters
  const [productFilter,  setProductFilter]  = useState("");
  const [typeFilter,     setTypeFilter]     = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");

  /* ── load ── */
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMovements(),
      getProducts({ includeInactive: true }),
    ])
      .then(([movs, prods]) => {
        setMovements(movs);
        setProducts(prods);
      })
      .catch(() => toast.error("Error al cargar movimientos"))
      .finally(() => setLoading(false));
  }, []);

  /* ── filtered movements ── */
  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (productFilter && m.productId !== productFilter) return false;
      if (typeFilter    && m.type      !== typeFilter)    return false;
      if (dateFrom || dateTo) {
        const d = m.createdAt?.toDate?.() ?? null;
        if (!d) return false;
        if (dateFrom && d < new Date(dateFrom))                     return false;
        if (dateTo   && d > new Date(dateTo + "T23:59:59"))         return false;
      }
      return true;
    });
  }, [movements, productFilter, typeFilter, dateFrom, dateTo]);

  /* ── summary by product ── */
  const summary = useMemo(() => {
    const map = {};
    filtered.forEach((m) => {
      if (!map[m.productId]) {
        map[m.productId] = {
          productId:   m.productId,
          productName: m.productName || "Producto eliminado",
          count:       0,
          inTotal:     0,
          outTotal:    0,
          adjTotal:    0,
        };
      }
      const row = map[m.productId];
      row.count++;
      if      (m.type === "in")         row.inTotal  += Number(m.quantity) || 0;
      else if (m.type === "out")        row.outTotal += Number(m.quantity) || 0;
      else if (m.type === "adjustment") row.adjTotal += Number(m.quantity) || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filtered]);

  /* ── loading state ── */
  if (loading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Flex>
    );
  }

  /* ─────────────────── render ─────────────────── */
  return (
    <VStack align="stretch" spacing={6}>

      {/* Header */}
      <VStack align="flex-start" spacing={0}>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
          Inventario
        </Text>
        <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark" letterSpacing="0.04em">
          Movimientos de stock
        </Text>
      </VStack>

      {/* KPI chips */}
      <HStack spacing={3} flexWrap="wrap">
        <HStack
          spacing={2}
          bg="brand.cream"
          border="0.5px solid rgba(160,120,90,0.2)"
          borderRadius="full"
          px={4}
          py={2}
        >
          <ListOrdered size={13} color="var(--chakra-colors-brand-muted)" />
          <Text fontFamily="body" fontSize="sm" color="brand.dark">
            <Text as="span" fontWeight={600}>{filtered.length}</Text>{" "}
            <Text as="span" color="brand.muted">movimientos</Text>
          </Text>
        </HStack>
        <HStack
          spacing={2}
          bg="green.50"
          border="0.5px solid"
          borderColor="green.200"
          borderRadius="full"
          px={4}
          py={2}
        >
          <TrendingUp size={13} color="var(--chakra-colors-green-500)" />
          <Text fontFamily="body" fontSize="sm" color="brand.dark">
            <Text as="span" fontWeight={600} color="green.600">
              {filtered.filter((m) => m.type === "in").reduce((s, m) => s + (Number(m.quantity) || 0), 0)}
            </Text>{" "}
            <Text as="span" color="brand.muted">entradas</Text>
          </Text>
        </HStack>
        <HStack
          spacing={2}
          bg="red.50"
          border="0.5px solid"
          borderColor="red.200"
          borderRadius="full"
          px={4}
          py={2}
        >
          <TrendingDown size={13} color="var(--chakra-colors-red-500)" />
          <Text fontFamily="body" fontSize="sm" color="brand.dark">
            <Text as="span" fontWeight={600} color="red.600">
              {filtered.filter((m) => m.type === "out").reduce((s, m) => s + (Number(m.quantity) || 0), 0)}
            </Text>{" "}
            <Text as="span" color="brand.muted">salidas</Text>
          </Text>
        </HStack>
      </HStack>

      {/* Filters */}
      <Box
        bg="brand.cream"
        border="0.5px solid rgba(160,120,90,0.2)"
        borderRadius="xl"
        p={4}
      >
        <HStack spacing={2} mb={3}>
          <SlidersHorizontal size={13} color="var(--chakra-colors-brand-brown)" />
          <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.brown">
            Filtros
          </Text>
        </HStack>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={3}>
          {/* Producto */}
          <Select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            bg="brand.white"
            border="0.5px solid rgba(160,120,90,0.3)"
            borderRadius="lg"
            fontFamily="body"
            fontSize="sm"
            h="40px"
            color="brand.dark"
            _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
          >
            <option value="">Todos los productos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>

          {/* Tipo */}
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            bg="brand.white"
            border="0.5px solid rgba(160,120,90,0.3)"
            borderRadius="lg"
            fontFamily="body"
            fontSize="sm"
            h="40px"
            color="brand.dark"
            _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
          >
            <option value="">Todos los tipos</option>
            <option value="in">Entrada</option>
            <option value="out">Salida</option>
            <option value="adjustment">Ajuste</option>
          </Select>

          {/* Desde */}
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            bg="brand.white"
            border="0.5px solid rgba(160,120,90,0.3)"
            borderRadius="lg"
            fontFamily="body"
            fontSize="sm"
            h="40px"
            color="brand.dark"
            _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
          />

          {/* Hasta */}
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            bg="brand.white"
            border="0.5px solid rgba(160,120,90,0.3)"
            borderRadius="lg"
            fontFamily="body"
            fontSize="sm"
            h="40px"
            color="brand.dark"
            _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
          />
        </SimpleGrid>
      </Box>

      {/* ── Accordion resumen por producto ── */}
      {summary.length > 0 && (
        <Box>
          <Text fontFamily="body" fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.brown" mb={3}>
            Resumen por producto
          </Text>
          <Accordion allowMultiple>
            {summary.map((row) => (
              <AccordionItem
                key={row.productId}
                border="0.5px solid rgba(160,120,90,0.2)"
                borderRadius="xl"
                mb={2}
                overflow="hidden"
              >
                <AccordionButton
                  bg="brand.cream"
                  _hover={{ bg: "brand.beige" }}
                  borderRadius="xl"
                  px={5}
                  py={3}
                >
                  <HStack flex={1} spacing={3} flexWrap="wrap">
                    <Text fontFamily="heading" fontWeight={300} fontSize="md" color="brand.dark" letterSpacing="0.03em" flex={1} textAlign="left">
                      {row.productName}
                    </Text>
                    <HStack spacing={2}>
                      <Badge colorScheme="gray"   fontFamily="body" fontSize="xs" borderRadius="full" px={2}>{row.count} movs.</Badge>
                      <Badge colorScheme="green"  fontFamily="body" fontSize="xs" borderRadius="full" px={2}>+{row.inTotal}</Badge>
                      <Badge colorScheme="red"    fontFamily="body" fontSize="xs" borderRadius="full" px={2}>−{row.outTotal}</Badge>
                      {row.adjTotal > 0 && (
                        <Badge colorScheme="blue" fontFamily="body" fontSize="xs" borderRadius="full" px={2}>~{row.adjTotal}</Badge>
                      )}
                    </HStack>
                  </HStack>
                  <AccordionIcon color="brand.muted" ml={2} />
                </AccordionButton>

                <AccordionPanel bg="brand.white" px={5} py={3}>
                  <SimpleGrid columns={{ base: 2, sm: 4 }} gap={4}>
                    <Stat>
                      <StatLabel fontFamily="body" fontSize="xs" color="brand.muted">Movimientos</StatLabel>
                      <StatNumber fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">{row.count}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontFamily="body" fontSize="xs" color="green.600">Entradas</StatLabel>
                      <StatNumber fontFamily="heading" fontWeight={300} fontSize="xl" color="green.600">+{row.inTotal}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontFamily="body" fontSize="xs" color="red.500">Salidas</StatLabel>
                      <StatNumber fontFamily="heading" fontWeight={300} fontSize="xl" color="red.500">−{row.outTotal}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontFamily="body" fontSize="xs" color="blue.500">Ajustes</StatLabel>
                      <StatNumber fontFamily="heading" fontWeight={300} fontSize="xl" color="blue.500">{row.adjTotal}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      )}

      {/* ── Tabla de movimientos ── */}
      <Box>
        <Text fontFamily="body" fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.brown" mb={3}>
          Detalle
        </Text>

        {filtered.length === 0 ? (
          <Flex direction="column" align="center" py={16} gap={3}>
            <ListOrdered size={44} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
            <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.muted">
              No hay movimientos registrados
            </Text>
            <Text fontFamily="body" fontSize="sm" color="brand.muted">
              Usá el botón de historial en Gestión de stock para registrar movimientos
            </Text>
          </Flex>
        ) : (
          <Box
            bg="brand.cream"
            border="0.5px solid rgba(160,120,90,0.15)"
            borderRadius="xl"
            overflow="hidden"
          >
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr bg="brand.beige">
                    <Th fontFamily="body" fontSize="2xs" letterSpacing="0.12em" color="brand.muted" textTransform="uppercase" px={4} py={3}>
                      Fecha
                    </Th>
                    <Th fontFamily="body" fontSize="2xs" letterSpacing="0.12em" color="brand.muted" textTransform="uppercase" px={4} py={3}>
                      Producto
                    </Th>
                    <Th fontFamily="body" fontSize="2xs" letterSpacing="0.12em" color="brand.muted" textTransform="uppercase" px={4} py={3} textAlign="center">
                      Talle
                    </Th>
                    <Th fontFamily="body" fontSize="2xs" letterSpacing="0.12em" color="brand.muted" textTransform="uppercase" px={4} py={3} textAlign="center">
                      Color
                    </Th>
                    <Th fontFamily="body" fontSize="2xs" letterSpacing="0.12em" color="brand.muted" textTransform="uppercase" px={4} py={3} textAlign="center">
                      Tipo
                    </Th>
                    <Th fontFamily="body" fontSize="2xs" letterSpacing="0.12em" color="brand.muted" textTransform="uppercase" px={4} py={3} textAlign="center">
                      Cantidad
                    </Th>
                    <Th fontFamily="body" fontSize="2xs" letterSpacing="0.12em" color="brand.muted" textTransform="uppercase" px={4} py={3}>
                      Razón
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((mov) => {
                    const meta = TYPE_META[mov.type] ?? { label: mov.type, scheme: "gray" };
                    return (
                      <Tr
                        key={mov.id}
                        _hover={{ bg: "brand.beige" }}
                        transition="background 0.15s"
                        borderBottom="0.5px solid rgba(160,120,90,0.08)"
                      >
                        <Td px={4} py={3}>
                          <Text fontFamily="body" fontSize="xs" color="brand.muted" whiteSpace="nowrap">
                            {fmtDateTime(mov.createdAt)}
                          </Text>
                        </Td>
                        <Td px={4} py={3}>
                          <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={400}>
                            {mov.productName || "—"}
                          </Text>
                        </Td>
                        <Td px={4} py={3} textAlign="center">
                          <Badge
                            fontFamily="body"
                            fontSize="xs"
                            colorScheme="gray"
                            borderRadius="full"
                            px={2}
                          >
                            {mov.sizeKey || "—"}
                          </Badge>
                        </Td>
                        <Td px={4} py={3} textAlign="center">
                          <Text fontFamily="body" fontSize="sm" color="brand.dark" textTransform="capitalize">
                            {colorLabel(mov.colorKey)}
                          </Text>
                        </Td>
                        <Td px={4} py={3} textAlign="center">
                          <Badge
                            colorScheme={meta.scheme}
                            fontSize="xs"
                            borderRadius="full"
                            px={3}
                            fontFamily="body"
                          >
                            {meta.label}
                          </Badge>
                        </Td>
                        <Td px={4} py={3} textAlign="center">
                          <Text
                            fontFamily="body"
                            fontSize="sm"
                            fontWeight={600}
                            color={
                              mov.type === "in"  ? "green.600" :
                              mov.type === "out" ? "red.500"   :
                              "blue.500"
                            }
                          >
                            {mov.type === "out" ? "−" : "+"}{mov.quantity}
                          </Text>
                        </Td>
                        <Td px={4} py={3}>
                          <Text fontFamily="body" fontSize="sm" color="brand.dark">
                            {mov.reason || "—"}
                          </Text>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default MovementList;
