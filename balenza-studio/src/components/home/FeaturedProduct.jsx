import { useRef, useEffect, useState } from "react";
import {
  Box, Grid, GridItem, VStack, HStack, Text, Button, Badge, Flex, Image,
  Spinner, SimpleGrid,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/formatters";
import SizeSelector from "../products/SizeSelector";

gsap.registerPlugin(ScrollTrigger);

const FeaturedProduct = () => {
  const { products, loading } = useProducts({ featured: true, limit: 1 });
  const product = products[0];
  const sectionRef = useRef(null);
  const imagesRef = useRef(null);
  const infoRef = useRef(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    setSelectedSize(null);
    setSelectedImage(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imagesRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        infoRef.current,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [product]);

  const handleAdd = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
  };

  if (loading) {
    return (
      <Flex py={{ base: 16, md: 24 }} justify="center" align="center" bg="brand.nude">
        <Spinner size="xl" color="brand.dark" />
      </Flex>
    );
  }

  if (!product) return null;

  const images = product.images || [];
  const gallery = [
    images[0] || `https://placehold.co/900x1200/EDE0D4/7A6555?text=${product.name}`,
    images[1] || images[0] || `https://placehold.co/900x1200/EDE0D4/7A6555?text=${product.name}`,
    images[2] || images[0] || `https://placehold.co/900x1200/EDE0D4/7A6555?text=${product.name}`,
  ];
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const totalStock = Object.values(product.sizes || {}).reduce((acc, qty) => acc + qty, 0);
  const isLowStock = totalStock > 0 && totalStock <= 6;
  const saving = hasDiscount ? product.price - product.salePrice : 0;

  return (
    <Box ref={sectionRef} py={{ base: 14, md: 22 }} px={{ base: 4, md: 8, lg: 16 }} bg="brand.nude" overflow="hidden">
      <VStack spacing={3} textAlign="center" mb={{ base: 8, md: 10 }}>
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.32em" textTransform="uppercase" color="brand.brown">
          Seleccion recomendada
        </Text>
        <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark" letterSpacing="0.04em">
          Producto destacado
        </Text>
        <Text fontFamily="body" fontSize="sm" color="brand.muted" maxW="560px" lineHeight={1.8}>
          Encontralo rapido, elegi tu talle y sumalo al carrito en segundos.
        </Text>
      </VStack>

      <Grid
        templateColumns={{ base: "1fr", xl: "1.05fr 0.95fr" }}
        gap={{ base: 8, lg: 12 }}
        maxW="1200px"
        mx="auto"
        alignItems="stretch"
      >
        <GridItem ref={imagesRef}>
          <Box
            bg="brand.cream"
            borderRadius="2xl"
            border="0.5px solid rgba(160,120,90,0.15)"
            p={{ base: 4, md: 5 }}
            h="100%"
          >
            <Box position="relative" overflow="hidden" borderRadius="xl" h={{ base: "380px", sm: "460px", md: "560px" }}>
              <Image
                src={gallery[selectedImage]}
                alt={product.name}
                w="100%"
                h="100%"
                objectFit="cover"
              />

              <HStack position="absolute" top={3} left={3} spacing={2} flexWrap="wrap">
                <Badge bg="rgba(44,26,14,0.75)" color="white" fontSize="2xs" px={2.5} py={1} borderRadius="full">
                  BEST SELLER
                </Badge>
                {hasDiscount && (
                  <Badge bg="brand.error" color="white" fontSize="2xs" px={2.5} py={1} borderRadius="full">
                    Ahorro {formatPrice(saving)}
                  </Badge>
                )}
                {isLowStock && (
                  <Badge bg="orange.500" color="white" fontSize="2xs" px={2.5} py={1} borderRadius="full">
                    Quedan pocas unidades
                  </Badge>
                )}
              </HStack>
            </Box>

            <SimpleGrid columns={3} gap={2.5} mt={3}>
              {gallery.map((img, idx) => (
                <Box
                  key={`${img}-${idx}`}
                  borderRadius="md"
                  overflow="hidden"
                  border="1.5px solid"
                  borderColor={selectedImage === idx ? "brand.brown" : "transparent"}
                  cursor="pointer"
                  onClick={() => setSelectedImage(idx)}
                  opacity={selectedImage === idx ? 1 : 0.75}
                  transition="all 0.2s"
                  _hover={{ opacity: 1 }}
                >
                  <Image src={img} alt={`${product.name} vista ${idx + 1}`} w="100%" h="110px" objectFit="cover" />
                </Box>
              ))}
            </SimpleGrid>

            <HStack
              mt={4}
              spacing={{ base: 2, md: 3 }}
              flexWrap="wrap"
              color="brand.muted"
              fontSize="xs"
            >
              <HStack spacing={1.5}><Truck size={14} /><Text>Envios a todo el pais</Text></HStack>
              <HStack spacing={1.5}><RotateCcw size={14} /><Text>Cambios sin vueltas</Text></HStack>
              <HStack spacing={1.5}><ShieldCheck size={14} /><Text>Compra segura</Text></HStack>
            </HStack>
          </Box>
        </GridItem>

        <GridItem ref={infoRef}>
          <VStack
            align="stretch"
            spacing={5}
            bg="brand.white"
            borderRadius="2xl"
            border="0.5px solid rgba(160,120,90,0.18)"
            p={{ base: 5, md: 7 }}
            h="100%"
          >
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Badge variant="brand" fontSize="2xs">Curaduria Balenza</Badge>
              <HStack spacing={1.5} color="brand.brown">
                <Sparkles size={14} />
                <Text fontFamily="body" fontSize="2xs" letterSpacing="0.1em" textTransform="uppercase">
                  Eleccion destacada
                </Text>
              </HStack>
            </HStack>

            <VStack align="flex-start" spacing={2}>
              <Text fontFamily="body" fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
                {product.category}
              </Text>
              <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} letterSpacing="0.04em" color="brand.dark" lineHeight={1.1}>
                {product.name}
              </Text>
            </VStack>

            <Box bg="brand.beige" borderRadius="lg" p={4} border="0.5px solid rgba(160,120,90,0.15)">
              <HStack spacing={3} align="baseline" flexWrap="wrap">
                <Text fontFamily="body" fontWeight={600} fontSize={{ base: "2xl", md: "3xl" }} color="brand.dark">
                  {formatPrice(product.salePrice || product.price)}
                </Text>
                {product.salePrice && (
                  <Text fontFamily="body" fontSize="md" color="brand.muted" textDecoration="line-through">
                    {formatPrice(product.price)}
                  </Text>
                )}
              </HStack>
              <Text fontFamily="body" fontSize="xs" color="brand.muted" mt={1}>
                o 6 cuotas sin interes de {formatPrice(Math.round((product.salePrice || product.price) / 6))}
              </Text>
            </Box>

            <Text fontFamily="body" fontSize="sm" color="brand.muted" lineHeight={1.8}>
              {product.description}
            </Text>

            <Box bg="brand.nude" borderRadius="lg" p={4} border="0.5px dashed rgba(160,120,90,0.25)">
              <Text fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.brown" mb={1}>
                Como comprar rapido
              </Text>
              <VStack align="flex-start" spacing={1}>
                <Text fontFamily="body" fontSize="sm" color="brand.dark">1) Elegi tu talle</Text>
                <Text fontFamily="body" fontSize="sm" color="brand.dark">2) Agregalo al carrito y finaliza pago</Text>
              </VStack>
            </Box>

            <Box w="100%">
              <SizeSelector
                sizes={product.sizes}
                selected={selectedSize}
                onChange={setSelectedSize}
              />
            </Box>

            <Button
              variant="primary"
              size="lg"
              w="100%"
              fontSize="xs"
              letterSpacing="0.2em"
              py={7}
              onClick={handleAdd}
              isDisabled={!selectedSize}
              opacity={!selectedSize ? 0.5 : 1}
            >
              {selectedSize ? `Agregar talle ${selectedSize}` : "Elegi tu talle para continuar"}
            </Button>

            <Text
              fontFamily="body"
              fontSize="2xs"
              color={selectedSize && product.sizes?.[selectedSize] <= 3 ? "orange.500" : "brand.muted"}
              letterSpacing="0.08em"
              textTransform="uppercase"
              textAlign="center"
            >
              {selectedSize
                ? `Stock en ${selectedSize}: ${product.sizes?.[selectedSize] || 0} unidad${(product.sizes?.[selectedSize] || 0) !== 1 ? "es" : ""}`
                : "Tip: elegi tu talle para habilitar la compra"}
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2.5}>
              <Box bg="brand.cream" borderRadius="md" p={3} border="0.5px solid rgba(160,120,90,0.12)">
                <Text fontFamily="body" fontSize="xs" color="brand.dark" fontWeight={500}>Envio gratis +$50.000</Text>
              </Box>
              <Box bg="brand.cream" borderRadius="md" p={3} border="0.5px solid rgba(160,120,90,0.12)">
                <Text fontFamily="body" fontSize="xs" color="brand.dark" fontWeight={500}>Cambios por 30 dias</Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default FeaturedProduct;
