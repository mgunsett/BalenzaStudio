import { Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFAB from "../ui/WhatsAppFAB";
import ScrollToTop from "../ui/ScrollToTop";

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="brand.nude">
      <Navbar />
      <Box as="main" pt="72px">
        {children}
      </Box>
      <Footer />
      <WhatsAppFAB />
      <ScrollToTop />
    </Box>
  );
};

export default Layout;