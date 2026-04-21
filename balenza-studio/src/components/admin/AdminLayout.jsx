// src/components/admin/AdminLayout.jsx
import { useEffect, useState } from "react";
import {
  Box, Flex, VStack, Text, IconButton, Avatar,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent,
  DrawerCloseButton, DrawerBody, Divider, Badge, Tooltip, Image,
} from "@chakra-ui/react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2,
  Layers, Menu as MenuIcon, LogOut, ExternalLink,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/firebase/auth";

// ── Rutas del panel ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",  path: "/admin",           exact: true  },
  { icon: Package,          label: "Productos",  path: "/admin/productos", exact: false },
  { icon: ShoppingCart,     label: "Órdenes",    path: "/admin/ordenes",   exact: false },
  { icon: Layers,           label: "Stock",      path: "/admin/stock",     exact: false },
];

// ── Item de navegación ───────────────────────────────────────────────
const NavItem = ({ item, collapsed, onClose }) => {
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  return (
    <Tooltip
      label={collapsed ? item.label : ""}
      placement="right"
      hasArrow
      bg="brand.brown"
      color="brand.white"
      fontSize="xs"
      openDelay={150}
    >
      <NavLink to={item.path} onClick={onClose} style={{ width: "100%" }}>
        <Flex
          align="center"
          gap={collapsed ? 0 : 3}
          px={collapsed ? 0 : 3}
          py={2.5}
          mx={2}
          borderRadius="lg"
          justify={collapsed ? "center" : "flex-start"}
          position="relative"
          bg={isActive ? "brand.beige" : "transparent"}
          color={isActive ? "brand.dark" : "brand.muted"}
          _hover={{ bg: "brand.beige", color: "brand.dark" }}
          transition="all 0.18s"
          cursor="pointer"
        >
          {/* Indicador activo */}
          {isActive && (
            <Box
              position="absolute"
              left={0}
              top="18%"
              h="64%"
              w="2.5px"
              bg="brand.brown"
              borderRadius="0 3px 3px 0"
            />
          )}
          <item.icon size={17} strokeWidth={isActive ? 2 : 1.5} />
          {!collapsed && (
            <Text
              fontFamily="body"
              fontSize="sm"
              fontWeight={isActive ? 500 : 400}
              flex={1}
            >
              {item.label}
            </Text>
          )}
          {!collapsed && isActive && (
            <Box w="5px" h="5px" borderRadius="full" bg="brand.brown" opacity={0.7} />
          )}
        </Flex>
      </NavLink>
    </Tooltip>
  );
};

