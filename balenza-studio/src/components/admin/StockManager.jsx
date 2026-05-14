// src/components/admin/StockManager.jsx
// variantStock support: Table (con colores) / SimpleGrid (sin colores)
// Movement modal → createMovement (log-only)
// Save → buildInventoryPayload (actualiza variantStock + sizes)
import { useEffect, useState } from "react";
import {
  Box, VStack, HStack, Text, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Button, Spinner, Badge, Flex, Image, Input, Select, Textarea,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, IconButton, Tooltip, SimpleGrid,
} from "@chakra-ui/react";
import { Search, Save, Package, History } from "lucide-react";
import { getProducts, updateProduct } from "../../services/firebase/products";
import { createMovement } from "../../services/firebase/stockMovements";
import { SIZES, CATEGORIES } from "../../utils/constants";
import {
  normalizeVariantStock,
  buildInventoryPayload,
} from "../../utils/inventory";
import toast from "react-hot-toast";

/* ─────────────────── helpers ─────────────────── */
const stockScheme = (n) => (n === 0 ? "red" : n <= 5 ? "yellow" : "green");
const cellColor   = (n) =>
  n === 0 ? "brand.error" : n <= 3 ? "orange.400" : "brand.success";

const colKeys = (product) =>
  product.colors && product.colors.length > 0 ? product.colors : ["__default"];

/* ─────────────────── component ─────────────────── */
const StockManager = () => {
  const [products,   setProducts]   = useState([]);
  const [edits,      setEdits]      = useState({});   // { productId: variantStock patch }
  const [saving,     setSaving]     = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [catFilter,  setCatFilter]  = useState("");

  // Movement modal
  const [movModal,   setMovModal]   = useState({ isOpen: false, product: null });
  const [movForm,    setMovForm]    = useState({
    sizeKey: SIZES[0], colorKey: "__default", type: "in", quantity: 1, reason: "",
  });
  const [movSaving,  setMovSaving]  = useState(false);

  /* ── load ── */
  const load = () => {
    setLoading(true);
    getProducts({ includeInactive: true })
      .then(setProducts)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  /* ── effective variantStock = base + edits ── */
  const getEffectiveVS = (product) => {
    const base = normalizeVariantStock(product, product.colors || []);
    const patch = edits[product.id] || {};
    const result = {};
    SIZES.forEach((size) => {
      result[size] = { ...base[size], ...(patch[size] || {}) };
    });
    return result;
  };

  const totalFromVS = (vs) =>
    Object.values(vs).reduce(
      (sum, colorMap) =>
        sum + Object.values(colorMap || {}).reduce((s, v) => s + (Number(v) || 0), 0),
      0
    );

  const hasChanges = (productId) =>
    !!edits[productId] && Object.keys(edits[productId]).length > 0;

  /* ── cell change ── */
  const handleCellChange = (productId, sizeKey, colorKey, rawVal) => {
    setEdits((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [sizeKey]: {
          ...((prev[productId] || {})[sizeKey] || {}),
          [colorKey]: Number(rawVal) || 0,
        },
      },
    }));
  };

  /* ── save ── */
  const handleSave = async (product) => {
    setSaving((prev) => ({ ...prev, [product.id]: true }));
    try {
      const variantStock = getEffectiveVS(product);
      const payload = buildInventoryPayload(variantStock);
      await updateProduct(product.id, payload);
      setEdits((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, ...payload } : p)
      );
      toast.success(`Stock de "${product.name}" actualizado`);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  /* ── open movement modal ── */
  const openMovModal = (product) => {
    const cols = colKeys(product);
    setMovForm({
      sizeKey:  SIZES[0],
      colorKey: cols[0],
      type:     "in",
      quantity: 1,
      reason:   "",
    });
    setMovModal({ isOpen: true, product });
  };

  /* ── save movement ── */
  const handleMovSave = async () => {
    const { product } = movModal;
    const { sizeKey, colorKey, type, quantity, reason } = movForm;
    if (!reason.trim())   { toast.error("Ingresá una razón");                  return; }
    if (quantity <= 0)    { toast.error("La cantidad debe ser mayor a 0");     return; }
    setMovSaving(true);
    try {
      await createMovement({
        productId:   product.id,
        productName: product.name,
        sizeKey,
        colorKey,
        type,
        quantity: Number(quantity),
        reason:   reason.trim(),
      });
      toast.success("Movimiento registrado");
      setMovModal({ isOpen: false, product: null });
    } catch (error) {
      console.error("Error creando movimiento de stock:", error);
      if (error?.code === "permission-denied") {
        toast.error("No tenes permisos para registrar movimientos");
      } else {
        toast.error("Error al registrar movimiento");
      }
    } finally {
      setMovSaving(false);
    }
  };

  /* ── filter ── */
  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !catFilter || p.category === catFilter;
    return matchSearch && matchCat;
  });

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
          Gestión de stock
        </Text>
      </VStack>

      {/* Legend */}
      <HStack spacing={4} flexWrap="wrap">
        {[
          { color: "brand.error",   label: "Sin stock (0)"   },
          { color: "orange.400",    label: "Stock bajo (1–3)" },
          { color: "brand.success", label: "OK (4+)"         },
        ].map(({ color, label }) => (
          <HStack key={label} spacing={2}>
            <Box w="7px" h="7px" borderRadius="full" bg={color} />
            <Text fontFamily="body" fontSize="xs" color="brand.muted">{label}</Text>
          </HStack>
        ))}
      </HStack>

      {/* Filters */}
      <HStack spacing={3} flexWrap="wrap">
        <Box position="relative" flex={1} minW={{ base: "100%", sm: "180px" }}>
          <Search
            size={14}
            color="var(--chakra-colors-brand-muted)"
            style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
          />
          <Input
            pl={8}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
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
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          w={{ base: "100%", sm: "170px" }}
          bg="brand.cream"
          border="0.5px solid rgba(160,120,90,0.3)"
          borderRadius="lg"
          fontFamily="body"
          fontSize="sm"
          h="40px"
          color="brand.dark"
          _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.label}</option>
          ))}
        </Select>
      </HStack>

      {/* Product cards */}
      <VStack align="stretch" spacing={3}>
        {filtered.map((product) => {
          const vs      = getEffectiveVS(product);
          const cols    = colKeys(product);
          const hasClrs = cols[0] !== "__default";
          const changed = hasChanges(product.id);
          const total   = totalFromVS(vs);

          return (
            <Box
              key={product.id}
              bg="brand.cream"
              borderRadius="xl"
              border="0.5px solid"
              borderColor={changed ? "brand.brown" : "rgba(160,120,90,0.15)"}
              p={5}
              transition="border-color 0.2s"
            >
              {/* Product info row */}
              <Flex align="center" gap={3} mb={4} flexWrap="wrap">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    w="44px" h="55px"
                    objectFit="cover"
                    borderRadius="md"
                    flexShrink={0}
                    bg="brand.beige"
                  />
                ) : (
                  <Flex
                    w="44px" h="55px"
                    bg="brand.beige"
                    borderRadius="md"
                    flexShrink={0}
                    align="center"
                    justify="center"
                  >
                    <Package size={16} color="var(--chakra-colors-brand-muted)" strokeWidth={1.5} />
                  </Flex>
                )}

                <VStack align="flex-start" spacing={0} flex={1}>
                  <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.03em">
                    {product.name}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted" textTransform="capitalize">
                    {product.category}
                  </Text>
                </VStack>

                <Badge
                  colorScheme={stockScheme(total)}
                  fontSize="xs"
                  borderRadius="full"
                  px={3}
                  fontFamily="body"
                  flexShrink={0}
                >
                  {total} u. totales
                </Badge>

                <Tooltip label="Registrar movimiento" hasArrow placement="top">
                  <IconButton
                    icon={<History size={14} />}
                    size="sm"
                    variant="outline"
                    borderColor="rgba(160,120,90,0.3)"
                    color="brand.muted"
                    borderRadius="lg"
                    _hover={{ borderColor: "brand.brown", color: "brand.brown" }}
                    onClick={() => openMovModal(product)}
                    aria-label="Registrar movimiento"
                    flexShrink={0}
                  />
                </Tooltip>

                {changed && (
                  <Button
                    size="sm"
                    fontSize="xs"
                    letterSpacing="0.1em"
                    px={4}
                    leftIcon={<Save size={13} />}
                    isLoading={saving[product.id]}
                    onClick={() => handleSave(product)}
                    bg="brand.dark"
                    color="brand.white"
                    _hover={{ bg: "brand.brown" }}
                    borderRadius="lg"
                    flexShrink={0}
                  >
                    Guardar
                  </Button>
                )}
              </Flex>

              {/* ── Stock grid: Table (con colores) vs SimpleGrid (sin colores) ── */}
              {hasClrs ? (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th
                          fontFamily="body"
                          fontSize="2xs"
                          letterSpacing="0.15em"
                          color="brand.muted"
                          textTransform="uppercase"
                          px={2}
                          w="52px"
                        >
                          Talle
                        </Th>
                        {cols.map((col) => (
                          <Th
                            key={col}
                            fontFamily="body"
                            fontSize="2xs"
                            letterSpacing="0.1em"
                            color="brand.brown"
                            textTransform="capitalize"
                            px={2}
                            textAlign="center"
                          >
                            {col}
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {SIZES.map((size) => (
                        <Tr key={size}>
                          <Td px={2} py={1}>
                            <Text fontFamily="body" fontSize="xs" fontWeight={500} color="brand.dark" letterSpacing="0.08em">
                              {size}
                            </Text>
                          </Td>
                          {cols.map((col) => {
                            const val      = vs[size]?.[col] ?? 0;
                            const isEdited = edits[product.id]?.[size]?.[col] !== undefined;
                            return (
                              <Td key={col} px={2} py={1} textAlign="center">
                                <NumberInput
                                  value={val}
                                  min={0}
                                  max={999}
                                  onChange={(_, v) => handleCellChange(product.id, size, col, v)}
                                  size="sm"
                                  maxW="80px"
                                  mx="auto"
                                >
                                  <NumberInputField
                                    fontFamily="body"
                                    fontSize="sm"
                                    textAlign="center"
                                    px={1}
                                    borderColor={isEdited ? "brand.brown" : "rgba(160,120,90,0.25)"}
                                    borderRadius="md"
                                    _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                                    bg={isEdited ? "rgba(160,120,90,0.06)" : "brand.white"}
                                    color={cellColor(val)}
                                    transition="all 0.15s"
                                  />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </Td>
                            );
                          })}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <SimpleGrid columns={{ base: 2, sm: 3, md: SIZES.length }} gap={3}>
                  {SIZES.map((size) => {
                    const val      = vs[size]?.["__default"] ?? 0;
                    const isEdited = edits[product.id]?.[size]?.["__default"] !== undefined;
                    return (
                      <VStack key={size} spacing={1}>
                        <Text
                          fontFamily="body"
                          fontSize="xs"
                          fontWeight={500}
                          color={cellColor(val)}
                          letterSpacing="0.08em"
                        >
                          {size}
                        </Text>
                        <NumberInput
                          value={val}
                          min={0}
                          max={999}
                          onChange={(_, v) => handleCellChange(product.id, size, "__default", v)}
                          size="sm"
                        >
                          <NumberInputField
                            fontFamily="body"
                            fontSize="sm"
                            textAlign="center"
                            px={2}
                            borderColor={isEdited ? "brand.brown" : "rgba(160,120,90,0.25)"}
                            borderRadius="lg"
                            _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                            bg={isEdited ? "rgba(160,120,90,0.06)" : "brand.white"}
                            transition="all 0.15s"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </VStack>
                    );
                  })}
                </SimpleGrid>
              )}
            </Box>
          );
        })}

        {filtered.length === 0 && (
          <Flex direction="column" align="center" py={16} gap={3}>
            <Package size={44} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
            <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.muted">
              No se encontraron productos
            </Text>
          </Flex>
        )}
      </VStack>

      {/* ─── Movement modal ─── */}
      <Modal
        isOpen={movModal.isOpen}
        onClose={() => setMovModal({ isOpen: false, product: null })}
        isCentered
        size="md"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="brand.white" borderRadius="2xl" fontFamily="body">
          <ModalHeader
            fontFamily="heading"
            fontWeight={300}
            fontSize="xl"
            letterSpacing="0.04em"
            color="brand.dark"
            pb={2}
          >
            Registrar movimiento
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Product label */}
              {movModal.product && (
                <Text fontFamily="body" fontSize="sm" color="brand.muted">
                  Producto:{" "}
                  <Text as="span" fontWeight={600} color="brand.dark">
                    {movModal.product.name}
                  </Text>
                </Text>
              )}

              {/* Talle */}
              <VStack align="flex-start" spacing={1}>
                <Text fontFamily="body" fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="brand.muted">
                  Talle
                </Text>
                <Select
                  value={movForm.sizeKey}
                  onChange={(e) => setMovForm((f) => ({ ...f, sizeKey: e.target.value }))}
                  bg="brand.cream"
                  border="0.5px solid rgba(160,120,90,0.3)"
                  borderRadius="lg"
                  fontFamily="body"
                  fontSize="sm"
                  h="40px"
                  color="brand.dark"
                  _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                >
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </VStack>

              {/* Color (solo si el producto tiene colores) */}
              {movModal.product?.colors?.length > 0 && (
                <VStack align="flex-start" spacing={1}>
                  <Text fontFamily="body" fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="brand.muted">
                    Color
                  </Text>
                  <Select
                    value={movForm.colorKey}
                    onChange={(e) => setMovForm((f) => ({ ...f, colorKey: e.target.value }))}
                    bg="brand.cream"
                    border="0.5px solid rgba(160,120,90,0.3)"
                    borderRadius="lg"
                    fontFamily="body"
                    fontSize="sm"
                    h="40px"
                    color="brand.dark"
                    _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                  >
                    {movModal.product.colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </VStack>
              )}

              {/* Tipo */}
              <VStack align="flex-start" spacing={1}>
                <Text fontFamily="body" fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="brand.muted">
                  Tipo
                </Text>
                <Select
                  value={movForm.type}
                  onChange={(e) => setMovForm((f) => ({ ...f, type: e.target.value }))}
                  bg="brand.cream"
                  border="0.5px solid rgba(160,120,90,0.3)"
                  borderRadius="lg"
                  fontFamily="body"
                  fontSize="sm"
                  h="40px"
                  color="brand.dark"
                  _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                >
                  <option value="in">Entrada</option>
                  <option value="out">Salida</option>
                  <option value="adjustment">Ajuste</option>
                </Select>
              </VStack>

              {/* Cantidad */}
              <VStack align="flex-start" spacing={1}>
                <Text fontFamily="body" fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="brand.muted">
                  Cantidad
                </Text>
                <NumberInput
                  value={movForm.quantity}
                  min={1}
                  max={9999}
                  onChange={(_, v) => setMovForm((f) => ({ ...f, quantity: Number(v) || 1 }))}
                  w="full"
                >
                  <NumberInputField
                    bg="brand.cream"
                    border="0.5px solid rgba(160,120,90,0.3)"
                    borderRadius="lg"
                    fontFamily="body"
                    fontSize="sm"
                    h="40px"
                    color="brand.dark"
                    _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </VStack>

              {/* Razón */}
              <VStack align="flex-start" spacing={1}>
                <Text fontFamily="body" fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="brand.muted">
                  Razón
                </Text>
                <Textarea
                  value={movForm.reason}
                  onChange={(e) => setMovForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="Ej: reposición, venta manual, corrección de inventario…"
                  bg="brand.cream"
                  border="0.5px solid rgba(160,120,90,0.3)"
                  borderRadius="lg"
                  fontFamily="body"
                  fontSize="sm"
                  resize="none"
                  rows={3}
                  _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                  _placeholder={{ color: "brand.muted" }}
                />
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter gap={2} pt={2}>
            <Button
              variant="ghost"
              fontFamily="body"
              fontSize="sm"
              color="brand.muted"
              onClick={() => setMovModal({ isOpen: false, product: null })}
              _hover={{ bg: "brand.beige" }}
            >
              Cancelar
            </Button>
            <Button
              bg="brand.dark"
              color="brand.white"
              _hover={{ bg: "brand.brown" }}
              fontFamily="body"
              fontSize="sm"
              letterSpacing="0.08em"
              borderRadius="lg"
              isLoading={movSaving}
              onClick={handleMovSave}
            >
              Registrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default StockManager;
