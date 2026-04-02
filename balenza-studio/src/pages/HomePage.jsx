import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import HeroCarousel from "../components/home/HeroCarousel";
import FeaturedProduct from "../components/home/FeaturedProduct";
import CategoryBanner from "../components/home/CategoryBanner";
import AboutSection from "../components/home/AboutSection";
import ProductGrid from "../components/products/ProductGrid";
import TrustBanner from "../components/home/TrustBanner";
import SocialSection from "../components/home/SocialSection";
import ProductModal from "../components/products/ProductModal";
import { useProducts } from "../hooks/useProducts";

const HomePage = () => {
  const { products, loading } = useProducts({ limit: 8 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  return (
    <>
      <HeroCarousel />
      <FeaturedProduct />
      <CategoryBanner />
      <AboutSection />
      <ProductGrid
        products={products}
        loading={loading}
        onProductClick={handleProductClick}
        title="Nuevos ingresos"
        subtitle="Colección actual"
      />
      <TrustBanner />
      <SocialSection />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isOpen}
          onClose={() => { onClose(); setSelectedProduct(null); }}
        />
      )}
    </>
  );
};

export default HomePage;