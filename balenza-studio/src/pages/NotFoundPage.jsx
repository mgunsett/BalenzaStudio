import { Box, VStack, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      bg="brand.nude"
    >
      <VStack spacing={6} textAlign="center">
        <Text
          fontFamily="heading"
          fontWeight={300}
          fontSize={{ base: "6xl", md: "9xl" }}
          color="brand.sand"
          letterSpacing="0.1em"
          lineHeight={1}
        >
          404
        </Text>
        <VStack spacing={2}>
          <Text fontFamily="heading" fontWeight={300} fontSize="2xl" color="brand.dark">
            Página no encontrada
          </Text>
          <Text fontFamily="body" fontSize="sm" color="brand.muted" maxW="340px">
            La página que buscás no existe o fue movida. Volvé al inicio para seguir explorando.
          </Text>
        </VStack>
        <Button variant="outline" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFoundPage;
