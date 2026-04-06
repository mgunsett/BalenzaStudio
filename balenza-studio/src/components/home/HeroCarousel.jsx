import { useRef, useEffect, useState, useCallback } from "react";
import { Box, Flex, Text, Button, VStack, HStack, IconButton } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBannerImages } from "../../services/firebase/design";

const SLIDES = [
  {
    id: 1,
    bg: "linear-gradient(135deg, #E8D5C4 0%, #D4B896 60%, #C4A880 100%)",
    eyebrow: "Nueva Colección · Otoño 2025",
    title: "Elegancia\nAtemporal",
    subtitle: "Prendas que te definen",
    cta: "Explorar colección",
    ctaLink: "/categoria/remeras",
    accent: "#A0785A",
  },
  {
    id: 2,
    bg: "linear-gradient(135deg, #D4DDE8 0%, #B8C9D8 60%, #A8BBCC 100%)",
    eyebrow: "Pantalones · Wide Leg",
    title: "Confort\nSin Límites",
    subtitle: "Para cada momento del día",
    cta: "Ver pantalones",
    ctaLink: "/categoria/pantalones",
    accent: "#6B8A9E",
  },
  {
    id: 3,
    bg: "linear-gradient(135deg, #DDD5E8 0%, #C8B8D8 60%, #B8A8CC 100%)",
    eyebrow: "Camperas · Temporada",
    title: "Estilo que\nAbriga",
    subtitle: "Diseño y funcionalidad en equilibrio",
    cta: "Ver camperas",
    ctaLink: "/categoria/camperas",
    accent: "#7A6590",
  },
];

