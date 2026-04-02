import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

const HomePage           = lazy(() => import("../pages/HomePage"));
const CategoryPage       = lazy(() => import("../pages/CategoryPage"));
const HowToBuyPage       = lazy(() => import("../pages/HowToBuyPage"));
const CartPage           = lazy(() => import("../pages/CartPage"));
const CheckoutPage       = lazy(() => import("../pages/CheckoutPage"));
const PaymentSuccessPage = lazy(() => import("../pages/PaymentSuccessPage"));
const PaymentFailurePage = lazy(() => import("../pages/PaymentFailurePage"));
const PaymentPendingPage = lazy(() => import("../pages/PaymentPendingPage"));
const ProfilePage        = lazy(() => import("../pages/ProfilePage"));
const AdminPage          = lazy(() => import("../pages/AdminPage"));
const NotFoundPage       = lazy(() => import("../pages/NotFoundPage"));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

const LoadingScreen = () => (
  <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="brand.nude">
    <Spinner size="lg" color="brand.brown" thickness="1px" speed="0.8s" />
  </Box>
);

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/categoria/:slug" element={<Layout><CategoryPage /></Layout>} />
        <Route path="/como-comprar" element={<Layout><HowToBuyPage /></Layout>} />
        <Route path="/carrito" element={<Layout><CartPage /></Layout>} />
        <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
        <Route path="/pago-exitoso" element={<Layout><PaymentSuccessPage /></Layout>} />
        <Route path="/pago-fallido" element={<Layout><PaymentFailurePage /></Layout>} />
        <Route path="/pago-pendiente" element={<Layout><PaymentPendingPage /></Layout>} />
        <Route path="/mi-cuenta" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;