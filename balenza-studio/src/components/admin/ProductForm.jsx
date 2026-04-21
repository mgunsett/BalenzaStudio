// ═══════════════════════════════════════════════════════════════
// src/components/admin/ProductForm.jsx
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Input, Textarea, Select,
  Button, FormControl, FormLabel, FormErrorMessage,
  Switch, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper,
  SimpleGrid, Divider, Badge, Spinner, Flex,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { createProduct, updateProduct, getProductById } from "../../services/firebase/products";
import { slugify, formatPrice } from "../../utils/formatters";
import { CATEGORIES, SIZES } from "../../utils/constants";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";

const schema = z.object({
  name:             z.string().min(2,  "Nombre requerido"),
  category:         z.string().min(1,  "Categoría requerida"),
  price:            z.coerce.number().positive("Precio inválido"),
  salePrice:        z.coerce.number().optional().nullable(),
  description:      z.string().min(10, "Descripción requerida (mín. 10 caracteres)"),
  shortDescription: z.string().optional(),
  tags:             z.string().optional(),
  featured:         z.boolean().default(false),
  active:           z.boolean().default(true),
});

const fieldStyle = {
  bg: "brand.white",
  border: "0.5px solid",
  borderColor: "rgba(160,120,90,0.3)",
  borderRadius: "lg",
  fontFamily: "body",
  fontSize: "sm",
  color: "brand.dark",
  _placeholder: { color: "brand.muted" },
  _focus: { borderColor: "brand.brown", boxShadow: "0 0 0 1px var(--chakra-colors-brand-brown)", outline: "none" },
  _hover: { borderColor: "brand.sand" },
};

const labelStyle = {
  fontFamily: "body",
  fontSize: "2xs",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "brand.muted",
  mb: 1.5,
};

