import { useRef, useEffect } from "react";
import { Box, VStack, HStack, Text, SimpleGrid, Image, Link, Icon, Flex } from "@chakra-ui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Facebook } from "lucide-react";
import { SOCIAL_LINKS } from "../../utils/constants";

// Mosaico de fotos IG (placeholders)
const IG_POSTS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  src: `https://placehold.co/300x300/EDE0D4/7A6555?text=@balenzastudio`,
  alt: `Post BALENZA Studio ${i + 1}`,
}));

const SocialSection = () => {
  const sectionRef = useRef(null);
  const titleRef   = useRef(null);
  const gridRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
      gsap.fromTo(
        gridRef.current.children,
        { scale: 0.92, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      id="contacto"
      ref={sectionRef}
      py={{ base: 20, md: 28 }}
      px={{ base: 4, md: 8 }}
      bg="brand.nude"
    >
      <VStack spacing={10} maxW="1100px" mx="auto">
        {/* Título */}
        <VStack ref={titleRef} spacing={3} textAlign="center">
          <Text fontFamily="body" fontSize="2xs" letterSpacing="0.35em" textTransform="uppercase" color="brand.brown">
            Seguinos
          </Text>
          <Text fontFamily="heading" fontWeight={300} fontSize={{ base: "3xl", md: "4xl" }} color="brand.dark" letterSpacing="0.05em">
            En nuestras redes
          </Text>
          <HStack spacing={5} pt={2}>
            <Link href={SOCIAL_LINKS.instagram} isExternal>
              <Flex
                w="40px" h="40px"
                borderRadius="full"
                bg="brand.beige"
                border="0.5px solid rgba(160,120,90,0.2)"
                align="center" justify="center"
                _hover={{ bg: "brand.brown", color: "white" }}
                transition="all 0.2s"
                color="brand.brown"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </Flex>
            </Link>
            <Link href={SOCIAL_LINKS.facebook} isExternal>
              <Flex
                w="40px" h="40px"
                borderRadius="full"
                bg="brand.beige"
                border="0.5px solid rgba(160,120,90,0.2)"
                align="center" justify="center"
                _hover={{ bg: "brand.brown", color: "white" }}
                transition="all 0.2s"
                color="brand.brown"
              >
                <Facebook size={18} strokeWidth={1.5} />
              </Flex>
            </Link>
          </HStack>
          <Text fontFamily="body" fontSize="sm" color="brand.muted" letterSpacing="0.05em">
            @balenzastudio
          </Text>
        </VStack>

        {/* Mosaico IG */}
        <SimpleGrid ref={gridRef} columns={{ base: 2, sm: 3, md: 6 }} gap={2} w="100%">
          {IG_POSTS.map((post) => (
            <Box
              key={post.id}
              overflow="hidden"
              borderRadius="md"
              cursor="pointer"
              role="group"
              _hover={{ opacity: 0.85 }}
              transition="opacity 0.2s"
            >
              <Image
                src={post.src}
                alt={post.alt}
                w="100%"
                aspectRatio="1"
                objectFit="cover"
                transform="scale(1)"
                _groupHover={{ transform: "scale(1.04)" }}
                transition="transform 0.4s ease"
              />
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default SocialSection;