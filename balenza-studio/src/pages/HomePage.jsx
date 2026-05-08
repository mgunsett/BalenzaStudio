import HeroOptimized from "../components/home/HeroOptimized";
import ProductsPreview from "../components/home/ProductsPreview";
import TrustBannerOptimized from "../components/home/TrustBannerOptimized";
import FeaturedProduct from "../components/home/FeaturedProduct";
import CategoryBannerOptimized from "../components/home/CategoryBannerOptimized";
import AboutSection from "../components/home/AboutSection";
import ReviewsSection from "../components/home/ReviewsSection";
import SocialSection from "../components/home/SocialSection";

const HomePage = () => {
  return (
    <>
      <HeroOptimized />
      <ProductsPreview
        title="Nuevos ingresos"
        eyebrow="Colección destacada"
        limit={8}
        ctaLabel="Ver catálogo completo"
        ctaPath="/categoria/todos"
      />
      <TrustBannerOptimized />
      <FeaturedProduct />
      <CategoryBannerOptimized />
      <AboutSection />
      <ReviewsSection />
      <SocialSection />
    </>
  );
};

export default HomePage;
