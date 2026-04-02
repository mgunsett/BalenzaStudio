import { useState } from "react";
import { Box, Image, HStack, Flex } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({ images = [], name }) => {
  const [main, setMain]       = useState(0);
  const [zoomed, setZoomed]   = useState(false);

  const prev = () => setMain((m) => (m - 1 + images.length) % images.length);
  const next = () => setMain((m) => (m + 1) % images.length);

  return (
    <Box>
      {/* Imagen principal */}
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="lg"
        bg="brand.beige"
        h={{ base: "380px", md: "520px" }}
        cursor={zoomed ? "zoom-out" : "zoom-in"}
        onClick={() => setZoomed(!zoomed)}
      >
        <Image
          src={images[main] || `https://placehold.co/600x700/EDE0D4/7A6555?text=${name}`}
          alt={`${name} - foto ${main + 1}`}
          w="100%" h="100%"
          objectFit="cover"
          transform={zoomed ? "scale(1.6)" : "scale(1)"}
          transition="transform 0.4s ease"
          objectPosition={zoomed ? "center center" : "center top"}
        />
        {images.length > 1 && (
          <>
            <Box
              position="absolute" left={3} top="50%" transform="translateY(-50%)"
              w="36px" h="36px" borderRadius="full"
              bg="rgba(253,250,247,0.8)" backdropFilter="blur(6px)"
              display="flex" alignItems="center" justifyContent="center"
              cursor="pointer" onClick={(e) => { e.stopPropagation(); prev(); }}
              _hover={{ bg: "brand.white" }}
            >
              <ChevronLeft size={16} color="var(--chakra-colors-brand-dark)" />
            </Box>
            <Box
              position="absolute" right={3} top="50%" transform="translateY(-50%)"
              w="36px" h="36px" borderRadius="full"
              bg="rgba(253,250,247,0.8)" backdropFilter="blur(6px)"
              display="flex" alignItems="center" justifyContent="center"
              cursor="pointer" onClick={(e) => { e.stopPropagation(); next(); }}
              _hover={{ bg: "brand.white" }}
            >
              <ChevronRight size={16} color="var(--chakra-colors-brand-dark)" />
            </Box>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      {images.length > 1 && (
        <HStack mt={3} spacing={2} overflowX="auto" pb={1}>
          {images.map((img, i) => (
            <Box
              key={i}
              flexShrink={0}
              w="72px" h="90px"
              borderRadius="md"
              overflow="hidden"
              border="1.5px solid"
              borderColor={main === i ? "brand.brown" : "transparent"}
              opacity={main === i ? 1 : 0.6}
              cursor="pointer"
              onClick={() => setMain(i)}
              transition="all 0.2s"
              _hover={{ opacity: 1 }}
            >
              <Image src={img} alt="" w="100%" h="100%" objectFit="cover" />
            </Box>
          ))}
        </HStack>
      )}
    </Box>
  );
};

export default ImageGallery;