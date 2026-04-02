import { useRef, useEffect } from "react";
import {
  SimpleGrid, Box, Text, VStack, Spinner, Button,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products = [], loading, onProductClick, title, subtitle }) => {
  const gridRef  = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (loading || !products.length) return;
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
          }
        );
      }
      gsap.fromTo(
        Array.from(gridRef.current?.children || []),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    });
    return () => ctx.revert();
  }, [loading, products]);

  if (loading) {
    return (
      <Box py={20} display="flex" justifyContent="center">
        <Spinner size="lg" color="brand.brown" thickness="1px" speed="0.8s" />
      </Box>
    );
  }

  return (
    <Box py={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} bg="brand.nude">
      {(title || subtitle) && (
        <VStack ref={titleRef} spacing={2} textAlign="center" mb={12}>
          {subtitle && (
            <Text fontFamily="body" fontSize="2xs" letterSpacing="0.35em" textTransform="uppercase" color="brand.brown">
              {subtitle}
            </Text>
          )}
          {title && (
            <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark" letterSpacing="0.05em">
              {title}
            </Text>
          )}
        </VStack>
      )}

      <SimpleGrid
        ref={gridRef}
        columns={{ base: 2, md: 3, lg: 4 }}
        gap={{ base: 4, md: 6, lg: 8 }}
        maxW="1300px"
        mx="auto"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </SimpleGrid>

      {products.length === 0 && (
        <VStack py={20} spacing={4}>
          <Text fontFamily="heading" fontSize="xl" color="brand.muted">
            No hay productos disponibles
          </Text>
        </VStack>
      )}
    </Box>
  );
};

export default ProductGrid;