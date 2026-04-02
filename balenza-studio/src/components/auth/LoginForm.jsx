import { useState } from "react";
import {
  VStack, FormControl, FormLabel, Input, Button, Text,
  FormErrorMessage, Alert, AlertDescription,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../../services/firebase/auth";

const schema = z.object({
  email:    z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
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

const LoginForm = ({ onSuccess }) => {
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
      await loginUser(data.email, data.password);
      onSuccess?.();
    } catch (e) {
      setError("Email o contraseña incorrectos");
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

      <FormControl isInvalid={!!errors.email}>
        <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>
          Email
        </FormLabel>
        <Input {...register("email")} type="email" placeholder="vos@email.com" {...fieldStyle} />
        <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.password}>
        <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>
          Contraseña
        </FormLabel>
        <Input {...register("password")} type="password" placeholder="••••••••" {...fieldStyle} />
        <FormErrorMessage fontSize="xs">{errors.password?.message}</FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        variant="primary"
        w="100%"
        py={6}
        fontSize="xs"
        letterSpacing="0.2em"
        isLoading={loading}
        loadingText="Ingresando..."
        mt={2}
      >
        Iniciar sesión
      </Button>
    </VStack>
  );
};

export default LoginForm;