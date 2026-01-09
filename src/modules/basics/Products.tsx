import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useEffect, useMemo, useState } from "react";
import apiService from "../../services/apiService";
import { ProductModel } from "../../models/product/ProductModel";
import "../../asset/basiclayout/Product.css";
import noProductImg from "../../asset/img/no-product.jpg";

interface GroupBrand {
  groupId: number;
  groupName: string;
  brands: {
    brandId: number;
    brandName: string;
  }[];
}

export const Products = () => {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  /* ================= LOAD DATA ================= */
  const loadAllData = async () => {
    try {
      const hierarchy = await apiService.get(
        "/ProductCategory/hierarchy?includeCategories=true&includeGroups=true&includeBrands=true&includeProducts=true"
      );

      const apiBaseUrl =
        process.env.REACT_APP_SERVICE_API_BASE_URL?.replace("/api", "") || "";

      const mappedProducts: ProductModel[] = (hierarchy.products ?? []).map(
        (item: any) => ({
          ...item,
          imagePreviewUrl: item.imagePreviewUrl
            ? apiBaseUrl + item.imagePreviewUrl
            : noProductImg,
        })
      );

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Error loading product data", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  /* ================= GROUP → BRAND MAP ================= */
  const groupBrandMap: GroupBrand[] = useMemo(() => {
    const map = new Map<number, GroupBrand>();

    products.forEach((p) => {
      if (
        !p.productGroupId ||
        !p.groupName ||
        !p.productBrandId ||
        !p.brandName
      )
        return;

      if (!map.has(p.productGroupId)) {
        map.set(p.productGroupId, {
          groupId: p.productGroupId,
          groupName: p.groupName,
          brands: [],
        });
      }

      const group = map.get(p.productGroupId)!;

      if (!group.brands.some((b) => b.brandId === p.productBrandId)) {
        group.brands.push({
          brandId: p.productBrandId,
          brandName: p.brandName,
        });
      }
    });

    return Array.from(map.values());
  }, [products]);

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    if (selectedBrands.length === 0) return products;
    return products.filter((p) =>
      selectedBrands.includes(p.productBrandId)
    );
  }, [products, selectedBrands]);

  /* ================= HANDLERS ================= */

  // Group = expand / collapse ONLY
  const onGroupToggle = (groupId: number) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Brand = actual filter
  const onBrandChange = (brandId: number, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brandId] : prev.filter((id) => id !== brandId)
    );
  };

  const addToCart = (product: ProductModel) => {
    console.log("Added to cart:", product);
  };

  /* ================= UI ================= */
  return (
    <div className="grid p-2">
      {/* ========== LEFT FILTER ========== */}
      <div className="col-12 md:col-3">
        <Card title="Filters" className="filter-card">
          {groupBrandMap.map((group) => (
            <div key={group.groupId} className="mb-3">
              {/* GROUP */}
              <div
                className="flex align-items-center font-semibold cursor-pointer"
                onClick={() => onGroupToggle(group.groupId)}
              >
                <i
                  className={`pi ${expandedGroups.includes(group.groupId)
                      ? "pi-chevron-down"
                      : "pi-chevron-right"
                    } mr-2`}
                />
                {group.groupName}
              </div>

              {/* BRANDS */}
              {expandedGroups.includes(group.groupId) && (
                <div className="ml-4 mt-2">
                  {group.brands.map((brand) => (
                    <div
                      key={brand.brandId}
                      className="flex align-items-center mb-2"
                    >
                      <Checkbox
                        checked={selectedBrands.includes(brand.brandId)}
                        onChange={(e) =>
                          onBrandChange(brand.brandId, e.checked!)
                        }
                      />
                      <span className="ml-2">{brand.brandName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Card>
      </div>

      {/* ========== PRODUCTS ========== */}
      <div className="col-12 md:col-9">
        <div className="grid">
          {filteredProducts.map((product) => (
            <div key={product.productId} className="col-12 md:col-4">
              <Card className="product-card">
                <img
                  src={product.imagePreviewUrl ?? ""}
                  alt={product.productName}
                  className="product-image"
                />

                <h6 className="mt-2">{product.productName}</h6>

                <div className="product-footer">
                  <span className="price">
                    ₹{" "}
                    {Number(product.salePrice || 0).toLocaleString("en-IN")}
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
