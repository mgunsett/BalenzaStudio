import { Box, Flex, Text, HStack } from "@chakra-ui/react";
import { Truck, CreditCard } from "lucide-react";

const MESSAGES = [
  { icon: Truck, text: "Envíos a todo el país" },
  { icon: CreditCard, text: "3 cuotas sin interés" },
  { icon: Truck, text: "Cambios sin problema" },
];

const TopBar = () => (
  <Box
    bg="brand.dark"
    color="brand.white"
    py={2}
    px={4}
    position="fixed"
    top={0}
    left={0}
    right={0}
    zIndex={1001}
  >
    <Flex justify="center" align="center" gap={{ base: 4, md: 8 }} wrap="wrap">
      {MESSAGES.map(({ icon: Icon, text }, i) => (
        <HStack key={i} spacing={2}>
          <Icon size={13} strokeWidth={1.8} />
          <Text fontFamily="body" fontSize={{ base: "10px", md: "xs" }} letterSpacing="0.1em">
            {text}
          </Text>
        </HStack>
      ))}
    </Flex>
  </Box>
);

export default TopBar;
