import { useRef, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Image, Badge, IconButton,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "../../utils/formatters";

const ProductCard = ({ product, onClick, onQuickAdd }) => {
  const cardRef = useRef(null);
  const imgRef  = useRef(null);

  const handleMouseEnter = () => {
    gsap.to(imgRef.current, { scale: 1.04, duration: 0.5, ease: "power2.out" });
    gsap.to(cardRef.current, { y: -4, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(imgRef.current, { scale: 1, duration: 0.5, ease: "power2.out" });
    gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
  };

  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <Box
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      cursor="pointer"
      onClick={onClick}
      role="group"
    >
      {/* Imagen */}
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="lg"
        mb={3}
        bg="brand.beige"
      >
        <Box overflow="hidden" h={{ base: "260px", sm: "300px", md: "340px" }}>
          <Image
            ref={imgRef}
            src={product.images?.[0] || `https://placehold.co/400x500/EDE0D4/7A6555?text=${product.name}`}
            alt={product.name}
            w="100%" h="100%"
            objectFit="cover"
            transition="opacity 0.3s"
          />
        </Box>

        {/* Badges */}
        <HStack position="absolute" top={3} left={3} spacing={2}>
          {product.featured && <Badge variant="brand">Destacado</Badge>}
          {hasDiscount && <Badge variant="sale">Oferta</Badge>}
          {Object.values(product.sizes || {}).every((s) => s === 0) && (
            <Badge bg="brand.muted" color="brand.white" fontSize="2xs" borderRadius="full" px={2}>
              Sin stock
            </Badge>
          )}
        </HStack>

        {/* Botón rápido "añadir" */}
        <Box
          position="absolute"
          bottom={3} right={3}
          opacity={0}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.25s"
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickAdd) onQuickAdd(product);
          }}
        >
          <Box
            w="40px" h="40px"
            borderRadius="full"
            bg="rgba(253,250,247,0.9)"
            backdropFilter="blur(8px)"
            border="0.5px solid rgba(160,120,90,0.25)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ bg: "brand.dark", color: "brand.white" }}
            transition="all 0.2s"
            color="brand.brown"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
          </Box>
        </Box>
      </Box>

      {/* Info */}
      <VStack align="flex-start" spacing={1} px={1}>
        <Text
          fontFamily="body"
          fontSize="2xs"
          letterSpacing="0.15em"
          textTransform="uppercase"
          color="brand.muted"
        >
          {product.category}
        </Text>
        <Text
          fontFamily="heading"
          fontWeight={400}
          fontSize="lg"
          color="brand.dark"
          letterSpacing="0.03em"
          lineHeight={1.2}
          noOfLines={2}
        >
          {product.name}
        </Text>
        <HStack spacing={2} align="baseline">
          <Text fontFamily="body" fontWeight={500} fontSize="md" color="brand.dark">
            {formatPrice(product.salePrice || product.price)}
          </Text>
          {hasDiscount && (
            <Text fontFamily="body" fontSize="sm" color="brand.muted" textDecoration="line-through">
              {formatPrice(product.price)}
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProductCard;