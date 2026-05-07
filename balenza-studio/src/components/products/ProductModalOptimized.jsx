import { useRef, useEffect, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Grid, GridItem, VStack, HStack, Text, Button, Badge, Box,
  Divider, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Table, Thead, Tbody, Tr, Th, Td
} from "@chakra-ui/react";
import { gsap } from "gsap";
import {
  ShoppingBag, CreditCard, Truck, RotateCcw, Shield,
  Clock, Users, Heart, Share2, Ruler, ChevronRight
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatters";
import { useRelatedProducts } from "../../hooks/useProducts";
import ImageGallery from "./ImageGallery";
import SizeSelector from "./SizeSelector";
import RelatedProducts from "./RelatedProducts";
import toast from "react-hot-toast";

const ProductModalOptimized = ({ product: initialProduct, isOpen, onClose }) => {
  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [recentViews, setRecentViews] = useState(Math.floor(Math.random() * 15) + 8);
  const contentRef = useRef(null);
  const { addItem } = useCart();

  // Sincronizar con prop externa
  useEffect(() => {
    if (initialProduct) {
      setCurrentProduct(initialProduct);
      setQuantity(1);
      setSelectedSize(null);
    }
  }, [initialProduct]);

  const { products: related } = useRelatedProducts(
    currentProduct?.category,
    currentProduct?.id
  );

  // Simular views en tiempo real
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setRecentViews((prev) => prev + Math.floor(Math.random() * 3));
    }, 7000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [isOpen, currentProduct]);

  if (!currentProduct) return null;

  const product = currentProduct;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;
  const displayPrice = product.salePrice || product.price;

  // Stock
  const totalStock = Object.values(product.sizes || {}).reduce(
    (a, b) => a + b,
    0
  );
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const isOutOfStock = totalStock === 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Seleccioná un talle primero");
      return;
    }
    addItem(product, selectedSize, quantity);
    toast.success(`${product.name} agregado al carrito`, {
      icon: "🛍️",
    });
    onClose();
  };

  const handleRelatedClick = (relatedProduct) => {
    setCurrentProduct(relatedProduct);
    setSelectedSize(null);
    setQuantity(1);
    const modalBody = contentRef.current?.closest(".chakra-modal__body");
    if (modalBody) modalBody.scrollTop = 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "5xl", lg: "6xl" }}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent
        bg="white"
        borderRadius={{ base: 0, md: "2xl" }}
        maxH="95vh"
      >
        <ModalCloseButton
          top={4}
          right={{ base: 2, md: 4 }}
          borderRadius="full"
          bg="brand.beige"
          _hover={{ bg: "brand.sand" }}
          color="brand.dark"
          zIndex={10}
        />

        <ModalBody p={0} ref={contentRef}>
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={0}
            minH={{ base: "auto", md: "600px" }}
          >
            {/* COLUMNA IZQUIERDA - GALERÍA */}
            <GridItem bg="brand.beige" p={{ base: 4, md: 6 }}>
              <ImageGallery
                images={product.images || []}
                name={product.name}
              />
            </GridItem>

            {/* COLUMNA DERECHA - INFORMACIÓN Y COMPRA */}
            <GridItem>
              <VStack
                align="stretch"
                spacing={5}
                p={{ base: 6, md: 8 }}
                h="100%"
              >
                {/* BREADCRUMB */}
                <HStack
                  fontSize="xs"
                  color="brand.muted"
                  spacing={2}
                  display={{ base: "none", md: "flex" }}
                >
                  <Text cursor="pointer" _hover={{ color: "brand.brown" }}>
                    Inicio
                  </Text>
                  <ChevronRight size={12} />
                  <Text cursor="pointer" _hover={{ color: "brand.brown" }}>
                    {product.category}
                  </Text>
                  <ChevronRight size={12} />
                  <Text color="brand.dark" fontWeight="600">
                    {product.name}
                  </Text>
                </HStack>

                {/* TÍTULO */}
                <Box>
                  <Text
                    fontSize="xs"
                    color="brand.muted"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    fontWeight="600"
                    mb={2}
                  >
                    {product.category}
                  </Text>
                  <Text
                    fontFamily="heading"
                    fontWeight={400}
                    fontSize={{ base: "2xl", md: "3xl" }}
                    color="brand.dark"
                    letterSpacing="0.02em"
                    lineHeight={1.2}
                    mb={3}
                  >
                    {product.name}
                  </Text>

                  {/* BADGES Y SOCIAL PROOF */}
                  <HStack spacing={3} mb={3} flexWrap="wrap">
                    {discountPct > 0 && (
                      <Badge
                        bg="brand.error"
                        color="white"
                        px={3}
                        py={1}
                        fontSize="xs"
                      >
                        {discountPct}% OFF
                      </Badge>
                    )}
                    {product.featured && (
                      <Badge
                        bg="brand.brown"
                        color="white"
                        px={3}
                        py={1}
                        fontSize="xs"
                      >
                        NUEVO
                      </Badge>
                    )}
                  </HStack>

                  {/* SOCIAL PROOF EN TIEMPO REAL */}
                  <HStack
                    spacing={2}
                    color="brand.muted"
                    fontSize="sm"
                    mb={2}
                  >
                    <Users size={14} />
                    <Text>{recentViews} personas viendo esto ahora</Text>
                  </HStack>
                </Box>

                {/* PRECIO */}
                <Box>
                  <HStack spacing={3} align="baseline" mb={2}>
                    {hasDiscount ? (
                      <>
                        <Text
                          fontSize="4xl"
                          fontWeight="700"
                          color="brand.error"
                        >
                          {formatPrice(displayPrice)}
                        </Text>
                        <Text
                          fontSize="xl"
                          color="brand.muted"
                          textDecoration="line-through"
                        >
                          {formatPrice(product.price)}
                        </Text>
                      </>
                    ) : (
                      <Text fontSize="4xl" fontWeight="700" color="brand.dark">
                        {formatPrice(displayPrice)}
                      </Text>
                    )}
                  </HStack>

                  {/* CUOTAS */}
                  <Text fontSize="sm" color="brand.brown" fontWeight="600">
                    o hasta 6 cuotas sin interés de{" "}
                    {formatPrice(Math.round(displayPrice / 6))}
                  </Text>
                </Box>

                <Divider />

                {/* URGENCIA DE STOCK */}
                {isLowStock && selectedSize && (
                  <HStack
                    p={3}
                    bg="orange.50"
                    borderRadius="md"
                    borderLeft="3px solid"
                    borderColor="orange.500"
                  >
                    <Clock size={16} color="#DD6B20" />
                    <Text fontSize="sm" color="orange.700" fontWeight="600">
                      ¡Solo quedan {product.sizes[selectedSize]} unidades de
                      este talle!
                    </Text>
                  </HStack>
                )}

                {/* SELECTOR DE TALLE */}
                <Box>
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="600" fontSize="md">
                      Seleccionar talle
                    </Text>
                    <Button
                      variant="link"
                      size="sm"
                      color="brand.brown"
                      leftIcon={<Ruler size={14} />}
                      fontSize="sm"
                    >
                      Guía de talles
                    </Button>
                  </HStack>

                  <SizeSelector
                    sizes={product.sizes || {}}
                    selected={selectedSize}
                    onChange={setSelectedSize}
                  />
                </Box>

                {/* CANTIDAD */}
                <Box>
                  <Text fontWeight="600" fontSize="md" mb={3}>
                    Cantidad
                  </Text>
                  <HStack>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <Text px={4} fontWeight="600" minW="40px" textAlign="center">
                      {quantity}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(quantity + 1)}
                      isDisabled={
                        selectedSize &&
                        quantity >= (product.sizes[selectedSize] || 0)
                      }
                    >
                      +
                    </Button>
                  </HStack>
                </Box>

                {/* BOTONES DE ACCIÓN */}
                <VStack spacing={3}>
                  <Button
                    size="lg"
                    bg="brand.brown"
                    color="white"
                    width="full"
                    leftIcon={<ShoppingBag size={20} />}
                    isDisabled={!selectedSize || isOutOfStock}
                    onClick={handleAddToCart}
                    _hover={{
                      bg: "brand.dark",
                      transform: "translateY(-2px)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    boxShadow="lg"
                    py={7}
                    fontSize="md"
                    fontWeight="600"
                  >
                    Agregar al carrito
                  </Button>

                  <HStack width="full" spacing={2}>
                    <Button
                      flex={1}
                      variant="outline"
                      borderColor="brand.brown"
                      color="brand.brown"
                      leftIcon={<Heart size={18} />}
                      size="md"
                    >
                      Favorito
                    </Button>
                    <Button
                      flex={1}
                      variant="outline"
                      borderColor="brand.brown"
                      color="brand.brown"
                      leftIcon={<Share2 size={18} />}
                      size="md"
                    >
                      Compartir
                    </Button>
                  </HStack>
                </VStack>

                <Divider />

                {/* TRUST INDICATORS - SEÑALES DE CONFIANZA */}
                <VStack
                  align="stretch"
                  spacing={3}
                  bg="brand.nude"
                  p={4}
                  borderRadius="xl"
                >
                  <HStack spacing={3}>
                    <Box color="brand.brown">
                      <Truck size={20} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="brand.dark">
                        Envío gratis en compras mayores a $50.000
                      </Text>
                      <Text fontSize="xs" color="brand.muted">
                        Recibilo en 3-5 días hábiles
                      </Text>
                    </Box>
                  </HStack>

                  <HStack spacing={3}>
                    <Box color="brand.brown">
                      <RotateCcw size={20} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="brand.dark">
                        Cambios y devoluciones gratis
                      </Text>
                      <Text fontSize="xs" color="brand.muted">
                        Tenés 30 días para cambiar tu producto
                      </Text>
                    </Box>
                  </HStack>

                  <HStack spacing={3}>
                    <Box color="brand.brown">
                      <Shield size={20} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="brand.dark">
                        Compra 100% segura
                      </Text>
                      <Text fontSize="xs" color="brand.muted">
                        Protegemos tus datos en todo momento
                      </Text>
                    </Box>
                  </HStack>

                  <HStack spacing={3}>
                    <Box color="brand.brown">
                      <CreditCard size={20} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="brand.dark">
                        Hasta 6 cuotas sin interés
                      </Text>
                      <Text fontSize="xs" color="brand.muted">
                        Con todas las tarjetas de crédito
                      </Text>
                    </Box>
                  </HStack>
                </VStack>

                <Divider />

                {/* ACCORDION CON INFORMACIÓN ADICIONAL */}
                <Accordion allowMultiple>
                  <AccordionItem border="none">
                    <AccordionButton px={0}>
                      <Box flex="1" textAlign="left" fontWeight="600">
                        Descripción
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0} pb={4} fontSize="sm" color="brand.muted">
                      <Text mb={4}>
                        {product.description ||
                          "Prenda de alta calidad, confeccionada con materiales premium. Diseño versátil perfecto para cualquier ocasión."}
                      </Text>

                      <VStack align="stretch" spacing={2}>
                        <HStack>
                          <Text fontWeight="600">Material:</Text>
                          <Text>Algodón 95%, Elastano 5%</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="600">Fit:</Text>
                          <Text>Regular</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="600">Cuidado:</Text>
                          <Text>Lavar a máquina máx. 30°C</Text>
                        </HStack>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem border="none">
                    <AccordionButton px={0}>
                      <Box flex="1" textAlign="left" fontWeight="600">
                        Guía de talles
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0} pb={4}>
                      <SizeGuideTable category={product.category} />
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem border="none">
                    <AccordionButton px={0}>
                      <Box flex="1" textAlign="left" fontWeight="600">
                        Envíos y devoluciones
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel
                      px={0}
                      pb={4}
                      fontSize="sm"
                      color="brand.muted"
                    >
                      <VStack align="stretch" spacing={3}>
                        <Box>
                          <Text fontWeight="600" color="brand.dark" mb={1}>
                            Envíos
                          </Text>
                          <Text>
                            Realizamos envíos a todo el país a través de Correo
                            Argentino y Andreani. Envío gratis en compras
                            mayores a $50.000.
                          </Text>
                        </Box>
                        <Box>
                          <Text fontWeight="600" color="brand.dark" mb={1}>
                            Devoluciones
                          </Text>
                          <Text>
                            Tenés 30 días corridos desde la fecha de recepción
                            del producto para solicitar el cambio o devolución
                            sin cargo.
                          </Text>
                        </Box>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
            </GridItem>
          </Grid>

          {/* SECCIÓN DE PRODUCTOS RELACIONADOS */}
          {related.length > 0 && (
            <Box bg="brand.nude" py={12} px={{ base: 6, md: 8 }}>
              <Text
                fontFamily="heading"
                fontSize={{ base: "xl", md: "2xl" }}
                mb={6}
                fontWeight={400}
              >
                Completá tu look
              </Text>
              <RelatedProducts
                products={related}
                onProductClick={handleRelatedClick}
              />
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// COMPONENTE AUXILIAR: GUÍA DE TALLES
const SizeGuideTable = ({ category }) => {
  const sizeGuides = {
    remeras: [
      { size: "XS", chest: "80-84", waist: "60-64", hip: "86-90" },
      { size: "S", chest: "85-89", waist: "65-69", hip: "91-95" },
      { size: "M", chest: "90-94", waist: "70-74", hip: "96-100" },
      { size: "L", chest: "95-99", waist: "75-79", hip: "101-105" },
      { size: "XL", chest: "100-104", waist: "80-84", hip: "106-110" },
    ],
    pantalones: [
      { size: "XS", waist: "60-64", hip: "86-90", inseam: "72" },
      { size: "S", waist: "65-69", hip: "91-95", inseam: "74" },
      { size: "M", waist: "70-74", hip: "96-100", inseam: "76" },
      { size: "L", waist: "75-79", hip: "101-105", inseam: "78" },
      { size: "XL", waist: "80-84", hip: "106-110", inseam: "80" },
    ],
    camperas: [
      { size: "XS", chest: "80-84", waist: "60-64", hip: "86-90" },
      { size: "S", chest: "85-89", waist: "65-69", hip: "91-95" },
      { size: "M", chest: "90-94", waist: "70-74", hip: "96-100" },
      { size: "L", chest: "95-99", waist: "75-79", hip: "101-105" },
      { size: "XL", chest: "100-104", waist: "80-84", hip: "106-110" },
    ],
  };

  const guide = sizeGuides[category] || sizeGuides.remeras;

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead bg="brand.beige">
          <Tr>
            <Th>Talle</Th>
            {category === "pantalones" ? (
              <>
                <Th>Cintura (cm)</Th>
                <Th>Cadera (cm)</Th>
                <Th>Largo (cm)</Th>
              </>
            ) : (
              <>
                <Th>Busto (cm)</Th>
                <Th>Cintura (cm)</Th>
                <Th>Cadera (cm)</Th>
              </>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {guide.map((row) => (
            <Tr key={row.size} _hover={{ bg: "brand.nude" }}>
              <Td fontWeight="600">{row.size}</Td>
              {category === "pantalones" ? (
                <>
                  <Td>{row.waist}</Td>
                  <Td>{row.hip}</Td>
                  <Td>{row.inseam}</Td>
                </>
              ) : (
                <>
                  <Td>{row.chest}</Td>
                  <Td>{row.waist}</Td>
                  <Td>{row.hip}</Td>
                </>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Text fontSize="xs" color="brand.muted" mt={3}>
        💡 Si estás entre dos talles, te recomendamos elegir el mayor para
        mayor comodidad.
      </Text>
    </Box>
  );
};

export default ProductModalOptimized;
