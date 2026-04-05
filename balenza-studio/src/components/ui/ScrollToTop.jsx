import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    gsap.to(".scroll-top-btn", {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : 10,
      duration: 0.3,
      ease: "power2.out",
      pointerEvents: visible ? "all" : "none",
    });
  }, [visible]);

  return (
    <Box
      className="scroll-top-btn"
      position="fixed"
      bottom={20}
      right={6}
      zIndex={998}
      w="40px" h="40px"
      borderRadius="full"
      bg="brand.dark"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      opacity={0}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      _hover={{ bg: "brand.brown", transform: "scale(1.05)" }}
      transition="background 0.2s, transform 0.2s"
    >
      <ArrowUp size={16} color="var(--chakra-colors-brand-white)" strokeWidth={1.5} />
    </Box>
  );
};

export default ScrollToTop;