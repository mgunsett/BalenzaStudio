import { useRef, useEffect, useState } from "react";
import {
  Box, Flex, VStack, HStack, Text, IconButton, useDisclosure,
  Drawer, DrawerBody, DrawerOverlay, DrawerContent, DrawerCloseButton,
  Avatar, Menu, MenuButton, MenuList, MenuItem, Divider,
} from "@chakra-ui/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Menu as MenuIcon,
  LogOut, ExternalLink, BarChart2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/firebase/auth";
import Logo from "../ui/Logo";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",  path: "/admin"            },
  { icon: Package,         label: "Productos",   path: "/admin/productos"  },
  { icon: ShoppingCart,    label: "Órdenes",     path: "/admin/ordenes"    },
  { icon: BarChart2,       label: "Estadísticas",path: "/admin/stats"      },
];

const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <VStack h="100%" align="stretch" spacing={0}>
      {/* Logo */}
      <Box px={6} py={6} borderBottom="0.5px solid rgba(160,120,90,0.15)">
        <Logo size="sm" />
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.brown" mt={1}>
          Panel Admin
        </Text>
      </Box>

      {/* Nav */}
      <VStack flex={1} align="stretch" spacing={1} px={3} py={4} overflowY="auto">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path ||
            (path !== "/admin" && location.pathname.startsWith(path));
          return (
            <HStack
              key={path}
              spacing={3}
              px={3} py={3}
              borderRadius="md"
              cursor="pointer"
              bg={isActive ? "brand.beige" : "transparent"}
              color={isActive ? "brand.dark" : "brand.muted"}
              onClick={() => handleNav(path)}
              _hover={{ bg: "brand.beige", color: "brand.dark" }}
              transition="all 0.15s"
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
              <Text fontFamily="body" fontSize="sm" fontWeight={isActive ? 500 : 400}>
                {label}
              </Text>
              {isActive && (
                <Box ml="auto" w="4px" h="4px" borderRadius="full" bg="brand.brown" />
              )}
            </HStack>
          );
        })}
      </VStack>

      {/* Footer sidebar */}
      <Box px={3} py={4} borderTop="0.5px solid rgba(160,120,90,0.15)">
        <HStack
          spacing={3}
          px={3} py={3}
          borderRadius="md"
          cursor="pointer"
          color="brand.muted"
          onClick={() => window.open("/", "_blank")}
          _hover={{ bg: "brand.beige", color: "brand.dark" }}
        >
          <ExternalLink size={16} strokeWidth={1.5} />
          <Text fontFamily="body" fontSize="sm">Ver tienda</Text>
        </HStack>
        <HStack
          spacing={3}
          px={3} py={3}
          borderRadius="md"
          cursor="pointer"
          color="brand.muted"
          onClick={async () => { await logoutUser(); navigate("/"); }}
          _hover={{ bg: "rgba(192,57,43,0.08)", color: "brand.error" }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          <Text fontFamily="body" fontSize="sm">Cerrar sesión</Text>
        </HStack>
        {profile && (
          <HStack spacing={3} px={3} pt={3} mt={2} borderTop="0.5px solid rgba(160,120,90,0.1)">
            <Avatar
              size="sm"
              name={`${profile.name} ${profile.lastName}`}
              bg="brand.sand"
              color="brand.dark"
              fontFamily="body"
              fontSize="xs"
            />
            <VStack align="flex-start" spacing={0}>
              <Text fontFamily="body" fontSize="xs" fontWeight={500} color="brand.dark">
                {profile.name} {profile.lastName}
              </Text>
              <Text fontFamily="body" fontSize="2xs" color="brand.muted">
                Administrador
              </Text>
            </VStack>
          </HStack>
        )}
      </Box>
    </VStack>
  );
};

const AdminLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mainRef = useRef(null);
  const sideRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      sideRef.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
    gsap.fromTo(
      mainRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.2 }
    );
  }, []);

  return (
    <Flex h="100vh" bg="brand.nude" overflow="hidden">
      {/* Sidebar desktop */}
      <Box
        ref={sideRef}
        display={{ base: "none", lg: "flex" }}
        flexDir="column"
        w="240px"
        flexShrink={0}
        bg="brand.cream"
        borderRight="0.5px solid rgba(160,120,90,0.15)"
        h="100vh"
        position="sticky"
        top={0}
      >
        <SidebarContent />
      </Box>

      {/* Main content */}
      <Box ref={mainRef} flex={1} overflowY="auto" h="100vh">
        {/* Topbar mobile */}
        <Flex
          display={{ base: "flex", lg: "none" }}
          align="center"
          justify="space-between"
          px={4}
          py={3}
          bg="brand.cream"
          borderBottom="0.5px solid rgba(160,120,90,0.15)"
          position="sticky"
          top={0}
          zIndex={100}
        >
          <Logo size="sm" />
          <IconButton
            icon={<MenuIcon size={20} strokeWidth={1.5} />}
            variant="ghost"
            onClick={onOpen}
            color="brand.dark"
            aria-label="Menú"
          />
        </Flex>

        <Box p={{ base: 4, md: 8 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Drawer mobile */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay />
        <DrawerContent bg="brand.cream" maxW="240px">
          <DrawerCloseButton color="brand.muted" />
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default AdminLayout;
