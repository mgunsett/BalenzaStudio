import {
  VStack, SimpleGrid, Input, Select, FormControl, FormLabel,
  FormErrorMessage, Text, Box,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name:      z.string().min(2, "Nombre requerido"),
  lastName:  z.string().min(2, "Apellido requerido"),
  dni:       z.string().regex(/^\d{7,9}$/, "DNI inválido"),
  email:     z.string().email("Email inválido"),
  phone:     z.string().min(8, "Teléfono requerido"),
  address:   z.string().min(5, "Dirección requerida"),
  city:      z.string().min(2, "Ciudad requerida"),
  province:  z.string().min(2, "Provincia requerida"),
  zip:       z.string().min(4, "Código postal requerido"),
});

export { schema };

const fieldStyle = {
  bg: "brand.white",
  border: "0.5px solid",
  borderColor: "rgba(160,120,90,0.3)",
  borderRadius: "sm",
  fontFamily: "body",
  fontSize: "sm",
  color: "brand.dark",
  px: 4,
  h: "44px",
  _placeholder: { color: "brand.muted" },
  _focus: { borderColor: "brand.brown", boxShadow: "0 0 0 1px var(--chakra-colors-brand-brown)", outline: "none" },
};

const PROVINCES = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba",
  "Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja",
  "Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan",
  "San Luis","Santa Cruz","Santa Fe","Santiago del Estero","Tierra del Fuego","Tucumán",
];

const CheckoutForm = ({ onSubmit, defaultValues }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} w="100%">
      <VStack align="flex-start" spacing={6}>

        <Box>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.brown" mb={1}>
            Datos personales
          </Text>
          <Text fontFamily="body" fontSize="xs" color="brand.muted">
            Necesitamos estos datos para procesar tu pedido
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} w="100%">
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

          <FormControl isInvalid={!!errors.dni}>
            <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>DNI</FormLabel>
            <Input {...register("dni")} placeholder="12345678" {...fieldStyle} />
            <FormErrorMessage fontSize="xs">{errors.dni?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.phone}>
            <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Teléfono</FormLabel>
            <Input {...register("phone")} placeholder="+54 9 11 1234-5678" {...fieldStyle} />
            <FormErrorMessage fontSize="xs">{errors.phone?.message}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <FormControl isInvalid={!!errors.email} w="100%">
          <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Email</FormLabel>
          <Input {...register("email")} type="email" placeholder="vos@email.com" {...fieldStyle} />
          <FormErrorMessage fontSize="xs">{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <Box w="100%">
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.brown" mb={4} mt={2}>
            Datos de envío
          </Text>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.address}>
              <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Dirección</FormLabel>
              <Input {...register("address")} placeholder="Av. Corrientes 1234" {...fieldStyle} />
              <FormErrorMessage fontSize="xs">{errors.address?.message}</FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} w="100%">
              <FormControl isInvalid={!!errors.city}>
                <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Ciudad</FormLabel>
                <Input {...register("city")} placeholder="Buenos Aires" {...fieldStyle} />
                <FormErrorMessage fontSize="xs">{errors.city?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.province}>
                <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Provincia</FormLabel>
                <Select
                  {...register("province")}
                  {...fieldStyle}
                  h="44px"
                >
                  <option value="">Seleccioná</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
                <FormErrorMessage fontSize="xs">{errors.province?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.zip}>
                <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>Cód. Postal</FormLabel>
                <Input {...register("zip")} placeholder="1000" {...fieldStyle} />
                <FormErrorMessage fontSize="xs">{errors.zip?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </Box>

        <Text fontFamily="body" fontSize="xs" color="brand.muted" lineHeight={1.7} pt={2}>
          📦 El costo y tiempo de envío se coordina por WhatsApp una vez confirmado el pago.
          Trabajamos con correo y transporte a todo el país.
        </Text>
      </VStack>
    </Box>
  );
};

export default CheckoutForm;