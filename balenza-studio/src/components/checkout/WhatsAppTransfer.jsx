import { Box, Button, VStack, HStack, Text, Divider } from "@chakra-ui/react";
import { generateWhatsAppMessage } from "../../utils/whatsappMessage";
import { formatPrice } from "../../utils/formatters";
import { TRANSFER_DISCOUNT } from "../../utils/constants";

const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const WhatsAppTransfer = ({ orderData, disabled }) => {
  const discount      = orderData?.subtotal * TRANSFER_DISCOUNT;
  const transferTotal = orderData?.subtotal - discount;

  const handleClick = () => {
    if (!orderData || disabled) return;
    const url = generateWhatsAppMessage(orderData);
    window.open(url, "_blank");
  };

  return (
    <Box
      border="0.5px solid rgba(37,211,102,0.35)"
      borderRadius="lg"
      overflow="hidden"
      bg="rgba(37,211,102,0.04)"
    >
      {/* Header descuento */}
      <Box bg="rgba(37,211,102,0.12)" px={4} py={3} borderBottom="0.5px solid rgba(37,211,102,0.2)">
        <HStack spacing={2}>
          <Text fontFamily="body" fontSize="xs" letterSpacing="0.05em" color="brand.success" fontWeight={500}>
            🎁 Descuento exclusivo por transferencia
          </Text>
          <Box
            bg="brand.success"
            color="white"
            fontSize="2xs"
            fontFamily="body"
            fontWeight={600}
            px={2}
            py={0.5}
            borderRadius="full"
            letterSpacing="0.05em"
          >
            −10%
          </Box>
        </HStack>
      </Box>

      {/* Contenido */}
      <Box px={4} py={4}>
        <VStack spacing={3}>
          {orderData && (
            <HStack justify="space-between" w="100%">
              <Text fontFamily="body" fontSize="sm" color="brand.muted">
                Total con descuento
              </Text>
              <Text fontFamily="body" fontWeight={600} fontSize="lg" color="brand.success">
                {formatPrice(transferTotal)}
              </Text>
            </HStack>
          )}

          <Button
            w="100%"
            h="50px"
            bg="wa.green"
            color="white"
            borderRadius="md"
            fontFamily="body"
            fontWeight={500}
            fontSize="sm"
            letterSpacing="0.03em"
            leftIcon={<WhatsAppIcon size={18} />}
            onClick={handleClick}
            isDisabled={disabled}
            _hover={{ bg: "wa.greenDark", transform: "translateY(-1px)" }}
            _active={{ transform: "translateY(0)" }}
            transition="all 0.2s"
          >
            Coordinar por WhatsApp
          </Button>

          <Text fontFamily="body" fontSize="2xs" color="brand.muted" textAlign="center" lineHeight={1.6}>
            Te contactamos para confirmar la transferencia y el envío.
            El stock se reserva por 24hs hasta acreditar el pago.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default WhatsAppTransfer;