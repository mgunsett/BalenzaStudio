import { useRef, useEffect } from "react";
import { Box, VStack, HStack, Text, SimpleGrid } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REVIEWS = [
  {
    name: "Valentina G.",
    stars: 5,
    text: "Hermosa calidad! La tela es súper suave, llegó muy rápido y bien embalado. Ya pedí de nuevo 🙌",
  },
  {
    name: "Sofía M.",
    stars: 5,
    text: "Me encantó el tallaje, calza perfecto. El servicio fue muy personalizado, se nota que cuidan cada detalle.",
  },
  {
    name: "Camila R.",
    stars: 5,
    text: "Compré una campera y quedé enamorada. Definitivamente vuelvo a comprar. Lo recomiendo a todas mis amigas.",
  },
  {
    name: "Lucía P.",
    stars: 5,
    text: "Precio justo por una calidad increíble. El envío fue rapidísimo y el empaque muy cuidado. ¡10/10!",
  },
];

const Stars = ({ count = 5 }) => (
  <HStack spacing={1}>
    {Array.from({ length: count }).map((_, i) => (
      <Text key={i} fontSize="sm" lineHeight={1}>⭐</Text>
    ))}
  </HStack>
);

const ReviewsSection = () => {
  const ref      = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 82%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Box ref={ref} py={{ base: 14, md: 20 }} px={{ base: 4, md: 8 }} bg="brand.beige">
      <Box maxW="1200px" mx="auto">
        {/* Header */}
        <VStack spacing={2} mb={10} textAlign="center">
          <Text
            fontFamily="body"
            fontSize="2xs"
            letterSpacing="0.35em"
            textTransform="uppercase"
            color="brand.brown"
          >
            Lo que dicen nuestras clientas
          </Text>
          <Text
            fontFamily="heading"
            fontWeight={300}
            fontSize={{ base: "3xl", md: "4xl" }}
            color="brand.dark"
            letterSpacing="0.04em"
          >
            Opiniones reales
          </Text>
        </VStack>

        {/* Grid de reviews */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={{ base: 4, md: 6 }}>
          {REVIEWS.map((review, i) => (
            <Box
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              bg="brand.cream"
              borderRadius="xl"
              p={6}
              border="0.5px solid"
              borderColor="rgba(160,120,90,0.15)"
              shadow="sm"
            >
              <VStack align="flex-start" spacing={3}>
                <Stars count={review.stars} />
                <Text
                  fontFamily="body"
                  fontSize="sm"
                  color="brand.dark"
                  lineHeight={1.7}
                  fontStyle="italic"
                >
                  "{review.text}"
                </Text>
                <Text
                  fontFamily="body"
                  fontSize="xs"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="brand.brown"
                  fontWeight={500}
                >
                  — {review.name}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default ReviewsSection;
