import { useRef, useEffect, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Grid, GridItem, VStack, HStack, Text, Button, Badge, Box,
  Divider, Tabs, TabList, TabPanels, Tab, TabPanel, TabIndicator
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ShoppingBag, CreditCard, MessageCircle, Truck, RefreshCw, AlertCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatters";
import { useRelatedProducts } from "../../hooks/useProducts";
import ImageGallery from "./ImageGallery";
import SizeSelector from "./SizeSelector";
import RelatedProducts from "./RelatedProducts";

const ProductModal = ({ product: initialProduct, isOpen, onClose }) => {
  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  const [selectedSize, setSelectedSize] = useState(null);
  const contentRef = useRef(null);
  const { addItem } = useCart();

  // Sincronizar con prop externa (cuando se abre el modal con otro producto)
  useEffect(() => {
    if (initialProduct) setCurrentProduct(initialProduct);
  }, [initialProduct]);

  const { products: related } = useRelatedProducts(currentProduct?.category, currentProduct?.id);

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(null);
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
        );
      }
    }
  }, [isOpen, currentProduct]);

  if (!currentProduct) return null;

  const product = currentProduct;
  const hasDiscount  = product.salePrice && product.salePrice < product.price;
  const discountPct  = hasDiscount ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const displayPrice = product.salePrice || product.price;

  // Stock total para urgencia
  const totalStock = Object.values(product.sizes || {}).reduce((a, b) => a + b, 0);
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    onClose();
  };

  const handleRelatedClick = (relatedProduct) => {
    setCurrentProduct(relatedProduct);
    setSelectedSize(null);
    // Scroll al inicio del modal
    const modalBody = contentRef.current?.closest('.chakra-modal__body');
    if (modalBody) modalBody.scrollTop = 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "5xl", lg: "6xl" }}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
      w="100%"
      isCentered
    >
      <ModalOverlay />
      <ModalContent 
      bg="brand.cream" 
      borderRadius={{ base: 0, md: "xl" }} 
      maxH={"95vh"}
      >
        <ModalCloseButton
          top={4} right={{ base: 2, md: 4 }}
          borderRadius="full"
          bg="brand.beige"
          _hover={{ bg: "brand.sand" }}
          color="brand.muted"
          zIndex={9}
        />

        <ModalBody p={{ base: 4, md: 8 }} ref={contentRef}>
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={{ base: 6, md: 12 }}
            mt={{base: 4, md: 0}}
          >
            {/* Galería */}
            <GridItem>
              <ImageGallery images={product.images || []} name={product.name} />
            </GridItem>

            {/* Info */}
            <GridItem>
              <VStack align="flex-start" spacing={4} h="100%">
                {/* Categoría + badges */}
                <HStack spacing={2} flexWrap="wrap">
                  <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
                    {product.category}
                  </Text>
                  {product.featured && <Badge variant="brand">Nuevo</Badge>}
                  {hasDiscount && <Badge variant="sale">−{discountPct}%</Badge>}
                </HStack>

                {/* Nombre */}
                <Text
                  fontFamily="heading"
                  fontWeight={300}
                  fontSize={{ base: "2xl", md: "3xl" }}
                  color="brand.dark"
                  letterSpacing="0.04em"
                  lineHeight={1.15}
                >
                  {product.name}
                </Text>

                {/* Precio — prominente */}
                <HStack spacing={3} align="baseline">
                  <Text fontFamily="body" fontWeight={700} fontSize="3xl" color="brand.dark">
                    {formatPrice(displayPrice)}
                  </Text>
                  {hasDiscount && (
                    <Text fontFamily="body" fontSize="lg" color="brand.muted" textDecoration="line-through">
                      {formatPrice(product.price)}
                    </Text>
                  )}
                </HStack>

                {/* Urgencia */}
                {isLowStock && (
                  <HStack
                    bg="orange.50"
                    border="1px solid"
                    borderColor="orange.200"
                    borderRadius="md"
                    px={3} py={2}
                    spacing={2}
                    w="100%"
                  >
                    <AlertCircle size={14} color="var(--chakra-colors-orange-500)" />
                    <Text fontFamily="body" fontSize="xs" color="orange.700" fontWeight={500}>
                      ¡Quedan pocas unidades disponibles!
                    </Text>
                  </HStack>
                )}

                {/* Selector de talle */}
                <SizeSelector
                  sizes={product.sizes || {}}
                  selected={selectedSize}
                  onChange={setSelectedSize}
                />

                {/* CTA principal — Comprar ahora */}
                <VStack w="100%" spacing={2} pt={1}>
                  <Button
                    variant="primary"
                    size="lg"
                    w="100%"
                    py={7}
                    fontSize="sm"
                    fontWeight={600}
                    letterSpacing="0.15em"
                    leftIcon={<ShoppingBag size={16} strokeWidth={1.5} />}
                    onClick={handleAddToCart}
                    isDisabled={!selectedSize}
                    opacity={!selectedSize ? 0.55 : 1}
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(44,26,14,0.2)" }}
                  >
                    Comprar ahora
                  </Button>
                  {!selectedSize && (
                    <Text fontFamily="body" fontSize="xs" color="brand.muted" textAlign="center">
                      Seleccioná un talle para continuar
                    </Text>
                  )}
                </VStack>

                {/* Beneficios rápidos */}
                <VStack align="flex-start" spacing={2} w="100%">
                  <HStack spacing={2}>
                    <Truck size={14} color="var(--chakra-colors-brand-brown)" strokeWidth={1.8} />
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Envíos a todo el país</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <RefreshCw size={14} color="var(--chakra-colors-brand-brown)" strokeWidth={1.8} />
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Cambios disponibles sin problema</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <CreditCard size={14} color="var(--chakra-colors-brand-brown)" strokeWidth={1.8} />
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Pagos seguros por MercadoPago</Text>
                  </HStack>
                </VStack>

                <Divider borderColor="rgba(160,120,90,0.15)" />

                {/* Tabs: Descripción / Pagos / Envíos */}
                <Tabs variant="unstyled" w="100%">
                  <TabList gap={6}>
                    {["Descripción", "Formas de pago", "Envíos"].map((tab) => (
                      <Tab
                        key={tab}
                        fontFamily="body"
                        fontSize={{ base: "2xs", md: "xs" }}
                        letterSpacing="0.15em"
                        textTransform="uppercase"
                        color="brand.muted"
                        pb={2}
                      >
                        {tab}
                      </Tab>
                    ))}
                  </TabList>
                  <TabIndicator mt='-1.5px' height='2px' bg='brand.brown' borderRadius='1px' />
                  <TabPanels pt={4}>
                    <TabPanel p={0}>
                      <VStack align="flex-start" spacing={2} mb={3}>
                        {["Calce cómodo y tallaje amplio", "Ideal para uso diario", "Tela suave y liviana"].map((b) => (
                          <HStack key={b} spacing={2}>
                            <Box w="5px" h="5px" borderRadius="full" bg="brand.brown" flexShrink={0} />
                            <Text fontFamily="body" fontSize={{ base: "xs", md: "sm" }} color="brand.muted">{b}</Text>
                          </HStack>
                        ))}
                      </VStack>
                      <Text fontFamily="body" fontSize={{ base: "xs", md: "sm" }} color="brand.muted" lineHeight={1.8}>
                        {product.description || "Sin descripción disponible."}
                      </Text>
                    </TabPanel>
                    <TabPanel p={0}>
                      <VStack align="flex-start" spacing={3}>
                        <HStack spacing={3}>
                          <CreditCard size={16} color="var(--chakra-colors-brand-brown)" strokeWidth={1.5} />
                          <Text fontFamily="body" fontSize={{ base: "xs", md: "sm" }} color="brand.muted">
                            MercadoPago — todas las tarjetas con <Text as="span" color="brand.brown" fontWeight={500}>8% de recargo</Text>
                          </Text>
                        </HStack>
                        <HStack spacing={3}>
                          <MessageCircle size={16} color="#25D366" strokeWidth={1.5} />
                          <Text fontFamily="body" fontSize={{ base: "xs", md: "sm" }} color="brand.muted">
                            Transferencia bancaria con <Text as="span" color="brand.success" fontWeight={500}>10% de descuento</Text>
                          </Text>
                        </HStack>
                      </VStack>
                    </TabPanel>
                    <TabPanel p={0}>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontFamily="body" fontSize={{ base: "xs", md: "sm" }} color="brand.muted">
                          📦 Envíos a todo el país por correo o transporte
                        </Text>
                        <Text fontFamily="body" fontSize={{ base: "xs", md: "sm" }} color="brand.muted">
                          🏙️ Retiro en punto de entrega disponible
                        </Text>
                        <Text fontFamily="body" fontSize={{ base: "xs", md: "sm" }} color="brand.brown" mt={1}>
                          El costo y tiempo de envío se coordina por WhatsApp
                        </Text>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            </GridItem>
          </Grid>

          {/* Productos relacionados */}
          {related.length > 0 && (
            <Box mt={12}>
              <RelatedProducts products={related} onProductClick={handleRelatedClick} />
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProductModal;