import React, { useState, useEffect, useCallback } from "react";
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
  Container,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
  Modal,
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Form state
  const [basicInfo, setBasicInfo] = useState({});
  const [pricing, setPricing] = useState({});
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);

  // Form completion status
  const [completionStatus, setCompletionStatus] = useState({
    basic: false,
    pricing: false,
    images: false,
    variants: false,
  });

  // Handle form changes and track unsaved changes
  const handleBasicInfoChange = (data) => {
    setBasicInfo(data);
    setUnsavedChanges(true);

    // Update completion status
    const isComplete =
      data.name &&
      data.brand &&
      data.categories?.length > 0 &&
      data.shortDescription &&
      data.description;

    setCompletionStatus((prev) => ({ ...prev, basic: isComplete }));
  };

  const handlePricingChange = (data) => {
    setPricing(data);
    setUnsavedChanges(true);

    // Update completion status
    const isComplete =
      data.basePrice && (!data.hasVariants || variants.length > 0);
    setCompletionStatus((prev) => ({ ...prev, pricing: isComplete }));
  };

  const handleImagesChange = useCallback(
    (newImages) => {
      // Filter for product images only, as ImagesManager now only deals with these.
      const productImages = newImages.filter((img) => !img.variantId);

      // Validate that we have at least one main product image if product images exist
      let updatedImages = [...newImages]; // Start with newImages

      if (
        productImages.length > 0 &&
        !productImages.some((img) => img.isMain)
      ) {
        const firstProductImage = productImages[0];
        if (firstProductImage && firstProductImage._id) {
          // Ensure it has an ID (i.e., it's a saved image)
          // This logic is now primarily handled within ImagesManager's useEffect and setMain
          // However, we ensure the state here reflects it for consistency if needed by other parts of EditProductPage
          updatedImages = newImages.map((img) => {
            if (img._id === firstProductImage._id) {
              return { ...img, isMain: true };
            } else if (!img.variantId) {
              return { ...img, isMain: false };
            }
            return img;
          });
        }
      }

      setImages(updatedImages);
      setUnsavedChanges(true); // Image changes might require a general save if other parts of product depend on it

      const isComplete =
        productImages.length > 0 && productImages.some((img) => img.isMain);
      setCompletionStatus((prev) => ({ ...prev, images: isComplete }));
    },
    [setImages, setUnsavedChanges, setCompletionStatus]
  ); // Dependencies for useCallback

  const handleVariantsChange = (data) => {
    setVariants(data);
    setUnsavedChanges(true);
    // Update completion status
    const isComplete = !pricing.hasVariants || data.length > 0;
    setCompletionStatus((prev) => ({ ...prev, variants: isComplete }));
  };

  // Calculate overall completion percentage
  const calculateCompletion = () => {
    const fields = Object.values(completionStatus);
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
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
          const initialBasicInfo = {
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
          };

          setBasicInfo(initialBasicInfo);

          const initialPricing = {
            basePrice: productData.basePrice,
            hasVariants:
              productData.variants && productData.variants.length > 0,
          };

          setPricing(initialPricing);

          // Images are now only product-level from the server for this manager
          const productLevelImages = (productData.images || []).filter(
            (img) => !img.variantId
          );
          setImages(productLevelImages);

          const productVariants = productData.variants || [];
          setVariants(productVariants);

          // Set initial completion status
          setCompletionStatus({
            basic:
              !!initialBasicInfo.name &&
              !!initialBasicInfo.brand &&
              initialBasicInfo.categories?.length > 0 &&
              !!initialBasicInfo.description &&
              !!initialBasicInfo.shortDescription,
            pricing:
              !!initialPricing.basePrice &&
              (!initialPricing.hasVariants || productVariants.length > 0),
            images:
              productLevelImages.length > 0 &&
              productLevelImages.some((img) => img.isMain),
            variants: !initialPricing.hasVariants || productVariants.length > 0,
          });
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
      setError(null);

      const productLevelImages = images.filter((img) => !img.variantId);

      if (productLevelImages.length === 0) {
        toast.warning("Please add at least one image for the product.");
        setActiveTab("images");
        setSaving(false);
        return;
      }
      if (!productLevelImages.some((img) => img.isMain)) {
        toast.warning("Please set one product image as the main image.");
        setActiveTab("images");
        setSaving(false);
        return;
      }

      // Save basic product info + variants
      const productUpdateData = {
        ...basicInfo,
        basePrice: pricing.basePrice,
        // variants: variants, // variants are updated via VariantsManager and its own save
        // images are handled by ImagesManager directly via its own API calls
      };

      const productResponse = await adminService.updateProduct(
        id,
        productUpdateData
      );

      if (productResponse.success) {
        // Update variants if any changes
        // This part assumes VariantsManager handles its own save or provides data to save here.
        // For simplicity, let's assume VariantsManager handles its own saving for now.
        // If variants need to be saved as part of this main save, adjust accordingly.

        // Example: if variants need to be saved with the product update
        // const variantsToSave = variants.map(v => ({ ...v, productId: id }));
        // await adminService.updateProductVariants(id, variantsToSave); // Hypothetical endpoint

        toast.success("Product updated successfully");
        setProduct((prev) => ({ ...prev, ...productResponse.data })); // Update local product state
        setUnsavedChanges(false);
        // Optionally, refetch product to ensure data consistency if server modifies data significantly
        // fetchProduct();
      } else {
        toast.error(productResponse.message || "Failed to update product.");
        setError(productResponse.message || "Failed to update product.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("An error occurred while saving the product.");
      setError("An error occurred while saving the product.");
    } finally {
      setSaving(false);
    }
  };

  // Navigate to product list with confirmation if unsaved changes
  const handleNavigateBack = () => {
    if (unsavedChanges) {
      setShowExitConfirm(true);
    } else {
      navigate("/admin/products");
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    navigate("/admin/products");
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <div className="d-flex flex-column align-items-center my-5 py-5">
            <Spinner
              animation="border"
              variant="primary"
              className="mb-3"
              size="lg"
            />
            <h5 className="text-primary mb-0">Loading product data...</h5>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  // Show error if failed to load
  if (error) {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <Alert variant="danger" className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>
              <strong className="d-block mb-1">Error Loading Product</strong>
              <p className="mb-0">{error}</p>
            </div>
            <Button
              variant="outline-danger"
              className="ms-auto"
              onClick={() => navigate("/admin/products")}
            >
              Return to Products
            </Button>
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  // Check if product has variants
  const hasVariants = variants && variants.length > 0;

  // Check if a required variant exists when needed
  const needsVariant = !hasVariants && pricing.hasVariants;

  // Get completion percentage
  const completionPercentage = calculateCompletion();

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item
            onClick={() => navigate("/admin/dashboard")}
            className="cursor-pointer"
          >
            <i className="bi bi-speedometer2 me-1"></i> Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item
            onClick={() => navigate("/admin/products")}
            className="cursor-pointer"
          >
            <i className="bi bi-box me-1"></i> Products
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            <i className="bi bi-pencil-square me-1"></i> Edit: {product?.name}
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Header with Status Badge */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-2 d-flex align-items-center">
              {product?.name}
              {product?.isActive ? (
                <Badge bg="success" pill className="ms-2 px-3 py-2">
                  <i className="bi bi-check-circle me-1"></i> Active
                </Badge>
              ) : (
                <Badge bg="secondary" pill className="ms-2 px-3 py-2">
                  <i className="bi bi-dash-circle me-1"></i> Inactive
                </Badge>
              )}
            </h1>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {product?.isFeatured && (
                <Badge bg="primary" pill className="px-3 py-2">
                  <i className="bi bi-star-fill me-1"></i> Featured
                </Badge>
              )}
              {product?.isNewProduct && (
                <Badge bg="info" pill className="px-3 py-2">
                  <i className="bi bi-patch-check-fill me-1"></i> New
                </Badge>
              )}
              {product?.isBestSeller && (
                <Badge bg="warning" pill className="px-3 py-2">
                  <i className="bi bi-trophy-fill me-1"></i> Best Seller
                </Badge>
              )}
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center mt-3 mt-md-0">
            <div className="completion-indicator me-2 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-muted">Completion</span>
                <Badge
                  bg={completionPercentage === 100 ? "success" : "secondary"}
                  pill
                >
                  {completionPercentage}%
                </Badge>
              </div>
              <ProgressBar
                now={completionPercentage}
                variant={completionPercentage === 100 ? "success" : "primary"}
                style={{ height: "8px", width: "150px" }}
              />
            </div>
            <Button
              variant="outline-secondary"
              onClick={handleNavigateBack}
              className="d-flex align-items-center"
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </Button>
            <Button
              variant={unsavedChanges ? "primary" : "success"}
              onClick={handleSave}
              disabled={saving || !unsavedChanges}
              className="d-flex align-items-center"
            >
              {saving ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />{" "}
                  Saving...
                </>
              ) : unsavedChanges ? (
                <>
                  <i className="bi bi-save me-1"></i> Save Changes
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-1"></i> Saved
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Warning for missing variants */}
        {needsVariant && (
          <Alert variant="warning" className="mb-4 d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3 text-warning"></i>
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
              <i className="bi bi-plus-lg me-1"></i> Add Variants
            </Button>
          </Alert>
        )}

        <Card className="shadow border-0">
          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0 product-tabs"
              fill
            >
              <Tab
                eventKey="basic"
                title={
                  <div className="d-flex align-items-center py-2 px-1">
                    <div
                      className={`status-indicator ${
                        completionStatus.basic ? "complete" : "incomplete"
                      } me-2`}
                    ></div>
                    <i className="bi bi-info-circle me-2"></i>
                    <span className="d-none d-sm-inline">
                      Basic Information
                    </span>
                    <span className="d-sm-none">Basic</span>
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
                  <div className="d-flex align-items-center py-2 px-1">
                    <div
                      className={`status-indicator ${
                        completionStatus.pricing ? "complete" : "incomplete"
                      } me-2`}
                    ></div>
                    <i className="bi bi-tag me-2"></i>
                    <span className="d-none d-sm-inline">
                      Pricing & Variants
                    </span>
                    <span className="d-sm-none">Pricing</span>
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
              </Tab>
              <Tab
                eventKey="images"
                title={
                  <div className="d-flex align-items-center py-2 px-1">
                    <div
                      className={`status-indicator ${
                        completionStatus.images ? "complete" : "incomplete"
                      } me-2`}
                    ></div>
                    <i className="bi bi-images me-2"></i>
                    <span className="d-none d-sm-inline">Images</span>
                    <div className="d-flex align-items-center">
                      <Badge bg="secondary" pill className="ms-1">
                        {images.length}
                      </Badge>
                      {images.filter((img) => img.variantId).length > 0 && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Variant-specific images</Tooltip>}
                        >
                          <Badge bg="info" pill className="ms-1">
                            {images.filter((img) => img.variantId).length}
                          </Badge>
                        </OverlayTrigger>
                      )}
                    </div>
                  </div>
                }
              >
                <div className="p-4">
                  <ImagesManager
                    productId={id}
                    images={images} // Pass only product-level images if that's how it's stored
                    onChange={handleImagesChange}
                    // variants prop is no longer needed by the simplified ImagesManager
                  />
                </div>
              </Tab>
              <Tab
                eventKey="variants"
                title={
                  <div className="d-flex align-items-center py-2 px-1">
                    <div
                      className={`status-indicator ${
                        completionStatus.variants ? "complete" : "incomplete"
                      } me-2`}
                    ></div>
                    <i className="bi bi-boxes me-2"></i>
                    <span className="d-none d-sm-inline">Variants</span>
                    <Badge
                      bg={
                        hasVariants
                          ? "secondary"
                          : pricing.hasVariants
                          ? "warning"
                          : "secondary"
                      }
                      pill
                      className="ms-1"
                    >
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

        {/* Exit Confirmation Modal */}
        <Modal
          show={showExitConfirm}
          onHide={() => setShowExitConfirm(false)}
          centered
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="text-warning">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Unsaved Changes
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You have unsaved changes. Are you sure you want to leave? All
              unsaved changes will be lost.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              onClick={() => setShowExitConfirm(false)}
            >
              Stay on Page
            </Button>
            <Button variant="warning" onClick={confirmExit}>
              Leave Without Saving
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-indicator.complete {
          background-color: #28a745;
        }
        .status-indicator.incomplete {
          background-color: #dee2e6;
        }
        .product-tabs .nav-link {
          border: none;
          border-bottom: 3px solid transparent;
          color: #6c757d;
          transition: all 0.2s ease;
        }
        .product-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom-color: #0d6efd;
          background-color: rgba(13, 110, 253, 0.05);
        }
        .product-tabs .nav-link:hover:not(.active) {
          border-bottom-color: #dee2e6;
          background-color: rgba(108, 117, 125, 0.05);
        }
      `}</style>
    </AdminLayout>
  );
};

export default EditProductPage;
