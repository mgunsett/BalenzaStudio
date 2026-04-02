import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box, VStack, Text, useDisclosure, HStack, Select,
} from "@chakra-ui/react";
import { useProducts } from "../hooks/useProducts";
import ProductGrid from "../components/products/ProductGrid";
import ProductModal from "../components/products/ProductModal";
import { CATEGORIES } from "../utils/constants";

const CategoryPage = () => {
  const { slug } = useParams();
  const cat = CATEGORIES.find((c) => c.slug === slug);

  const { products, loading } = useProducts({ category: slug });
  const [filtered, setFiltered]         = useState([]);
  const [sort, setSort]                 = useState("newest");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isOpen, onOpen, onClose }     = useDisclosure();

  useEffect(() => {
    let sorted = [...products];
    if (sort === "price-asc")  sorted.sort((a, b) => (a.salePrice||a.price) - (b.salePrice||b.price));
    if (sort === "price-desc") sorted.sort((a, b) => (b.salePrice||b.price) - (a.salePrice||a.price));
    setFiltered(sorted);
  }, [products, sort]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  return (
    <Box minH="80vh">
      {/* Header de categoría */}
      <Box
        py={20}
        px={{ base: 4, md: 8 }}
        bg="brand.beige"
        borderBottom="0.5px solid rgba(160,120,90,0.15)"
        textAlign="center"
      >
        <VStack spacing={2}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.35em" textTransform="uppercase" color="brand.brown">
            Colección
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "4xl", md: "5xl" }} color="brand.dark" letterSpacing="0.06em">
            {cat?.label || slug}
          </Text>
          <Text fontFamily="body" fontSize="sm" color="brand.muted">
            {loading ? "Cargando..." : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
          </Text>
        </VStack>
      </Box>

      {/* Toolbar */}
      <Box px={{ base: 4, md: 8 }} py={4} bg="brand.nude" borderBottom="0.5px solid rgba(160,120,90,0.1)">
        <HStack justify="flex-end" maxW="1300px" mx="auto">
          <HStack spacing={2}>
            <Text fontFamily="body" fontSize="xs" color="brand.muted" letterSpacing="0.1em" textTransform="uppercase">
              Ordenar
            </Text>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              size="sm"
              w="180px"
              bg="brand.white"
              border="0.5px solid rgba(160,120,90,0.3)"
              borderRadius="sm"
              fontFamily="body"
              fontSize="xs"
              color="brand.dark"
              _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
            >
              <option value="newest">Más nuevos</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </Select>
          </HStack>
        </HStack>
      </Box>

      <ProductGrid
        products={filtered}
        loading={loading}
        onProductClick={handleProductClick}
      />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isOpen}
          onClose={() => { onClose(); setSelectedProduct(null); }}
        />
      )}
    </Box>
  );
};

export default CategoryPage;