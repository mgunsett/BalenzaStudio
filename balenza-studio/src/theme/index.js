import { extendTheme } from "@chakra-ui/react";
import { colors } from "./colors";
import { typography } from "./typography";
import { componentOverrides } from "./components";
import { foundations } from "./foundations";

const theme = extendTheme({
  colors,
  fonts: typography.fonts,
  fontSizes: typography.fontSizes,
  letterSpacings: typography.letterSpacings,
  ...foundations,
  components: componentOverrides,
  styles: {
    global: {
      "html, body": {
        bg: "brand.nude",
        color: "brand.dark",
        fontFamily: "body",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      "::selection": {
        bg: "brand.sand",
        color: "brand.dark",
      },
      "* ": {
        scrollbarWidth: "thin",
        scrollbarColor: "var(--chakra-colors-brand-sand) transparent",
      },
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

export default theme;