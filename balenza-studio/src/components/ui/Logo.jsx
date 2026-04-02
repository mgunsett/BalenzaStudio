import { VStack, Text } from "@chakra-ui/react";

const Logo = ({ size = "md" }) => {
  const sizes = {
    sm: { main: "18px", sub: "8px" },
    md: { main: "24px", sub: "9px" },
    lg: { main: "32px", sub: "11px" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <VStack spacing={0} align="flex-start" lineHeight={1}>
      <Text
        fontFamily="heading"
        fontWeight={300}
        fontSize={s.main}
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="brand.dark"
        lineHeight={1}
      >
        Balenza
      </Text>
      <Text
        fontFamily="body"
        fontWeight={300}
        fontSize={s.sub}
        letterSpacing="0.35em"
        textTransform="uppercase"
        color="brand.muted"
        lineHeight={1}
        mt="2px"
      >
        Studio
      </Text>
    </VStack>
  );
};

export default Logo;
