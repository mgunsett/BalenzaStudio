import { useEffect, useRef, useState } from "react";
import { Box, Button, Text, Spinner, VStack } from "@chakra-ui/react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useMercadoPago } from "../../hooks/useMercadoPago";
import { CreditCard } from "lucide-react";

// Inicializar MP UNA sola vez (fuera del componente)
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: "es-AR" });

const MercadoPagoButton = ({ orderData, disabled }) => {
  const { preferenceId, loading, error, createPreference } = useMercadoPago();
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!orderData || initialized.current || disabled) return;
    initialized.current = true;

    createPreference({
      items:   orderData.items,
      payer:   orderData.payer,
      orderId: orderData.orderId,
    }).then(() => setReady(true));
  }, [orderData, disabled]);

  if (error) {
    return (
      <VStack spacing={2}>
        <Text fontFamily="body" fontSize="xs" color="brand.error" textAlign="center">
          Error al cargar el botón de pago. Intentá de nuevo.
        </Text>
        <Button
          variant="ghost"
          size="sm"
          fontSize="xs"
          color="brand.muted"
          onClick={() => {
            initialized.current = false;
            setReady(false);
            createPreference({
              items: orderData.items,
              payer: orderData.payer,
              orderId: orderData.orderId,
            }).then(() => setReady(true));
          }}
        >
          Reintentar
        </Button>
      </VStack>
    );
  }

  return (
    <Box w="100%">
      {loading && !ready && (
        <Box
          w="100%"
          h="50px"
          borderRadius="md"
          bg="mp.blue"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={3}
        >
          <Spinner size="sm" color="white" thickness="1px" />
          <Text fontFamily="body" fontSize="sm" color="white" fontWeight={500}>
            Cargando MercadoPago...
          </Text>
        </Box>
      )}

      {ready && preferenceId && (
        <Box
          sx={{
            // Override de estilos del iframe de MP para que encaje con el diseño
            ".mercadopago-button": {
              borderRadius: "6px !important",
              fontFamily: "'DM Sans', sans-serif !important",
              fontSize: "13px !important",
              fontWeight: "500 !important",
              letterSpacing: "0.02em !important",
              height: "50px !important",
              background: "#009EE3 !important",
              border: "none !important",
            },
          }}
        >
          <Wallet
            initialization={{ preferenceId }}
            customization={{
              texts: { action: "pay", valueProp: "smart_option" },
              visual: { buttonBackground: "default", borderRadius: "6px" },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default MercadoPagoButton;