import { useRef, useEffect } from "react";
import {
  Box, Grid, GridItem, VStack, HStack, Text, Button, Divider, Flex, Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/cart/CartItem";
import { formatPrice } from "../utils/formatters";
import { TRANSFER_DISCOUNT } from "../utils/constants";

const CartPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
  }, []);

  const transferTotal = subtotal * (1 - TRANSFER_DISCOUNT);

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
        <HStack justify="space-between" mb={10}>
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
            onClick={() => navigate(-1)}
            _hover={{ color: "brand.dark", bg: "transparent" }}
          >
            Seguir comprando
          </Button>
        </HStack>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={10}>
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
          </GridItem>

          {/* Resumen */}
          <GridItem>
            <Box
              bg="brand.cream"
              borderRadius="xl"
              border="0.5px solid rgba(160,120,90,0.15)"
              p={6}
              position={{ lg: "sticky" }}
              top={{ lg: "100px" }}
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