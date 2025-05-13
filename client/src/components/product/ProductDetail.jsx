import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductDetail from "../components/product/ProductDetail";
import productService from "../services/product.service";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductBySlug(slug);

        if (response.success) {
          setProduct(response.data);
        } else {
          setError("Failed to load product");
        }
      } catch (err) {
        setError("Error loading product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </div>
  );
};

export default ProductDetailPage;
