import { useRef, useEffect } from "react";
import {
  Box, VStack, HStack, Text, SimpleGrid, Divider,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShoppingBag, CreditCard, Package, MessageCircle } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: ShoppingBag,
    title: "Elegí tus productos",
    desc: "Navegá nuestra tienda, encontrá lo que te gusta y seleccioná el talle. Podés agregar varios productos al carrito antes de comprar.",
  },
  {
    num: "02",
    icon: CreditCard,
    title: "Completá tus datos",
    desc: "Ingresá tus datos personales y de envío. Podés crear una cuenta para guardarlos y agilizar futuras compras.",
  },
  {
    num: "03",
    icon: CreditCard,
    title: "Elegí cómo pagar",
    desc: "Pagá con MercadoPago (todas las tarjetas, hasta 12 cuotas) o por transferencia bancaria con un 10% de descuento exclusivo.",
  },
  {
    num: "04",
    icon: MessageCircle,
    title: "Coordinamos el envío",
    desc: "Una vez confirmado el pago, te contactamos por WhatsApp para coordinar el envío. Trabajamos con correo y transporte a todo el país.",
  },
  {
    num: "05",
    icon: Package,
    title: "¡Recibís tu pedido!",
    desc: "Tu prenda llega con packaging especial de BALENZA Studio. Si hay algún problema, te asesoramos sin cargo.",
  },
];

const HowToBuyPage = () => {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".htb-step",
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Box minH="80vh">
      {/* Header */}
      <Box py={20} px={{ base: 4, md: 8 }} bg="brand.beige" textAlign="center">
        <VStack spacing={3}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.35em" textTransform="uppercase" color="brand.brown">
            Guía de compra
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "4xl", md: "5xl" }} color="brand.dark" letterSpacing="0.06em">
            ¿Cómo comprar?
          </Text>
          <Text fontFamily="body" fontSize="md" color="brand.muted" maxW="500px" mx="auto" lineHeight={1.7}>
            Comprarte algo lindo tiene que ser fácil. Seguí estos pasos y en minutos tu pedido estará en camino.
          </Text>
        </VStack>
      </Box>

      {/* Pasos */}
      <Box ref={ref} py={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} bg="brand.nude">
        <VStack spacing={0} maxW="720px" mx="auto">
          {STEPS.map((step, i) => (
            <Box key={step.num} className="htb-step" w="100%">
              <HStack spacing={6} align="flex-start" py={8}>
                {/* Número + línea */}
                <VStack spacing={0} align="center" flexShrink={0}>
                  <Box
                    w="52px" h="52px"
                    borderRadius="full"
                    bg="brand.beige"
                    border="0.5px solid rgba(160,120,90,0.25)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <step.icon size={20} color="var(--chakra-colors-brand-brown)" strokeWidth={1.5} />
                  </Box>
                  {i < STEPS.length - 1 && (
                    <Box w="1px" h="40px" bg="rgba(160,120,90,0.2)" mt={2} />
                  )}
                </VStack>

                {/* Contenido */}
                <VStack align="flex-start" spacing={2} flex={1} pt={1}>
                  <HStack spacing={3} align="baseline">
                    <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" color="brand.sand" fontWeight={500}>
                      {step.num}
                    </Text>
                    <Text fontFamily="heading" fontWeight={400} fontSize="xl" color="brand.dark" letterSpacing="0.03em">
                      {step.title}
                    </Text>
                  </HStack>
                  <Text fontFamily="body" fontSize="sm" color="brand.muted" lineHeight={1.8}>
                    {step.desc}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* FAQs */}
      <Box py={{ base: 16, md: 20 }} px={{ base: 4, md: 8 }} bg="brand.beige">
        <VStack spacing={8} maxW="720px" mx="auto">
          <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "2xl", md: "3xl" }} color="brand.dark" textAlign="center">
            Preguntas frecuentes
          </Text>
          {[
            {
              q: "¿Cuánto tarda en llegar mi pedido?",
              a: "El tiempo de envío depende de tu ubicación. Generalmente entre 3 y 7 días hábiles. Te lo confirmamos por WhatsApp.",
            },
            {
              q: "¿Puedo cambiar una prenda si el talle no me queda?",
              a: "Sí. Coordinamos el cambio por WhatsApp. La prenda debe estar sin uso y con etiquetas.",
            },
            {
              q: "¿Cómo sé si hay stock en mi talle?",
              a: "En el modal de cada producto podés ver el stock por talle en tiempo real. Los talles sin stock aparecen tachados.",
            },
            {
              q: "¿El descuento por transferencia es automático?",
              a: "Sí. Al elegir la opción 'Transferencia' en el checkout, el 10% de descuento se aplica automáticamente y se muestra en el resumen.",
            },
          ].map((faq) => (
            <Box key={faq.q} w="100%" borderBottom="0.5px solid rgba(160,120,90,0.15)" pb={6}>
              <Text fontFamily="body" fontWeight={500} fontSize="md" color="brand.dark" mb={2}>
                {faq.q}
              </Text>
              <Text fontFamily="body" fontSize="sm" color="brand.muted" lineHeight={1.8}>
                {faq.a}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default HowToBuyPage;