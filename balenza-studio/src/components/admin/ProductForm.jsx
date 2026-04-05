import { useState, useEffect } from "react";
import {
  VStack, SimpleGrid, HStack, Box, Text, Input, Textarea, Select,
  Button, FormControl, FormLabel, FormErrorMessage, Switch, NumberInput,
  NumberInputField, Divider, Badge,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createProduct, updateProduct, getProductById } from "../../services/firebase/products";
import { slugify } from "../../utils/formatters";
import { CATEGORIES, SIZES } from "../../utils/constants";
import ImageUploader from "./ImageUploader";

const schema = z.object({
  name:             z.string().min(2, "Nombre requerido"),
  category:         z.string().min(1, "Categoría requerida"),
  price:            z.coerce.number().positive("Precio inválido"),
  salePrice:        z.coerce.number().optional().nullable(),
  description:      z.string().min(10, "Descripción requerida"),
  shortDescription: z.string().optional(),
  tags:             z.string().optional(),
  featured:         z.boolean().default(false),
  active:           z.boolean().default(true),
});

const fieldStyle = {
  bg: "brand.white",
  border: "0.5px solid",
  borderColor: "rgba(160,120,90,0.3)",
  borderRadius: "sm",
  fontFamily: "body",
  fontSize: "sm",
  color: "brand.dark",
  _placeholder: { color: "brand.muted" },
  _focus: { borderColor: "brand.brown", boxShadow: "0 0 0 1px var(--chakra-colors-brand-brown)", outline: "none" },
};

const labelStyle = {
  fontFamily: "body",
  fontSize: "2xs",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "brand.muted",
  mb: 1,
};

