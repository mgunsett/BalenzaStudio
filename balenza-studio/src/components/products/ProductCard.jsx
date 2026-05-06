import { useRef, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Image, Badge, Button,
} from "@chakra-ui/react";
import { gsap } from "gsap";
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

  // Determinar badge de urgencia
  const totalStock = Object.values(product.sizes || {}).reduce((a, b) => a + b, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock <= 5;

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
        <HStack position="absolute" top={3} left={3} spacing={2} flexWrap="wrap">
          {product.featured && (
            <Badge variant="brand" fontSize="2xs">Nuevo</Badge>
          )}
          {hasDiscount && <Badge variant="sale">Oferta</Badge>}
          {isLowStock && (
            <Badge bg="orange.400" color="white" fontSize="2xs" borderRadius="full" px={2}>
              Últimas unidades
            </Badge>
          )}
          {isOutOfStock && (
            <Badge bg="brand.muted" color="brand.white" fontSize="2xs" borderRadius="full" px={2}>
              Sin stock
            </Badge>
          )}
        </HStack>
      </Box>

      {/* Info */}
      <VStack align="flex-start" spacing={2} px={1}>
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

        {/* Botón Comprar */}
        {!isOutOfStock && (
          <Button
            variant="primary"
            size="sm"
            w="100%"
            mt={1}
            fontSize="2xs"
            letterSpacing="0.2em"
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick();
            }}
            _hover={{ transform: "translateY(-1px)" }}
          >
            Comprar
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default ProductCard;