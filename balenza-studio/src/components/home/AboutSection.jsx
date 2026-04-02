import { useRef, useEffect } from "react";
import { Box, Grid, GridItem, VStack, Text, Image, Flex } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const lineRef    = useRef(null);
  const textRef    = useRef(null);
  const imgRef     = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Línea decorativa
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        }
      );
      // Texto
      gsap.fromTo(
        textRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
        }
      );
      // Imagen con parallax
      gsap.fromTo(
        imgRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      id="about"
      ref={sectionRef}
      py={{ base: 20, md: 32 }}
      px={{ base: 6, md: 12, lg: 20 }}
      bg="brand.beige"
      overflow="hidden"
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={{ base: 12, lg: 20 }}
        maxW="1200px"
        mx="auto"
        alignItems="center"
      >
        {/* Texto */}
        <GridItem>
          <VStack ref={textRef} align="flex-start" spacing={6}>
            <Box>
              <Text
                fontFamily="body"
                fontSize="2xs"
                letterSpacing="0.35em"
                textTransform="uppercase"
                color="brand.brown"
                mb={3}
              >
                Quiénes somos
              </Text>
              <Box ref={lineRef} h="1px" w="60px" bg="brand.brown" mb={6} />
            </Box>

            <Text
              fontFamily="heading"
              fontWeight={300}
              fontSize={{ base: "3xl", md: "4xl" }}
              color="brand.dark"
              lineHeight={1.15}
              letterSpacing="0.04em"
            >
              Moda con{" "}
              <Text as="span" fontStyle="italic">
                propósito
              </Text>
            </Text>

            <Text fontFamily="body" fontSize="md" color="brand.muted" lineHeight={1.9}>
              En BALENZA Studio creemos que vestirse bien es un acto de confianza en una misma.
              Diseñamos prendas para la mujer contemporánea: versátiles, de calidad y con una
              estética cuidada que trasciende las tendencias.
            </Text>

            <Text fontFamily="body" fontSize="sm" color="brand.muted" lineHeight={1.8}>
              Cada pieza de nuestra colección es seleccionada con atención al detalle,
              priorizando materiales nobles y cortes que favorecen. Porque cuando te sentís
              bien con lo que usás, todo lo demás fluye.
            </Text>

            <Flex gap={8} pt={2}>
              {[
                { num: "100%", label: "Calidad garantizada" },
                { num: "3+",   label: "Años de trayectoria" },
                { num: "∞",   label: "Estilo atemporal" },
              ].map((item) => (
                <VStack key={item.label} align="flex-start" spacing={0}>
                  <Text fontFamily="heading" fontWeight={300} fontSize="2xl" color="brand.brown">
                    {item.num}
                  </Text>
                  <Text fontFamily="body" fontSize="2xs" letterSpacing="0.1em" textTransform="uppercase" color="brand.muted">
                    {item.label}
                  </Text>
                </VStack>
              ))}
            </Flex>
          </VStack>
        </GridItem>

        {/* Imagen */}
        <GridItem ref={imgRef}>
          <Box position="relative">
            <Image
              src="https://placehold.co/560x700/E8D5C4/7A6555?text=BALENZA+Studio"
              alt="BALENZA Studio"
              w="100%"
              borderRadius="xl"
              objectFit="cover"
            />
            {/* Caja decorativa superpuesta */}
            <Box
              position="absolute"
              bottom={-6}
              left={-6}
              w="120px"
              h="120px"
              border="1px solid"
              borderColor="brand.sand"
              borderRadius="lg"
              zIndex={-1}
            />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AboutSection;