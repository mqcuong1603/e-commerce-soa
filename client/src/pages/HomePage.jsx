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
    parentCategories: [],
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

        // Get landing page products
        const response = await productService.getLandingPageProducts();

        // Fetch parent categories for "Shop By Category" section
        const categoryResponse = await productService.getCategoryTree();

        if (response.success && categoryResponse.success) {
          // Get only parent categories (categories with no parentId)
          const parentCategories = categoryResponse.data.filter(
            (cat) => !cat.parentId && cat.isActive !== false
          );

          setLandingData({
            ...response.data,
            parentCategories: parentCategories.slice(0, 6), // Limit to 6 parent categories
          });
        } else {
          throw new Error(
            response.message ||
              categoryResponse.message ||
              "Failed to fetch landing page data"
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
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center min-vh-40">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <p className="mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-danger"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Slider */}
      <section className="position-relative bg-dark mb-4">
        <div className="position-relative" style={{ height: "500px" }}>
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`position-absolute top-0 start-0 w-100 h-100 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transition: "opacity 1s ease-in-out",
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <div
                className="h-100 d-flex align-items-center"
                style={{
                  backgroundImage: `url(${slide.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="container">
                  <div
                    className="card bg-dark bg-opacity-75 text-white p-4 p-md-5"
                    style={{ maxWidth: "550px" }}
                  >
                    <h1 className="display-5 fw-bold mb-3">{slide.title}</h1>
                    <p className="lead mb-4">{slide.description}</p>
                    <div>
                      <Link to={slide.link}>
                        <Button variant="primary" size="large">
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider indicators */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
          <div className="d-flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => navigateSlide(index)}
                className={`rounded-circle border-0 ${
                  index === currentSlide
                    ? "bg-danger"
                    : "bg-secondary bg-opacity-50"
                }`}
                style={{ width: "12px", height: "12px" }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Category - UPDATED to display only parent categories */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <h2 className="text-center fw-bold mb-0">Shop By Category</h2>
            <Link to="/products">
              <Button variant="outlined">
                View All Categories <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </Link>
          </div>

          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3">
            {landingData.parentCategories &&
            landingData.parentCategories.length > 0 ? (
              landingData.parentCategories.map((category) => (
                <div className="col" key={category._id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-decoration-none"
                  >
                    <div className="card h-100 border-0 shadow-sm product-card">
                      <div className="card-body text-center p-3">
                        <div
                          className="rounded-circle bg-white shadow-sm mx-auto mb-3 d-flex align-items-center justify-content-center"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <img
                            src={
                              category.image ||
                              `/images/categories/${category.slug}.jpg`
                            }
                            alt={category.name}
                            className="object-fit-contain"
                            width="64"
                            height="64"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/images/categories/placeholder.jpg";
                            }}
                          />
                        </div>
                        <h6 className="card-title fw-medium text-dark">
                          {category.name}
                        </h6>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-3">
                <p className="text-muted">No categories available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <h2 className="fw-bold mb-0">Best Sellers</h2>
            <Link to="/products?sort=bestSellers">
              <Button variant="outlined">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </Link>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {landingData.bestSellers?.length > 0 ? (
              landingData.bestSellers.slice(0, 4).map((product) => (
                <div className="col" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-inbox text-secondary fs-1 d-block mb-3"></i>
                <p className="text-muted">No best sellers found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <h2 className="fw-bold mb-0">New Arrivals</h2>
            <Link to="/products?sort=newest">
              <Button variant="outlined">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </Link>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {landingData.newProducts?.length > 0 ? (
              landingData.newProducts.slice(0, 4).map((product) => (
                <div className="col" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-inbox text-secondary fs-1 d-block mb-3"></i>
                <p className="text-muted">No new products found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Specific Products - UPDATED to show only 3 parent categories with max 4 products each */}
      {Object.keys(landingData.categoryProducts || {}).length > 0 &&
        Object.keys(landingData.categoryProducts)
          .slice(0, 3) // Limit to 3 parent categories
          .map((categoryId, index) => {
            const category = landingData.categoryProducts[categoryId];

            // Check if this is a parent category (no parentId)
            const isParentCategory = !category.category.parentId;

            // Skip if not a parent category (we only want to show parent categories)
            if (!isParentCategory) return null;

            return (
              <section
                key={categoryId}
                className={`py-5 ${index % 2 !== 0 ? "bg-light" : ""}`}
              >
                <div className="container">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <h2 className="fw-bold mb-0">{category.category.name}</h2>
                    <Link to={`/category/${category.category.slug}`}>
                      <Button variant="outlined">
                        View All <i className="bi bi-arrow-right ms-1"></i>
                      </Button>
                    </Link>
                  </div>
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {category.products?.length > 0 ? (
                      category.products.slice(0, 4).map(
                        (
                          product // Limit to 4 products
                        ) => (
                          <div className="col" key={product._id}>
                            <ProductCard product={product} />
                          </div>
                        )
                      )
                    ) : (
                      <div className="col-12 text-center py-5">
                        <i className="bi bi-inbox text-secondary fs-1 d-block mb-3"></i>
                        <p className="text-muted">
                          No products found in this category.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">Why Choose Us</h2>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {[
              {
                icon: "bi-check-lg",
                title: "Genuine Products",
                text: "All our products are 100% genuine with manufacturer warranty",
                color: "primary",
              },
              {
                icon: "bi-clock",
                title: "Fast Delivery",
                text: "We deliver your orders within 24-48 hours in major cities",
                color: "success",
              },
              {
                icon: "bi-shield-check",
                title: "Secure Payments",
                text: "Multiple secure payment options including cash on delivery",
                color: "danger",
              },
              {
                icon: "bi-arrow-return-left",
                title: "Easy Returns",
                text: "Hassle-free 7-day return policy on most products",
                color: "info",
              },
            ].map((feature, index) => (
              <div className="col" key={index}>
                <div className="card h-100 border-0 shadow-sm text-center product-card">
                  <div className="card-body p-4">
                    <div
                      className={`rounded-circle bg-${feature.color} bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3`}
                      style={{ width: "70px", height: "70px" }}
                    >
                      <i
                        className={`bi ${feature.icon} text-${feature.color} fs-3`}
                      ></i>
                    </div>
                    <h5 className="card-title fw-bold mb-3">{feature.title}</h5>
                    <p className="card-text text-muted mb-0 small">
                      {feature.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
