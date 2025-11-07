import { useNavigate } from "react-router-dom";
import ProductForm, { ProductFormData } from "./ProductForm";

export default function ProductAdd() {
  const navigate = useNavigate();

  const saveProduct = (data: ProductFormData) => {
    console.log("Add product:", data);
    navigate("/products");
  };

  return <ProductForm onSubmit={saveProduct} submitLabel="Add Product" />;
}