// ── Contenido del sidebar ────────────────────────────────────────────
const SidebarContent = ({ collapsed, onToggle, onClose, isMobile }) => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  return (
    <Flex
      direction="column"
      h="100%"
      bg="brand.cream"
      borderRight="0.5px solid rgba(160,120,90,0.15)"
    >
      {/* Logo */}
      <Flex
        align="center"
        justify={collapsed ? "center" : "space-between"}
        px={collapsed ? 0 : 5}
        py={4}
        minH="64px"
        borderBottom="0.5px solid rgba(160,120,90,0.12)"
      >
        {!collapsed && (
          <VStack align="flex-start" spacing={0} lineHeight={1}>
            <Text
              fontFamily="heading"
              fontWeight={300}
              fontSize="xl"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="brand.dark"
            >
              Balenza
            </Text>
            <Text
              fontFamily="body"
              fontWeight={300}
              fontSize="2xs"
              letterSpacing="0.35em"
              textTransform="uppercase"
              color="brand.muted"
              mt="2px"
            >
              Studio · Admin
            </Text>
          </VStack>
        )}
        {collapsed && (
          <Text
            fontFamily="heading"
            fontWeight={300}
            fontSize="sm"
            letterSpacing="0.15em"
            textTransform="uppercase"
            color="brand.dark"
          >
            B
          </Text>
        )}
        {!isMobile && (
          <IconButton
            icon={collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            size="xs"
            variant="ghost"
            color="brand.muted"
            onClick={onToggle}
            _hover={{ color: "brand.dark", bg: "brand.beige" }}
            borderRadius="full"
            aria-label="Toggle sidebar"
            flexShrink={0}
          />
        )}
      </Flex>

      {/* Navegación */}
      <VStack spacing={0.5} align="stretch" flex={1} py={3} overflowY="auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} onClose={onClose} />
        ))}
      </VStack>

      <Divider borderColor="rgba(160,120,90,0.12)" />

      {/* Ver tienda */}
      <Tooltip label={collapsed ? "Ver tienda" : ""} placement="right" hasArrow bg="brand.brown">
        <Flex
          align="center"
          gap={collapsed ? 0 : 3}
          px={collapsed ? 0 : 5}
          py={3}
          justify={collapsed ? "center" : "flex-start"}
          color="brand.muted"
          _hover={{ color: "brand.dark", cursor: "pointer" }}
          transition="color 0.18s"
          onClick={() => window.open("/", "_blank")}
        >
          <ExternalLink size={15} strokeWidth={1.5} />
          {!collapsed && (
            <Text fontFamily="body" fontSize="xs">
              Ver tienda
            </Text>
          )}
        </Flex>
      </Tooltip>

      {/* Usuario + logout */}
      <Box
        borderTop="0.5px solid rgba(160,120,90,0.12)"
        px={collapsed ? 2 : 3}
        py={3}
      >
        {!collapsed && (
          <Flex align="center" gap={2.5} mb={2} px={1}>
            <Avatar
              size="sm"
              name={profile ? `${profile.name} ${profile.lastName}` : user?.email}
              bg="brand.sand"
              color="brand.dark"
              fontFamily="body"
              fontSize="xs"
            />
            <VStack align="flex-start" spacing={0} flex={1} overflow="hidden">
              <Text fontFamily="body" fontSize="xs" fontWeight={500} color="brand.dark" noOfLines={1}>
                {profile ? `${profile.name} ${profile.lastName}` : "Admin"}
              </Text>
              <Text fontFamily="body" fontSize="2xs" color="brand.muted">
                Administrador
              </Text>
            </VStack>
          </Flex>
        )}
        {collapsed && (
          <Flex justify="center" mb={2}>
            <Avatar
              size="sm"
              name={profile ? `${profile.name} ${profile.lastName}` : user?.email}
              bg="brand.sand"
              color="brand.dark"
              fontSize="xs"
            />
          </Flex>
        )}

        <Tooltip label={collapsed ? "Cerrar sesión" : ""} placement="right" hasArrow bg="brand.brown">
          <Flex
            align="center"
            gap={collapsed ? 0 : 2.5}
            px={2}
            py={2}
            borderRadius="lg"
            justify={collapsed ? "center" : "flex-start"}
            color="brand.muted"
            _hover={{ bg: "rgba(192,57,43,0.07)", color: "brand.error", cursor: "pointer" }}
            transition="all 0.18s"
            onClick={async () => { await logoutUser(); navigate("/"); }}
          >
            <LogOut size={15} strokeWidth={1.5} />
            {!collapsed && (
              <Text fontFamily="body" fontSize="xs">Cerrar sesión</Text>
            )}
          </Flex>
        </Tooltip>
      </Box>
    </Flex>
  );
};

// ── Layout principal ─────────────────────────────────────────────────
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  // Cerrar drawer mobile al navegar
  useEffect(() => { onClose(); }, [location.pathname]);

  const sidebarW = collapsed ? "64px" : "220px";

  return (
    <Flex h="100vh" overflow="hidden" bg="brand.nude">
      {/* Sidebar desktop */}
      <Box
        display={{ base: "none", lg: "block" }}
        w={sidebarW}
        flexShrink={0}
        h="100vh"
        position="sticky"
        top={0}
        transition="width 0.22s ease"
        overflow="hidden"
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          onClose={() => {}}
          isMobile={false}
        />
      </Box>

      {/* Drawer mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay bg="rgba(44,26,14,0.5)" backdropFilter="blur(3px)" />
        <DrawerContent maxW="220px" p={0}>
          <DrawerCloseButton color="brand.muted" top={3} right={3} _hover={{ color: "brand.dark" }} />
          <DrawerBody p={0}>
            <SidebarContent collapsed={false} onToggle={() => {}} onClose={onClose} isMobile />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main */}
      <Flex flex={1} direction="column" overflow="hidden" h="100vh">
        {/* Topbar mobile */}
        <Flex
          display={{ base: "flex", lg: "none" }}
          align="center"
          justify="space-between"
          px={4}
          py={3}
          bg="brand.cream"
          borderBottom="0.5px solid rgba(160,120,90,0.15)"
          flexShrink={0}
        >
          <IconButton
            icon={<MenuIcon size={20} strokeWidth={1.5} />}
            variant="ghost"
            color="brand.dark"
            onClick={onOpen}
            _hover={{ bg: "brand.beige" }}
            aria-label="Menú"
          />
          <VStack spacing={0} lineHeight={1}>
            <Text fontFamily="heading" fontWeight={300} fontSize="lg" letterSpacing="0.12em" textTransform="uppercase" color="brand.dark">
              Balenza
            </Text>
            <Text fontFamily="body" fontSize="2xs" letterSpacing="0.25em" textTransform="uppercase" color="brand.muted">
              Studio
            </Text>
          </VStack>
          <Box w="40px" />
        </Flex>

        {/* Contenido de la página */}
        <Box flex={1} overflowY="auto" bg="brand.nude">
          <Box p={{ base: 4, md: 6, lg: 8 }} maxW="1400px" mx="auto">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default AdminLayout;
