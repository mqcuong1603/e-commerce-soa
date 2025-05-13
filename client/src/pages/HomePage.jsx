import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import productService from "../services/product.service";
import ProductCard from "../components/ui/ProductCard";
import Button from "../components/ui/Button";

const HomePage = () => {
  const [landingData, setLandingData] = useState({
    newProducts: [],
    bestSellers: [],
    categoryProducts: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hero slider images
  const heroSlides = [
    {
      id: 1,
      imageUrl: "/images/banners/banner-1.jpg",
      title: "Latest Laptops",
      description: "Discover the newest models with cutting-edge performance",
      link: "/category/laptops",
    },
    {
      id: 2,
      imageUrl: "/images/banners/banner-2.jpg",
      title: "Gaming Essentials",
      description: "Level up your setup with premium gaming hardware",
      link: "/category/gaming-monitors",
    },
    {
      id: 3,
      imageUrl: "/images/banners/banner-3.jpg",
      title: "Storage Solutions",
      description: "Fast and reliable storage for all your data needs",
      link: "/category/storage",
    },
  ];

  // Current hero slide
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch landing page data
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const response = await productService.getLandingPageProducts();

        if (response.success) {
          setLandingData(response.data);
        } else {
          throw new Error(
            response.message || "Failed to fetch landing page data"
          );
        }
      } catch (err) {
        console.error("Error fetching landing page data:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Navigate to next/previous slide
  const navigateSlide = (index) => {
    setCurrentSlide(index);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Slider */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="h-[500px] relative">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              >
                <div className="container mx-auto px-4 h-full flex items-center">
                  <div className="max-w-lg bg-black bg-opacity-70 p-8 rounded-lg">
                    <h1 className="text-4xl font-bold text-white mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-gray-200 mb-6">
                      {slide.description}
                    </p>
                    <Link to={slide.link}>
                      <Button variant="primary" size="large">
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? "bg-white" : "bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Shop By Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link
              to="/category/laptops"
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center">
                <img
                  src="/images/categories/laptops.jpg"
                  alt="Laptops"
                  className="w-16 h-16 object-contain mb-2"
                />
                <span className="font-medium">Laptops</span>
              </div>
            </Link>
            <Link
              to="/category/monitors"
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center">
                <img
                  src="/images/categories/monitors.jpg"
                  alt="Monitors"
                  className="w-16 h-16 object-contain mb-2"
                />
                <span className="font-medium">Monitors</span>
              </div>
            </Link>
            <Link
              to="/category/storage"
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center">
                <img
                  src="/images/categories/storage.jpg"
                  alt="Storage"
                  className="w-16 h-16 object-contain mb-2"
                />
                <span className="font-medium">Storage</span>
              </div>
            </Link>
            <Link
              to="/category/processors"
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center">
                <img
                  src="/images/categories/processors.jpg"
                  alt="Processors"
                  className="w-16 h-16 object-contain mb-2"
                />
                <span className="font-medium">Processors</span>
              </div>
            </Link>
            <Link
              to="/category/graphics-cards"
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center">
                <img
                  src="/images/categories/gpu.jpg"
                  alt="Graphics Cards"
                  className="w-16 h-16 object-contain mb-2"
                />
                <span className="font-medium">Graphics Cards</span>
              </div>
            </Link>
            <Link
              to="/category/motherboards"
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center">
                <img
                  src="/images/categories/motherboards.jpg"
                  alt="Motherboards"
                  className="w-16 h-16 object-contain mb-2"
                />
                <span className="font-medium">Motherboards</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Best Sellers</h2>
            <Link to="/products?sort=bestSellers">
              <Button variant="outlined">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {landingData.bestSellers?.length > 0 ? (
              landingData.bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-4 text-center text-gray-500">
                No best sellers found.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">New Arrivals</h2>
            <Link to="/products?sort=newest">
              <Button variant="outlined">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {landingData.newProducts?.length > 0 ? (
              landingData.newProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-4 text-center text-gray-500">
                No new products found.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Category Specific Products */}
      {Object.keys(landingData.categoryProducts || {}).length > 0 &&
        Object.keys(landingData.categoryProducts).map((categoryId) => {
          const category = landingData.categoryProducts[categoryId];
          return (
            <section key={categoryId} className="py-10">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold">
                    {category.category.name}
                  </h2>
                  <Link to={`/category/${category.category.slug}`}>
                    <Button variant="outlined">View All</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {category.products?.length > 0 ? (
                    category.products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))
                  ) : (
                    <p className="col-span-4 text-center text-gray-500">
                      No products found in this category.
                    </p>
                  )}
                </div>
              </div>
            </section>
          );
        })}

      {/* Features Section */}
      <section className="py-10 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Genuine Products</h3>
              <p className="text-gray-600">
                All our products are 100% genuine with manufacturer warranty
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                We deliver your orders within 24-48 hours in major cities
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Multiple secure payment options including cash on delivery
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600">
                Hassle-free 7-day return policy on most products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Top Brands</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
              <img
                src="/images/brands/dell.png"
                alt="Dell"
                className="h-12 object-contain"
              />
            </div>
            <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
              <img
                src="/images/brands/hp.png"
                alt="HP"
                className="h-12 object-contain"
              />
            </div>
            <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
              <img
                src="/images/brands/lenovo.png"
                alt="Lenovo"
                className="h-12 object-contain"
              />
            </div>
            <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
              <img
                src="/images/brands/samsung.png"
                alt="Samsung"
                className="h-12 object-contain"
              />
            </div>
            <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
              <img
                src="/images/brands/asus.png"
                alt="ASUS"
                className="h-12 object-contain"
              />
            </div>
            <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
              <img
                src="/images/brands/msi.png"
                alt="MSI"
                className="h-12 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-lg mb-6">
              Stay updated with our latest products, deals and tech news
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-l-md focus:outline-none text-gray-900"
              />
              <button
                type="submit"
                className="bg-primary-600 px-6 py-3 rounded-r-md hover:bg-primary-700 focus:outline-none"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
