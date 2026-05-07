import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import HeroOptimized from "../components/home/HeroOptimized";
import FeaturedProduct from "../components/home/FeaturedProduct";
import CategoryBannerOptimized from "../components/home/CategoryBannerOptimized";
import AboutSection from "../components/home/AboutSection";
import ProductGrid from "../components/products/ProductGrid";
import TrustBannerOptimized from "../components/home/TrustBannerOptimized";
import ReviewsSection from "../components/home/ReviewsSection";
import SocialSection from "../components/home/SocialSection";
import ProductModalOptimized from "../components/products/ProductModalOptimized";
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
      <HeroOptimized />
      <FeaturedProduct />
      <CategoryBannerOptimized />
      <AboutSection />
      <ProductGrid
        products={products}
        loading={loading}
        onProductClick={handleProductClick}
        title="🔥 Más vendidos"
        subtitle="Los favoritos de nuestras clientas"
      />
      <TrustBannerOptimized />
      <ReviewsSection />
      <SocialSection />

      {selectedProduct && (
        <ProductModalOptimized
          product={selectedProduct}
          isOpen={isOpen}
          onClose={() => { onClose(); setSelectedProduct(null); }}
        />
      )}
    </>
  );
};

export default HomePage;