const ProductForm = () => {
  const { id }     = useParams();   // ← usa "id" como en AdminPage
  const navigate   = useNavigate();
  const isEdit     = !!id;

  const [images,      setImages]      = useState([]);
  const [sizes,       setSizes]       = useState({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });
  const [saving,      setSaving]      = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const {
    register, handleSubmit, control, reset, watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { featured: false, active: true },
  });

  const watchName     = watch("name", "");
  const watchPrice    = watch("price", "");
  const watchSalePrice = watch("salePrice", "");

  // Cargar datos si es edición
  useEffect(() => {
    if (!isEdit) return;
    getProductById(id)
      .then((product) => {
        if (!product) { navigate("/admin/productos"); return; }
        reset({
          name:             product.name,
          category:         product.category,
          price:            product.price,
          salePrice:        product.salePrice ?? "",
          description:      product.description,
          shortDescription: product.shortDescription || "",
          tags:             Array.isArray(product.tags) ? product.tags.join(", ") : "",
          featured:         product.featured || false,
          active:           product.active !== false,
        });
        setImages(product.images || []);
        setSizes(product.sizes || { XS: 0, S: 0, M: 0, L: 0, XL: 0 });
      })
      .finally(() => setLoadingData(false));
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data) => {
    if (!images.length) { toast.error("Agregá al menos una imagen"); return; }
    setSaving(true);
    try {
      const payload = {
        ...data,
        slug:        slugify(data.name),
        salePrice:   data.salePrice || null,
        tags:        data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        images,
        sizes,
      };
      if (isEdit) {
        await updateProduct(id, payload);
        toast.success("Producto actualizado");
      } else {
        await createProduct(payload);
        toast.success("Producto creado");
      }
      navigate("/admin/productos");
    } catch (e) {
      console.error("[ProductForm]", e);
      toast.error("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Flex>
    );
  }

  const totalStockVal = Object.values(sizes).reduce((a, b) => a + b, 0);
  const discountPct   = watchPrice && watchSalePrice && Number(watchSalePrice) < Number(watchPrice)
    ? Math.round((1 - Number(watchSalePrice) / Number(watchPrice)) * 100)
    : null;

  return (
    <VStack align="stretch" spacing={6} maxW="920px">
      {/* Header */}
      <Flex align="center" gap={3} flexWrap="wrap">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={15} />}
          onClick={() => navigate("/admin/productos")}
          fontFamily="body"
          fontSize="xs"
          color="brand.muted"
          _hover={{ color: "brand.dark", bg: "brand.beige" }}
        >
          Volver
        </Button>
        <Divider orientation="vertical" h="20px" borderColor="rgba(160,120,90,0.2)" />
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            {isEdit ? "Editar" : "Nuevo"} producto
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="2xl" color="brand.dark" letterSpacing="0.04em">
            {watchName || (isEdit ? "Producto" : "Sin nombre")}
          </Text>
        </VStack>
        {discountPct && (
          <Badge ml="auto" bg="brand.success" color="white" fontSize="sm" borderRadius="lg" px={3} py={1} fontFamily="body">
            −{discountPct}% OFF
          </Badge>
        )}
      </Flex>

      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>

          {/* ── Columna izquierda ─── */}
          <VStack spacing={4} align="stretch">

            {/* Información */}
            <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
              <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.05em" mb={4}>
                Información
              </Text>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel {...labelStyle}>Nombre *</FormLabel>
                  <Input {...register("name")} placeholder="Ej: Remera Lino Oversized" {...fieldStyle} h="44px" px={4} />
                  {watchName && (
                    <Text fontFamily="body" fontSize="2xs" color="brand.muted" mt={1}>
                      Slug: {slugify(watchName)}
                    </Text>
                  )}
                  <FormErrorMessage fontSize="xs">{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.category}>
                  <FormLabel {...labelStyle}>Categoría *</FormLabel>
                  <Select {...register("category")} {...fieldStyle} h="44px" px={4}>
                    <option value="">Seleccioná una categoría</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.emoji} {c.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage fontSize="xs">{errors.category?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description}>
                  <FormLabel {...labelStyle}>Descripción completa *</FormLabel>
                  <Textarea
                    {...register("description")}
                    placeholder="Descripción detallada del producto..."
                    {...fieldStyle}
                    h="110px"
                    px={4}
                    pt={3}
                    resize="vertical"
                  />
                  <FormErrorMessage fontSize="xs">{errors.description?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Descripción corta (para cards)</FormLabel>
                  <Input {...register("shortDescription")} placeholder="Una línea resumida" {...fieldStyle} h="44px" px={4} />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyle}>Tags (separados por coma)</FormLabel>
                  <Input {...register("tags")} placeholder="lino, oversized, verano" {...fieldStyle} h="44px" px={4} />
                </FormControl>
              </VStack>
            </Box>

            {/* Precios */}
            <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
              <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.05em" mb={4}>
                Precios
              </Text>
              <SimpleGrid columns={2} gap={4}>
                <FormControl isInvalid={!!errors.price}>
                  <FormLabel {...labelStyle}>Precio normal (ARS) *</FormLabel>
                  <Input {...register("price")} type="number" placeholder="15990" {...fieldStyle} h="44px" px={4} />
                  <FormErrorMessage fontSize="xs">{errors.price?.message}</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel {...labelStyle}>Precio oferta (ARS)</FormLabel>
                  <Input {...register("salePrice")} type="number" placeholder="Vacío = sin oferta" {...fieldStyle} h="44px" px={4} />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Opciones */}
            <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
              <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.05em" mb={4}>
                Opciones
              </Text>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <VStack align="flex-start" spacing={0}>
                    <Text fontFamily="body" fontSize="sm" color="brand.dark">Producto activo</Text>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Visible en la tienda</Text>
                  </VStack>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <Switch isChecked={field.value} onChange={field.onChange} colorScheme="green" />
                    )}
                  />
                </HStack>
                <Divider borderColor="rgba(160,120,90,0.12)" />
                <HStack justify="space-between">
                  <VStack align="flex-start" spacing={0}>
                    <Text fontFamily="body" fontSize="sm" color="brand.dark">Producto destacado</Text>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Aparece en el home</Text>
                  </VStack>
                  <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                      <Switch isChecked={field.value} onChange={field.onChange} colorScheme="orange" />
                    )}
                  />
                </HStack>
              </VStack>
            </Box>
          </VStack>

          {/* ── Columna derecha ─── */}
          <VStack spacing={4} align="stretch">

            {/* Stock por talle */}
            <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.05em">
                  Stock por talle
                </Text>
                <Badge
                  bg={totalStockVal > 0 ? "rgba(92,138,110,0.15)" : "rgba(192,57,43,0.12)"}
                  color={totalStockVal > 0 ? "brand.success" : "brand.error"}
                  fontSize="xs"
                  borderRadius="full"
                  px={3}
                  fontFamily="body"
                >
                  Total: {totalStockVal} u.
                </Badge>
              </Flex>
              <SimpleGrid columns={5} gap={3}>
                {SIZES.map((size) => {
                  const val   = sizes[size] ?? 0;
                  const color = val === 0 ? "brand.muted" : val <= 3 ? "orange.500" : "brand.success";
                  return (
                    <VStack key={size} spacing={1}>
                      <Text fontFamily="body" fontSize="xs" fontWeight={500} color={color} letterSpacing="0.08em">
                        {size}
                      </Text>
                      <NumberInput
                        value={val}
                        min={0}
                        max={999}
                        onChange={(_, v) => setSizes((prev) => ({ ...prev, [size]: v || 0 }))}
                        size="sm"
                      >
                        <NumberInputField
                          fontFamily="body"
                          fontSize="sm"
                          textAlign="center"
                          px={2}
                          borderColor="rgba(160,120,90,0.25)"
                          borderRadius="lg"
                          _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                          bg="brand.white"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </VStack>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Imágenes */}
            <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={5}>
              <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" letterSpacing="0.05em" mb={4}>
                Imágenes
              </Text>
              <ImageUploader
                productId={id}
                images={images}
                onChange={setImages}
              />
            </Box>
          </VStack>
        </SimpleGrid>

        {/* Acciones */}
        <HStack justify="flex-end" mt={5} spacing={3}>
          <Button
            variant="ghost"
            size="lg"
            fontSize="xs"
            letterSpacing="0.15em"
            color="brand.muted"
            onClick={() => navigate("/admin/productos")}
            isDisabled={saving}
            _hover={{ color: "brand.dark", bg: "brand.beige" }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            fontSize="xs"
            letterSpacing="0.2em"
            px={8}
            py={6}
            isLoading={saving}
            loadingText="Guardando..."
            leftIcon={<Save size={15} />}
            bg="brand.dark"
            color="brand.white"
            _hover={{ bg: "brand.brown" }}
            borderRadius="lg"
          >
            {isEdit ? "Guardar cambios" : "Crear producto"}
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
};

export default ProductForm;
