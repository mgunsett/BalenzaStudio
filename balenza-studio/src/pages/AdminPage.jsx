import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout  from "../components/admin/AdminLayout";
import AdminStats   from "../components/admin/AdminStats";
import ProductList  from "../components/admin/ProductList";
import ProductForm  from "../components/admin/ProductForm";
import OrderList    from "../components/admin/OrderList";
import OrderDetail  from "../components/admin/OrderDetail";
import StockManager from "../components/admin/StockManager";
import { useAdmin } from "../hooks/useAdmin";
import { Box, Spinner } from "@chakra-ui/react";

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
        <Route index             element={<AdminStats />}   />
        <Route path="productos"  element={<ProductList />}  />
        <Route path="productos/nuevo" element={<ProductForm />} />
        <Route path="productos/:id"   element={<ProductForm />} />
        <Route path="ordenes"    element={<OrderList />}    />
        <Route path="ordenes/:id"element={<OrderDetail />}  />
        <Route path="stats"      element={<AdminStats />}   />
        <Route path="stock"      element={<StockManager />} />
        <Route path="*"          element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminPage;
