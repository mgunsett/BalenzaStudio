// src/components/admin/ImageUploader.jsx
import { useRef, useState } from "react";
import {
  Box, VStack, HStack, Text, Image, IconButton,
  Progress, SimpleGrid, Spinner,
} from "@chakra-ui/react";
import { Upload, X, Star } from "lucide-react";
import { uploadProductImage, deleteImage } from "../../services/firebase/storage";
import toast from "react-hot-toast";

const ImageUploader = ({ productId, images = [], onChange }) => {
  const inputRef              = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const handleFiles = async (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;

    setUploading(true);
    setProgress(0);
    const urls = [];
    try {
      for (let i = 0; i < valid.length; i++) {
        const url = await uploadProductImage(
          valid[i],
          productId || `temp-${Date.now()}`,
          (pct) => {
            // progreso por archivo, interpolado al total
            const base = (i / valid.length) * 100;
            setProgress(Math.round(base + pct / valid.length));
          }
        );
        urls.push(url);
      }
      onChange([...images, ...urls]);
      toast.success(`${urls.length} imagen${urls.length > 1 ? "es" : ""} subida${urls.length > 1 ? "s" : ""}`);
    } catch (e) {
      console.error("[ImageUploader]", e);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!uploading) handleFiles(e.dataTransfer.files);
  };

  const handleRemove = async (url, index) => {
    try {
      await deleteImage(url);
    } catch {
      // La imagen puede no existir en Storage; igual la removemos del array
    }
    onChange(images.filter((_, i) => i !== index));
    toast.success("Imagen eliminada");
  };

  const moveToMain = (index) => {
    if (index === 0) return;
    const arr = [...images];
    const [item] = arr.splice(index, 1);
    arr.unshift(item);
    onChange(arr);
    toast.success("Imagen principal actualizada");
  };

  const moveLeft = (index) => {
    if (index === 0) return;
    const arr = [...images];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
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
        cursor={uploading ? "not-allowed" : "pointer"}
        bg={uploading ? "rgba(160,120,90,0.04)" : "brand.white"}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        transition="all 0.2s"
        _hover={!uploading ? { borderColor: "brand.brown", bg: "rgba(160,120,90,0.04)" } : {}}
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
              borderRadius="full"
              bg="brand.beige"
              sx={{ "& > div": { background: "var(--chakra-colors-brand-brown)" } }}
            />
          </VStack>
        ) : (
          <VStack spacing={2}>
            <Upload size={26} color="var(--chakra-colors-brand-sand)" strokeWidth={1.5} />
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

      {/* Grid de previews */}
      {images.length > 0 && (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3}>
          {images.map((url, i) => (
            <Box
              key={`${url}-${i}`}
              position="relative"
              borderRadius="lg"
              overflow="hidden"
              border="0.5px solid"
              borderColor={i === 0 ? "brand.brown" : "rgba(160,120,90,0.2)"}
              role="group"
              transition="border-color 0.2s"
              _hover={{ borderColor: "brand.sand" }}
            >
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
                bg="rgba(44,26,14,0.45)"
                opacity={0}
                _groupHover={{ opacity: 1 }}
                transition="opacity 0.2s"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                {i !== 0 && (
                  <IconButton
                    icon={<Star size={13} />}
                    size="xs"
                    variant="ghost"
                    bg="rgba(253,250,247,0.92)"
                    color="brand.brown"
                    borderRadius="full"
                    onClick={() => moveToMain(i)}
                    aria-label="Hacer principal"
                    title="Hacer imagen principal"
                    _hover={{ bg: "brand.white" }}
                  />
                )}
                {i !== 0 && (
                  <IconButton
                    icon={<span style={{ fontSize: "12px" }}>←</span>}
                    size="xs"
                    variant="ghost"
                    bg="rgba(253,250,247,0.92)"
                    color="brand.muted"
                    borderRadius="full"
                    onClick={() => moveLeft(i)}
                    aria-label="Mover izquierda"
                    _hover={{ bg: "brand.white" }}
                  />
                )}
                <IconButton
                  icon={<X size={13} />}
                  size="xs"
                  variant="ghost"
                  bg="rgba(253,250,247,0.92)"
                  color="brand.error"
                  borderRadius="full"
                  onClick={() => handleRemove(url, i)}
                  aria-label="Eliminar"
                  _hover={{ bg: "brand.white" }}
                />
              </Box>

              {/* Badge "Principal" */}
              {i === 0 && (
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  bg="brand.brown"
                  py={0.5}
                >
                  <Text fontFamily="body" fontSize="2xs" textAlign="center" color="brand.white" letterSpacing="0.1em">
                    Principal
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}

      {images.length > 0 && (
        <Text fontFamily="body" fontSize="2xs" color="brand.muted" letterSpacing="0.05em">
          La primera imagen es la principal. Hover → ★ para hacerla principal, ← para reordenar.
        </Text>
      )}
    </VStack>
  );
};

export default ImageUploader;
