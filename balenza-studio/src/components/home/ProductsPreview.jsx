import { useRef, useEffect, useState } from "react";
import {
  Box, VStack, HStack, Text, Button, SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import ProductCard from "../products/ProductCard";
import ProductModal from "../products/ProductModal";
import { useProducts } from "../../hooks/useProducts";
import { useDisclosure } from "@chakra-ui/react";

const ProductsPreview = ({
  title    = "Nuevos ingresos",
  eyebrow  = "Colección actual",
  category = null,
  limit    = 4,
  ctaLabel = "Ver toda la colección",
  ctaPath  = "/categoria/remeras",
}) => {
  const { products, loading } = useProducts({ category, limit, featured: !category ? undefined : undefined });
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate  = useNavigate();
  const ref       = useRef(null);
  const titleRef  = useRef(null);
  const gridRef   = useRef(null);

  useEffect(() => {
    if (loading || !products.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(
        Array.from(gridRef.current?.children || []),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [loading, products]);

  const handleClick = (product) => {
    setSelected(product);
    onOpen();
  };

  return (
    <Box ref={ref} py={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} bg="brand.nude">
      <Box maxW="1300px" mx="auto">
        {/* Header con CTA */}
        <HStack ref={titleRef} justify="space-between" align="flex-end" mb={10} flexWrap="wrap" gap={4}>
          <VStack align="flex-start" spacing={1}>
            <Text fontFamily="body" fontSize="2xs" letterSpacing="0.35em" textTransform="uppercase" color="brand.brown">
              {eyebrow}
            </Text>
            <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark" letterSpacing="0.05em">
              {title}
            </Text>
          </VStack>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={14} />}
            fontSize="xs"
            letterSpacing="0.15em"
            textTransform="uppercase"
            color="brand.muted"
            onClick={() => navigate(ctaPath)}
            _hover={{ color: "brand.dark", bg: "transparent" }}
          >
            {ctaLabel}
          </Button>
        </HStack>

        {/* Grid */}
        <SimpleGrid
          ref={gridRef}
          columns={{ base: 2, md: 4 }}
          gap={{ base: 4, md: 6 }}
        >
          {loading
            ? Array.from({ length: limit }).map((_, i) => (
                <Box key={i} bg="brand.beige" borderRadius="lg" h="340px" />
              ))
            : products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => handleClick(p)}
                />
              ))
          }
        </SimpleGrid>
      </Box>

      {selected && (
        <ProductModal
          product={selected}
          isOpen={isOpen}
          onClose={() => { onClose(); setSelected(null); }}
        />
      )}
    </Box>
  );
};

export default ProductsPreview;