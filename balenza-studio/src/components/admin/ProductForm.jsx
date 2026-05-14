// src/components/admin/ProductForm.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Box, VStack, HStack, Text, Input, Textarea, Select,
  Button, FormControl, FormLabel, Switch, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, SimpleGrid, Divider, Badge, Spinner,
  Flex, Table, Thead, Tbody, Tr, Th, Td,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { createProduct, updateProduct, getProductById } from "../../services/firebase/products";
import { slugify, formatPrice } from "../../utils/formatters";
import { buildInventoryPayload, normalizeVariantStock, initVariantStock } from "../../utils/inventory";
import { CATEGORIES, SIZES } from "../../utils/constants";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";

// ── Chip ────────────────────────────────────────────────────────────
const Chip = ({ label, onRemove }) => (
  <HStack
    bg="brand.beige"
    borderRadius="full"
    px={3}
    py={1}
    spacing={1.5}
    cursor="pointer"
    onClick={onRemove}
    _hover={{ bg: "brand.sand" }}
    transition="all 0.15s"
    flexShrink={0}
  >
    <Text fontFamily="body" fontSize="xs" color="brand.dark" userSelect="none">
      {label}
    </Text>
    <X size={10} color="var(--chakra-colors-brand-muted)" />
  </HStack>
);

// ── ChipInput ────────────────────────────────────────────────────────
const ChipInput = ({ chips, onAdd, onRemove, placeholder, fieldStyle }) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = input.trim();
      if (val && !chips.includes(val)) {
        onAdd(val);
        setInput("");
      }
    }
  };

  return (
    <Box>
      {chips.length > 0 && (
        <Flex wrap="wrap" gap={2} mb={2}>
          {chips.map((chip) => (
            <Chip key={chip} label={chip} onRemove={() => onRemove(chip)} />
          ))}
        </Flex>
      )}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        {...fieldStyle}
        h="44px"
        px={4}
      />
    </Box>
  );
};

