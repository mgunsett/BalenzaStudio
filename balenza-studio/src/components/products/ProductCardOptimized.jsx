import { useState, useRef } from "react";
import {
  Box, VStack, HStack, Text, Image, Badge, IconButton, Tooltip
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Eye, TrendingUp } from "lucide-react";
import { gsap } from "gsap";
import { formatPrice } from "../../utils/formatters";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import toast from "react-hot-toast";

const MotionBox = motion(Box);

const ProductCardOptimized = ({ product, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Calcular descuento
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Stock disponible
  const totalStock = Object.values(product.sizes || {}).reduce((a, b) => a + b, 0);
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const isOutOfStock = totalStock === 0;

  // Detectar si es nuevo (últimos 30 días) - si tiene fecha
  const isNew = product.createdAt;

  const handleMouseEnter = () => {
    setIsHovered(true);
    gsap.to(cardRef.current, { y: -8, duration: 0.3, ease: "power2.out" });
    gsap.to(imgRef.current, { scale: 1.05, duration: 0.5, ease: "power2.out" });
    // Cambiar a segunda imagen si existe
    if (product.images && product.images.length > 1) {
      setCurrentImage(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(imgRef.current, { scale: 1, duration: 0.5, ease: "power2.out" });
    setCurrentImage(0);
  };

  // Quick add to cart
  const handleQuickAdd = (e) => {
    e.stopPropagation();

    // Encontrar el primer talle disponible
    const availableSize = Object.entries(product.sizes || {})
      .find(([size, stock]) => stock > 0)?.[0];

    if (availableSize) {
      addItem(product, availableSize, 1);
      toast.success(`${product.name} (${availableSize}) agregado al carrito`, {
        duration: 2000,
        icon: '🛍️',
      });
    } else {
      toast.error('Producto sin stock disponible');
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(product.id, product);
  };

  return (
    <MotionBox
      ref={cardRef}
      position="relative"
      borderRadius="2xl"
      overflow="hidden"
      bg="white"
      cursor="pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role="group"
      boxShadow={isHovered ? "2xl" : "md"}
      transition="box-shadow 0.3s"
    >
      {/* CONTENEDOR DE IMAGEN */}
      <Box position="relative" overflow="hidden">
        {/* IMAGEN PRINCIPAL CON SWAP */}
        <Box
          position="relative"
          h={{ base: "280px", sm: "320px", md: "360px" }}
          bg="brand.beige"
          overflow="hidden"
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              position="absolute"
              inset={0}
            >
              <Image
                ref={imgRef}
                src={
                  product.images?.[currentImage] ||
                  `https://placehold.co/400x500/EDE0D4/7A6555?text=${product.name}`
                }
                alt={product.name}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </MotionBox>
          </AnimatePresence>

          {/* OVERLAY CON ACCIONES RÁPIDAS */}
          <AnimatePresence>
            {isHovered && (
              <MotionBox
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <HStack spacing={2}>
                  {/* VISTA RÁPIDA */}
                  <Tooltip label="Vista rápida" placement="top">
                    <IconButton
                      icon={<Eye size={18} />}
                      size="sm"
                      bg="white"
                      color="brand.dark"
                      borderRadius="full"
                      _hover={{ bg: "brand.cream", transform: "scale(1.1)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick && onClick();
                      }}
                      aria-label="Vista rápida"
                    />
                  </Tooltip>

                  {/* AGREGAR AL CARRITO */}
                  {!isOutOfStock && (
                    <Tooltip label="Agregar al carrito" placement="top">
                      <IconButton
                        icon={<ShoppingBag size={18} />}
                        size="sm"
                        bg="brand.brown"
                        color="white"
                        borderRadius="full"
                        _hover={{ bg: "brand.dark", transform: "scale(1.1)" }}
                        onClick={handleQuickAdd}
                        aria-label="Agregar al carrito"
                      />
                    </Tooltip>
                  )}
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        {/* BADGES SUPERIORES */}
        <Box position="absolute" top={3} left={3} right={3}>
          <HStack justify="space-between" align="flex-start">
            {/* BADGES IZQUIERDA */}
            <VStack align="flex-start" spacing={2}>
              {/* DESCUENTO */}
              {discount > 0 && (
                <Badge
                  bg="brand.error"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="600"
                >
                  -{discount}%
                </Badge>
              )}

              {/* NUEVO */}
              {isNew && !discount && (
                <Badge
                  bg="brand.brown"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="600"
                >
                  NUEVO
                </Badge>
              )}

              {/* LOW STOCK */}
              {isLowStock && (
                <Badge
                  bg="orange.500"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="600"
                >
                  ¡Últimas {totalStock}!
                </Badge>
              )}

              {/* OUT OF STOCK */}
              {isOutOfStock && (
                <Badge
                  bg="gray.600"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="600"
                >
                  Agotado
                </Badge>
              )}
            </VStack>

            {/* FAVORITO - DERECHA */}
            <IconButton
              icon={
                <Heart
                  size={16}
                  fill={isFavorite(product.id) ? "#A0785A" : "none"}
                  color={isFavorite(product.id) ? "#A0785A" : "white"}
                />
              }
              size="sm"
              bg="whiteAlpha.800"
              backdropFilter="blur(10px)"
              borderRadius="full"
              boxShadow="md"
              _hover={{ bg: "white", transform: "scale(1.1)" }}
              onClick={handleFavorite}
              aria-label="Agregar a favoritos"
              transition="all 0.2s"
            />
          </HStack>
        </Box>

        {/* INDICADOR DE IMÁGENES MÚLTIPLES */}
        {product.images && product.images.length > 1 && (
          <HStack
            position="absolute"
            bottom={3}
            left="50%"
            transform="translateX(-50%)"
            spacing={1}
          >
            {product.images.map((_, index) => (
              <Box
                key={index}
                w="6px"
                h="6px"
                borderRadius="full"
                bg={currentImage === index ? "white" : "whiteAlpha.500"}
                transition="all 0.2s"
              />
            ))}
          </HStack>
        )}
      </Box>

      {/* INFORMACIÓN DEL PRODUCTO */}
      <VStack align="stretch" p={4} spacing={2}>
        {/* CATEGORÍA */}
        <Text
          fontSize="2xs"
          color="brand.muted"
          textTransform="uppercase"
          letterSpacing="wider"
          fontWeight="600"
        >
          {product.category}
        </Text>

        {/* NOMBRE DEL PRODUCTO */}
        <Text
          fontSize="md"
          fontWeight="600"
          color="brand.dark"
          noOfLines={2}
          minH="40px"
          fontFamily="body"
        >
          {product.name}
        </Text>

        {/* PRECIO */}
        <HStack spacing={2} align="baseline">
          {product.salePrice ? (
            <>
              <Text fontSize="xl" fontWeight="700" color="brand.error">
                {formatPrice(product.salePrice)}
              </Text>
              <Text
                fontSize="sm"
                color="brand.muted"
                textDecoration="line-through"
              >
                {formatPrice(product.price)}
              </Text>
            </>
          ) : (
            <Text fontSize="xl" fontWeight="700" color="brand.dark">
              {formatPrice(product.price)}
            </Text>
          )}
        </HStack>

        {/* MICRO-COPY ADICIONAL */}
        {!isOutOfStock && (
          <HStack spacing={2} fontSize="xs" color="brand.muted" flexWrap="wrap">
            <Text>✓ Envío gratis +$50.000</Text>
            {product.featured && (
              <HStack spacing={1} color="brand.brown">
                <TrendingUp size={12} />
                <Text fontWeight="600">Popular</Text>
              </HStack>
            )}
          </HStack>
        )}

        {/* TALLES DISPONIBLES */}
        {!isOutOfStock && (
          <HStack spacing={1} pt={1} flexWrap="wrap">
            <Text fontSize="2xs" color="brand.muted">
              Talles:
            </Text>
            <HStack spacing={1} flexWrap="wrap">
              {Object.entries(product.sizes || {})
                .filter(([_, stock]) => stock > 0)
                .slice(0, 5)
                .map(([size]) => (
                  <Badge
                    key={size}
                    fontSize="2xs"
                    px={1.5}
                    py={0.5}
                    bg="brand.beige"
                    color="brand.dark"
                  >
                    {size}
                  </Badge>
                ))}
            </HStack>
          </HStack>
        )}
      </VStack>
    </MotionBox>
  );
};

export default ProductCardOptimized;
