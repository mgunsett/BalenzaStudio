import { useRef } from "react";
import { Box, Text, HStack, IconButton, VStack } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

const RelatedProducts = ({ products = [], onProductClick }) => {
  const sliderRef = useRef(null);

  const scroll = (dir) => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = el.offsetWidth * 0.6;
    gsap.to(el, {
      scrollLeft: el.scrollLeft + (dir === "right" ? amount : -amount),
      duration: 0.5,
      ease: "power2.out",
    });
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.brown">
            También te puede gustar
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
            Productos relacionados
          </Text>
        </VStack>
        <HStack spacing={2}>
          <IconButton
            icon={<ChevronLeft size={16} />}
            variant="ghost"
            size="sm"
            borderRadius="full"
            border="0.5px solid rgba(160,120,90,0.25)"
            color="brand.muted"
            onClick={() => scroll("left")}
            _hover={{ bg: "brand.beige", color: "brand.dark" }}
            aria-label="Anterior"
          />
          <IconButton
            icon={<ChevronRight size={16} />}
            variant="ghost"
            size="sm"
            borderRadius="full"
            border="0.5px solid rgba(160,120,90,0.25)"
            color="brand.muted"
            onClick={() => scroll("right")}
            _hover={{ bg: "brand.beige", color: "brand.dark" }}
            aria-label="Siguiente"
          />
        </HStack>
      </HStack>

      <Box
        ref={sliderRef}
        display="flex"
        gap={4}
        overflowX="auto"
        pb={2}
        sx={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          "& > *": {
            scrollSnapAlign: "start",
            flexShrink: 0,
            w: { base: "200px", md: "240px" },
          },
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick?.(product)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default RelatedProducts;