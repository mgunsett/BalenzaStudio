import { useRef, useEffect, useState } from "react";
import {
  Box, Grid, GridItem, VStack, HStack, Text, Button, Badge, Flex, Image,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatters";
import { SIZES } from "../../utils/constants";
import SizeSelector from "../products/SizeSelector";

gsap.registerPlugin(ScrollTrigger);

// Imágenes placeholder — reemplazar con URLs de Firebase Storage
const PLACEHOLDER_IMAGES = [
  "https://placehold.co/600x750/EDE0D4/7A6555?text=Look+1",
  "https://placehold.co/400x500/E8D5C4/7A6555?text=Look+2",
  "https://placehold.co/400x500/D4C4B5/7A6555?text=Look+3",
  "https://placehold.co/400x500/DDD5C4/7A6555?text=Look+4",
];

const FEATURED_PRODUCT = {
  id: "featured-001",
  name: "Remera Lino Oversized",
  category: "remeras",
  price: 15990,
  salePrice: null,
  description: "Confeccionada en lino 100% natural, esta remera oversized combina comodidad y elegancia en una pieza atemporal. Perfecta para el día a día con un toque sofisticado.",
  images: PLACEHOLDER_IMAGES,
  sizes: { XS: 5, S: 8, M: 6, L: 3, XL: 2 },
  featured: true,
};

const FeaturedProduct = ({ product = FEATURED_PRODUCT }) => {
  const sectionRef = useRef(null);
  const imagesRef  = useRef(null);
  const infoRef    = useRef(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imagesRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
      gsap.fromTo(
        infoRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleAdd = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
  };

  return (
    <Box ref={sectionRef} py={{ base: 16, md: 24 }} px={{ base: 4, md: 8, lg: 16 }} bg="brand.nude" overflow="hidden">
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={{ base: 12, lg: 16 }}
        maxW="1200px"
        mx="auto"
        alignItems="center"
      >
        {/* Galería de imágenes */}
        <GridItem ref={imagesRef}>
          <Grid templateColumns="2fr 1fr" templateRows="auto auto" gap={3} h={{ base: "500px", md: "620px" }}>
            <GridItem rowSpan={2}>
              <Image
                src={product.images[0]}
                alt={product.name}
                w="100%" h="100%"
                objectFit="cover"
                borderRadius="lg"
              />
            </GridItem>
            <GridItem>
              <Image
                src={product.images[1]}
                alt={product.name}
                w="100%" h="100%"
                objectFit="cover"
                borderRadius="lg"
              />
            </GridItem>
            <GridItem>
              <Image
                src={product.images[2]}
                alt={product.name}
                w="100%" h="100%"
                objectFit="cover"
                borderRadius="lg"
              />
            </GridItem>
          </Grid>
        </GridItem>

        {/* Info del producto */}
        <GridItem ref={infoRef}>
          <VStack align="flex-start" spacing={6}>
            <Badge variant="brand" fontSize="2xs">Producto destacado</Badge>

            <VStack align="flex-start" spacing={1}>
              <Text fontFamily="body" fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
                {product.category}
              </Text>
              <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} letterSpacing="0.05em" color="brand.dark" lineHeight={1.1}>
                {product.name}
              </Text>
            </VStack>

            <HStack spacing={3} align="baseline">
              <Text fontFamily="body" fontWeight={500} fontSize="2xl" color="brand.dark">
                {formatPrice(product.salePrice || product.price)}
              </Text>
              {product.salePrice && (
                <Text fontFamily="body" fontSize="lg" color="brand.muted" textDecoration="line-through">
                  {formatPrice(product.price)}
                </Text>
              )}
            </HStack>

            <Text fontFamily="body" fontSize="sm" color="brand.muted" lineHeight={1.8} maxW="420px">
              {product.description}
            </Text>

            <Box w="100%">
              <SizeSelector
                sizes={product.sizes}
                selected={selectedSize}
                onChange={setSelectedSize}
              />
            </Box>

            <VStack w="100%" spacing={3}>
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
                Agregar al carrito
              </Button>
              <Text fontSize="2xs" color="brand.muted" letterSpacing="0.1em" textTransform="uppercase">
                Elegí un talle para continuar
              </Text>
            </VStack>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default FeaturedProduct;