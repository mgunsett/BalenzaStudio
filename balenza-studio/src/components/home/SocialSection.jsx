import { useRef, useEffect, useState } from "react";
import { Box, VStack, HStack, Text, SimpleGrid, Image, Link, Icon, Flex, Skeleton } from "@chakra-ui/react";
import { gsap } from "gsap";
import { SOCIAL_LINKS } from "../../utils/constants";
import { getInstagramPosts } from "../../services/firebase/instagram";

const InstagramIcon = ({ size = 18, strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/>
  </svg>
);

const FacebookIcon = ({ size = 18, strokeWidth = 1.5, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const POSTS_COUNT = 4;

// Placeholders de fallback
const FALLBACK_POSTS = Array.from({ length: POSTS_COUNT }, (_, i) => ({
  id: `placeholder-${i + 1}`,
  mediaUrl: `https://placehold.co/300x300/EDE0D4/7A6555?text=@balenzastudio`,
  permalink: SOCIAL_LINKS.instagram,
  caption: "",
}));

const SocialSection = () => {
  const sectionRef = useRef(null);
  const titleRef   = useRef(null);
  const gridRef    = useRef(null);
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch de posts reales
  useEffect(() => {
    let cancelled = false;
    getInstagramPosts(POSTS_COUNT)
      .then((data) => { if (!cancelled) setPosts(data); })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

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
                <InstagramIcon size={18} strokeWidth={1.5} />
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
                <FacebookIcon size={18} strokeWidth={1.5} />
              </Flex>
            </Link>
          </HStack>
          <Text fontFamily="body" fontSize="sm" color="brand.muted" letterSpacing="0.05em">
            @balenzastudio
          </Text>
        </VStack>

        {/* Mosaico IG */}
        <SimpleGrid ref={gridRef} columns={{ base: 2, md: 4 }} gap={2} w="100%">
          {loading
            ? Array.from({ length: POSTS_COUNT }, (_, i) => (
                <Skeleton
                  key={`skel-${i}`}
                  borderRadius="md"
                  w="100%"
                  sx={{ aspectRatio: "1" }}
                  startColor="brand.beige"
                  endColor="brand.cream"
                />
              ))
            : (posts.length > 0 ? posts : FALLBACK_POSTS).map((post) => (
                <Link
                  key={post.id}
                  href={post.permalink}
                  isExternal
                  _hover={{ textDecoration: "none" }}
                >
                  <Box
                    overflow="hidden"
                    borderRadius="md"
                    cursor="pointer"
                    role="group"
                    _hover={{ opacity: 0.85 }}
                    transition="opacity 0.2s"
                  >
                    <Image
                      src={post.mediaUrl}
                      alt={post.caption || "Post BALENZA Studio"}
                      w="100%"
                      aspectRatio="1"
                      objectFit="cover"
                      transform="scale(1)"
                      _groupHover={{ transform: "scale(1.04)" }}
                      transition="transform 0.4s ease"
                      loading="lazy"
                    />
                  </Box>
                </Link>
              ))
          }
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default SocialSection;