const HeroCarousel = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const slidesRef    = useRef([]);
  const textRef      = useRef(null);
  const eyebrowRef   = useRef(null);
  const titleRef     = useRef(null);
  const subtitleRef  = useRef(null);
  const ctaRef       = useRef(null);
  const dotsRef      = useRef([]);
  const autoRef      = useRef(null);

  // Cargar imágenes de banner desde Firestore
  useEffect(() => {
    getBannerImages()
      .then((imgs) => setBannerImages(imgs))
      .catch(() => setBannerImages([]));
  }, []);

  // Animación de entrada inicial
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.6 });
    tl.fromTo(
      eyebrowRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    )
    .fromTo(
      titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo(
      ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    );
  }, []);

  // Autoplay
  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, [startAuto]);

  // Animación de transición de texto al cambiar slide
  useEffect(() => {
    if (!textRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      [eyebrowRef.current, titleRef.current, subtitleRef.current, ctaRef.current],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
    );
    // Animación de fondo del slide actual
    if (slidesRef.current[current]) {
      gsap.fromTo(
        slidesRef.current[current],
        { scale: 1.05, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: "power2.out" }
      );
    }
    // Dot activo
    dotsRef.current.forEach((dot, i) => {
      gsap.to(dot, {
        width: i === current ? "28px" : "8px",
        opacity: i === current ? 1 : 0.4,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }, [current]);

  const goTo = (idx) => {
    if (isAnimating || idx === current) return;
    clearInterval(autoRef.current);
    setIsAnimating(true);

    gsap.to([eyebrowRef.current, titleRef.current, subtitleRef.current, ctaRef.current], {
      y: -20, opacity: 0, duration: 0.3, stagger: 0.04, ease: "power2.in",
      onComplete: () => {
        setCurrent(idx);
        setIsAnimating(false);
        startAuto();
      },
    });
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <Box
      ref={containerRef}
      position="relative"
      h={{ base: "92vh", md: "95vh" }}
      overflow="hidden"
      maxH="900px"
    >
      {/* Slides de fondo */}
      {SLIDES.map((s, i) => (
        <Box
          key={s.id}
          ref={(el) => (slidesRef.current[i] = el)}
          position="absolute"
          inset={0}
          background={s.bg}
          opacity={i === current ? 1 : 0}
          transition="opacity 0.1s"
          zIndex={i === current ? 1 : 0}
        >
          {/* Imagen de fondo desde Firebase */}
          {bannerImages[i] && (
            <Box
              as="img"
              src={bannerImages[i]}
              alt=""
              position="absolute"
              inset={0}
              w="100%"
              h="100%"
              objectFit="cover"
              objectPosition="center"
              opacity={0.7}
            />
          )}

          {/* Elementos decorativos */}
          <Box
            position="absolute"
            right="-5%"
            top="-5%"
            w="45vw"
            h="45vw"
            maxW="500px"
            maxH="500px"
            borderRadius="full"
            border="0.5px solid rgba(255,255,255,0.3)"
          />
          <Box
            position="absolute"
            left="5%"
            bottom="-8%"
            w="30vw"
            h="30vw"
            maxW="350px"
            maxH="350px"
            borderRadius="full"
            border="0.5px solid rgba(255,255,255,0.2)"
          />
        </Box>
      ))}

      {/* Contenido del slide */}
      <Flex
        position="absolute"
        inset={0}
        zIndex={10}
        align="center"
        justify={{ base: "center", md: "flex-start" }}
        px={{ base: 6, md: 16, lg: 24 }}
      >
        <VStack
          ref={textRef}
          align={{ base: "center", md: "flex-start" }}
          spacing={5}
          maxW="600px"
        >
          {/* Eyebrow */}
          <Text
            ref={eyebrowRef}
            fontFamily="body"
            fontSize="xs"
            letterSpacing="0.35em"
            textTransform="uppercase"
            color="rgba(44,26,14,0.55)"
          >
            {slide.eyebrow}
          </Text>

          {/* Título */}
          <Text
            ref={titleRef}
            fontFamily="heading"
            fontWeight={300}
            fontSize={{ base: "5xl", md: "6xl", lg: "7xl" }}
            lineHeight={1.05}
            letterSpacing="0.04em"
            color="brand.dark"
            textAlign={{ base: "center", md: "left" }}
            whiteSpace="pre-line"
          >
            {slide.title}
          </Text>

          {/* Subtítulo */}
          <Text
            ref={subtitleRef}
            fontFamily="heading"
            fontStyle="italic"
            fontSize={{ base: "lg", md: "xl" }}
            color="brand.muted"
            letterSpacing="0.03em"
          >
            {slide.subtitle}
          </Text>

          {/* CTA */}
          <Box ref={ctaRef}>
            <Button
              variant="outline"
              size="lg"
              fontSize="xs"
              letterSpacing="0.25em"
              px={10}
              py={6}
              onClick={() => navigate(slide.ctaLink)}
              borderColor="brand.dark"
              _hover={{
                bg: "brand.dark",
                color: "brand.white",
                transform: "translateY(-2px)",
              }}
            >
              {slide.cta}
            </Button>
          </Box>
        </VStack>
      </Flex>

      {/* Flechas de navegación */}
      <IconButton
        icon={<ChevronLeft size={20} strokeWidth={1.5} />}
        variant="ghost"
        position="absolute"
        left={4}
        top="50%"
        transform="translateY(-50%)"
        zIndex={20}
        w="44px" h="44px"
        borderRadius="full"
        bg="rgba(253,250,247,0.6)"
        backdropFilter="blur(8px)"
        border="0.5px solid rgba(160,120,90,0.2)"
        color="brand.dark"
        onClick={prev}
        _hover={{ bg: "brand.white", transform: "translateY(-50%) scale(1.05)" }}
        aria-label="Anterior"
      />
      <IconButton
        icon={<ChevronRight size={20} strokeWidth={1.5} />}
        variant="ghost"
        position="absolute"
        right={4}
        top="50%"
        transform="translateY(-50%)"
        zIndex={20}
        w="44px" h="44px"
        borderRadius="full"
        bg="rgba(253,250,247,0.6)"
        backdropFilter="blur(8px)"
        border="0.5px solid rgba(160,120,90,0.2)"
        color="brand.dark"
        onClick={next}
        _hover={{ bg: "brand.white", transform: "translateY(-50%) scale(1.05)" }}
        aria-label="Siguiente"
      />

      {/* Dots de navegación */}
      <HStack
        position="absolute"
        bottom={8}
        left="50%"
        transform="translateX(-50%)"
        zIndex={20}
        spacing={2}
      >
        {SLIDES.map((_, i) => (
          <Box
            key={i}
            ref={(el) => (dotsRef.current[i] = el)}
            h="8px"
            w={i === current ? "28px" : "8px"}
            borderRadius="full"
            bg="brand.dark"
            opacity={i === current ? 1 : 0.35}
            cursor="pointer"
            onClick={() => goTo(i)}
            transition="all 0.3s"
          />
        ))}
      </HStack>

      {/* Scroll indicator */}
      <VStack
        position="absolute"
        bottom={8}
        right={8}
        zIndex={20}
        spacing={1}
        opacity={0.4}
      >
        <Box
          w="1px"
          h="40px"
          bg="brand.dark"
          sx={{
            animation: "scrollPulse 2s ease-in-out infinite",
            "@keyframes scrollPulse": {
              "0%, 100%": { scaleY: 1, transformOrigin: "top" },
              "50%": { scaleY: 0.5, transformOrigin: "top" },
            },
          }}
        />
        <Text fontFamily="body" fontSize="2xs" letterSpacing="0.2em" textTransform="uppercase" color="brand.muted">
          scroll
        </Text>
      </VStack>
    </Box>
  );
};

export default HeroCarousel;
