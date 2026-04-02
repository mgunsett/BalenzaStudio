import { useRef, useEffect } from "react";
import { Box, SimpleGrid, VStack, Text, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES } from "../../utils/constants";
import { ArrowRight } from "lucide-react";

const CAT_IMAGES = {
  remeras:    "https://placehold.co/500x640/EDE0D4/7A6555?text=Remeras",
  pantalones: "https://placehold.co/500x640/D4DDE8/7A6555?text=Pantalones",
  camperas:   "https://placehold.co/500x640/DDD5E8/7A6555?text=Camperas",
};

const CategoryBanner = () => {
  const ref   = useRef(null);
  const cards = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const navigate = useNavigate();

  return (
    <Box
      ref={ref}
      py={{ base: 16, md: 24 }}
      px={{ base: 4, md: 8 }}
      bg="brand.beige"
    >
      <VStack spacing={10} maxW="1200px" mx="auto">
        <VStack spacing={2} textAlign="center">
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.35em" textTransform="uppercase" color="brand.brown">
            Colecciones
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark" letterSpacing="0.05em">
            Explorá por categoría
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} w="100%">
          {CATEGORIES.map((cat, i) => (
            <Box
              key={cat.slug}
              ref={(el) => (cards.current[i] = el)}
              position="relative"
              overflow="hidden"
              borderRadius="xl"
              cursor="pointer"
              role="group"
              h={{ base: "320px", md: "480px" }}
              onClick={() => navigate(`/categoria/${cat.slug}`)}
            >
              <Image
                src={CAT_IMAGES[cat.slug]}
                alt={cat.label}
                w="100%" h="100%"
                objectFit="cover"
                transform="scale(1)"
                _groupHover={{ transform: "scale(1.05)" }}
                transition="transform 0.6s ease"
              />
              {/* Overlay */}
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, rgba(44,26,14,0.65) 0%, transparent 60%)"
              />
              {/* Label */}
              <VStack
                position="absolute"
                bottom={6}
                left={6}
                align="flex-start"
                spacing={1}
              >
                <Text fontFamily="heading" fontWeight={300} fontSize="2xl" color="brand.white" letterSpacing="0.08em">
                  {cat.label}
                </Text>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.3s"
                  color="brand.sand"
                >
                  <Text fontFamily="body" fontSize="xs" letterSpacing="0.15em" textTransform="uppercase">
                    Ver todo
                  </Text>
                  <ArrowRight size={14} />
                </Box>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default CategoryBanner;