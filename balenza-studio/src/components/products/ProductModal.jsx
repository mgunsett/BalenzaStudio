import { useRef, useEffect, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Grid, GridItem, VStack, HStack, Text, Button, Badge, Box,
  Divider, Tabs, TabList, TabPanels, Tab, TabPanel, TabIndicator
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ShoppingBag, CreditCard, MessageCircle } from "lucide-react";
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
              <VStack align="flex-start" spacing={5} h="100%">
                {/* Badges + categoría */}
                <HStack spacing={2}>
                  <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
                    {product.category}
                  </Text>
                  {product.featured && <Badge variant="brand">Destacado</Badge>}
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

                {/* Precio */}
                <HStack spacing={3} align="baseline">
                  <Text fontFamily="body" fontWeight={500} fontSize="2xl" color="brand.dark">
                    {formatPrice(displayPrice)}
                  </Text>
                  {hasDiscount && (
                    <Text fontFamily="body" fontSize="lg" color="brand.muted" textDecoration="line-through">
                      {formatPrice(product.price)}
                    </Text>
                  )}
                </HStack>

                <Divider borderColor="rgba(160,120,90,0.15)" />

                {/* Selector de talle */}
                <SizeSelector
                  sizes={product.sizes || {}}
                  selected={selectedSize}
                  onChange={setSelectedSize}
                />

                {/* Botón agregar */}
                <VStack w="100%" spacing={3} pt={2}>
                  <Button
                    variant="primary"
                    size="lg"
                    w="100%"
                    py={7}
                    fontSize="xs"
                    letterSpacing="0.2em"
                    leftIcon={<ShoppingBag size={16} strokeWidth={1.5} />}
                    onClick={handleAddToCart}
                    isDisabled={!selectedSize}
                    opacity={!selectedSize ? 0.5 : 1}
                    transition="all 0.2s"
                  >
                    Agregar al carrito
                  </Button>
                </VStack>

                <Divider borderColor="rgba(160,120,90,0.15)" />

                {/* Tabs: Descripción / Pagos */}
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