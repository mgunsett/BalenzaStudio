import { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel, VStack, Text,
} from "@chakra-ui/react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Logo from "../ui/Logo";

const AuthModal = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState(0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "md" }} motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent bg="brand.cream" borderRadius={{ base: 0, sm: "xl" }}>
        <ModalCloseButton
          top={4} right={4}
          borderRadius="full"
          bg="brand.beige"
          _hover={{ bg: "brand.sand" }}
          color="brand.muted"
        />
        <ModalBody p={{ base: 6, sm: 8 }}>
          <VStack spacing={6}>
            <Logo size="md" />

            <Tabs
              index={tab}
              onChange={setTab}
              variant="unstyled"
              w="100%"
            >
              <TabList
                bg="brand.beige"
                borderRadius="full"
                p={1}
                gap={1}
              >
                {["Iniciar sesión", "Crear cuenta"].map((label, i) => (
                  <Tab
                    key={label}
                    flex={1}
                    fontFamily="body"
                    fontSize="xs"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="brand.muted"
                    borderRadius="full"
                    py={2}
                    _selected={{
                      bg: "brand.dark",
                      color: "brand.white",
                      fontWeight: 500,
                    }}
                    transition="all 0.2s"
                  >
                    {label}
                  </Tab>
                ))}
              </TabList>

              <TabPanels pt={6}>
                <TabPanel p={0}>
                  <LoginForm onSuccess={onClose} />
                </TabPanel>
                <TabPanel p={0}>
                  <RegisterForm onSuccess={onClose} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;