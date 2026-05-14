// src/components/admin/ProductList.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Text, Flex, Button, Badge, Image, Spinner, Input, HStack,
  VStack, IconButton, Select, Tooltip,
  Table, Thead, Tbody, Tr, Th, Td,
} from "@chakra-ui/react";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, hardDeleteProduct } from "../../services/firebase/products";
import { formatPrice } from "../../utils/formatters";
import { getTotalStock } from "../../utils/inventory";
import { CATEGORIES } from "../../utils/constants";
import toast from "react-hot-toast";

const ProductList = () => {
  const navigate = useNavigate();
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    setLoading(true);
    getProducts({ includeInactive: true })
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || p.category === catFilter;
      const matchStatus =
        !statusFilter ||
        (statusFilter === "active"   &&  p.active !== false) ||
        (statusFilter === "inactive" && p.active === false);
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, catFilter, statusFilter]);

  const handleDelete = async (product) => {
    const ok = window.confirm(
      `¿Seguro que querés eliminar "${product.name}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    try {
      await hardDeleteProduct(product.id);
      toast.success("Producto eliminado");
      load();
    } catch (e) {
      toast.error(e.message || "Error al eliminar");
    }
  };

  const stockBadge = (product) => {
    const t = getTotalStock(product);
    if (t === 0) return { label: "Sin stock", colorScheme: "red" };
    if (t < 5)   return { label: "Stock bajo", colorScheme: "yellow" };
    return             { label: "En stock",   colorScheme: "green" };
  };

  return (
    <VStack align="stretch" spacing={6}>

      {/* Header */}
      <Flex justify="space-between" align="flex-end" flexWrap="wrap" gap={3}>
        <VStack align="flex-start" spacing={0}>
          <Text
            fontFamily="body" fontSize="2xs" letterSpacing="0.25em"
            textTransform="uppercase" color="brand.brown"
          >
            Catálogo
          </Text>
          <Text
            fontFamily="heading" fontWeight={300} fontSize="4xl"
            letterSpacing="0.05em" color="brand.dark" lineHeight={1}
          >
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
      <Flex wrap="wrap" gap={3}>
        <Box position="relative" flex={1} minW={{ base: "100%", sm: "200px" }}>
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
            fontFamily="body" fontSize="sm" h="40px"
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
          fontFamily="body" fontSize="sm" h="40px"
          color="brand.dark"
          _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          w={{ base: "100%", sm: "150px" }}
          bg="brand.cream"
          border="0.5px solid rgba(160,120,90,0.3)"
          borderRadius="lg"
          fontFamily="body" fontSize="sm" h="40px"
          color="brand.dark"
          _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </Select>
      </Flex>

      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner size="lg" color="brand.brown" thickness="1px" />
        </Flex>
      ) : filtered.length === 0 ? (
        <Flex direction="column" align="center" py={20} gap={3}>
          <Package size={44} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
          <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.muted">
            No hay productos
          </Text>
          <Text fontFamily="body" fontSize="sm" color="brand.muted">
            Probá ajustar los filtros o creá un producto nuevo
          </Text>
        </Flex>
      ) : (
        <Box
          bg="brand.cream"
          borderRadius="xl"
          border="0.5px solid rgba(160,120,90,0.15)"
          overflow="hidden"
        >
          <Text
            fontFamily="body" fontSize="xs" color="brand.muted"
            px={5} py={3}
            borderBottom="0.5px solid rgba(160,120,90,0.1)"
          >
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
          </Text>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th
                    fontFamily="body" fontSize="2xs" letterSpacing="0.15em"
                    textTransform="uppercase" color="brand.muted"
                    borderColor="rgba(160,120,90,0.12)" py={3}
                  >
                    Producto
                  </Th>
                  <Th
                    fontFamily="body" fontSize="2xs" letterSpacing="0.15em"
                    textTransform="uppercase" color="brand.muted"
                    borderColor="rgba(160,120,90,0.12)"
                    display={{ base: "none", md: "table-cell" }}
                  >
                    Precio
                  </Th>
                  <Th
                    fontFamily="body" fontSize="2xs" letterSpacing="0.15em"
                    textTransform="uppercase" color="brand.muted"
                    borderColor="rgba(160,120,90,0.12)"
                    display={{ base: "none", lg: "table-cell" }}
                    isNumeric
                  >
                    Stock
                  </Th>
                  <Th
                    fontFamily="body" fontSize="2xs" letterSpacing="0.15em"
                    textTransform="uppercase" color="brand.muted"
                    borderColor="rgba(160,120,90,0.12)"
                    display={{ base: "none", sm: "table-cell" }}
                  >
                    Estado
                  </Th>
                  <Th borderColor="rgba(160,120,90,0.12)" w="100px" />
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((product) => {
                  const sb = stockBadge(product);
                  return (
                    <Tr
                      key={product.id}
                      opacity={product.active === false ? 0.5 : 1}
                      _hover={{ bg: "rgba(160,120,90,0.04)" }}
                      transition="background 0.12s"
                    >
                      {/* Imagen + nombre + categoría */}
                      <Td borderColor="rgba(160,120,90,0.08)" py={3}>
                        <HStack spacing={3}>
                          <Image
                            src={product.images?.[0] || ""}
                            fallback={
                              <Flex
                                w="40px" h="40px" bg="brand.beige"
                                borderRadius="md" align="center" justify="center" flexShrink={0}
                              >
                                <Package size={14} color="var(--chakra-colors-brand-muted)" strokeWidth={1.5} />
                              </Flex>
                            }
                            w="40px" h="40px"
                            objectFit="cover"
                            borderRadius="md"
                            flexShrink={0}
                            bg="brand.beige"
                          />
                          <VStack align="flex-start" spacing={0.5}>
                            <Text
                              fontFamily="body" fontSize="sm" fontWeight={500}
                              color="brand.dark" noOfLines={1}
                            >
                              {product.name}
                            </Text>
                            <HStack spacing={2}>
                              <Badge
                                bg="brand.beige" color="brand.muted"
                                fontSize="2xs" borderRadius="full" px={2}
                                fontFamily="body" textTransform="capitalize"
                              >
                                {product.category}
                              </Badge>
                              {product.featured && (
                                <Badge
                                  bg="brand.brown" color="brand.white"
                                  fontSize="2xs" borderRadius="full" px={2}
                                  fontFamily="body"
                                >
                                  Destacado
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                      </Td>

                      {/* Precio */}
                      <Td
                        borderColor="rgba(160,120,90,0.08)"
                        display={{ base: "none", md: "table-cell" }}
                      >
                        <VStack align="flex-start" spacing={0}>
                          <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                            {formatPrice(product.salePrice || product.price)}
                          </Text>
                          {product.salePrice && (
                            <Text
                              fontFamily="body" fontSize="xs"
                              color="brand.muted" textDecoration="line-through"
                            >
                              {formatPrice(product.price)}
                            </Text>
                          )}
                        </VStack>
                      </Td>

                      {/* Stock */}
                      <Td
                        borderColor="rgba(160,120,90,0.08)"
                        isNumeric
                        display={{ base: "none", lg: "table-cell" }}
                      >
                        <Text fontFamily="body" fontSize="sm" color="brand.dark">
                          {getTotalStock(product)} u.
                        </Text>
                      </Td>

                      {/* Estado */}
                      <Td
                        borderColor="rgba(160,120,90,0.08)"
                        display={{ base: "none", sm: "table-cell" }}
                      >
                        <VStack align="flex-start" spacing={1}>
                          <Badge
                            colorScheme={product.active === false ? "red" : "green"}
                            fontSize="2xs" borderRadius="full" px={2}
                            fontFamily="body"
                          >
                            {product.active === false ? "Inactivo" : "Activo"}
                          </Badge>
                          <Badge
                            colorScheme={sb.colorScheme}
                            fontSize="2xs" borderRadius="full" px={2}
                            fontFamily="body"
                          >
                            {sb.label}
                          </Badge>
                        </VStack>
                      </Td>

                      {/* Acciones */}
                      <Td borderColor="rgba(160,120,90,0.08)" py={2}>
                        <HStack spacing={1} justify="flex-end">
                          <Tooltip label="Editar" hasArrow fontSize="xs">
                            <IconButton
                              icon={<Edit2 size={14} />}
                              size="sm"
                              variant="ghost"
                              borderRadius="lg"
                              color="brand.muted"
                              onClick={() => navigate(`/admin/productos/${product.id}`)}
                              _hover={{ bg: "brand.beige", color: "brand.dark" }}
                              aria-label="Editar"
                            />
                          </Tooltip>
                          <Tooltip label="Eliminar" hasArrow fontSize="xs">
                            <IconButton
                              icon={<Trash2 size={14} />}
                              size="sm"
                              variant="ghost"
                              borderRadius="lg"
                              color="brand.muted"
                              onClick={() => handleDelete(product)}
                              _hover={{ bg: "rgba(192,57,43,0.07)", color: "brand.error" }}
                              aria-label="Eliminar"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </VStack>
  );
};

export default ProductList;
