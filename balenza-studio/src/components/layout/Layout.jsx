import { Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import TopBarOptimized from "./TopBarOptimized";
import Footer from "./Footer";
import WhatsAppFAB from "../ui/WhatsAppFAB";
import ScrollToTop from "../ui/ScrollToTop";

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="brand.nude">
      <TopBarOptimized />
      <Navbar />
      <Box as="main" pt={{ base: "96px", md: "108px" }}>
        {children}
      </Box>
      <Footer />
      <WhatsAppFAB />
      <ScrollToTop />
    </Box>
  );
};

export default Layout;