// ── Estilos reutilizables ────────────────────────────────────────────
const fieldStyle = {
  bg: "brand.white",
  border: "0.5px solid",
  borderColor: "rgba(160,120,90,0.3)",
  borderRadius: "lg",
  fontFamily: "body",
  fontSize: "sm",
  color: "brand.dark",
  _placeholder: { color: "brand.muted" },
  _focus: {
    borderColor: "brand.brown",
    boxShadow: "0 0 0 1px var(--chakra-colors-brand-brown)",
    outline: "none",
  },
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

const cardStyle = {
  bg: "brand.cream",
  borderRadius: "xl",
  border: "0.5px solid rgba(160,120,90,0.15)",
  p: 5,
};

const cardTitle = {
  fontFamily: "heading",
  fontWeight: 300,
  fontSize: "lg",
  color: "brand.dark",
  letterSpacing: "0.05em",
  mb: 4,
};

// ── Componente principal ─────────────────────────────────────────────
const ProductForm = () => {
  const { productId } = useParams();
  const navigate      = useNavigate();
  const isEdit        = !!productId;

  // ── Form state ───────────────────────────────────────────────────
  const [name,             setName]             = useState("");
  const [category,         setCategory]         = useState("");
  const [description,      setDescription]      = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price,            setPrice]            = useState("");
  const [salePrice,        setSalePrice]        = useState("");
  const [featured,         setFeatured]         = useState(false);
  const [active,           setActive]           = useState(true);

  const [colors,       setColors]       = useState([]);
  const [tags,         setTags]         = useState([]);
  const [variantStock, setVariantStock] = useState(() => initVariantStock([]));
  const [images,       setImages]       = useState([]);

  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  // Cargar datos en modo edición
  useEffect(() => {
    if (!isEdit) return;
    getProductById(productId)
      .then((product) => {
        if (!product) { navigate("/admin/productos"); return; }
        setName(product.name || "");
        setCategory(product.category || "");
        setDescription(product.description || "");
        setShortDescription(product.shortDescription || "");
        setPrice(product.price || "");
        setSalePrice(product.salePrice || "");
        setFeatured(product.featured || false);
        setActive(product.active !== false);
        setColors(product.colors || []);
        setTags(Array.isArray(product.tags) ? product.tags : []);
        setImages(product.images || []);
        const vs = normalizeVariantStock(product, product.colors || []);
        setVariantStock(vs);
      })
      .finally(() => setLoadingData(false));
  }, [productId, isEdit, navigate]);

  // ── Manejo de colores (chips que generan columnas del grid) ───────
  const addColor = (val) => {
    const newColors = [...colors, val];
    setColors(newColors);
    setVariantStock((prev) => {
      const next = {};
      SIZES.forEach((size) => {
        next[size] = { ...(prev[size] || {}) };
        if (!(val in next[size])) next[size][val] = 0;
        // Si antes solo tenía __default, eliminar esa columna
        if (next[size]["__default"] !== undefined && newColors.length === 1) {
          delete next[size]["__default"];
        }
      });
      return next;
    });
  };

  const removeColor = (val) => {
    const newColors = colors.filter((c) => c !== val);
    setColors(newColors);
    setVariantStock((prev) => {
      const next = {};
      SIZES.forEach((size) => {
        next[size] = { ...(prev[size] || {}) };
        delete next[size][val];
        // Si quedó sin columnas, volver a __default
        if (newColors.length === 0 && !next[size]["__default"]) {
          next[size]["__default"] = 0;
        }
      });
      return next;
    });
  };

  // ── Columnas activas del grid ────────────────────────────────────
  const colKeys = useMemo(
    () => (colors.length > 0 ? colors : ["__default"]),
    [colors]
  );

  // ── Stock total derivado ─────────────────────────────────────────
  const totalStock = useMemo(
    () =>
      SIZES.reduce((t, size) =>
        t + colKeys.reduce((s, c) => s + (variantStock[size]?.[c] || 0), 0),
        0
      ),
    [variantStock, colKeys]
  );

  // ── Descuento ───────────────────────────────────────────────────
  const discountPct = useMemo(() => {
    const p = Number(price);
    const sp = Number(salePrice);
    if (p > 0 && sp > 0 && sp < p) return Math.round((1 - sp / p) * 100);
    return null;
  }, [price, salePrice]);

  // ── Validación ───────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!name.trim())        e.name        = "El nombre es requerido";
    if (!category)           e.category    = "La categoría es requerida";
    if (!description.trim()) e.description = "La descripción es requerida";
    if (!price || Number(price) <= 0) e.price = "El precio debe ser mayor a 0";
    if (!images.length)      e.images      = "Agregá al menos una imagen";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Completá los campos requeridos");
      return;
    }
    setSaving(true);
    try {
      const { variantStock: vs, sizes } = buildInventoryPayload(variantStock);
      const payload = {
        name:             name.trim(),
        slug:             slugify(name.trim()),
        category,
        description:      description.trim(),
        shortDescription: shortDescription.trim(),
        price:            Number(price),
        salePrice:        salePrice && Number(salePrice) > 0 ? Number(salePrice) : null,
        featured,
        active,
        tags,
        colors,
        variantStock:     vs,
        sizes,
        images,
      };
      if (isEdit) {
        await updateProduct(productId, payload);
        toast.success("Producto actualizado");
      } else {
        await createProduct(payload);
        toast.success("Producto creado");
      }
      navigate("/admin/productos");
    } catch (err) {
      console.error("[ProductForm]", err);
      toast.error(err.message || "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Flex>
    );
  }

  return (
    <VStack align="stretch" spacing={6} maxW="980px">

      {/* Header */}
      <Flex align="center" gap={3} flexWrap="wrap">
        <Button
          variant="ghost" size="sm"
          leftIcon={<ArrowLeft size={15} />}
          onClick={() => navigate("/admin/productos")}
          fontFamily="body" fontSize="xs" color="brand.muted"
          _hover={{ color: "brand.dark", bg: "brand.beige" }}
        >
          Volver
        </Button>
        <Box h="20px" w="0.5px" bg="rgba(160,120,90,0.2)" />
        <VStack align="flex-start" spacing={0}>
          <Text
            fontFamily="body" fontSize="2xs" letterSpacing="0.25em"
            textTransform="uppercase" color="brand.brown"
          >
            {isEdit ? "Editar" : "Nuevo"} producto
          </Text>
          <Text
            fontFamily="heading" fontWeight={300} fontSize="2xl"
            color="brand.dark" letterSpacing="0.04em"
          >
            {name || (isEdit ? "Producto" : "Sin nombre")}
          </Text>
        </VStack>
        {discountPct && (
          <Badge
            ml="auto" bg="brand.success" color="white"
            fontSize="sm" borderRadius="lg" px={3} py={1} fontFamily="body"
          >
            −{discountPct}% OFF
          </Badge>
        )}
      </Flex>

      <Box as="form" onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>

          {/* ── Columna izquierda ──────────────────────────────── */}
          <VStack spacing={4} align="stretch">

            {/* Card Información */}
            <Box {...cardStyle}>
              <Text {...cardTitle}>Información</Text>
              <VStack spacing={4}>

                {/* Nombre */}
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel {...labelStyle}>Nombre *</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Remera Lino Oversized"
                    {...fieldStyle} h="44px" px={4}
                  />
                  {name && (
                    <Text fontFamily="body" fontSize="2xs" color="brand.muted" mt={1}>
                      slug: {slugify(name)}
                    </Text>
                  )}
                  {errors.name && (
                    <Text fontFamily="body" fontSize="xs" color="brand.error" mt={1}>
                      {errors.name}
                    </Text>
                  )}
                </FormControl>

                {/* Categoría */}
                <FormControl isInvalid={!!errors.category}>
                  <FormLabel {...labelStyle}>Categoría *</FormLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    {...fieldStyle} h="44px"
                  >
                    <option value="">Seleccioná una categoría</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.emoji} {c.label}
                      </option>
                    ))}
                  </Select>
                  {errors.category && (
                    <Text fontFamily="body" fontSize="xs" color="brand.error" mt={1}>
                      {errors.category}
                    </Text>
                  )}
                </FormControl>

                {/* Descripción */}
                <FormControl isInvalid={!!errors.description}>
                  <FormLabel {...labelStyle}>Descripción larga *</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción detallada del producto..."
                    {...fieldStyle}
                    h="110px" px={4} pt={3} resize="vertical"
                  />
                  {errors.description && (
                    <Text fontFamily="body" fontSize="xs" color="brand.error" mt={1}>
                      {errors.description}
                    </Text>
                  )}
                </FormControl>

                {/* Descripción corta */}
                <FormControl>
                  <FormLabel {...labelStyle}>Descripción corta (para cards)</FormLabel>
                  <Input
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Una línea resumida"
                    {...fieldStyle} h="44px" px={4}
                  />
                </FormControl>

                {/* Tags */}
                <FormControl>
                  <FormLabel {...labelStyle}>Tags (Enter para agregar)</FormLabel>
                  <ChipInput
                    chips={tags}
                    onAdd={(v) => setTags((prev) => [...prev, v])}
                    onRemove={(v) => setTags((prev) => prev.filter((t) => t !== v))}
                    placeholder="lino, oversized, verano..."
                    fieldStyle={fieldStyle}
                  />
                </FormControl>

                {/* Colores */}
                <FormControl>
                  <FormLabel {...labelStyle}>
                    Colores — definen columnas del stock (Enter para agregar)
                  </FormLabel>
                  <ChipInput
                    chips={colors}
                    onAdd={addColor}
                    onRemove={removeColor}
                    placeholder="Rojo, Azul, Negro..."
                    fieldStyle={fieldStyle}
                  />
                  <Text fontFamily="body" fontSize="2xs" color="brand.muted" mt={1}>
                    Sin colores = columna única de stock
                  </Text>
                </FormControl>

              </VStack>
            </Box>

            {/* Card Precios */}
            <Box {...cardStyle}>
              <Text {...cardTitle}>Precios</Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                <FormControl isInvalid={!!errors.price}>
                  <FormLabel {...labelStyle}>Precio base (ARS) *</FormLabel>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15990"
                    {...fieldStyle} h="44px" px={4}
                  />
                  {errors.price && (
                    <Text fontFamily="body" fontSize="xs" color="brand.error" mt={1}>
                      {errors.price}
                    </Text>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel {...labelStyle}>Precio de oferta (ARS)</FormLabel>
                  <Input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Vacío = sin oferta"
                    {...fieldStyle} h="44px" px={4}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Card Opciones */}
            <Box {...cardStyle}>
              <Text {...cardTitle}>Opciones</Text>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <VStack align="flex-start" spacing={0}>
                    <Text fontFamily="body" fontSize="sm" color="brand.dark">Producto activo</Text>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Visible en la tienda</Text>
                  </VStack>
                  <Switch
                    isChecked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    colorScheme="green"
                  />
                </HStack>
                <Divider borderColor="rgba(160,120,90,0.12)" />
                <HStack justify="space-between">
                  <VStack align="flex-start" spacing={0}>
                    <Text fontFamily="body" fontSize="sm" color="brand.dark">Producto destacado</Text>
                    <Text fontFamily="body" fontSize="xs" color="brand.muted">Aparece en el home</Text>
                  </VStack>
                  <Switch
                    isChecked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    colorScheme="orange"
                  />
                </HStack>
              </VStack>
            </Box>

          </VStack>

          {/* ── Columna derecha ────────────────────────────────── */}
          <VStack spacing={4} align="stretch">

            {/* Card Stock */}
            <Box {...cardStyle}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text {...cardTitle} mb={0}>Stock por talle y color</Text>
                <Badge
                  bg={totalStock > 0 ? "rgba(92,138,110,0.15)" : "rgba(192,57,43,0.12)"}
                  color={totalStock > 0 ? "brand.success" : "brand.error"}
                  fontSize="xs" borderRadius="full" px={3} fontFamily="body"
                >
                  Total: {totalStock} u.
                </Badge>
              </Flex>

              {colKeys.length === 0 || (colKeys.length === 1 && colKeys[0] === "__default") ? (
                /* Sin colores — columna simple */
                <SimpleGrid columns={{ base: 2, sm: 3 }} gap={3}>
                  {SIZES.map((size) => {
                    const val = variantStock[size]?.["__default"] ?? 0;
                    return (
                      <VStack key={size} spacing={1}>
                        <Text
                          fontFamily="body" fontSize="xs" fontWeight={500}
                          color={val === 0 ? "brand.muted" : val <= 3 ? "orange.500" : "brand.success"}
                          letterSpacing="0.08em"
                        >
                          {size}
                        </Text>
                        <NumberInput
                          value={val}
                          min={0} max={999}
                          onChange={(_, v) =>
                            setVariantStock((prev) => ({
                              ...prev,
                              [size]: { ...prev[size], "__default": Number(v) || 0 },
                            }))
                          }
                          size="sm"
                        >
                          <NumberInputField
                            fontFamily="body" fontSize="sm" textAlign="center"
                            px={2} borderRadius="lg"
                            borderColor="rgba(160,120,90,0.25)"
                            bg="brand.white"
                            _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
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
              ) : (
                /* Con colores — tabla */
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th
                          fontFamily="body" fontSize="2xs" letterSpacing="0.1em"
                          color="brand.muted" borderColor="rgba(160,120,90,0.12)"
                          textTransform="uppercase" py={2}
                        >
                          Talle
                        </Th>
                        {colKeys.map((c) => (
                          <Th
                            key={c}
                            fontFamily="body" fontSize="2xs" letterSpacing="0.1em"
                            color="brand.brown" borderColor="rgba(160,120,90,0.12)"
                            textTransform="uppercase" py={2} isNumeric
                          >
                            {c}
                          </Th>
                        ))}
                        <Th
                          fontFamily="body" fontSize="2xs" letterSpacing="0.1em"
                          color="brand.muted" borderColor="rgba(160,120,90,0.12)"
                          textTransform="uppercase" py={2} isNumeric
                        >
                          Total
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {SIZES.map((size) => {
                        const rowTotal = colKeys.reduce(
                          (s, c) => s + (variantStock[size]?.[c] || 0),
                          0
                        );
                        return (
                          <Tr key={size}>
                            <Td
                              fontFamily="body" fontSize="sm" fontWeight={600}
                              color="brand.dark" borderColor="rgba(160,120,90,0.08)"
                            >
                              {size}
                            </Td>
                            {colKeys.map((color) => (
                              <Td
                                key={color}
                                borderColor="rgba(160,120,90,0.08)"
                                px={2} isNumeric
                              >
                                <NumberInput
                                  value={variantStock[size]?.[color] ?? 0}
                                  min={0} max={999}
                                  onChange={(_, v) =>
                                    setVariantStock((prev) => ({
                                      ...prev,
                                      [size]: {
                                        ...prev[size],
                                        [color]: Number(v) || 0,
                                      },
                                    }))
                                  }
                                  size="xs"
                                  w="64px"
                                >
                                  <NumberInputField
                                    fontFamily="body" fontSize="sm" textAlign="center"
                                    px={1} borderRadius="md"
                                    borderColor="rgba(160,120,90,0.2)"
                                    bg="brand.white"
                                    _focus={{ borderColor: "brand.brown", boxShadow: "none" }}
                                  />
                                </NumberInput>
                              </Td>
                            ))}
                            <Td
                              isNumeric
                              fontFamily="body" fontSize="sm" fontWeight={500}
                              color={rowTotal === 0 ? "brand.muted" : rowTotal <= 3 ? "orange.500" : "brand.success"}
                              borderColor="rgba(160,120,90,0.08)"
                            >
                              {rowTotal}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              )}

              <Divider borderColor="rgba(160,120,90,0.12)" mt={4} mb={2} />
              <Text fontFamily="body" fontSize="xs" color="brand.muted">
                Stock total acumulado: <strong>{totalStock} unidades</strong>
              </Text>
            </Box>

            {/* Card Imágenes */}
            <Box {...cardStyle}>
              <Text {...cardTitle}>Imágenes</Text>
              {errors.images && (
                <Text fontFamily="body" fontSize="xs" color="brand.error" mb={3}>
                  {errors.images}
                </Text>
              )}
              <ImageUploader
                productId={productId}
                images={images}
                onChange={setImages}
              />
            </Box>

          </VStack>
        </SimpleGrid>

        {/* Acciones */}
        <HStack justify="flex-end" mt={6} spacing={3} flexWrap="wrap">
          <Button
            variant="ghost" size="lg" fontSize="xs" letterSpacing="0.15em"
            color="brand.muted" w={{ base: "100%", sm: "auto" }}
            onClick={() => navigate("/admin/productos")}
            isDisabled={saving}
            _hover={{ color: "brand.dark", bg: "brand.beige" }}
          >
            Cancelar
          </Button>
          <Button
            type="submit" size="lg" fontSize="xs" letterSpacing="0.2em"
            px={8} py={6} w={{ base: "100%", sm: "auto" }}
            isLoading={saving} loadingText="Guardando..."
            leftIcon={<Save size={15} />}
            bg="brand.dark" color="brand.white"
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
