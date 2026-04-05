import { useState, useEffect, useRef } from "react";
import {
  Box, VStack, HStack, Text, Input, Button, SimpleGrid,
  Divider, Avatar, Badge, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/firebase/auth";
import { getOrdersByUser } from "../services/firebase/orders";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase/config";
import { formatPrice, formatDate } from "../utils/formatters";
import { ORDER_STATUS } from "../utils/constants";
import toast from "react-hot-toast";

const fieldStyle = {
  bg: "brand.white",
  border: "0.5px solid",
  borderColor: "rgba(160,120,90,0.3)",
  borderRadius: "sm",
  fontFamily: "body",
  fontSize: "sm",
  h: "44px",
  px: 4,
  _placeholder: { color: "brand.muted" },
  _focus: { borderColor: "brand.brown", boxShadow: "0 0 0 1px var(--chakra-colors-brand-brown)", outline: "none" },
};

const ProfilePage = () => {
  const { user, profile } = useAuth();
  const navigate          = useNavigate();
  const ref               = useRef(null);

  const [orders,   setOrders]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);
  const [formData, setFormData]= useState({
    name:     "",
    lastName: "",
    phone:    "",
    dni:      "",
  });

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
    if (profile) {
      setFormData({
        name:     profile.name || "",
        lastName: profile.lastName || "",
        phone:    profile.phone || "",
        dni:      profile.dni || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user?.uid) return;
    getOrdersByUser(user.uid)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      toast.success("Datos actualizados");
    } catch { toast.error("Error al guardar"); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  return (
    <Box ref={ref} py={{ base: 8, md: 16 }} px={{ base: 4, md: 8, lg: 16 }} minH="80vh">
      <Box maxW="860px" mx="auto">
        {/* Header */}
        <HStack spacing={4} mb={10}>
          <Avatar
            size="lg"
            name={profile ? `${profile.name} ${profile.lastName}` : user?.email}
            bg="brand.sand"
            color="brand.dark"
            fontFamily="body"
          />
          <VStack align="flex-start" spacing={0}>
            <Text fontFamily="heading" fontWeight={300} fontSize="2xl" color="brand.dark">
              {profile ? `${profile.name} ${profile.lastName}` : "Mi cuenta"}
            </Text>
            <Text fontFamily="body" fontSize="sm" color="brand.muted">{user?.email}</Text>
          </VStack>
          <Button
            variant="ghost"
            size="sm"
            fontSize="xs"
            color="brand.muted"
            ml="auto"
            onClick={handleLogout}
            _hover={{ color: "brand.error", bg: "transparent" }}
          >
            Cerrar sesión
          </Button>
        </HStack>

        <Tabs variant="unstyled">
          <TabList
            bg="brand.beige"
            borderRadius="full"
            p={1}
            display="inline-flex"
            mb={8}
          >
            {["Mis datos", "Mis pedidos"].map((label) => (
              <Tab
                key={label}
                fontFamily="body"
                fontSize="xs"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color="brand.muted"
                borderRadius="full"
                px={6} py={2}
                _selected={{
                  bg: "brand.dark",
                  color: "brand.white",
                  fontWeight: 500,
                }}
              >
                {label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {/* Tab 1 — Mis datos */}
            <TabPanel p={0}>
              <Box bg="brand.cream" borderRadius="xl" border="0.5px solid rgba(160,120,90,0.15)" p={6}>
                <VStack spacing={5} align="stretch">
                  <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.dark">
                    Información personal
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                    {[
                      { key: "name",     label: "Nombre",   ph: "María"     },
                      { key: "lastName", label: "Apellido", ph: "González"  },
                      { key: "dni",      label: "DNI",      ph: "12345678"  },
                      { key: "phone",    label: "Teléfono", ph: "+54 9 11..." },
                    ].map(({ key, label, ph }) => (
                      <FormControl key={key}>
                        <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>
                          {label}
                        </FormLabel>
                        <Input
                          value={formData[key]}
                          onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={ph}
                          {...fieldStyle}
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel fontFamily="body" fontSize="2xs" letterSpacing="0.15em" textTransform="uppercase" color="brand.muted" mb={1}>
                      Email
                    </FormLabel>
                    <Input value={user?.email || ""} isReadOnly {...fieldStyle} opacity={0.6} cursor="not-allowed" />
                  </FormControl>

                  <Button
                    variant="primary"
                    size="lg"
                    alignSelf="flex-start"
                    px={8}
                    py={6}
                    fontSize="xs"
                    letterSpacing="0.2em"
                    isLoading={saving}
                    onClick={handleSave}
                  >
                    Guardar cambios
                  </Button>
                </VStack>
              </Box>
            </TabPanel>

            {/* Tab 2 — Mis pedidos */}
            <TabPanel p={0}>
              {loading ? (
                <Box py={12} display="flex" justifyContent="center">
                  <Spinner size="md" color="brand.brown" thickness="1px" />
                </Box>
              ) : orders.length === 0 ? (
                <Box py={16} textAlign="center">
                  <Text fontFamily="heading" fontWeight={300} fontSize="xl" color="brand.muted">
                    Todavía no tenés pedidos
                  </Text>
                  <Button variant="outline" mt={4} onClick={() => navigate("/")}>
                    Explorar tienda
                  </Button>
                </Box>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {orders.map((order) => {
                    const st = ORDER_STATUS[order.status];
                    return (
                      <Box
                        key={order.id}
                        bg="brand.cream"
                        borderRadius="xl"
                        border="0.5px solid rgba(160,120,90,0.15)"
                        p={5}
                      >
                        <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
                          <VStack align="flex-start" spacing={0}>
                            <Text fontFamily="body" fontSize="sm" fontWeight={500} color="brand.dark">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </Text>
                            <Text fontFamily="body" fontSize="xs" color="brand.muted">
                              {formatDate(order.createdAt)}
                            </Text>
                          </VStack>
                          <HStack spacing={2}>
                            <Badge colorScheme={st?.color || "gray"} fontSize="2xs" borderRadius="full" px={2}>
                              {st?.label || order.status}
                            </Badge>
                            <Text fontFamily="body" fontWeight={500} fontSize="md" color="brand.dark">
                              {formatPrice(order.totals?.total || 0)}
                            </Text>
                          </HStack>
                        </HStack>
                        <Divider borderColor="rgba(160,120,90,0.1)" mb={3} />
                        <VStack align="stretch" spacing={1}>
                          {order.items?.map((item, i) => (
                            <HStack key={i} justify="space-between">
                              <Text fontFamily="body" fontSize="xs" color="brand.muted">
                                {item.name} × {item.quantity} (T.{item.size})
                              </Text>
                              <Text fontFamily="body" fontSize="xs" color="brand.dark">
                                {formatPrice(item.price * item.quantity)}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default ProfilePage;