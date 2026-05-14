import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import AdminLayout   from "../components/admin/AdminLayout";
import AdminStats    from "../components/admin/AdminStats";
import ProductList   from "../components/admin/ProductList";
import ProductForm   from "../components/admin/ProductForm";
import OrderList     from "../components/admin/OrderList";
import OrderDetail   from "../components/admin/OrderDetail";
import StockManager  from "../components/admin/StockManager";
import MovementList  from "../components/admin/MovementList";
import { useAdmin }  from "../hooks/useAdmin";

const LoadingSpinner = () => (
  <Flex h="60vh" align="center" justify="center">
    <Spinner size="lg" color="brand.brown" thickness="1px" speed="0.8s" />
  </Flex>
);

const AdminPage = () => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="brand.nude">
        <Spinner size="lg" color="brand.brown" thickness="1px" />
      </Box>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index                       element={<AdminStats />}   />
        <Route path="productos"            element={<ProductList />}  />
        <Route path="productos/nuevo"      element={<ProductForm />}  />
        <Route path="productos/:productId" element={<ProductForm />}  />
        <Route path="ordenes"              element={<OrderList />}    />
        <Route path="ordenes/:orderId"     element={<OrderDetail />}  />
        <Route path="stock"                element={<StockManager />} />
        <Route path="movimientos"          element={<MovementList />} />
        <Route path="*"                    element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminPage;
