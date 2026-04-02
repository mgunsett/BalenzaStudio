import {
  Box, Grid, VStack, HStack, Text, Link, Divider, Flex,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import Logo from "../ui/Logo";
import { SOCIAL_LINKS, CATEGORIES } from "../../utils/constants";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box bg="brand.dark" color="brand.cream" py={16} px={{ base: 6, md: 12 }}>
      <Grid
        templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }}
        gap={10}
        maxW="1200px"
        mx="auto"
        mb={10}
      >
        {/* Marca */}
        <VStack align="flex-start" spacing={4}>
          <Box filter="invert(1) sepia(1) saturate(0.3) brightness(1.5)">
            <Logo size="md" />
          </Box>
          <Text fontFamily="body" fontSize="sm" color="rgba(237,224,212,0.6)" lineHeight={1.8} maxW="280px">
            Moda femenina con carácter. Prendas diseñadas para acompañarte en cada momento con elegancia y confort.
          </Text>
          <HStack spacing={3} pt={2}>
            {[
              { href: SOCIAL_LINKS.instagram, Icon: Instagram },
              { href: SOCIAL_LINKS.facebook,  Icon: Facebook  },
            ].map(({ href, Icon }) => (
              <Link key={href} href={href} isExternal>
                <Flex
                  w="36px" h="36px"
                  borderRadius="full"
                  border="0.5px solid rgba(237,224,212,0.2)"
                  align="center" justify="center"
                  color="rgba(237,224,212,0.6)"
                  _hover={{ color: "brand.sand", borderColor: "brand.sand" }}
                  transition="all 0.2s"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </Flex>
              </Link>
            ))}
          </HStack>
        </VStack>

        {/* Categorías */}
        <VStack align="flex-start" spacing={3}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.sand" mb={1}>
            Tienda
          </Text>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              as={RouterLink}
              to={`/categoria/${cat.slug}`}
              fontFamily="body"
              fontSize="sm"
              color="rgba(237,224,212,0.6)"
              _hover={{ color: "brand.cream" }}
              transition="color 0.2s"
            >
              {cat.label}
            </Link>
          ))}
        </VStack>

        {/* Info */}
        <VStack align="flex-start" spacing={3}>
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.3em" textTransform="uppercase" color="brand.sand" mb={1}>
            Información
          </Text>
          {[
            { label: "¿Cómo comprar?",   to: "/como-comprar" },
            { label: "Mi cuenta",         to: "/mi-cuenta"    },
          ].map((item) => (
            <Link
              key={item.to}
              as={RouterLink}
              to={item.to}
              fontFamily="body"
              fontSize="sm"
              color="rgba(237,224,212,0.6)"
              _hover={{ color: "brand.cream" }}
              transition="color 0.2s"
            >
              {item.label}
            </Link>
          ))}
          <Text fontFamily="body" fontSize="sm" color="rgba(237,224,212,0.6)">
            📍 Argentina
          </Text>
          <Link
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
            isExternal
            fontFamily="body"
            fontSize="sm"
            color="rgba(37,211,102,0.8)"
            _hover={{ color: "wa.green" }}
            transition="color 0.2s"
          >
            📱 WhatsApp
          </Link>
        </VStack>
      </Grid>

      <Divider borderColor="rgba(237,224,212,0.1)" mb={6} />

      <Flex
        maxW="1200px"
        mx="auto"
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={3}
      >
        <Text fontFamily="body" fontSize="xs" color="rgba(237,224,212,0.35)" letterSpacing="0.05em">
          © {year} BALENZA Studio. Todos los derechos reservados.
        </Text>
        <Text fontFamily="body" fontSize="xs" color="rgba(237,224,212,0.25)" letterSpacing="0.05em">
          Pagos procesados por MercadoPago
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;