const ProductForm = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = !!id;

  const [images,  setImages]  = useState([]);
  const [sizes,   setSizes]   = useState({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const {
    register, handleSubmit, control, reset, watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { featured: false, active: true } });

  const watchName = watch("name", "");

  // Cargar producto si es edición
  useEffect(() => {
    if (!isEdit) return;
    getProductById(id).then((product) => {
      if (!product) { navigate("/admin/productos"); return; }
      reset({
        name:             product.name,
        category:         product.category,
        price:            product.price,
        salePrice:        product.salePrice || "",
        description:      product.description,
        shortDescription: product.shortDescription || "",
        tags:             (product.tags || []).join(", "),
        featured:         product.featured || false,
        active:           product.active !== false,
      });
      setImages(product.images || []);
      setSizes(product.sizes || { XS: 0, S: 0, M: 0, L: 0, XL: 0 });
      setLoadingData(false);
    });
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data) => {
    if (!images.length) { toast.error("Agregá al menos una imagen"); return; }
    setLoading(true);
    try {
      const payload = {
        ...data,
        slug:             slugify(data.name),
        salePrice:        data.salePrice || null,
        tags:             data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
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
      toast.error("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box py={20} display="flex" justifyContent="center">
        <Text fontFamily="body" color="brand.muted">Cargando producto...</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={8} maxW="860px">
      {/* Header */}
      <HStack justify="space-between">
        <VStack align="flex-start" spacing={0}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.brown">
            {isEdit ? "Editar" : "Nuevo"} producto
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize="3xl" color="brand.dark">
            {isEdit ? watchName || "Producto" : "Agregar producto"}
          </Text>
        </VStack>
        <Button
          variant="ghost"
          size="sm"
          fontSize="xs"
          color="brand.muted"
          onClick={() => navigate("/admin/productos")}
        >
          ← Volver
        </Button>
      </HStack>

      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch" spacing={6}>

          {/* ── Información básica ────────────────── */}
          <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={6}>
            <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={5}>
              Información básica
            </Text>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel {...labelStyle}>Nombre del producto</FormLabel>
                <Input {...register("name")} placeholder="Remera Lino Oversized" {...fieldStyle} h="44px" px={4} />
                <FormErrorMessage fontSize="xs">{errors.name?.message}</FormErrorMessage>
              </FormControl>

              {watchName && (
                <HStack spacing={2} align="center">
                  <Text fontFamily="body" fontSize="2xs" color="brand.muted" letterSpacing="0.1em">Slug:</Text>
                  <Badge variant="subtle" fontFamily="body" fontSize="2xs">{slugify(watchName)}</Badge>
                </HStack>
              )}

              <FormControl isInvalid={!!errors.category}>
                <FormLabel {...labelStyle}>Categoría</FormLabel>
                <Select {...register("category")} {...fieldStyle} h="44px" px={4}>
                  <option value="">Seleccioná una categoría</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </Select>
                <FormErrorMessage fontSize="xs">{errors.category?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel {...labelStyle}>Descripción completa</FormLabel>
                <Textarea
                  {...register("description")}
                  placeholder="Descripción detallada del producto..."
                  {...fieldStyle}
                  h="120px"
                  px={4}
                  pt={3}
                  resize="vertical"
                />
                <FormErrorMessage fontSize="xs">{errors.description?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Descripción corta (para cards)</FormLabel>
                <Input {...register("shortDescription")} placeholder="Descripción breve para la tarjeta del producto" {...fieldStyle} h="44px" px={4} />
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Tags (separados por coma)</FormLabel>
                <Input {...register("tags")} placeholder="lino, oversized, verano, casual" {...fieldStyle} h="44px" px={4} />
              </FormControl>
            </VStack>
          </Box>

          {/* ── Precios ────────────────────────────── */}
          <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={6}>
            <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={5}>
              Precios
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
              <FormControl isInvalid={!!errors.price}>
                <FormLabel {...labelStyle}>Precio normal (ARS)</FormLabel>
                <Input
                  {...register("price")}
                  type="number"
                  placeholder="15990"
                  {...fieldStyle}
                  h="44px" px={4}
                />
                <FormErrorMessage fontSize="xs">{errors.price?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel {...labelStyle}>Precio oferta (ARS) — opcional</FormLabel>
                <Input
                  {...register("salePrice")}
                  type="number"
                  placeholder="Dejar vacío si no hay oferta"
                  {...fieldStyle}
                  h="44px" px={4}
                />
              </FormControl>
            </SimpleGrid>
          </Box>

          {/* ── Stock por talle ─────────────────────── */}
          <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={6}>
            <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={5}>
              Stock por talle
            </Text>
            <SimpleGrid columns={5} gap={3}>
              {SIZES.map((size) => (
                <VStack key={size} spacing={1}>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted" letterSpacing="0.1em">
                    {size}
                  </Text>
                  <NumberInput
                    value={sizes[size] ?? 0}
                    min={0}
                    max={999}
                    onChange={(_, val) => setSizes((prev) => ({ ...prev, [size]: val || 0 }))}
                    size="sm"
                  >
                    <NumberInputField
                      fontFamily="body"
                      fontSize="sm"
                      textAlign="center"
                      borderColor="rgba(160,120,90,0.25)"
                      borderRadius="sm"
                      px={2}
                      _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                    />
                  </NumberInput>
                </VStack>
              ))}
            </SimpleGrid>
            <Text fontFamily="body" fontSize="2xs" color="brand.muted" mt={3} letterSpacing="0.05em">
              Total: {Object.values(sizes).reduce((a, b) => a + b, 0)} unidades
            </Text>
          </Box>

          {/* ── Imágenes ─────────────────────────────── */}
          <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={6}>
            <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={5}>
              Imágenes
            </Text>
            <ImageUploader
              productId={id}
              images={images}
              onChange={setImages}
            />
          </Box>

          {/* ── Opciones ─────────────────────────────── */}
          <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={6}>
            <Text fontFamily="heading" fontWeight={300} fontSize="lg" color="brand.dark" mb={5}>
              Opciones
            </Text>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <VStack align="flex-start" spacing={0}>
                  <Text fontFamily="body" fontSize="sm" color="brand.dark">Producto activo</Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">Visible en la tienda</Text>
                </VStack>
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      isChecked={field.value}
                      onChange={field.onChange}
                      colorScheme="orange"
                    />
                  )}
                />
              </HStack>
              <Divider borderColor="rgba(160,120,90,0.12)" />
              <HStack justify="space-between">
                <VStack align="flex-start" spacing={0}>
                  <Text fontFamily="body" fontSize="sm" color="brand.dark">Producto destacado</Text>
                  <Text fontFamily="body" fontSize="xs" color="brand.muted">Aparece en el home y sección destacados</Text>
                </VStack>
                <Controller
                  name="featured"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      isChecked={field.value}
                      onChange={field.onChange}
                      colorScheme="orange"
                    />
                  )}
                />
              </HStack>
            </VStack>
          </Box>

          {/* Acciones */}
          <HStack justify="flex-end" spacing={3}>
            <Button
              variant="ghost"
              size="lg"
              fontSize="xs"
              letterSpacing="0.15em"
              color="brand.muted"
              onClick={() => navigate("/admin/productos")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fontSize="xs"
              letterSpacing="0.2em"
              px={8}
              py={6}
              isLoading={loading}
              loadingText="Guardando..."
            >
              {isEdit ? "Guardar cambios" : "Crear producto"}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default ProductForm;