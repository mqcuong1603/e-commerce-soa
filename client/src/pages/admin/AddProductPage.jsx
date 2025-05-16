import React from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ProductForm from "../../components/admin/product/ProductForm";

const AddProductPage = () => {
  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h3 mb-1">Add New Product</h1>
          <p className="text-muted">Create a new product in your store</p>
        </div>

        <ProductForm isEditing={false} />
      </div>
    </AdminLayout>
  );
};

export default AddProductPage;
