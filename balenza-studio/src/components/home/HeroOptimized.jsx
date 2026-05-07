import { useRef, useEffect } from "react";
import { Box, Flex, Text, Button, VStack, HStack, Badge, Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { TrendingUp, Heart, Truck, Shield } from "lucide-react";
import banner_1 from "../../assets/images/hero/banner_1.svg";

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
        h={{ base: "80vh", md: "85vh" }}
        maxH="900px"
      >
        {/* Imagen de fondo */}
        <Box
          ref={imageRef}
          as="img"
          src={banner_1}
          alt="Balenza Studio - Nueva Colección"
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center"
          opacity={0.7}
          pointerEvents="none"
          filter={{ base: "blur(1px)", md: "none" }}
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
        <Container maxW="container.xl" h="full">
          <Flex
            h="full"
            align="center"
            justify={{ base: "center", md: "flex-start" }}
            position="relative"
            zIndex={10}
          >
            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={6}
              maxW="650px"
              textAlign={{ base: "center", md: "left" }}
              px={{ base: 4, md: 0 }}
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
                  fontSize={{ base: "5xl", md: "6xl", lg: "7xl" }}
                  fontWeight="400"
                  color="brand.dark"
                  lineHeight="1.1"
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
                fontSize={{ base: "md", md: "lg", lg: "xl" }}
                color="brand.muted"
                maxW="550px"
                lineHeight="1.6"
              >
                Prendas pensadas para vos. Comodidad, calidad y estilo que te
                acompañan todos los días.
              </Text>

              {/* CTAs PRINCIPALES */}
              <HStack
                ref={ctaRef}
                spacing={4}
                flexWrap={{ base: "wrap", sm: "nowrap" }}
                w={{ base: "full", md: "auto" }}
              >
                <Button
                  size="lg"
                  bg="brand.brown"
                  color="white"
                  px={8}
                  py={{ base: 6, md: 7 }}
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="600"
                  onClick={() => navigate("/categoria/remeras")}
                  _hover={{
                    bg: "brand.dark",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(160,120,90,0.3)",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.3s"
                  boxShadow="lg"
                  w={{ base: "full", sm: "auto" }}
                  minW={{ sm: "200px" }}
                >
                  Ver Nueva Colección →
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  borderColor="brand.brown"
                  borderWidth="2px"
                  color="brand.brown"
                  px={8}
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
                    const productosSection = document.getElementById("productos");
                    if (productosSection) {
                      productosSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  w={{ base: "full", sm: "auto" }}
                  minW={{ sm: "180px" }}
                >
                  Explorar productos
                </Button>
              </HStack>

              {/* TRUST INDICATORS INLINE */}
              <HStack
                ref={trustRef}
                spacing={{ base: 4, md: 6 }}
                color="brand.muted"
                fontSize={{ base: "xs", md: "sm" }}
                flexWrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
              >
                <HStack spacing={2}>
                  <Truck size={18} />
                  <Text fontWeight="500">Envíos gratis +$50.000</Text>
                </HStack>
                <HStack spacing={2}>
                  <Heart size={18} />
                  <Text fontWeight="500">+2.500 clientas felices</Text>
                </HStack>
                <HStack spacing={2} display={{ base: "none", md: "flex" }}>
                  <Shield size={18} />
                  <Text fontWeight="500">Compra 100% segura</Text>
                </HStack>
              </HStack>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* MINI-BANNER SECUNDARIO CON URGENCIA */}
      <Box bg="brand.brown" color="white" py={3} textAlign="center">
        <Container maxW="container.xl">
          <HStack
            justify="center"
            spacing={{ base: 2, md: 4 }}
            flexWrap="wrap"
            fontSize={{ base: "xs", md: "sm" }}
          >
            <Text fontWeight="600">🎁 OFERTA ESPECIAL:</Text>
            <Text>
              15% OFF en tu primera compra con el código{" "}
              <Badge
                bg="white"
                color="brand.brown"
                px={2}
                py={1}
                fontWeight="700"
                fontSize={{ base: "2xs", md: "xs" }}
              >
                BIENVENIDA15
              </Badge>
            </Text>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HeroOptimized;
