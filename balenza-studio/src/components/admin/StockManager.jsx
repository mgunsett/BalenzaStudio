// src/components/admin/StockManager.jsx
// Usa: getProducts({ includeInactive: true }), updateProduct(id, { sizes })
// SIZES = ["XS", "S", "M", "L", "XL"] (strings)
import { useEffect, useState } from "react";
import {
  Box, VStack, HStack, Text, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Button, Spinner, Badge, SimpleGrid, Flex, Image, Input, Select,
} from "@chakra-ui/react";
import { Search, Save, Package } from "lucide-react";
import { getProducts, updateProduct } from "../../services/firebase/products";
import { SIZES, CATEGORIES } from "../../utils/constants";
import toast from "react-hot-toast";

const StockManager = () => {
  const [products,    setProducts]    = useState([]);
  const [edits,       setEdits]       = useState({});   // { productId: { size: newValue } }
  const [saving,      setSaving]      = useState({});
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("");

  const load = () => {
    setLoading(true);
    getProducts({ includeInactive: true })
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (productId, size, value) => {
    setEdits((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [size]: Number(value) || 0 },
    }));
  };

  const hasChanges = (productId) =>
    !!edits[productId] && Object.keys(edits[productId]).length > 0;

  const handleSave = async (product) => {
    const changes = edits[product.id];
    if (!changes) return;
    setSaving((prev) => ({ ...prev, [product.id]: true }));
    try {
      const newSizes = { ...product.sizes, ...changes };
      // Usa updateProduct (no updateStock) para mantener consistencia con services/firebase/products.js
      await updateProduct(product.id, { sizes: newSizes });
      setEdits((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, sizes: newSizes } : p)
      );
      toast.success(`Stock de "${product.name}" actualizado`);
    } catch { toast.error("Error al guardar"); }
    finally { setSaving((prev) => ({ ...prev, [product.id]: false })); }
  };

  const getEffectiveSizes = (product) => ({
    ...(product.sizes || {}),
    ...(edits[product.id] || {}),
  });

  const totalStock = (sizes = {}) =>
    Object.values(sizes).reduce((a, b) => a + b, 0);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !catFilter || p.category === catFilter;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Flex>
    );
  }

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

      {/* Leyenda */}
      <HStack spacing={4} flexWrap="wrap">
        {[
          { color: "brand.error",   label: "Sin stock (0)"   },
          { color: "orange.400",    label: "Stock bajo (1-3)" },
          { color: "brand.success", label: "OK (4+)"         },
        ].map(({ color, label }) => (
          <HStack key={label} spacing={2}>
            <Box w="7px" h="7px" borderRadius="full" bg={color} />
            <Text fontFamily="body" fontSize="xs" color="brand.muted">{label}</Text>
          </HStack>
        ))}
      </HStack>

      {/* Filtros */}
      <HStack spacing={3} flexWrap="wrap">
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
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.label}</option>
          ))}
        </Select>
      </HStack>

      {/* Cards de productos */}
      <VStack align="stretch" spacing={3}>
        {filtered.map((product) => {
          const sizes   = getEffectiveSizes(product);
          const changed = hasChanges(product.id);
          const total   = totalStock(sizes);

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
              {/* Info del producto */}
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
                  colorScheme={total === 0 ? "red" : total <= 5 ? "yellow" : "green"}
                  fontSize="xs"
                  borderRadius="full"
                  px={3}
                  fontFamily="body"
                  flexShrink={0}
                >
                  {total} u. totales
                </Badge>

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

              {/* Grid de talles — SIZES = ["XS","S","M","L","XL"] */}
              <SimpleGrid columns={SIZES.length} gap={3}>
                {SIZES.map((size) => {
                  const val   = sizes[size] ?? 0;
                  const color = val === 0 ? "brand.error"
                    : val <= 3 ? "orange.400"
                    : "brand.success";
                  const isEdited = edits[product.id]?.[size] !== undefined;

                  return (
                    <VStack key={size} spacing={1}>
                      <Text
                        fontFamily="body"
                        fontSize="xs"
                        fontWeight={500}
                        color={color}
                        letterSpacing="0.08em"
                      >
                        {size}
                      </Text>
                      <NumberInput
                        value={val}
                        min={0}
                        max={999}
                        onChange={(_, v) => handleChange(product.id, size, v)}
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
    </VStack>
  );
};

export default StockManager;
