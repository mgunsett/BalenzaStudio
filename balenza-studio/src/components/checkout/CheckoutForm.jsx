import {
  VStack, SimpleGrid, Input, Select, FormControl, FormLabel,
  FormErrorMessage, Text, Box, HStack, Badge,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SHIPPING_COSTS, NEARBY_CITIES } from "../../utils/constants";
import { formatPrice } from "../../utils/formatters";

const schema = z.object({
  name:      z.string().min(2, "Nombre requerido"),
  lastName:  z.string().min(2, "Apellido requerido"),
  dni:       z.string().regex(/^\d{7,9}$/, "DNI inválido"),
  email:     z.string().email("Email inválido"),
  phone:     z.string().min(8, "Teléfono requerido"),
  address:   z.string().optional(),
  city:      z.string().optional(),
  province:  z.string().optional(),
  zip:       z.string().optional(),
  shippingMethod: z.enum(["local", "delivery"]),
}).superRefine((data, ctx) => {
  if (data.shippingMethod === "delivery") {
    if (!data.address || data.address.trim().length < 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "Dirección requerida" });
    }
    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["city"], message: "Ciudad requerida" });
    }
    if (!data.province || data.province.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["province"], message: "Provincia requerida" });
    }
    if (!data.zip || data.zip.trim().length < 4) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["zip"], message: "Código postal requerido" });
    }
  }
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

const CheckoutForm = ({ onSubmit, onShippingChange, defaultValues }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({ resolver: zodResolver(schema), defaultValues: { shippingMethod: "local", ...defaultValues } });

  const shippingMethod = watch("shippingMethod", "local");
  const addressValue = watch("address", "");
  const cityValue = watch("city", "");
  const provinceValue = watch("province", "");
  const zipValue = watch("zip", "");
  const normalizedCity = cityValue.trim().toUpperCase();
  const isNearbyCity = NEARBY_CITIES.includes(normalizedCity);
  const isDelivery = shippingMethod === "delivery";
  const hasDeliveryData = Boolean(
    addressValue.trim() && cityValue.trim() && provinceValue.trim() && zipValue.trim()
  );

  useEffect(() => {
    if (shippingMethod === "local") {
      if (onShippingChange) onShippingChange("local", 0, "local");
      return;
    }

    if (!hasDeliveryData) {
      if (onShippingChange) onShippingChange("delivery", null, null);
      return;
    }

    const zone = isNearbyCity ? "nearby" : "far";
    const cost = SHIPPING_COSTS[zone] ?? 0;
    if (onShippingChange) onShippingChange("delivery", cost, zone);
  }, [shippingMethod, isNearbyCity, hasDeliveryData, onShippingChange]);

  return (
    <Box as="form" id="checkout-form" onSubmit={handleSubmit(onSubmit)} w="100%">
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
            Forma de entrega
          </Text>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.shippingMethod}>
              <Input type="hidden" {...register("shippingMethod")} />
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3} w="100%">
                <Box
                  role="button"
                  onClick={() => setValue("shippingMethod", "local", { shouldDirty: true })}
                  border="1px solid"
                  borderColor={shippingMethod === "local" ? "brand.dark" : "rgba(160,120,90,0.2)"}
                  bg={shippingMethod === "local" ? "rgba(160,120,90,0.06)" : "white"}
                  borderRadius="lg"
                  p={4}
                  transition="all 0.2s"
                >
                  <HStack spacing={3} align="flex-start">
                    <Box
                      w="10px"
                      h="10px"
                      mt={1}
                      borderRadius="full"
                      border="2px solid"
                      borderColor={shippingMethod === "local" ? "brand.dark" : "rgba(160,120,90,0.3)"}
                      bg={shippingMethod === "local" ? "brand.dark" : "transparent"}
                    />
                    <Box>
                      <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                        Retiro por local
                      </Text>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted">
                        Gratis
                      </Text>
                    </Box>
                  </HStack>
                </Box>

                <Box
                  role="button"
                  onClick={() => setValue("shippingMethod", "delivery", { shouldDirty: true })}
                  border="1px solid"
                  borderColor={shippingMethod === "delivery" ? "brand.dark" : "rgba(160,120,90,0.2)"}
                  bg={shippingMethod === "delivery" ? "rgba(160,120,90,0.06)" : "white"}
                  borderRadius="lg"
                  p={4}
                  transition="all 0.2s"
                >
                  <HStack spacing={3} align="flex-start">
                    <Box
                      w="10px"
                      h="10px"
                      mt={1}
                      borderRadius="full"
                      border="2px solid"
                      borderColor={shippingMethod === "delivery" ? "brand.dark" : "rgba(160,120,90,0.3)"}
                      bg={shippingMethod === "delivery" ? "brand.dark" : "transparent"}
                    />
                    <Box>
                      <Text fontFamily="body" fontSize="sm" fontWeight={600} color="brand.dark">
                        Envío a domicilio
                      </Text>
                      <Text fontFamily="body" fontSize="xs" color="brand.muted">
                        Se calcula según ciudad
                      </Text>
                      {isNearbyCity && (
                        <HStack mt={2} spacing={2} align="center">
                          <Badge colorScheme="green" fontSize="2xs" borderRadius="full" px={2}>
                            Cerca
                          </Badge>
                          <Text fontFamily="body" fontSize="xs" color="brand.muted">
                            {formatPrice(SHIPPING_COSTS.nearby)} en tu zona
                          </Text>
                        </HStack>
                      )}
                    </Box>
                  </HStack>
                </Box>
              </SimpleGrid>
              <FormErrorMessage fontSize="xs">{errors.shippingMethod?.message}</FormErrorMessage>
            </FormControl>

            {isDelivery && (
              <>
                <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.brown" mb={1} mt={2}>
                  Datos de envío
                </Text>
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
              </>
            )}
          </VStack>
        </Box>

        {shippingMethod === "local" ? (
          <Text fontFamily="body" fontSize="xs" color="brand.muted" lineHeight={1.7} pt={2}>
            📍 Te contactaremos por WhatsApp para coordinar el día y horario de retiro en nuestro local.
            <br />
            📦 Los pedidos con retiro por local se procesan en 24/48 hs hábiles.
          </Text>
        ) : (
          <Text fontFamily="body" fontSize="xs" color="brand.muted" lineHeight={1.7} pt={2}>
            📦 El tiempo de envío es de 3 a 4 dias habiles, una vez confirmado el pago.
            Trabajamos con correo y transporte a todo el país.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default CheckoutForm;