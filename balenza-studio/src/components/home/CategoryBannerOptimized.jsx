import { useRef, useEffect } from "react";
import { Box, SimpleGrid, VStack, HStack, Text, Image, Badge, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import section_camperas from "../../assets/images/categories/section_camperas.svg";
import section_pantalones from "../../assets/images/categories/section_pantalones.svg";
import section_remeras from "../../assets/images/categories/section_remeras.svg";

const MotionBox = motion(Box);

const CATEGORIES_DATA = [
  {
    slug: "remeras",
    label: "Remeras",
    subtitle: "Básicas que no fallan",
    description: "Comodidad y estilo para el día a día",
    image: section_remeras,
    badge: "Lo más vendido",
    color: "brand.sand",
  },
  {
    slug: "pantalones",
    label: "Pantalones",
    subtitle: "Comfort todo el día",
    description: "Perfectos para cualquier ocasión",
    image: section_pantalones,
    badge: "Nuevo",
    color: "brand.brown",
  },
  {
    slug: "camperas",
    label: "Camperas",
    subtitle: "Estilo para cada ocasión",
    description: "Diseños únicos y versátiles",
    image: section_camperas,
    badge: "Temporada",
    color: "brand.muted",
  },
];

const CategoryBannerOptimized = () => {
  const ref = useRef(null);
  const cards = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={ref}
      py={{ base: 16, md: 24 }}
      px={{ base: 4, md: 8 }}
      bg="brand.nude"
    >
      <VStack spacing={10} maxW="1200px" mx="auto">
        {/* HEADER */}
        <VStack spacing={3} textAlign="center">
          <Text
            fontFamily="body"
            fontSize="xs"
            letterSpacing="0.3em"
            textTransform="uppercase"
            color="brand.brown"
            fontWeight="600"
          >
            Colecciones
          </Text>
          <Text
            fontFamily="heading"
            fontWeight={400}
            fontSize={{ base: "3xl", md: "4xl" }}
            color="brand.dark"
            letterSpacing="0.03em"
          >
            Explorá por categoría
          </Text>
          <Text
            fontSize="md"
            color="brand.muted"
            maxW="500px"
          >
            Elegí tu estilo perfecto entre nuestras colecciones diseñadas para vos
          </Text>
        </VStack>

        {/* GRID DE CATEGORÍAS */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="100%">
          {CATEGORIES_DATA.map((cat, i) => (
            <MotionBox
              key={cat.slug}
              ref={(el) => (cards.current[i] = el)}
              position="relative"
              overflow="hidden"
              borderRadius="2xl"
              cursor="pointer"
              role="group"
              h={{ base: "320px", sm: "400px", md: "480px" }}
              onClick={() => navigate(`/categoria/${cat.slug}`)}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              boxShadow="lg"
              _hover={{ boxShadow: "2xl" }}
            >
              {/* IMAGEN DE FONDO */}
              <Image
                src={cat.image}
                alt={cat.label}
                w="100%"
                h="100%"
                objectFit="cover"
                objectPosition="center"
                transform="scale(1)"
                _groupHover={{ transform: "scale(1.05)" }}
                transition="transform 0.6s ease"
              />

              {/* OVERLAY GRADIENT */}
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, rgba(44,26,14,0.85) 0%, rgba(44,26,14,0.2) 50%, transparent 80%)"
                _groupHover={{
                  bgGradient: "linear(to-t, rgba(44,26,14,0.9) 0%, rgba(44,26,14,0.3) 50%, transparent 80%)"
                }}
                transition="background 0.4s"
              />

              {/* BADGE SUPERIOR */}
              <Badge
                position="absolute"
                top={4}
                left={4}
                bg={cat.color}
                color="white"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="xs"
                fontWeight="600"
                textTransform="uppercase"
              >
                {cat.badge}
              </Badge>

              {/* CONTENIDO INFERIOR */}
              <VStack
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                p={6}
                align="flex-start"
                spacing={1}
                color="white"
              >
                {/* SUBTÍTULO */}
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="brand.sand"
                  fontWeight="600"
                >
                  {cat.subtitle}
                </Text>

                {/* TÍTULO */}
                <Text
                  fontFamily="heading"
                  fontWeight={400}
                  fontSize={{ base: "2xl", md: "3xl" }}
                  letterSpacing="0.05em"
                  color="white"
                >
                  {cat.label}
                </Text>

               

                {/* CTA */}
                <Button
                  size="sm"
                  bg={cat.color}
                  color="white"
                  rightIcon={<ArrowRight size={16} />}
                  _hover={{ bg: "brand.dark" }}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.3s"
                >
                  Ver colección
                </Button>
              </VStack>
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* CTA GLOBAL (OPCIONAL) */}
        <Box textAlign="center" pt={4}>
          <Text fontSize="sm" color="brand.muted" mb={4}>
            ¿No sabés por dónde empezar?
          </Text>
          <Button
            variant="outline"
            borderColor="brand.brown"
            color="brand.brown"
            onClick={() => navigate("/categoria/todos")}
            _hover={{ bg: "brand.beige" }}
          >
            Ver todos los productos
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default CategoryBannerOptimized;
