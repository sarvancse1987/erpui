import { useParams, useNavigate } from "react-router-dom";
import ProductForm, { ProductFormData } from "./ProductForm";

export default function ProductEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const product: ProductFormData = {
        id: Number(id),
        name: "Laptop",
        category: "Electronics",
        price: 80000,
        status: "ACTIVE"
    };

    const updateProduct = (data: ProductFormData) => {
        console.log("Updated:", data);
        navigate("/products");
    };

    return (
        <ProductForm
            initialValue={product}
            onSubmit={updateProduct}
            submitLabel="Update"
        />
    );
}
