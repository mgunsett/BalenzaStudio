import { useState } from "react";
import {
  VStack, SimpleGrid, FormControl, FormLabel, Input, Button,
  FormErrorMessage, Alert, AlertDescription, Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "../../services/firebase/auth";

const schema = z.object({
  name:      z.string().min(2, "Requerido"),
  lastName:  z.string().min(2, "Requerido"),
  dni:       z.string().regex(/^\d{7,9}$/, "DNI inválido"),
  email:     z.string().email("Email inválido"),
  password:  z.string().min(6, "Mínimo 6 caracteres"),
  phone:     z.string().optional(),
});

const fieldStyle = {
  bg: "brand.white",
  border: "0.5px solid",
  borderColor: "rgba(160,120,90,0.3)",
  borderRadius: "sm",
  fontFamily: "body",
  fontSize: "sm",
  h: "44px",
  px: 4,
  _placeholder: { color: "brand.muted" },
  _focus: { borderColor: "brand.brown", boxShadow: "0 0 0 1px var(--chakra-colors-brand-brown)", outline: "none" },
};

const RegisterForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await registerUser(data);
      onSuccess?.();
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado");
      } else {
        setError("Error al crear la cuenta. Intentá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} as="form" onSubmit={handleSubmit(onSubmit)} w="100%">
      {error && (
        <Alert status="error" borderRadius="md" bg="rgba(192,57,43,0.1)" border="0.5px solid rgba(192,57,43,0.3)">
          <AlertDescription fontFamily="body" fontSize="sm" color="brand.error">{error}</AlertDescription>
        </Alert>
      )}

      <SimpleGrid columns={2} gap={3} w="100%">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Nombre</FormLabel>
          <Input {...register("name")} placeholder="María" {...fieldStyle} />
          <FormErrorMessage fontSize="xs">{errors.name?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.lastName}>
          <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Apellido</FormLabel>
          <Input {...register("lastName")} placeholder="González" {...fieldStyle} />
          <FormErrorMessage fontSize="xs">{errors.lastName?.message}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>

      <FormControl isInvalid={!!errors.dni}>
        <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>DNI</FormLabel>
        <Input {...register("dni")} placeholder="12345678" {...fieldStyle} />
        <FormErrorMessage fontSize="xs">{errors.dni?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.email}>
        <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Email</FormLabel>
        <Input {...register("email")} type="email" placeholder="vos@email.com" {...fieldStyle} />
        <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.phone}>
        <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Teléfono (opcional)</FormLabel>
        <Input {...register("phone")} placeholder="+54 9 11 1234-5678" {...fieldStyle} />
      </FormControl>

      <FormControl isInvalid={!!errors.password}>
        <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Contraseña</FormLabel>
        <Input {...register("password")} type="password" placeholder="Mínimo 6 caracteres" {...fieldStyle} />
        <FormErrorMessage fontSize="xs">{errors.password?.message}</FormErrorMessage>
      </FormControl>

      <Text fontFamily="body" fontSize="2xs" color="brand.muted" lineHeight={1.6}>
        Al registrarte aceptás recibir comunicaciones de BALENZA Studio relacionadas con tus compras y novedades de la tienda.
      </Text>

      <Button
        type="submit"
        variant="primary"
        w="100%"
        py={6}
        fontSize="xs"
        letterSpacing="0.2em"
        isLoading={loading}
        loadingText="Creando cuenta..."
        mt={2}
      >
        Crear cuenta
      </Button>
    </VStack>
  );
};

export default RegisterForm;