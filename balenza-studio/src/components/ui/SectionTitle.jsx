import { useRef, useEffect } from "react";
import { VStack, Text, Box } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SectionTitle = ({ eyebrow, title, centered = true }) => {
  const lineRef  = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: centered ? "center" : "left center" },
        {
          scaleX: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: groupRef.current, start: "top 80%" },
        }
      );
      gsap.fromTo(
        groupRef.current.children,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: groupRef.current, start: "top 80%" },
        }
      );
    }, groupRef);
    return () => ctx.revert();
  }, []);

  return (
    <VStack ref={groupRef} spacing={3} align={centered ? "center" : "flex-start"} textAlign={centered ? "center" : "left"}>
      {eyebrow && (
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.35em" textTransform="uppercase" color="brand.brown">
          {eyebrow}
        </Text>
      )}
      <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark" letterSpacing="0.05em">
        {title}
      </Text>
      <Box ref={lineRef} h="1px" w="40px" bg="brand.sand" />
    </VStack>
  );
};

export default SectionTitle;
