import {
  HStack, VStack, Text, Image, Box, IconButton, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatters";

const CartItem = ({ item }) => {
  const { removeItem, updateQuantity } = useCart();
  const price = item.product.salePrice || item.product.price;
  const maxStock = item.product.sizes?.[item.size] ?? 99;

  return (
    <HStack
      spacing={4}
      py={4}
      borderBottom="0.5px solid rgba(160,120,90,0.12)"
      align="flex-start"
    >
      {/* Imagen */}
      <Image
        src={item.product.images?.[0] || `https://placehold.co/80x100/EDE0D4/7A6555`}
        alt={item.product.name}
        w="80px" h="100px"
        objectFit="cover"
        borderRadius="md"
        flexShrink={0}
        bg="brand.beige"
      />

      {/* Info */}
      <VStack align="flex-start" spacing={1} flex={1}>
        <Text fontFamily="heading" fontSize="lg" color="brand.dark" lineHeight={1.2} noOfLines={2}>
          {item.product.name}
        </Text>
        <Text fontFamily="body" fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="brand.muted">
          Talle: {item.size}
        </Text>

        <HStack justify="space-between" w="100%" pt={2}>
          {/* Cantidad */}
          <NumberInput
            value={item.quantity}
            min={1}
            max={maxStock}
            onChange={(_, val) => updateQuantity(item.key, val)}
            size="sm"
            w="90px"
          >
            <NumberInputField
              fontFamily="body"
              fontSize="sm"
              borderColor="rgba(160,120,90,0.25)"
              borderRadius="sm"
              _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
            />
            <NumberInputStepper>
              <NumberIncrementStepper borderColor="rgba(160,120,90,0.15)" color="brand.muted" />
              <NumberDecrementStepper borderColor="rgba(160,120,90,0.15)" color="brand.muted" />
            </NumberInputStepper>
          </NumberInput>

          {/* Precio */}
          <Text fontFamily="body" fontWeight={500} fontSize="md" color="brand.dark">
            {formatPrice(price * item.quantity)}
          </Text>
        </HStack>
      </VStack>

      {/* Eliminar */}
      <IconButton
        icon={<X size={14} />}
        variant="ghost"
        size="sm"
        borderRadius="full"
        color="brand.muted"
        onClick={() => removeItem(item.key)}
        _hover={{ bg: "brand.beige", color: "brand.dark" }}
        aria-label="Eliminar del carrito"
      />
    </HStack>
  );
};

export default CartItem;