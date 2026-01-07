// src/pages/Products.tsx
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useEffect, useMemo, useState } from "react";
import apiService from "../../services/apiService";
import { ProductModel } from "../../models/product/ProductModel";
import "../../asset/basiclayout/Product.css";
import noProductImg from "../../asset/img/no-product.jpg";

export const Products = () => {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

  const loadAllData = async () => {
    try {
      const hierarchy = await apiService.get(
        "/ProductCategory/hierarchy?includeCategories=true&includeGroups=true&includeBrands=true&includeProducts=true"
      );

      const apiBaseUrl =
        process.env.REACT_APP_SERVICE_API_BASE_URL?.replace("/api", "") || "";

      const initialProducts: ProductModel[] =
        (hierarchy.products ?? []).map((item: any) => ({
          ...item,
          imagePreviewUrl: item.imagePreviewUrl
            ? apiBaseUrl + item.imagePreviewUrl
            : noProductImg,
        }));

      setProducts(initialProducts);
    } catch (err) {
      console.error("Error loading product data", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  /* ================= BRAND LIST ================= */
  const brands = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => {
      if (p.productBrandId && p.brandName) {
        map.set(p.productBrandId, p.brandName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({
      brandId: id,
      brandName: name,
    }));
  }, [products]);

  /* ================= FILTERED PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    if (selectedBrands.length === 0) return products;
    return products.filter((p) => selectedBrands.includes(p.productBrandId));
  }, [products, selectedBrands]);

  /* ================= HANDLERS ================= */
  const onBrandChange = (brandId: number, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brandId] : prev.filter((id) => id !== brandId)
    );
  };

  const addToCart = (product: ProductModel) => {
    console.log("Added to cart:", product);
  };

  return (
    <div className="grid p-4">
      {/* ===== LEFT: BRAND FILTER ===== */}
      <div className="col-12 md:col-3">
        <Card title="Brands" className="filter-card">
          {brands.map((brand) => (
            <div key={brand.brandId} className="flex align-items-center mb-2">
              <Checkbox
                inputId={`brand-${brand.brandId}`}
                checked={selectedBrands.includes(brand.brandId)}
                onChange={(e) =>
                  onBrandChange(brand.brandId, e.checked!)
                }
              />
              <label
                htmlFor={`brand-${brand.brandId}`}
                className="ml-2 cursor-pointer"
              >
                {brand.brandName}
              </label>
            </div>
          ))}
        </Card>
      </div>

      {/* ===== RIGHT: PRODUCTS ===== */}
      <div className="col-12 md:col-9">
        <div className="grid">
          {filteredProducts.map((product) => (
            <div key={product.productId} className="col-12 md:col-4">
              <Card className="product-card">
                <img
                  src={product.imagePreviewUrl ?? ""}
                  alt={product.productName ?? ""}
                  className="product-image"
                />

                <h6>{product.productName}</h6>
                <p className="text-600">{product.productDescription}</p>

                <div className="product-footer">
                  <span className="price">
                    ₹ {Number(product.salePrice).toLocaleString("en-IN")}
                  </span>

                  <Button
                    icon="pi pi-shopping-cart"
                    className="p-button-sm custom-xs"
                    onClick={() => addToCart(product)}
                    tooltip="Add to Cart"
                  />
                </div>
              </Card>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-12 text-center text-600 mt-5">
              No products found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
