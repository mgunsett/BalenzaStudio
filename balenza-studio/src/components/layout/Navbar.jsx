import { useRef, useEffect } from "react";
import {
  Box, Flex, HStack, Text, IconButton, Badge, Button,
  Menu, MenuButton, MenuList, MenuItem, useDisclosure,
  Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerCloseButton,
  VStack, Divider, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Image,
} from "@chakra-ui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, ChevronDown, Menu as MenuIcon } from "lucide-react";
import { gsap } from "gsap";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../utils/constants";
import logo from "../../assets/images/logo.png";
import CartPopover from "../cart/CartPopover";
import AuthModal from "../auth/AuthModal";

const Navbar = () => {
  const navRef  = useRef(null);
  const { scrolled } = useScrollPosition(60);
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authModal = useDisclosure();
  const mobileMenu = useDisclosure();

  // Animación de entrada GSAP
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  // Transición de fondo al hacer scroll
  useEffect(() => {
    gsap.to(navRef.current, {
      backgroundColor: scrolled ? "rgba(253,250,247,0.95)" : "rgba(253,250,247,0)",
      backdropFilter:  scrolled ? "blur(12px)" : "blur(0px)",
      boxShadow:       scrolled ? "0 1px 20px rgba(44,26,14,0.08)" : "none",
      duration: 0.4,
      ease: "power2.out",
    });
  }, [scrolled]);

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Box
        ref={navRef}
        position="fixed"
        top={0} left={0} right={0}
        zIndex={1000}
        px={{ base: 4, md: 8, lg: 12 }}
        py={4}
        transition="all 0.3s"
      >
        <Flex align="center" justify="space-between" maxW="1400px" mx="auto">

          {/* Logo */}
          <Link to="/">
            <Image src={logo} alt="Balenza Studio" w={{ base: "100px", md: "120px" }} h="auto" />
          </Link>

          {/* Nav links — desktop */}
          <HStack spacing={8} display={{ base: "none", lg: "flex" }}>

            {/* Productos con dropdown */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<ChevronDown size={14} />}
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
                color="brand.muted"
                fontWeight={400}
                _hover={{ color: "brand.dark", bg: "transparent" }}
              >
                Productos
              </MenuButton>
              <MenuList minW="160px">
                {CATEGORIES.map((cat) => (
                  <MenuItem
                    key={cat.slug}
                    onClick={() => navigate(`/categoria/${cat.slug}`)}
                    fontSize="sm"
                  >
                    {cat.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Button
              variant="ghost"
              fontSize="xs"
              letterSpacing="wider"
              textTransform="uppercase"
              color="brand.muted"
              fontWeight={400}
              onClick={() => scrollToSection("about")}
              _hover={{ color: "brand.dark", bg: "transparent" }}
            >
              Nosotros
            </Button>

            <Button
              variant="ghost"
              fontSize="xs"
              letterSpacing="wider"
              textTransform="uppercase"
              color="brand.muted"
              fontWeight={400}
              onClick={() => navigate("/como-comprar")}
              _hover={{ color: "brand.dark", bg: "transparent" }}
            >
              ¿Cómo comprar?
            </Button>

            <Button
              variant="ghost"
              fontSize="xs"
              letterSpacing="wider"
              textTransform="uppercase"
              color="brand.muted"
              fontWeight={400}
              onClick={() => scrollToSection("contacto")}
              _hover={{ color: "brand.dark", bg: "transparent" }}
            >
              Contacto
            </Button>
          </HStack>

          {/* Íconos derecha */}
          <HStack spacing={3}>
            {/* Carrito */}
            <CartPopover>
              <Box position="relative" cursor="pointer" onClick={() => navigate("/carrito")}>
                <ShoppingBag size={22} color="var(--chakra-colors-brand-dark)" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <Badge
                    position="absolute" top="-8px" right="-8px"
                    bg="brand.brown" color="brand.white"
                    borderRadius="full" minW="18px" h="18px"
                    display="flex" alignItems="center" justifyContent="center"
                    fontSize="2xs" fontWeight={500}
                  >
                    {totalItems}
                  </Badge>
                )}
              </Box>
            </CartPopover>

            {/* Usuario */}
            <IconButton
              display={{ base: "none", lg: "inline-flex"  }}
              icon={<User size={22} strokeWidth={1.5} />}
              variant="ghost"
              color="brand.dark"
              aria-label="Mi cuenta"
              onClick={isAuthenticated ? () => navigate("/mi-cuenta") : authModal.onOpen}
              _hover={{ bg: "brand.beige" }}
            />

            {isAdmin && (
              <Button
                display={{ base: "none", lg: "inline-flex"  }}
                variant="outline"
                size="sm"
                fontSize="2xs"
                onClick={() => navigate("/admin")}
              >
                Admin
              </Button>
            )}

            {/* Hamburguesa — mobile */}
            <IconButton
              icon={<MenuIcon size={24} strokeWidth={1.5} />}
              variant="ghost"
              color="brand.dark"
              aria-label="Menú"
              display={{ base: "flex", lg: "none" }}
              onClick={mobileMenu.onOpen}
              _hover={{ bg: "brand.beige" }}
            />
          </HStack>
        </Flex>
      </Box>

      {/* Drawer mobile */}
      <Drawer
        isOpen={mobileMenu.isOpen}
        onClose={mobileMenu.onClose}
        placement="right"
        size="xs"
      >
        <DrawerOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <DrawerContent bg="brand.white" pt={4}>
          <DrawerCloseButton
            color="brand.dark"
            top={5}
            right={4}
            _hover={{ bg: "brand.beige" }}
          />

          {/* Logo en drawer */}
          <Box px={6} pt={2} pb={4}>
            <Link to="/" onClick={mobileMenu.onClose}>
              <Image src={logo} alt="Balenza Studio" w={{ base: "100px", md: "120px" }} h="auto" />
            </Link>
          </Box>

          <Divider borderColor="brand.beige" />

          <DrawerBody px={6} pt={6}>
            <VStack align="stretch" spacing={0}>

              {/* Productos accordion */}
              <Accordion allowToggle>
                <AccordionItem border="none">
                  <AccordionButton
                    px={0} py={3}
                    _hover={{ bg: "transparent" }}
                  >
                    <Text
                      flex="1" textAlign="left"
                      fontSize="xs" letterSpacing="wider"
                      textTransform="uppercase" color="brand.muted"
                      fontWeight={400}
                    >
                      Productos
                    </Text>
                    <AccordionIcon color="brand.muted" />
                  </AccordionButton>
                  <AccordionPanel pb={2} px={0}>
                    <VStack align="stretch" spacing={0} pl={3}>
                      {CATEGORIES.map((cat) => (
                        <Button
                          key={cat.slug}
                          variant="ghost"
                          justifyContent="flex-start"
                          fontSize="sm"
                          fontWeight={400}
                          color="brand.muted"
                          px={0} py={2}
                          h="auto"
                          _hover={{ color: "brand.dark", bg: "transparent" }}
                          onClick={() => {
                            navigate(`/categoria/${cat.slug}`);
                            mobileMenu.onClose();
                          }}
                        >
                          {cat.emoji} {cat.label}
                        </Button>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>

              <Divider borderColor="brand.beige" />

              <Button
                variant="ghost"
                justifyContent="flex-start"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
                color="brand.muted"
                fontWeight={400}
                px={0} py={3}
                h="auto"
                _hover={{ color: "brand.dark", bg: "transparent" }}
                onClick={() => {
                  scrollToSection("about");
                  mobileMenu.onClose();
                }}
              >
                Nosotros
              </Button>

              <Divider borderColor="brand.beige" />

              <Button
                variant="ghost"
                justifyContent="flex-start"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
                color="brand.muted"
                fontWeight={400}
                px={0} py={3}
                h="auto"
                _hover={{ color: "brand.dark", bg: "transparent" }}
                onClick={() => {
                  navigate("/como-comprar");
                  mobileMenu.onClose();
                }}
              >
                ¿Cómo comprar?
              </Button>

              <Divider borderColor="brand.beige" />

              <Button
                variant="ghost"
                justifyContent="flex-start"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
                color="brand.muted"
                fontWeight={400}
                px={0} py={3}
                h="auto"
                _hover={{ color: "brand.dark", bg: "transparent" }}
                onClick={() => {
                  scrollToSection("contacto");
                  mobileMenu.onClose();
                }}
              >
                Contacto
              </Button>

              <Divider borderColor="brand.beige" />

              {/* Cuenta / Login */}
              <Button
                variant="ghost"
                justifyContent="flex-start"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
                color="brand.muted"
                fontWeight={400}
                px={0} py={3}
                h="auto"
                leftIcon={<User size={16} strokeWidth={1.5} />}
                _hover={{ color: "brand.dark", bg: "transparent" }}
                onClick={() => {
                  if (isAuthenticated) {
                    navigate("/mi-cuenta");
                  } else {
                    authModal.onOpen();
                  }
                  mobileMenu.onClose();
                }}
              >
                {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
              </Button>

              {isAdmin && (
                <>
                  <Divider borderColor="brand.beige" />
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    fontSize="xs"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    color="brand.brown"
                    fontWeight={400}
                    px={0} py={3}
                    h="auto"
                    _hover={{ color: "brand.dark", bg: "transparent" }}
                    onClick={() => {
                      navigate("/admin");
                      mobileMenu.onClose();
                    }}
                  >
                    Panel Admin
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AuthModal isOpen={authModal.isOpen} onClose={authModal.onClose} />
    </>
  );
};

export default Navbar;