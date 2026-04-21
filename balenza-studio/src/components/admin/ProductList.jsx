// ═══════════════════════════════════════════════════════════════
// src/components/admin/ProductList.jsx
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from "react";
import {
  Box, Text, Flex, Button, Badge, Image, Spinner, Input, HStack,
  VStack, IconButton, Select, Tooltip,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, useDisclosure,
} from "@chakra-ui/react";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, updateProduct, deleteProduct } from "../../services/firebase/products";
import { formatPrice } from "../../utils/formatters";
import { CATEGORIES, SIZES } from "../../utils/constants";
import toast from "react-hot-toast";

const ProductList = () => {
  const navigate = useNavigate();
  const [products,  setProducts]  = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [toDelete,  setToDelete]  = useState(null);
  const cancelRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const load = () => {
    setLoading(true);
    getProducts({ includeInactive: true })
      .then((p) => { setProducts(p); setFiltered(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = products;
    if (search)    result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (catFilter) result = result.filter((p) => p.category === catFilter);
    setFiltered(result);
  }, [search, catFilter, products]);

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, { active: !product.active });
      toast.success(product.active ? "Producto ocultado" : "Producto activado");
      load();
    } catch { toast.error("Error al actualizar"); }
  };

  const confirmDelete = (product) => { setToDelete(product); onOpen(); };

  const handleDelete = async () => {
    try {
      await deleteProduct(toDelete.id);
      toast.success("Producto desactivado");
      load();
    } catch { toast.error("Error al eliminar"); }
    onClose();
    setToDelete(null);
  };

  const totalStock  = (sizes = {}) => Object.values(sizes).reduce((a, b) => a + b, 0);
  const stockStatus = (sizes = {}) => {
    const t = totalStock(sizes);
    if (t === 0) return { label: "Sin stock", color: "red"    };
    if (t <= 5)  return { label: "Stock bajo", color: "yellow" };
    return             { label: "En stock",   color: "green"  };
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            Catálogo
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark" letterSpacing="0.04em">
            Productos
          </Text>
        </VStack>
        <Button
          size="sm"
          fontSize="xs"
          letterSpacing="0.15em"
          leftIcon={<Plus size={15} strokeWidth={1.5} />}
          onClick={() => navigate("/admin/productos/nuevo")}
          bg="brand.dark"
          color="brand.white"
          _hover={{ bg: "brand.brown" }}
          borderRadius="lg"
        >
          Nuevo producto
        </Button>
      </Flex>

      {/* Filtros */}
      <HStack spacing={3} flexWrap="wrap" gap={3}>
        <Box position="relative" flex={1} minW="200px">
          <Search
            size={14}
            color="var(--chakra-colors-brand-muted)"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
          />
          <Input
            pl={9}
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
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </Select>
      </HStack>

      <Text fontFamily="body" fontSize="xs" color="brand.muted">
        {loading ? "Cargando..." : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
      </Text>

      {/* Lista */}
      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner size="lg" color="brand.brown" thickness="1px" />
        </Flex>
      ) : (
        <VStack align="stretch" spacing={2}>
          {filtered.map((product) => {
            const st = stockStatus(product.sizes);
            return (
              <Box
                key={product.id}
                bg="brand.cream"
                borderRadius="xl"
                border="0.5px solid rgba(160,120,90,0.15)"
                p={4}
                opacity={product.active === false ? 0.55 : 1}
                _hover={{ borderColor: "brand.sand", shadow: "sm" }}
                transition="all 0.15s"
              >
                <Flex gap={4} align="center" flexWrap="wrap">
                  <Image
                    src={product.images?.[0] || `https://placehold.co/64x80/EDE0D4/7A6555?text=.`}
                    alt={product.name}
                    w="60px" h="75px"
                    objectFit="cover"
                    borderRadius="md"
                    flexShrink={0}
                    bg="brand.beige"
                  />
                  <VStack align="flex-start" spacing={1} flex={1} minW="140px">
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.03em">
                        {product.name}
                      </Text>
                      {product.featured && (
                        <Badge bg="brand.brown" color="brand.white" fontSize="2xs" borderRadius="full" px={2} fontFamily="body">
                          Destacado
                        </Badge>
                      )}
                      {product.active === false && (
                        <Badge bg="brand.muted" color="brand.white" fontSize="2xs" borderRadius="full" px={2} fontFamily="body">
                          Oculto
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={3}>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted" textTransform="capitalize">
                        {product.category}
                      </Text>
                      <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                        {formatPrice(product.salePrice || product.price)}
                        {product.salePrice && (
                          <Text as="span" color="brand.muted" fontWeight={400} textDecoration="line-through" ml={2} fontSize="xs">
                            {formatPrice(product.price)}
                          </Text>
                        )}
                      </Text>
                    </HStack>
                    {/* Stock por talle */}
                    <HStack spacing={2} flexWrap="wrap">
                      {SIZES.map((size) => {
                        const qty = product.sizes?.[size] ?? 0;
                        return (
                          <Text
                            key={size}
                            fontFamily="body"
                            fontSize="2xs"
                            letterSpacing="0.05em"
                            color={qty === 0 ? "brand.muted" : qty <= 2 ? "orange.500" : "brand.success"}
                          >
                            {size}:{qty}
                          </Text>
                        );
                      })}
                    </HStack>
                  </VStack>

                  <Badge
                    colorScheme={st.color}
                    fontSize="2xs"
                    borderRadius="full"
                    px={3} py={1}
                    fontFamily="body"
                  >
                    {st.label} ({totalStock(product.sizes)})
                  </Badge>

                  <HStack spacing={1}>
                    <Tooltip label={product.active === false ? "Activar" : "Ocultar"} hasArrow fontSize="xs">
                      <IconButton
                        icon={product.active === false ? <Eye size={15} /> : <EyeOff size={15} />}
                        size="sm"
                        variant="ghost"
                        borderRadius="lg"
                        color="brand.muted"
                        onClick={() => handleToggleActive(product)}
                        _hover={{ bg: "brand.beige", color: "brand.dark" }}
                        aria-label="Toggle visibilidad"
                      />
                    </Tooltip>
                    <Tooltip label="Editar" hasArrow fontSize="xs">
                      <IconButton
                        icon={<Edit2 size={15} />}
                        size="sm"
                        variant="ghost"
                        borderRadius="lg"
                        color="brand.muted"
                        onClick={() => navigate(`/admin/productos/${product.id}`)}
                        _hover={{ bg: "brand.beige", color: "brand.dark" }}
                        aria-label="Editar"
                      />
                    </Tooltip>
                    <Tooltip label="Desactivar" hasArrow fontSize="xs">
                      <IconButton
                        icon={<Trash2 size={15} />}
                        size="sm"
                        variant="ghost"
                        borderRadius="lg"
                        color="brand.muted"
                        onClick={() => confirmDelete(product)}
                        _hover={{ bg: "rgba(192,57,43,0.07)", color: "brand.error" }}
                        aria-label="Desactivar"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </Box>
            );
          })}

          {filtered.length === 0 && !loading && (
            <Flex direction="column" align="center" py={16} gap={3}>
              <Package size={44} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
              <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.muted">
                No se encontraron productos
              </Text>
            </Flex>
          )}
        </VStack>
      )}

      {/* Confirm dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent bg="brand.cream" borderRadius="xl">
            <AlertDialogHeader fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
              Desactivar producto
            </AlertDialogHeader>
            <AlertDialogBody fontFamily="body" fontSize="sm" color="brand.muted">
              ¿Desactivar <strong>{toDelete?.name}</strong>? No se elimina, solo deja de mostrarse en la tienda.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                variant="ghost"
                size="sm"
                onClick={onClose}
                color="brand.muted"
                fontSize="xs"
                _hover={{ color: "brand.dark", bg: "brand.beige" }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                bg="brand.error"
                color="white"
                fontSize="xs"
                letterSpacing="0.1em"
                onClick={handleDelete}
                _hover={{ bg: "red.700" }}
                borderRadius="lg"
              >
                Desactivar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default ProductList;