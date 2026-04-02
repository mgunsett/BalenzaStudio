import { Box, VStack, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

const PaymentPendingPage = () => {
  const navigate = useNavigate();
  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center" px={4}>
      <VStack spacing={6} textAlign="center" maxW="480px">
        <Clock size={72} color="var(--chakra-colors-brand-sand)" strokeWidth={1} />
        <VStack spacing={2}>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">Pago pendiente</Text>
          <Text fontFamily="body" fontSize="md" color="brand.muted" lineHeight={1.7}>
            Tu pago está siendo procesado. Te notificaremos por email cuando se acredite.
            Esto puede tardar hasta 72hs según tu banco.
          </Text>
        </VStack>
        <Button variant="outline" onClick={() => navigate("/")}>Ir al inicio</Button>
      </VStack>
    </Box>
  );
};

export default PaymentPendingPage;