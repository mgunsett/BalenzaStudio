import {
  Box, Grid, VStack, HStack, Text, Link, Divider, Flex, Image,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { SOCIAL_LINKS, CATEGORIES } from "../../utils/constants";
import { LiaLaptopCodeSolid } from "react-icons/lia";

const Instagram = ({ size = 16, strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/>
  </svg>
);

const Facebook = ({ size = 16, strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

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
            <Image src={logo} alt="Balenza Studio" w={{ base: "100px", md: "120px" }} h="auto" />
          </Box>
          
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
          <Text fontFamily="body" fontSize={{ base: "2xs", md: "xs" }} letterSpacing="0.3em" textTransform="uppercase" color="brand.sand" mb={1}>
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
          <Text fontFamily="body" fontSize={{ base: "2xs", md: "xs" }} letterSpacing="0.3em" textTransform="uppercase" color="brand.sand" mb={1}>
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
            Santa Fe, Argentina
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
            +54 342 5957-222
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
        <Text fontSize="12px" color="rgba(255,255,255,0.3)" letterSpacing="0.05em">
            Desarrollo Web -{' '} 
            <Link 
            href="https://matiasgunsett.netlify.app/" 
            isExternal 
            color="#2D5A47" 
            _hover={{ borderColor: '#e8d5a370', color: '#e8d5a380' }}
            transition="color 0.3s"
            >
              Matias Gunsett <LiaLaptopCodeSolid style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle', fontSize: '20px', color: '#E8D5A3' }} />
            </Link>
          </Text>
      </Flex>
    </Box>
  );
};

export default Footer;