import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tabs,
  Tab,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Breadcrumb,
} from "react-bootstrap";
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
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Form state
  const [basicInfo, setBasicInfo] = useState({});
  const [pricing, setPricing] = useState({});
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);

  // Handle form changes and track unsaved changes
  const handleBasicInfoChange = (data) => {
    setBasicInfo(data);
    setUnsavedChanges(true);
  };

  const handlePricingChange = (data) => {
    setPricing(data);
    setUnsavedChanges(true);
  };
  const handleImagesChange = (data) => {
    // Validate that we have at least one main product image
    const hasMainProductImage = data.some(
      (img) => img.isMain && !img.variantId
    );

    // If no main product image exists but we have images, set the first product image as main
    if (
      !hasMainProductImage &&
      data.filter((img) => !img.variantId).length > 0
    ) {
      const firstProductImage = data.find((img) => !img.variantId);
      if (firstProductImage) {
        data = data.map((img) => {
          if (img._id === firstProductImage._id) {
            return { ...img, isMain: true };
          } else if (!img.variantId) {
            // Ensure other product images are not marked as main
            return { ...img, isMain: false };
          }
          return img;
        });

        // Update on server (would happen inside the ImagesManager, but this ensures consistency)
        adminService
          .updateProductImage(id, firstProductImage._id, { isMain: true })
          .then((result) => {
            if (result.success) {
              toast.success("Main product image has been set automatically");
            }
          })
          .catch((err) => console.error("Failed to update main image:", err));
      }
    }

    // Check that each variant with specific images has a main variant image
    variants.forEach((variant) => {
      const variantImages = data.filter((img) => img.variantId === variant._id);
      if (
        variantImages.length > 0 &&
        !variantImages.some((img) => img.isMain)
      ) {
        // Set the first variant image as main for that variant
        const firstVariantImage = variantImages[0];
        data = data.map((img) => {
          if (img._id === firstVariantImage._id) {
            return { ...img, isMain: true };
          }
          return img;
        });

        // Update on server
        adminService
          .updateProductImage(id, firstVariantImage._id, { isMain: true })
          .catch((err) =>
            console.error(
              `Failed to update main image for variant ${variant._id}:`,
              err
            )
          );
      }
    });

    setImages(data);
    // Images are saved immediately so no need to track changes
  };
  const handleVariantsChange = (data) => {
    // Check if any variants were deleted (to clean up images)
    const deletedVariantIds = variants
      .filter(
        (oldVariant) =>
          !data.some((newVariant) => newVariant._id === oldVariant._id)
      )
      .map((variant) => variant._id);

    // Update variant images (mark deleted variant images as general product images)
    if (deletedVariantIds.length > 0) {
      const updatedImages = images.map((image) => {
        if (image.variantId && deletedVariantIds.includes(image.variantId)) {
          // Convert to general product image if variant is deleted
          return { ...image, variantId: null };
        }
        return image;
      });

      // Update images if needed
      if (JSON.stringify(images) !== JSON.stringify(updatedImages)) {
        setImages(updatedImages);
      }
    }

    setVariants(data);
    // Variants are saved immediately so no need to track changes
  };

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
            tags: productData.tags || [],
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
            isNewProduct: productData.isNewProduct,
            isBestSeller: productData.isBestSeller,
          });

          setPricing({
            basePrice: productData.basePrice,
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

      // Validate that we have at least one product image
      if (images.length === 0) {
        toast.warning("Please add at least one image for the product");
        setActiveTab("images");
        setSaving(false);
        return;
      }

      // Validate that each variant has proper images
      const hasVariantWithoutImages = variants.some((variant) => {
        // Check if this variant has specific images
        const variantImages = images.filter(
          (img) => img.variantId === variant._id
        );
        return variantImages.length === 0;
      });

      if (hasVariantWithoutImages) {
        // Just a warning, not a blocker
        toast.info(
          "Some variants don't have specific images. They will use the general product images."
        );
      }

      // Save basic product info
      const productData = {
        ...basicInfo,
        basePrice: pricing.basePrice,
      };

      const productResponse = await adminService.updateProduct(id, productData);

      if (productResponse.success) {
        toast.success("Product updated successfully");
        setUnsavedChanges(false);
      }
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Navigate to product list with confirmation if unsaved changes
  const handleNavigateBack = () => {
    if (unsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate("/admin/products");
      }
    } else {
      navigate("/admin/products");
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading product data...</span>
        </div>
      </AdminLayout>
    );
  }

  // Show error if failed to load
  if (error) {
    return (
      <AdminLayout>
        <Alert variant="danger">{error}</Alert>
      </AdminLayout>
    );
  }

  // Check if product has variants
  const hasVariants = variants && variants.length > 0;

  // Check if a required variant exists when needed
  const needsVariant = !hasVariants && pricing.hasVariants;

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item onClick={() => navigate("/admin/dashboard")}>
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => navigate("/admin/products")}>
            Products
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Edit: {product?.name}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header with Status Badge */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">{product?.name}</h1>
            <div>
              <Badge
                bg={product?.isActive ? "success" : "secondary"}
                className="me-2"
              >
                {product?.isActive ? "Active" : "Inactive"}
              </Badge>
              {product?.isFeatured && (
                <Badge bg="primary" className="me-2">
                  Featured
                </Badge>
              )}
              {product?.isNewProduct && (
                <Badge bg="info" className="me-2">
                  New
                </Badge>
              )}
              {product?.isBestSeller && <Badge bg="warning">Best Seller</Badge>}
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={handleNavigateBack}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !unsavedChanges}
            >
              {saving ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />{" "}
                  Saving...
                </>
              ) : unsavedChanges ? (
                "Save Changes"
              ) : (
                "Saved"
              )}
            </Button>
          </div>
        </div>

        {/* Warning for missing variants */}
        {needsVariant && (
          <Alert variant="warning" className="mb-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
              <div>
                <h5 className="mb-1">Product requires variants</h5>
                <p className="mb-0">
                  This product is set to use variants but no variants have been
                  created yet. Please add at least one variant in the Variants
                  tab.
                </p>
              </div>
              <Button
                variant="warning"
                className="ms-auto"
                onClick={() => setActiveTab("variants")}
              >
                Add Variants
              </Button>
            </div>
          </Alert>
        )}

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
              fill
            >
              <Tab
                eventKey="basic"
                title={
                  <div className="py-2">
                    <i className="bi bi-info-circle me-2"></i>
                    Basic Information
                  </div>
                }
              >
                <div className="p-4">
                  <BasicInfoForm
                    data={basicInfo}
                    onChange={handleBasicInfoChange}
                  />
                </div>
              </Tab>
              <Tab
                eventKey="pricing"
                title={
                  <div className="py-2">
                    <i className="bi bi-tag me-2"></i>
                    Pricing & Variants
                  </div>
                }
              >
                <div className="p-4">
                  <PricingInventoryForm
                    data={pricing}
                    onChange={handlePricingChange}
                    hasVariants={variants.length > 0}
                  />
                </div>
              </Tab>{" "}
              <Tab
                eventKey="images"
                title={
                  <div className="py-2">
                    <i className="bi bi-images me-2"></i>
                    Images <Badge bg="secondary">{images.length}</Badge>
                    {images.filter((img) => img.variantId).length > 0 && (
                      <Badge bg="info" className="ms-1" pill>
                        {images.filter((img) => img.variantId).length} Variant
                      </Badge>
                    )}
                  </div>
                }
              >
                <div className="p-4">
                  <ImagesManager
                    productId={id}
                    images={images}
                    onChange={handleImagesChange}
                    variants={variants}
                  />
                </div>
              </Tab>
              <Tab
                eventKey="variants"
                title={
                  <div className="py-2">
                    <i className="bi bi-boxes me-2"></i>
                    Variants{" "}
                    <Badge bg={hasVariants ? "secondary" : "warning"}>
                      {variants.length}
                    </Badge>
                  </div>
                }
              >
                <div className="p-4">
                  <VariantsManager
                    productId={id}
                    variants={variants}
                    onChange={handleVariantsChange}
                  />
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditProductPage;
