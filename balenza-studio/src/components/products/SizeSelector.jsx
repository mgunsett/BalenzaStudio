import { HStack, VStack, Box, Text } from "@chakra-ui/react";
import { SIZES } from "../../utils/constants";

const SizeSelector = ({ sizes = {}, selected, onChange }) => {
  return (
    <VStack align="flex-start" spacing={2} w="100%">
      <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.muted">
        Talle
      </Text>
      <HStack spacing={2} flexWrap="wrap">
        {SIZES.map((size) => {
          const stock    = sizes[size] ?? 0;
          const noStock  = stock === 0;
          const isActive = selected === size;

          return (
            <Box
              key={size}
              w="44px" h="44px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="sm"
              border="1px solid"
              borderColor={isActive ? "brand.dark" : noStock ? "rgba(160,120,90,0.15)" : "rgba(160,120,90,0.3)"}
              bg={isActive ? "brand.dark" : "transparent"}
              color={isActive ? "brand.white" : noStock ? "rgba(122,101,85,0.3)" : "brand.muted"}
              fontSize="xs"
              fontFamily="body"
              letterSpacing="0.05em"
              cursor={noStock ? "not-allowed" : "pointer"}
              position="relative"
              overflow="hidden"
              onClick={() => !noStock && onChange(size)}
              transition="all 0.2s"
              _hover={!noStock && !isActive ? { borderColor: "brand.brown", color: "brand.dark" } : {}}
            >
              {size}
              {/* Línea diagonal para sin stock */}
              {noStock && (
                <Box
                  position="absolute"
                  top="50%" left="50%"
                  w="130%"
                  h="1px"
                  bg="rgba(160,120,90,0.25)"
                  transform="translate(-50%, -50%) rotate(-45deg)"
                />
              )}
            </Box>
          );
        })}
      </HStack>
      {selected && (
        <Text fontSize="2xs" color="brand.brown" letterSpacing="0.1em">
          {sizes[selected] <= 3 && sizes[selected] > 0
            ? `⚠ Solo quedan ${sizes[selected]} unidades`
            : `Talle ${selected} seleccionado`}
        </Text>
      )}
    </VStack>
  );
};

export default SizeSelector;