import { useRef, useEffect } from "react";
import { Box, Flex, Text, Button, VStack, HStack, Badge, Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Heart, Truck, Shield } from "lucide-react";
import banner_2 from "../../assets/images/hero/banner_2.svg";

const HeroOptimized = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const trustRef = useRef(null);
  const imageRef = useRef(null);

  // Animación de entrada inicial
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    
    // Animación de imagen con efecto parallax suave
    tl.fromTo(
      imageRef.current,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 0.7, duration: 1.2, ease: "power3.out" }
    )
    // Badge superior
    .fromTo(
      badgeRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.8"
    )
    // Título principal
    .fromTo(
      titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
      "-=0.5"
    )
    // Subtítulo
    .fromTo(
      subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
      "-=0.6"
    )
    // CTAs
    .fromTo(
      ctaRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
      "-=0.5"
    )
    // Trust indicators
    .fromTo(
      trustRef.current.children,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" },
      "-=0.4"
    );
  }, []);

  return (
    <Box
      ref={containerRef}
      position="relative"
      overflow="hidden"
      bg="linear-gradient(135deg, #F5EFE6 0%, #EDE0D4 100%)"
    >
      {/* HERO PRINCIPAL */}
      <Box
        position="relative"
        h={{ base: "92svh", sm: "88svh", md: "85vh" }}
        minH={{ base: "580px", md: "auto" }}
        maxH={{ base: "none", md: "900px" }}
      >
        {/* Imagen de fondo */}
        <Box
          ref={imageRef}
          as="img"
          src={banner_2}
          alt="Balenza Studio - Nueva Colección"
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition={{ base: "60% center", md: "center" }}
          opacity={{ base: 0.45, md: 0.7 }}
          pointerEvents="none"
          filter={{ base: "blur(2px)", md: "none" }}
        />

        {/* Overlay gradiente para legibilidad en mobile */}
        <Box
          display={{ base: "block", md: "none" }}
          position="absolute"
          inset={0}
          bgGradient="linear(to-b, rgba(245,239,230,0.55) 0%, rgba(237,224,212,0.75) 60%, rgba(237,224,212,0.92) 100%)"
          zIndex={2}
          pointerEvents="none"
        />

        {/* Elementos decorativos */}
        <Box
          position="absolute"
          right="-10%"
          top="-10%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="brand.brown"
          opacity={0.05}
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Box
          position="absolute"
          left="-5%"
          bottom="-5%"
          w="350px"
          h="350px"
          borderRadius="full"
          bg="brand.sand"
          opacity={0.08}
          filter="blur(50px)"
          pointerEvents="none"
        />

        {/* Contenido */}
        <Container
          maxW="container.xl"
          h="full"
          ml={{ base: 0, md: 24 }}
          px={{ base: 5, sm: 6, md: 0 }}
          position="relative"
          zIndex={10}
        >
          <Flex
            h="full"
            align="center"
            justify={{ base: "center", md: "flex-start" }}
            position="relative"
            zIndex={10}
          >
            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={{ base: 4, sm: 5, md: 6 }}
              maxW={{ base: "100%", md: "650px" }}
              textAlign={{ base: "center", md: "left" }}
              pb={{ base: 4, md: 0 }}
            >
              {/* BADGE SUPERIOR CON URGENCIA */}
              <HStack
                ref={badgeRef}
                spacing={3}
                flexWrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
              >
                <Badge
                  bg="brand.brown"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  🔥 Nuevos ingresos
                </Badge>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color="brand.muted"
                  fontWeight="500"
                >
                  Envíos a todo el país
                </Text>
              </HStack>

              {/* TITULAR PRINCIPAL - MÁS VENDEDOR */}
              <Box ref={titleRef}>
                <Text
                  as="h1"
                  fontFamily="heading"
                  fontSize={{ base: "4xl", sm: "5xl", md: "6xl", lg: "7xl" }}
                  fontWeight="400"
                  color="brand.dark"
                  lineHeight={{ base: "1.15", md: "1.1" }}
                  letterSpacing="0.02em"
                >
                  Tu estilo{" "}
                  <Box
                    as="span"
                    color="brand.brown"
                    position="relative"
                    display="inline-block"
                    _after={{
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: { base: "8px", md: "12px" },
                      width: "100%",
                      height: { base: "8px", md: "12px" },
                      bg: "brand.sand",
                      opacity: 0.3,
                      zIndex: -1,
                    }}
                  >
                    cómodo
                  </Box>
                  ,<br />
                  tu esencia única
                </Text>
              </Box>

              {/* SUBTÍTULO CON PROPUESTA DE VALOR */}
              <Text
                ref={subtitleRef}
                fontSize={{ base: "sm", sm: "md", md: "lg", lg: "xl" }}
                color="brand.muted"
                maxW={{ base: "100%", md: "550px" }}
                lineHeight="1.6"
              >
                Prendas pensadas para vos. Comodidad, calidad y estilo que te
                acompañan todos los días.
              </Text>

              {/* CTAs PRINCIPALES */}
              <Flex
                ref={ctaRef}
                direction={{ base: "column", sm: "row" }}
                gap={{ base: 3, sm: 4 }}
                w={{ base: "full", sm: "auto" }}
                align={{ base: "stretch", sm: "center" }}
              >
                <Button
                  size="lg"
                  bg="brand.brown"
                  color="white"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 6, md: 7 }}
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="600"
                  onClick={() => navigate("/categoria/camperas")}
                  _hover={{
                    bg: "brand.dark",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(160,120,90,0.3)",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.3s"
                  boxShadow="lg"
                  minW={{ sm: "200px" }}
                  borderRadius={{ base: "xl", md: "md" }}
                >
                  Ver Nueva Colección →
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  borderColor="brand.brown"
                  borderWidth="2px"
                  color="brand.brown"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 6, md: 7 }}
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="600"
                  bg="rgba(253,250,247,0.6)"
                  backdropFilter="blur(10px)"
                  _hover={{
                    bg: "brand.beige",
                    borderColor: "brand.dark",
                    color: "brand.dark",
                  }}
                  onClick={() => {
                    const productosSection = document.getElementById("categorias");
                    if (productosSection) {
                      productosSection.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  minW={{ sm: "180px" }}
                  borderRadius={{ base: "xl", md: "md" }}
                >
                  Explorar productos
                </Button>
              </Flex>

              {/* TRUST INDICATORS INLINE */}
              <HStack
                ref={trustRef}
                spacing={{ base: 0, md: 6 }}
                gap={{ base: 3, md: 6 }}
                color="brand.muted"
                fontSize={{ base: "xs", md: "sm" }}
                flexWrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
                w={{ base: "full", md: "auto" }}
                px={{ base: 2, md: 0 }}
              >
                <HStack spacing={1.5}>
                  <Truck size={15} />
                  <Text fontWeight="500">Envíos gratis +$50k</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Heart size={15} />
                  <Text fontWeight="500">+2.500 clientas</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Shield size={15} />
                  <Text fontWeight="500">Compra segura</Text>
                </HStack>
              </HStack>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* MINI-BANNER SECUNDARIO CON URGENCIA */}
      <Box bg="brand.brown" color="white" py={{ base: 2.5, md: 3 }} textAlign="center">
        <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
          <Flex
            justify="center"
            align="center"
            gap={{ base: 1, sm: 2, md: 4 }}
            flexWrap="wrap"
            fontSize={{ base: "xs", md: "sm" }}
            flexDir={{ base: "column", sm: "row" }}
          >
            <Text fontWeight="700" letterSpacing="wide">🎁 OFERTA ESPECIAL:</Text>
            <Text textAlign="center">
              Abonando con transferencia ó efectivo{"  "}
              <Badge
                bg="white"
                color="brand.brown"
                px={2}
                py={0.5}
                fontWeight="700"
                fontSize={{ base: "xs", md: "xs" }}
                borderRadius="md"
                ml={1}
              >
                15% de descuento
              </Badge>
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default HeroOptimized;
