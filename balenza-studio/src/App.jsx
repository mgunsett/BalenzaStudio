import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import theme from "./theme";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <AppRouter />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  background: "var(--chakra-colors-brand-white)",
                  color: "var(--chakra-colors-brand-dark)",
                  border: "0.5px solid rgba(160,120,90,0.2)",
                  borderRadius: "8px",
                },
              }}
            />
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;