import { useState, useEffect } from "react";
import {
  Box, VStack, HStack, Text, NumberInput, NumberInputField,
  Button, Spinner, Badge, SimpleGrid, Divider,
} from "@chakra-ui/react";
import { getProducts, updateProduct } from "../../services/firebase/products";
import { SIZES } from "../../utils/constants";
import toast from "react-hot-toast";

const StockManager = () => {
  const [products, setProducts] = useState([]);
  const [edits,    setEdits]    = useState({});   // { productId: { size: newValue } }
  const [saving,   setSaving]   = useState({});
  const [loading,  setLoading]  = useState(true);

  const load = () => {
    setLoading(true);
    getProducts({})
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (productId, size, value) => {
    setEdits((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [size]: value },
    }));
  };

  const hasChanges = (productId) => !!Object.keys(edits[productId] || {}).length;

  const handleSave = async (product) => {
    const changes = edits[product.id];
    if (!changes) return;
    setSaving((prev) => ({ ...prev, [product.id]: true }));
    try {
      const newSizes = { ...product.sizes, ...changes };
      await updateProduct(product.id, { sizes: newSizes });
      setEdits((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, sizes: newSizes } : p)
      );
      toast.success(`Stock de "${product.name}" actualizado`);
    } catch { toast.error("Error al guardar"); }
    finally { setSaving((prev) => ({ ...prev, [product.id]: false })); }
  };

  const totalStock = (sizes = {}) => Object.values(sizes).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <Box py={20} display="flex" justifyContent="center">
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <VStack align="flex-start" spacing={0}>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
          Inventario
        </Text>
        <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">
          Gestión de stock
        </Text>
      </VStack>

      {/* Leyenda */}
      <HStack spacing={4} flexWrap="wrap">
        {[
          { color: "brand.error",   label: "Sin stock (0)" },
          { color: "orange.400",    label: "Stock bajo (1-3)" },
          { color: "brand.success", label: "OK (4+)" },
        ].map(({ color, label }) => (
          <HStack key={label} spacing={2}>
            <Box w="8px" h="8px" borderRadius="full" bg={color} />
            <Text fontFamily="body" fontSize="xs" color="brand.muted">{label}</Text>
          </HStack>
        ))}
      </HStack>

      <VStack align="stretch" spacing={3}>
        {products.map((product) => {
          const currentSizes = {
            ...product.sizes,
            ...(edits[product.id] || {}),
          };
          const total = totalStock(currentSizes);

          return (
            <Box
              key={product.id}
              bg="brand.cream"
              borderRadius="xl"
              border="0.5px solid"
              borderColor={hasChanges(product.id) ? "brand.brown" : "rgba(160,120,90,0.15)"}
              p={5}
              transition="border-color 0.2s"
            >
              <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
                <VStack align="flex-start" spacing={0}>
                  <Text fontFamily="heading" fontSize="md" color="brand.dark" fontWeight={400}>
                    {product.name}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted" textTransform="capitalize">
                    {product.category} · Total: {total} u.
                  </Text>
                </VStack>
                {hasChanges(product.id) && (
                  <Button
                    size="sm"
                    variant="primary"
                    fontSize="xs"
                    letterSpacing="0.1em"
                    px={4}
                    isLoading={saving[product.id]}
                    onClick={() => handleSave(product)}
                  >
                    Guardar
                  </Button>
                )}
              </HStack>

              <SimpleGrid columns={5} gap={3}>
                {SIZES.map((size) => {
                  const val   = currentSizes[size] ?? 0;
                  const color = val === 0 ? "brand.error" : val <= 3 ? "orange.400" : "brand.success";
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
                        onChange={(_, v) => handleChange(product.id, size, v || 0)}
                        size="sm"
                      >
                        <NumberInputField
                          fontFamily="body"
                          fontSize="sm"
                          textAlign="center"
                          px={2}
                          borderColor={
                            edits[product.id]?.[size] !== undefined
                              ? "brand.brown"
                              : "rgba(160,120,90,0.25)"
                          }
                          borderRadius="sm"
                          _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                          bg={edits[product.id]?.[size] !== undefined ? "rgba(160,120,90,0.06)" : "brand.white"}
                        />
                      </NumberInput>
                    </VStack>
                  );
                })}
              </SimpleGrid>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
};

export default StockManager;
