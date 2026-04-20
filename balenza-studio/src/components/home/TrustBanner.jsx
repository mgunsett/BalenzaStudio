import { useRef, useEffect } from "react";
import { Box, Flex, VStack, Text, Icon } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Package, CreditCard, ShieldCheck, Truck } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Envíos a todo el país",
    desc: "A cualquier punto de Argentina",
  },
  {
    icon: CreditCard,
    title: "Todas las tarjetas",
    desc: "Pagá con MercadoPago en cuotas",
  },
  {
    icon: ShieldCheck,
    title: "Compra 100% segura",
    desc: "Tus datos siempre protegidos",
  },
  {
    icon: Package,
    title: "Empaque cuidado",
    desc: "Estamos en cada detalle de tu pedido",
  },

];

const TrustBanner = () => {
  const ref   = useRef(null);
  const items = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.5)",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Box ref={{base: 'none',md:ref}} py={14} px={{ base: 2, md: 8 }} bg="brand.cream" borderY="0.5px solid" borderColor="rgba(160,120,90,0.15)">
      <Flex
        justify="space-around"
        align="flex-start"
        wrap="wrap"
        gap={{ base: 6, md: 8 }}
        maxW="1100px"
        mx="auto"
      >
        {TRUST_ITEMS.map((item, i) => (
          <VStack
            key={item.title}
            ref={(el) => (items.current[i] = el)}
            align="center"
            spacing={3}
            w={{base:'125px', md:'180px'}}
            maxW="200px"
          >
            <Box
              w="52px" h="52px"
              borderRadius="full"
              bg="brand.beige"
              border="0.5px solid"
              borderColor="rgba(160,120,90,0.2)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <item.icon size={22} color="var(--chakra-colors-brand-brown)" strokeWidth={1.5} />
            </Box>
            <VStack spacing={1}>
              <Text fontFamily="body" fontWeight={500} fontSize={{ base: "xs", md: "sm" }} color="brand.dark" textAlign="center" letterSpacing="0.02em">
                {item.title}
              </Text>
              <Text fontFamily="body" fontSize={{base: "10px", md: "xs"}} color="brand.muted" textAlign="center" lineHeight={1.6}>
                {item.desc}
              </Text>
            </VStack>
          </VStack>
        ))}
      </Flex>
    </Box>
  );
};

export default TrustBanner;