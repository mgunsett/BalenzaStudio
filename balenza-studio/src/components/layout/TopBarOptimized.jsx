import { useState, useEffect } from "react";
import { Box, Flex, Text, HStack, Badge } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, CreditCard, RefreshCw, Tag } from "lucide-react";

const MotionFlex = motion(Flex);

const MESSAGES = [
  {
    icon: Tag,
    text: "15% OFF abonando con ",
    highlight: "TRANSFERENCIA O EFECTIVO",
    urgent: true,
    colorText: "brand.dark",
  },
  {
    icon: Truck,
    text: "Envíos gratis en compras mayores a $80.000",
    highlight: null,
    urgent: false,
    colorText: "brand.beige",
  },
  {
    icon: CreditCard,
    text: "Hasta 3 cuotas sin interés con todas las tarjetas",
    highlight: null,
    urgent: false,
    colorText: "brand.beige",
  },
  {
    icon: RefreshCw,
    text: "Cambios y devoluciones gratis por 30 días",
    highlight: null,
    urgent: false,
    colorText: "brand.beige",
  },
];

const TopBarOptimized = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentMessage = MESSAGES[currentIndex];

  return (
    <Box
      bg={currentMessage.urgent ? "brand.brown" : "brand.dark"}
      color="white"
      py={2.5}
      px={4}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1001}
      transition="background 0.3s"
    >
      <Flex
        justify="center"
        align="center"
        minH="24px"
        overflow="hidden"
        position="relative"
      >
        <AnimatePresence mode="wait">
          <MotionFlex
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            align="center"
            gap={2}
          >
            <currentMessage.icon size={14} strokeWidth={2} />
            <Text
              fontFamily="body"
              fontSize={{ base: "xs", md: "sm" }}
              letterSpacing="0.05em"
              fontWeight={currentMessage.urgent ? "600" : "400"}
              color={currentMessage.colorText || "white"}
            >
              {currentMessage.text}
            </Text>
            {currentMessage.highlight && (
              <Badge
                bg="white"
                color="brand.brown"
                px={2}
                py={0.5}
                fontWeight="700"
                fontSize={{ base: "3xs", md: "xs" }}
              >
                {currentMessage.highlight}
              </Badge>
            )}
          </MotionFlex>
        </AnimatePresence>
      </Flex>
    </Box>
  );
};

export default TopBarOptimized;
