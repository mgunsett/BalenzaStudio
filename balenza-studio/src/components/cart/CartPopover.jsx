import { useRef, useEffect } from "react";
import {
  Popover, PopoverTrigger, PopoverContent, PopoverBody,
  HStack, VStack, Text, Image, Box,
} from "@chakra-ui/react";
import { gsap } from "gsap";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatters";

const CartPopover = ({ children }) => {
  const { lastAdded, clearLastAdded } = useCart();
  const popRef = useRef(null);
  const timer  = useRef(null);

  useEffect(() => {
    if (!lastAdded) return;
    // Auto-cerrar a los 3 segundos
    clearTimeout(timer.current);
    timer.current = setTimeout(() => clearLastAdded(), 3000);
    return () => clearTimeout(timer.current);
  }, [lastAdded, clearLastAdded]);

  return (
    <Popover
      isOpen={!!lastAdded}
      onClose={clearLastAdded}
      placement="bottom-end"
      closeOnBlur={false}
    >
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent
        ref={popRef}
        w="300px"
        bg="brand.white"
        border="0.5px solid rgba(160,120,90,0.2)"
        borderRadius="lg"
        shadow="md"
        _focus={{ outline: "none" }}
      >
        <PopoverBody p={4}>
          {lastAdded && (
            <VStack align="flex-start" spacing={3}>
              <HStack spacing={2}>
                <Box w="8px" h="8px" borderRadius="full" bg="brand.success" />
                <Text fontFamily="body" fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="brand.success" fontWeight={500}>
                  Agregado al carrito
                </Text>
              </HStack>
              <HStack spacing={3} w="100%">
                <Image
                  src={lastAdded.product.images?.[0] || `https://placehold.co/60x75/EDE0D4/7A6555?text=.`}
                  alt={lastAdded.product.name}
                  w="56px" h="70px"
                  objectFit="cover"
                  borderRadius="md"
                  bg="brand.beige"
                />
                <VStack align="flex-start" spacing={0.5} flex={1}>
                  <Text fontFamily="heading" fontSize="md" color="brand.dark" noOfLines={2} lineHeight={1.2}>
                    {lastAdded.product.name}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">
                    Talle {lastAdded.size} · {lastAdded.quantity} unidad{lastAdded.quantity > 1 ? "es" : ""}
                  </Text>
                  <Text fontFamily="body" fontWeight={500} fontSize="sm" color="brand.brown">
                    {formatPrice((lastAdded.product.salePrice || lastAdded.product.price) * lastAdded.quantity)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default CartPopover;