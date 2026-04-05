import { useState, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Input, Select, Button, Image,
  Badge, SimpleGrid, IconButton, Spinner, useDisclosure,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useRef } from "react";
import { getProducts, updateProduct, deleteProduct } from "../../services/firebase/products";
import { formatPrice } from "../../utils/formatters";
import { CATEGORIES, SIZES } from "../../utils/constants";
import toast from "react-hot-toast";

const ProductList = () => {
  const navigate    = useNavigate();
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

  const confirmDelete = (product) => {
    setToDelete(product);
    onOpen();
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(toDelete.id);
      toast.success("Producto desactivado");
      load();
    } catch { toast.error("Error al eliminar"); }
    onClose();
    setToDelete(null);
  };

  const totalStock = (sizes = {}) => Object.values(sizes).reduce((a, b) => a + b, 0);
  const stockStatus = (sizes = {}) => {
    const total = totalStock(sizes);
    if (total === 0) return { label: "Sin stock", color: "red" };
    if (total <= 5)  return { label: "Stock bajo", color: "yellow" };
    return { label: "En stock",  color: "green" };
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            Catálogo
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">
            Productos
          </Text>
        </VStack>
        <Button
          variant="primary"
          size="md"
          fontSize="xs"
          letterSpacing="0.15em"
          leftIcon={<Plus size={16} strokeWidth={1.5} />}
          onClick={() => navigate("/admin/productos/nuevo")}
        >
          Nuevo producto
        </Button>
      </HStack>

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
            placeholder="Buscar producto..."
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
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          w="160px"
          bg="brand.white"
          border="0.5px solid rgba(160,120,90,0.3)"
          borderRadius="sm"
          fontFamily="body"
          fontSize="sm"
          h="40px"
          color="brand.dark"
          _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </Select>
      </HStack>

      {/* Conteo */}
      <Text fontFamily="body" fontSize="xs" color="brand.muted" letterSpacing="0.05em">
        {loading ? "Cargando..." : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
      </Text>

      {/* Lista */}
      {loading ? (
        <Box py={16} display="flex" justifyContent="center">
          <Spinner size="lg" color="brand.brown" thickness="1px" />
        </Box>
      ) : (
        <VStack align="stretch" spacing={2}>
          {filtered.map((product) => {
            const st = stockStatus(product.sizes);
            return (
              <Box
                key={product.id}
                bg="brand.cream"
                borderRadius="lg"
                border="0.5px solid rgba(160,120,90,0.15)"
                p={4}
                opacity={product.active === false ? 0.55 : 1}
                transition="opacity 0.2s"
              >
                <Flex gap={4} align="center" flexWrap="wrap">
                  {/* Imagen */}
                  <Image
                    src={product.images?.[0] || `https://placehold.co/64x80/EDE0D4/7A6555`}
                    alt={product.name}
                    w="64px" h="80px"
                    objectFit="cover"
                    borderRadius="md"
                    flexShrink={0}
                    bg="brand.beige"
                  />

                  {/* Info */}
                  <VStack align="flex-start" spacing={1} flex={1} minW="160px">
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontFamily="heading" fontSize="md" color="brand.dark" fontWeight={400}>
                        {product.name}
                      </Text>
                      {product.featured && <Badge variant="brand" fontSize="2xs">Destacado</Badge>}
                      {product.active === false && (
                        <Badge bg="brand.muted" color="brand.white" fontSize="2xs" borderRadius="full" px={2}>
                          Oculto
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={3}>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted" textTransform="capitalize">
                        {product.category}
                      </Text>
                      <Text fontFamily="body" fontSize="xs" color="brand.dark" fontWeight={500}>
                        {formatPrice(product.salePrice || product.price)}
                        {product.salePrice && (
                          <Text as="span" color="brand.muted" fontWeight={400} textDecoration="line-through" ml={2}>
                            {formatPrice(product.price)}
                          </Text>
                        )}
                      </Text>
                    </HStack>
                    {/* Stock mini por talle */}
                    <HStack spacing={2} flexWrap="wrap">
                      {SIZES.map((size) => {
                        const qty = product.sizes?.[size] ?? 0;
                        return (
                          <Text
                            key={size}
                            fontFamily="body"
                            fontSize="2xs"
                            color={qty === 0 ? "brand.muted" : qty <= 2 ? "orange.500" : "brand.success"}
                            letterSpacing="0.05em"
                          >
                            {size}:{qty}
                          </Text>
                        );
                      })}
                    </HStack>
                  </VStack>

                  {/* Badge stock */}
                  <Badge
                    colorScheme={st.color}
                    fontSize="2xs"
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {st.label} ({totalStock(product.sizes)})
                  </Badge>

                  {/* Acciones */}
                  <HStack spacing={1}>
                    <IconButton
                      icon={product.active === false ? <Eye size={15} /> : <EyeOff size={15} />}
                      size="sm"
                      variant="ghost"
                      borderRadius="full"
                      color="brand.muted"
                      onClick={() => handleToggleActive(product)}
                      _hover={{ bg: "brand.beige", color: "brand.dark" }}
                      aria-label="Activar/desactivar"
                      title={product.active === false ? "Activar" : "Ocultar"}
                    />
                    <IconButton
                      icon={<Edit2 size={15} />}
                      size="sm"
                      variant="ghost"
                      borderRadius="full"
                      color="brand.muted"
                      onClick={() => navigate(`/admin/productos/${product.id}`)}
                      _hover={{ bg: "brand.beige", color: "brand.dark" }}
                      aria-label="Editar"
                    />
                    <IconButton
                      icon={<Trash2 size={15} />}
                      size="sm"
                      variant="ghost"
                      borderRadius="full"
                      color="brand.muted"
                      onClick={() => confirmDelete(product)}
                      _hover={{ bg: "rgba(192,57,43,0.08)", color: "brand.error" }}
                      aria-label="Eliminar"
                    />
                  </HStack>
                </Flex>
              </Box>
            );
          })}

          {filtered.length === 0 && !loading && (
            <Box py={16} textAlign="center">
              <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.muted">
                No se encontraron productos
              </Text>
            </Box>
          )}
        </VStack>
      )}

      {/* Confirm delete dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent bg="brand.cream" borderRadius="xl">
            <AlertDialogHeader fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
              Desactivar producto
            </AlertDialogHeader>
            <AlertDialogBody fontFamily="body" fontSize="sm" color="brand.muted">
              ¿Desactivar <strong>{toDelete?.name}</strong>? No se eliminará permanentemente, solo dejará de mostrarse en la tienda.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} variant="ghost" size="sm" onClick={onClose} color="brand.muted" fontSize="xs">
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