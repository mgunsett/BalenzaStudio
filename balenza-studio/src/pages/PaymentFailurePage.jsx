import { Box, VStack, Text, Button, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center" px={4}>
      <VStack spacing={6} textAlign="center" maxW="480px">
        <XCircle size={72} color="var(--chakra-colors-brand-error)" strokeWidth={1} />
        <VStack spacing={2}>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">El pago no se completó</Text>
          <Text fontFamily="body" fontSize="md" color="brand.muted" lineHeight={1.7}>
            Hubo un problema con tu pago. No se realizó ningún cobro.
            Podés intentarlo de nuevo.
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button variant="outline" onClick={() => navigate("/checkout")}>Reintentar</Button>
          <Button variant="ghost" color="brand.muted" onClick={() => navigate("/")}>Ir al inicio</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PaymentFailurePage;