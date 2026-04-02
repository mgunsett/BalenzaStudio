import { useEffect } from "react";
import { Box, VStack, Text, Button } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center" px={4}>
      <VStack spacing={6} textAlign="center" maxW="480px">
        <CheckCircle size={72} color="var(--chakra-colors-brand-success)" strokeWidth={1} />
        <VStack spacing={2}>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">
            ¡Pago exitoso!
          </Text>
          <Text fontFamily="body" fontSize="md" color="brand.muted" lineHeight={1.7}>
            Tu pedido fue recibido y estamos procesándolo.
            Te enviaremos un email con los detalles.
          </Text>
          {params.get("orderId") && (
            <Text fontFamily="body" fontSize="xs" color="brand.muted" letterSpacing="0.1em">
              Nro. de orden: <strong>{params.get("orderId").slice(0, 8).toUpperCase()}</strong>
            </Text>
          )}
        </VStack>
        <Button variant="outline" onClick={() => navigate("/")}>Seguir comprando</Button>
      </VStack>
    </Box>
  );
};

export default PaymentSuccessPage;