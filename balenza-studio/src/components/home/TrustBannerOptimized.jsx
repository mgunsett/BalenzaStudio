import { useRef, useEffect } from "react";
import { Box, Flex, VStack, HStack, Text, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Package, CreditCard, ShieldCheck, Truck, RefreshCw, Heart } from "lucide-react";

const MotionVStack = motion(VStack);

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Envíos gratis",
    highlight: "+$50.000",
    desc: "A todo el país",
    color: "brand.brown",
  },
  {
    icon: CreditCard,
    title: "Hasta 6 cuotas",
    highlight: "sin interés",
    desc: "Con todas las tarjetas",
    color: "brand.brown",
  },
  {
    icon: RefreshCw,
    title: "Cambios gratis",
    highlight: "30 días",
    desc: "Sin complicaciones",
    color: "brand.brown",
  },
  {
    icon: ShieldCheck,
    title: "Compra segura",
    highlight: "100%",
    desc: "Datos protegidos",
    color: "brand.brown",
  },
  {
    icon: Heart,
    title: "+2.500 clientas",
    highlight: "felices",
    desc: "Nos eligen todos los días",
    color: "brand.brown",
  },
  {
    icon: Package,
    title: "Empaque premium",
    highlight: "cuidado",
    desc: "Atención en cada detalle",
    color: "brand.brown",
  },
];

const TrustBannerOptimized = () => {
  const ref = useRef(null);
  const items = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items.current,
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "back.out(1.3)",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={ref}
      py={{ base: 14, md: 20 }}
      px={{ base: 4, md: 8 }}
      bg="white"
      borderY="1px solid"
      borderColor="brand.beige"
    >
      <VStack spacing={10} maxW="1300px" mx="auto">
        {/* HEADER */}
        <VStack spacing={2} textAlign="center">
          <Text
            fontFamily="heading"
            fontWeight={400}
            fontSize={{ base: "2xl", md: "3xl" }}
            color="brand.dark"
            letterSpacing="0.03em"
          >
            Comprá con total confianza
          </Text>
          <Text fontSize="md" color="brand.muted">
            Más de 2.500 clientas nos eligen cada día
          </Text>
        </VStack>

        {/* GRID DE TRUST ITEMS */}
        <Flex
          justify="space-around"
          align="flex-start"
          wrap="wrap"
          gap={{ base: 8, md: 6 }}
          w="100%"
        >
          {TRUST_ITEMS.map((item, i) => (
            <MotionVStack
              key={item.title}
              ref={(el) => (items.current[i] = el)}
              align="center"
              spacing={4}
              w={{ base: "140px", sm: "160px", md: "180px" }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {/* ÍCONO */}
              <Box
                w={{ base: "64px", md: "72px" }}
                h={{ base: "64px", md: "72px" }}
                borderRadius="full"
                bg="brand.nude"
                border="2px solid"
                borderColor="brand.beige"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  inset: "-8px",
                  borderRadius: "full",
                  border: "1px solid",
                  borderColor: "brand.beige",
                  opacity: 0.3,
                }}
                transition="all 0.3s"
                _hover={{
                  bg: "brand.brown",
                  borderColor: "brand.brown",
                  transform: "scale(1.05)",
                  "& svg": {
                    color: "white !important",
                  },
                }}
              >
                <item.icon
                  size={28}
                  color="var(--chakra-colors-brand-brown)"
                  strokeWidth={1.8}
                />
              </Box>

              {/* TEXTO */}
              <VStack spacing={1}>
                <Text
                  fontFamily="body"
                  fontWeight={600}
                  fontSize={{ base: "sm", md: "md" }}
                  color="brand.dark"
                  textAlign="center"
                  letterSpacing="0.01em"
                >
                  {item.title}
                </Text>
                {item.highlight && (
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    color={item.color}
                    fontWeight="600"
                    textAlign="center"
                  >
                    {item.highlight}
                  </Text>
                )}
                <Text
                  fontFamily="body"
                  fontSize="xs"
                  color="brand.muted"
                  textAlign="center"
                  lineHeight={1.5}
                >
                  {item.desc}
                </Text>
              </VStack>
            </MotionVStack>
          ))}
        </Flex>
      </VStack>
    </Box>
  );
};

export default TrustBannerOptimized;
