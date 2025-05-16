import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Tab, Card, Button, Alert, Spinner } from "react-bootstrap";
import AdminLayout from "../../components/admin/AdminLayout";
import BasicInfoForm from "../../components/admin/product/BasicInfoForm";
import ImagesManager from "../../components/admin/product/ImagesManager";
import VariantsManager from "../../components/admin/product/VariantsManager";
import PricingInventoryForm from "../../components/admin/product/PricingInventoryForm";
import adminService from "../../services/admin.service";
import { toast } from "react-toastify";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [error, setError] = useState(null);

  // Form state
  const [basicInfo, setBasicInfo] = useState({});
  const [pricing, setPricing] = useState({});
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await adminService.getProductDetails(id);

        if (response.success) {
          const productData = response.data;
          setProduct(productData);

          // Initialize form state
          setBasicInfo({
            name: productData.name,
            brand: productData.brand,
            description: productData.description,
            shortDescription: productData.shortDescription,
            categories: productData.categories?.map((cat) => cat._id) || [],
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
            isNewProduct: productData.isNewProduct,
            isBestSeller: productData.isBestSeller,
          });

          setPricing({
            basePrice: productData.basePrice,
            salePrice: productData.salePrice || "",
            inventory: productData.inventory || 0,
            hasVariants:
              productData.variants && productData.variants.length > 0,
          });

          setImages(productData.images || []);
          setVariants(productData.variants || []);
        }
      } catch (error) {
        setError("Failed to load product data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle save all changes
  const handleSave = async () => {
    try {
      setSaving(true);

      // Save basic product info
      const productData = {
        ...basicInfo,
        basePrice: pricing.basePrice,
        salePrice: pricing.salePrice || undefined,
        inventory: !pricing.hasVariants ? pricing.inventory : undefined,
      };

      const productResponse = await adminService.updateProduct(id, productData);

      if (productResponse.success) {
        // Handle images (add/delete)
        // This would be implemented in a separate component

        // Handle variants (add/update/delete)
        // This would be implemented in a separate component

        toast.success("Product updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="danger">{error}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3">Edit Product: {product?.name}</h1>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />{" "}
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-0">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="basic" title="Basic Information">
                <BasicInfoForm data={basicInfo} onChange={setBasicInfo} />
              </Tab>

              <Tab eventKey="pricing" title="Pricing & Inventory">
                <PricingInventoryForm
                  data={pricing}
                  onChange={setPricing}
                  hasVariants={variants.length > 0}
                />
              </Tab>

              <Tab eventKey="images" title="Images">
                <ImagesManager
                  productId={id}
                  images={images}
                  onChange={setImages}
                />
              </Tab>

              <Tab eventKey="variants" title={`Variants (${variants.length})`}>
                <VariantsManager
                  productId={id}
                  variants={variants}
                  onChange={setVariants}
                />
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditProductPage;
