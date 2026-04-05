import { useRef, useState } from "react";
import {
  Box, VStack, HStack, Text, Image, IconButton, Progress,
  SimpleGrid, Spinner,
} from "@chakra-ui/react";
import { Upload, X, GripVertical } from "lucide-react";
import { uploadProductImage, deleteImage } from "../../services/firebase/storage";
import toast from "react-hot-toast";

const ImageUploader = ({ productId, images = [], onChange }) => {
  const inputRef            = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const handleFiles = async (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;

    setUploading(true);
    const urls = [];
    try {
      for (const file of valid) {
        const url = await uploadProductImage(
          file,
          productId || `temp-${Date.now()}`,
          (pct) => setProgress(pct)
        );
        urls.push(url);
      }
      onChange([...images, ...urls]);
      toast.success(`${urls.length} imagen${urls.length > 1 ? "es" : ""} subida${urls.length > 1 ? "s" : ""}`);
    } catch (e) {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = async (url, index) => {
    try {
      await deleteImage(url);
    } catch {
      // Puede fallar si la imagen no existe en Storage; igual la removemos del array
    }
    onChange(images.filter((_, i) => i !== index));
    toast.success("Imagen eliminada");
  };

  const moveImage = (from, to) => {
    const arr = [...images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <VStack align="stretch" spacing={4}>
      {/* Drop zone */}
      <Box
        border="1px dashed"
        borderColor={uploading ? "brand.brown" : "rgba(160,120,90,0.35)"}
        borderRadius="lg"
        p={6}
        textAlign="center"
        cursor="pointer"
        bg={uploading ? "rgba(160,120,90,0.04)" : "brand.white"}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        transition="all 0.2s"
        _hover={{ borderColor: "brand.brown", bg: "rgba(160,120,90,0.04)" }}
      >
        {uploading ? (
          <VStack spacing={3}>
            <Spinner size="md" color="brand.brown" thickness="1px" />
            <Text fontFamily="body" fontSize="sm" color="brand.muted">
              Subiendo... {progress}%
            </Text>
            <Progress
              value={progress}
              size="xs"
              w="200px"
              colorScheme="orange"
              borderRadius="full"
              bg="brand.beige"
            />
          </VStack>
        ) : (
          <VStack spacing={2}>
            <Upload size={28} color="var(--chakra-colors-brand-sand)" strokeWidth={1.5} />
            <Text fontFamily="body" fontSize="sm" color="brand.muted">
              Arrastrá imágenes o hacé click para seleccionar
            </Text>
            <Text fontFamily="body" fontSize="2xs" color="brand.muted" letterSpacing="0.1em">
              JPG, PNG, WEBP · Máx. 5MB por imagen
            </Text>
          </VStack>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </Box>

      {/* Preview grid */}
      {images.length > 0 && (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3}>
          {images.map((url, i) => (
            <Box
              key={url}
              position="relative"
              borderRadius="md"
              overflow="hidden"
              border="0.5px solid rgba(160,120,90,0.2)"
              role="group"
            >
              {/* Imagen */}
              <Image
                src={url}
                alt={`Imagen ${i + 1}`}
                w="100%"
                h="120px"
                objectFit="cover"
              />

              {/* Overlay con controles */}
              <Box
                position="absolute"
                inset={0}
                bg="rgba(44,26,14,0.4)"
                opacity={0}
                _groupHover={{ opacity: 1 }}
                transition="opacity 0.2s"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                {/* Mover izquierda */}
                {i > 0 && (
                  <IconButton
                    icon={<GripVertical size={14} />}
                    size="xs"
                    variant="ghost"
                    bg="rgba(253,250,247,0.9)"
                    color="brand.dark"
                    borderRadius="full"
                    onClick={() => moveImage(i, i - 1)}
                    aria-label="Mover"
                    _hover={{ bg: "brand.white" }}
                  />
                )}
                {/* Eliminar */}
                <IconButton
                  icon={<X size={14} />}
                  size="xs"
                  variant="ghost"
                  bg="rgba(253,250,247,0.9)"
                  color="brand.error"
                  borderRadius="full"
                  onClick={() => handleRemove(url, i)}
                  aria-label="Eliminar"
                  _hover={{ bg: "brand.white" }}
                />
              </Box>

              {/* Badge "principal" */}
              {i === 0 && (
                <Box
                  position="absolute"
                  bottom={1} left={1}
                  bg="brand.dark"
                  color="brand.white"
                  fontSize="2xs"
                  fontFamily="body"
                  px={2}
                  py={0.5}
                  borderRadius="sm"
                  letterSpacing="0.1em"
                >
                  Principal
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}

      {images.length > 0 && (
        <Text fontFamily="body" fontSize="2xs" color="brand.muted" letterSpacing="0.05em">
          La primera imagen es la principal. Usá el ícono para reordenar.
        </Text>
      )}
    </VStack>
  );
};

export default ImageUploader;