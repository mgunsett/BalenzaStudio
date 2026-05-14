import { useRef, useEffect, useState } from "react";
import {
  Box, Grid, GridItem, VStack, HStack, Text, Button, Divider, Flex, Image,
  Select, Spinner, SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import CartItem from "../components/cart/CartItem";
import { formatPrice } from "../utils/formatters";
import { TRANSFER_DISCOUNT } from "../utils/constants";

const CartPage = () => {
  const { items, subtotal, clearCart, addItem } = useCart();
  const { favoriteProducts, loading: favoritesLoading } = useFavorites();
  const [favoriteSizes, setFavoriteSizes] = useState({});
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
  }, []);

  const transferTotal = subtotal * (1 - TRANSFER_DISCOUNT);
  const favoritePreview = favoriteProducts.slice(0, 4);
  const hasMoreFavorites = favoriteProducts.length > 4;
  const getAvailableSizes = (product) => (
    Object.entries(product.sizes || {})
      .filter(([, stock]) => stock > 0)
      .map(([size]) => size)
  );

  if (items.length === 0) {
    return (
      <Box ref={ref} minH="80vh" display="flex" flexDir="column" alignItems="center" justifyContent="center" gap={6} py={20} px={4}>
        <ShoppingBag size={64} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
        <VStack spacing={2} textAlign="center">
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">Tu carrito está vacío</Text>
          <Text fontFamily="body" fontSize="sm" color="brand.muted">Explorá nuestra colección y encontrá algo que te guste</Text>
        </VStack>
        <Button variant="outline" onClick={() => navigate("/")}>Ver productos</Button>
      </Box>
    );
  }

  return (
    <Box ref={ref} py={{ base: 8, md: 16 }} px={{ base: 4, md: 8, lg: 16 }} minH="80vh">
      <Box maxW="1100px" mx="auto">
        {/* Header */}
        <HStack justify="space-between" mb={10} flexWrap="wrap" align="flex-start" gap={4}>
          <VStack align="flex-start" spacing={1}>
            <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
              Mi selección
            </Text>
            <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark">
              Carrito
            </Text>
          </VStack>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            color="brand.muted"
            fontSize="xs"
            letterSpacing="0.1em"
            textTransform="uppercase"
            w={{ base: "100%", sm: "auto" }}
            justifyContent={{ base: "center", sm: "flex-start" }}
            ml={{ md: "auto" }}
            onClick={() => navigate(-1)}
            _hover={{ color: "brand.dark", bg: "transparent" }}
          >
            Seguir comprando
          </Button>
        </HStack>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={{ base: 8, lg: 10 }}>
          {/* Lista de items */}
          <GridItem>
            <VStack spacing={0} align="stretch">
              {items.map((item) => (
                <CartItem key={item.key} item={item} />
              ))}
            </VStack>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              color="brand.muted"
              fontSize="xs"
              letterSpacing="0.1em"
              textTransform="uppercase"
              mt={6}
              onClick={clearCart}
              _hover={{ color: "brand.error", bg: "transparent" }}
            >
              Vaciar carrito
            </Button>

            {(favoritesLoading || favoriteProducts.length > 0) && (
              <Box mt={10}>
                <VStack align="flex-start" spacing={1} mb={4}>
                  <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
                    Tus favoritos
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">
                    Sumá un favorito al pedido en un clic
                  </Text>
                </VStack>

                {favoritesLoading ? (
                  <Box py={8} display="flex" justifyContent="center">
                    <Spinner size="sm" color="brand.brown" thickness="1px" />
                  </Box>
                ) : (
                  <>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      {favoritePreview.map((product) => {
                      const availableSizes = getAvailableSizes(product);
                      const image = product.images?.[0] || `https://placehold.co/300x400/EDE0D4/7A6555?text=${product.name}`;

                      return (
                        <Box
                          key={product.id}
                          bg="brand.cream"
                          borderRadius="xl"
                          border="0.5px solid rgba(160,120,90,0.15)"
                          overflow="hidden"
                        >
                          <HStack align="stretch" spacing={0}>
                            <Box w="90px" minW="90px" bg="brand.beige">
                              <Image
                                src={image}
                                alt={product.name}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                              />
                            </Box>
                            <VStack align="flex-start" spacing={2} p={3} flex={1}>
                              <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={600} noOfLines={2}>
                                {product.name}
                              </Text>
                              <Text fontFamily="body" fontSize="xs" color="brand.muted">
                                {formatPrice(product.salePrice || product.price)}
                              </Text>
                              <HStack w="100%" spacing={2}>
                                <Select
                                  value={favoriteSizes[product.id] || ""}
                                  onChange={(e) => setFavoriteSizes((prev) => ({
                                    ...prev,
                                    [product.id]: e.target.value,
                                  }))}
                                  placeholder={availableSizes.length ? "Talle" : "Sin stock"}
                                  size="sm"
                                  bg="brand.white"
                                  border="0.5px solid rgba(160,120,90,0.3)"
                                  borderRadius="sm"
                                  fontFamily="body"
                                  fontSize="xs"
                                  color="brand.dark"
                                  _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                                >
                                  {availableSizes.map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                  ))}
                                </Select>
                                <Button
                                  size="sm"
                                  variant='outline'
                                  borderColor="brand.brown"
                                  color="brand.brown"
                                  fontSize="xs"
                                  p={4}
                                  borderRadius="md"
                                  onClick={() => addItem(product, favoriteSizes[product.id], 1)}
                                  isDisabled={!favoriteSizes[product.id] || availableSizes.length === 0}
                                >
                                  Agregar
                                </Button>
                              </HStack>
                            </VStack>
                          </HStack>
                        </Box>
                      );
                      })}
                    </SimpleGrid>
                    {hasMoreFavorites && (
                      <Button
                        variant="outline"
                        size="sm"
                        mt={4}
                        onClick={() => navigate("/mi-cuenta?tab=favoritos")}
                      >
                        Ver favoritos
                      </Button>
                    )}
                  </>
                )}
              </Box>
            )}
          </GridItem>

          {/* Resumen */}
          <GridItem>
            <Box
              bg="brand.cream"
              borderRadius="xl"
              border="0.5px solid rgba(160,120,90,0.15)"
              p={6}
              position={{ base: "static", lg: "sticky" }}
              top={{ base: "auto", lg: "100px" }}
            >
              <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark" mb={5}>
                Resumen del pedido
              </Text>

              <VStack spacing={3} mb={5}>
                {items.map((item) => (
                  <HStack key={item.key} justify="space-between" w="100%">
                    <Text fontFamily="body" fontSize="sm" color="brand.muted" noOfLines={1} flex={1}>
                      {item.product.name} × {item.quantity} (T. {item.size})
                    </Text>
                    <Text fontFamily="body" fontSize="sm" color="brand.dark" flexShrink={0}>
                      {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Divider borderColor="rgba(160,120,90,0.15)" mb={4} />

              <HStack justify="space-between" mb={2}>
                <Text fontFamily="body" fontSize="sm" color="brand.muted">Subtotal</Text>
                <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={500}>{formatPrice(subtotal)}</Text>
              </HStack>
              <HStack justify="space-between" mb={5}>
                <Text fontFamily="body" fontSize="xs" color="brand.success">
                  Con transferencia (−10%)
                </Text>
                <Text fontFamily="body" fontSize="xs" color="brand.success" fontWeight={500}>
                  {formatPrice(transferTotal)}
                </Text>
              </HStack>

              <Divider borderColor="rgba(160,120,90,0.15)" mb={5} />

              <HStack justify="space-between" mb={6}>
                <Text fontFamily="heading" fontSize="xl" color="brand.dark">Total</Text>
                <Text fontFamily="body" fontWeight={500} fontSize="xl" color="brand.dark">{formatPrice(subtotal)}</Text>
              </HStack>

              <Button
                variant="primary"
                size="lg"
                w="100%"
                py={7}
                fontSize="xs"
                letterSpacing="0.2em"
                onClick={() => navigate("/checkout")}
              >
                Continuar al pago
              </Button>

              <Text fontFamily="body" fontSize="2xs" color="brand.muted" textAlign="center" mt={3} letterSpacing="0.05em">
                Podrás elegir la forma de pago en el siguiente paso
              </Text>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default CartPage;
