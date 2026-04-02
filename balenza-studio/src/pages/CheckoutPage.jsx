import { useRef, useEffect, useState } from "react";
import {
  Box, Grid, GridItem, VStack, HStack, Text, Button, Divider,
  useDisclosure, Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatters";
import { TRANSFER_DISCOUNT } from "../utils/constants";
import { createOrder } from "../services/firebase/orders";
import CheckoutForm, { schema } from "../components/checkout/CheckoutForm";
import MercadoPagoButton from "../components/checkout/MercadoPagoButton";
import WhatsAppTransfer from "../components/checkout/WhatsAppTransfer";
import AuthModal from "../components/auth/AuthModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CartItem from "../components/cart/CartItem";

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);
  const authModal = useDisclosure();

  const [orderId, setOrderId]       = useState(null);
  const [creating, setCreating]     = useState(false);
  const [formData, setFormData]     = useState(null);
  const [orderReady, setOrderReady] = useState(false);

  const {
    register, handleSubmit, formState: { errors }, watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: profile ? {
      name: profile.name,
      lastName: profile.lastName,
      dni: profile.dni,
      email: user?.email,
      phone: profile.phone,
    } : {},
  });

  useEffect(() => {
    if (items.length === 0) navigate("/carrito");
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
  }, []);

  const onFormSubmit = async (data) => {
    setFormData(data);
    setCreating(true);
    try {
      const orderRef = await createOrder({
        userId: user?.uid || null,
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          image: i.product.images?.[0] || "",
          size: i.size,
          quantity: i.quantity,
          price: i.product.salePrice || i.product.price,
        })),
        shipping: data,
        totals: { subtotal, total: subtotal },
        paymentMethod: "pending",
      });
      setOrderId(orderRef.id);
      setOrderReady(true);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const mpOrderData = orderReady ? {
    orderId,
    items: items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      image: i.product.images?.[0] || "",
      quantity: i.quantity,
      price: i.product.salePrice || i.product.price,
    })),
    payer: formData,
    subtotal,
  } : null;

  return (
    <Box ref={ref} py={{ base: 8, md: 16 }} px={{ base: 4, md: 8, lg: 16 }} minH="80vh">
      <Box maxW="1100px" mx="auto">
        <VStack align="flex-start" spacing={1} mb={10}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            Finalizar compra
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark">
            Checkout
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }} gap={10}>
          {/* Formulario */}
          <GridItem>
            <VStack align="stretch" spacing={8}>
              {/* Login opcional */}
              {!user && (
                <Box
                  bg="brand.beige"
                  borderRadius="lg"
                  p={4}
                  border="0.5px solid rgba(160,120,90,0.15)"
                >
                  <HStack justify="space-between">
                    <Text fontFamily="body" fontSize="sm" color="brand.muted">
                      ¿Tenés cuenta? Iniciá sesión para autocompletar tus datos
                    </Text>
                    <Button variant="outline" size="sm" fontSize="xs" onClick={authModal.onOpen}>
                      Ingresar
                    </Button>
                  </HStack>
                </Box>
              )}

              {/* Formulario de envío */}
              {!orderReady ? (
                <CheckoutForm
                  onSubmit={onFormSubmit}
                  defaultValues={profile ? {
                    name: profile.name,
                    lastName: profile.lastName,
                    dni: profile.dni,
                    email: user?.email,
                    phone: profile.phone,
                  } : {}}
                />
              ) : (
                <Box bg="brand.beige" borderRadius="lg" p={4} border="0.5px solid rgba(37,211,102,0.3)">
                  <HStack>
                    <Box w="8px" h="8px" borderRadius="full" bg="brand.success" />
                    <Text fontFamily="body" fontSize="sm" color="brand.success" fontWeight={500}>
                      Datos de envío confirmados
                    </Text>
                  </HStack>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted" mt={1}>
                    {formData?.name} {formData?.lastName} · {formData?.address}, {formData?.city}
                  </Text>
                </Box>
              )}

              {/* Botón confirmar datos */}
              {!orderReady && (
                <Button
                  variant="primary"
                  size="lg"
                  py={7}
                  fontSize="xs"
                  letterSpacing="0.2em"
                  isLoading={creating}
                  loadingText="Procesando..."
                  onClick={handleSubmit(onFormSubmit)}
                  w="100%"
                >
                  Confirmar datos y elegir pago
                </Button>
              )}

              {/* Opciones de pago */}
              {orderReady && (
                <VStack spacing={4} align="stretch">
                  <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
                    Elegí cómo pagar
                  </Text>

                  <MercadoPagoButton orderData={mpOrderData} disabled={!orderReady} />

                  <HStack>
                    <Divider borderColor="rgba(160,120,90,0.2)" />
                    <Text fontFamily="body" fontSize="xs" color="brand.muted" whiteSpace="nowrap" px={3}>
                      o
                    </Text>
                    <Divider borderColor="rgba(160,120,90,0.2)" />
                  </HStack>

                  <WhatsAppTransfer orderData={{ ...mpOrderData, subtotal }} disabled={!orderReady} />
                </VStack>
              )}
            </VStack>
          </GridItem>

          {/* Resumen del pedido */}
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
                Tu pedido
              </Text>

              <VStack spacing={0} align="stretch" mb={5}>
                {items.map((item) => (
                  <HStack key={item.key} py={3} spacing={3} borderBottom="0.5px solid rgba(160,120,90,0.1)">
                    <Box
                      w="12px" h="12px"
                      borderRadius="full"
                      bg="brand.sand"
                      flexShrink={0}
                    />
                    <Text fontFamily="body" fontSize="sm" color="brand.muted" flex={1} noOfLines={1}>
                      {item.product.name} (T. {item.size}) ×{item.quantity}
                    </Text>
                    <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={500} flexShrink={0}>
                      {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Divider borderColor="rgba(160,120,90,0.15)" mb={4} />

              <VStack spacing={2} mb={2}>
                <HStack justify="space-between" w="100%">
                  <Text fontFamily="body" fontSize="sm" color="brand.muted">Subtotal</Text>
                  <Text fontFamily="body" fontSize="sm" color="brand.dark" fontWeight={500}>{formatPrice(subtotal)}</Text>
                </HStack>
                <HStack justify="space-between" w="100%">
                  <Text fontFamily="body" fontSize="xs" color="brand.success">Con transferencia (−10%)</Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.success" fontWeight={500}>
                    {formatPrice(subtotal * (1 - TRANSFER_DISCOUNT))}
                  </Text>
                </HStack>
              </VStack>

              <Divider borderColor="rgba(160,120,90,0.15)" my={4} />

              <HStack justify="space-between">
                <Text fontFamily="heading" fontSize="xl" color="brand.dark">Total</Text>
                <Text fontFamily="body" fontWeight={600} fontSize="xl" color="brand.dark">{formatPrice(subtotal)}</Text>
              </HStack>
            </Box>
          </GridItem>
        </Grid>
      </Box>

      <AuthModal isOpen={authModal.isOpen} onClose={authModal.onClose} />
    </Box>
  );
};

export default CheckoutPage;
