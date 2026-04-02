export const componentOverrides = {

  Button: {
    baseStyle: {
      fontFamily: "body",
      fontWeight: 400,
      letterSpacing: "wider",
      textTransform: "uppercase",
      fontSize: "xs",
      borderRadius: "sm",
      transition: "all 0.25s ease",
      _focus: { boxShadow: "none" },
    },
    variants: {
      primary: {
        bg: "brand.dark",
        color: "brand.white",
        _hover: { bg: "brand.brown", transform: "translateY(-1px)" },
        _active: { transform: "translateY(0)" },
      },
      outline: {
        bg: "transparent",
        color: "brand.dark",
        border: "1px solid",
        borderColor: "brand.dark",
        _hover: { bg: "brand.dark", color: "brand.white", transform: "translateY(-1px)" },
        _active: { transform: "translateY(0)" },
      },
      ghost: {
        color: "brand.muted",
        _hover: { bg: "brand.beige", color: "brand.dark" },
      },
      mercadopago: {
        bg: "mp.blue",
        color: "white",
        borderRadius: "md",
        letterSpacing: "normal",
        textTransform: "none",
        fontWeight: 500,
        _hover: { bg: "mp.blueDark", transform: "translateY(-1px)" },
      },
      whatsapp: {
        bg: "wa.green",
        color: "white",
        borderRadius: "md",
        letterSpacing: "normal",
        textTransform: "none",
        fontWeight: 500,
        _hover: { bg: "wa.greenDark", transform: "translateY(-1px)" },
      },
    },
    defaultProps: { variant: "primary" },
  },

  Input: {
    baseStyle: {
      field: {
        fontFamily: "body",
        bg: "brand.white",
        border: "0.5px solid",
        borderColor: "rgba(160,120,90,0.3)",
        borderRadius: "sm",
        color: "brand.dark",
        fontSize: "sm",
        _placeholder: { color: "brand.muted" },
        _focus: {
          borderColor: "brand.brown",
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-brown)",
        },
        _hover: { borderColor: "brand.sand" },
      },
    },
    defaultProps: { variant: "unstyled" },
  },

  Select: {
    baseStyle: {
      field: {
        fontFamily: "body",
        bg: "brand.white",
        border: "0.5px solid",
        borderColor: "rgba(160,120,90,0.3)",
        borderRadius: "sm",
        color: "brand.dark",
        fontSize: "sm",
        _focus: { borderColor: "brand.brown" },
      },
    },
    defaultProps: { variant: "unstyled" },
  },

  Heading: {
    baseStyle: {
      fontFamily: "heading",
      fontWeight: 300,
      color: "brand.dark",
      letterSpacing: "wide",
    },
  },

  Text: {
    baseStyle: {
      fontFamily: "body",
      color: "brand.dark",
    },
  },

  Link: {
    baseStyle: {
      color: "brand.brown",
      textDecoration: "none",
      _hover: { color: "brand.dark", textDecoration: "none" },
    },
  },

  Badge: {
    baseStyle: {
      fontFamily: "body",
      fontWeight: 400,
      letterSpacing: "wider",
      textTransform: "uppercase",
      fontSize: "2xs",
      borderRadius: "full",
      px: 2,
      py: 0.5,
    },
    variants: {
      brand: {
        bg: "brand.brown",
        color: "brand.white",
      },
      subtle: {
        bg: "brand.beige",
        color: "brand.muted",
      },
      sale: {
        bg: "brand.success",
        color: "brand.white",
      },
    },
  },

  Modal: {
    baseStyle: {
      dialog: {
        bg: "brand.cream",
        borderRadius: "xl",
        shadow: "lg",
      },
      overlay: {
        bg: "rgba(44,26,14,0.5)",
        backdropFilter: "blur(4px)",
      },
      header: {
        fontFamily: "heading",
        fontWeight: 300,
        fontSize: "2xl",
        letterSpacing: "wide",
      },
    },
  },

  Drawer: {
    baseStyle: {
      dialog: {
        bg: "brand.cream",
      },
      overlay: {
        bg: "rgba(44,26,14,0.4)",
        backdropFilter: "blur(4px)",
      },
    },
  },

  Divider: {
    baseStyle: {
      borderColor: "rgba(160,120,90,0.2)",
    },
  },

  Popover: {
    baseStyle: {
      content: {
        bg: "brand.white",
        borderColor: "rgba(160,120,90,0.2)",
        borderRadius: "lg",
        shadow: "md",
      },
    },
  },

  Menu: {
    baseStyle: {
      list: {
        bg: "brand.white",
        borderColor: "rgba(160,120,90,0.2)",
        borderRadius: "lg",
        shadow: "md",
        py: 2,
      },
      item: {
        fontFamily: "body",
        fontSize: "sm",
        color: "brand.muted",
        _hover: { bg: "brand.beige", color: "brand.dark" },
        _focus: { bg: "brand.beige" },
      },
    },
  },

  Table: {
    variants: {
      balenza: {
        th: {
          fontFamily: "body",
          fontWeight: 500,
          fontSize: "2xs",
          letterSpacing: "widest",
          textTransform: "uppercase",
          color: "brand.muted",
          borderColor: "rgba(160,120,90,0.15)",
        },
        td: {
          fontFamily: "body",
          fontSize: "sm",
          color: "brand.dark",
          borderColor: "rgba(160,120,90,0.1)",
        },
      },
    },
  },
};