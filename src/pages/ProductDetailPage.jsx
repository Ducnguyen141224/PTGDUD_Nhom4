import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCart } from "../components/CartContext";
import useProductsData from "../hooks/useProductsData";
import "../css/ProductDetailPage.css";


const formatVnd = (value) => `${value.toLocaleString("vi-VN")}đ`;

// Danh sách tab thông tin chi tiết sản phẩm 
const TABS = [
  { key: "spec", label: "Thông số" },
  { key: "ingredients", label: "Thành phần" },
  { key: "usage", label: "Hướng dẫn sử dụng" },
];

export default function ProductDetailPage() {

  const { id } = useParams();
  // ─── Hàm thêm sản phẩm vào giỏ hàng từ CartContext
  const { addToCart } = useCart();

  //  Fetch toàn bộ sản phẩm (dùng chung hook với ProductListPage) 
  const { products, loading, error } = useProductsData();


  const [quantity, setQuantity] = useState(1);      // số lượng chọn mua
  const [activeTab, setActiveTab] = useState("spec"); // tab đang mở
  const [added, setAdded] = useState(false);  // hiệu ứng "đã thêm vào giỏ"

  //  Tìm sản phẩm hiện tại từ danh sách theo id trên URL 
  const product = useMemo(
    () => products.find((item) => String(item.id) === String(id)) || null,
    [products, id]
  );

  // ─── Lọc sản phẩm cùng danh mục, loại trừ sản phẩm hiện tại, lấy tối đa 4 ─
  const relatedProducts = useMemo(() => {
    if (!product?.id) return [];
    return products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  // Tính giá gốc (trước giảm) nếu có discount 
  // Ưu tiên: oldPrice có sẵn → tính ngược từ price và discount %
  const discount = product?.discount || 0;
  const oldPrice = product?.oldPrice || product?.originalPrice || (
    discount > 0 && product?.price
      ? Math.round(product.price / (1 - discount / 100))
      : null
  );

  //  Xử lý thêm vào giỏ: gọi context rồi bật hiệu ứng 1.8 giây 
  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  // Trạng thái loading 
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border product-detail-loading-spinner" role="status" />
        <p className="mt-3 product-detail-loading-text">Đang tải sản phẩm...</p>
      </div>
    );
  }

  //  Trạng thái lỗi hoặc không tìm thấy sản phẩm
  if (error || !product?.id) {
    return (
      <div className="container text-center product-detail-not-found">
        <h3 className="mb-2">Không tìm thấy sản phẩm</h3>
        <p className="text-secondary mb-4">Sản phẩm có thể đã bị xóa hoặc không tồn tại</p>
        <Link to="/san-pham" className="product-detail-back-link">
          Quay lại bộ sưu tập
        </Link>
      </div>
    );
  }


  return (
    <div className="product-detail-page">
      <div className="container product-detail-container">

        {/* Breadcrumb: Trang chủ / Bộ sưu tập / Tên sản phẩm */}
        <nav className="product-detail-breadcrumb">
          <Link to="/" className="product-detail-breadcrumb-link">Trang chủ</Link>
          <span>/</span>
          <Link to="/san-pham" className="product-detail-breadcrumb-link">Bộ sưu tập</Link>
          <span>/</span>
          <span className="product-detail-breadcrumb-current">{product.name}</span>
        </nav>

        {/* Layout 2 cột: ảnh trái — thông tin phải */}
        <div className="row g-4 mb-4">

          {/* Cột ảnh sản phẩm */}
          <div className="col-12 col-md-5">
            <div className="product-detail-image-card">

              {/* Badge giảm giá — chỉ hiện khi discount > 0 */}
              {discount > 0 && (
                <div className="product-detail-discount-badge">
                  Giảm {discount}%
                </div>
              )}
              <img src={product.image} alt={product.name} className="product-detail-main-image" />
            </div>
          </div>

          {/* Cột thông tin & hành động */}
          <div className="col-12 col-md-7">
            <div className="product-detail-info-card">

              {/* Tag thương hiệu + danh mục */}
              <div className="product-detail-tags">
                <span className="product-detail-brand-tag">{product.brand}</span>
                <span className="product-detail-category-tag">{product.category}</span>
              </div>

              {/* Tên sản phẩm */}
              <h1 className="product-detail-title">{product.name}</h1>

              {/* Khung giá: giá hiện tại + giá gốc gạch ngang + badge % giảm */}
              <div className="product-detail-price-box">
                <div className="product-detail-price-row">
                  <span className="product-detail-price">{formatVnd(product.price)}</span>
                  {oldPrice && discount > 0 && (
                    <span className="product-detail-old-price">{formatVnd(oldPrice)}</span>
                  )}
                  {discount > 0 && (
                    <span className="product-detail-price-discount">-{discount}%</span>
                  )}
                </div>
              </div>

              {/* Mô tả ngắn sản phẩm */}
              <p className="product-detail-description">{product.description}</p>

              {/* Thẻ thông tin nhanh: Xuất xứ / Thương hiệu / Danh mục */}
              <div className="row g-3 mb-4">
                {[
                  { title: "Xuất xứ", value: product.origin || "Đang cập nhật" },
                  { title: "Thương hiệu", value: product.brand },
                  { title: "Danh mục", value: product.category },
                ].map((item) => (
                  <div key={item.title} className="col-12 col-sm-4">
                    <div className="product-detail-quick-card">
                      <div className="product-detail-quick-title">{item.title}</div>
                      <div className="product-detail-quick-value">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bộ chọn số lượng — tối thiểu là 1 */}
              <div className="product-detail-quantity">
                <div className="product-detail-quantity-label">Số lượng</div>
                <div className="product-detail-quantity-row">
                  <div className="product-detail-stepper">
                    {/* Nút giảm — disable khi đang ở 1 */}
                    <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1}
                      className="product-detail-stepper-btn">−</button>
                    <div className="product-detail-stepper-value">{quantity}</div>
                    {/* Nút tăng */}
                    <button onClick={() => setQuantity((value) => value + 1)}
                      className="product-detail-stepper-btn">+</button>
                  </div>
                  <span className="product-detail-stock">Còn hàng</span>
                </div>
              </div>

              {/* Nút thêm vào giỏ — đổi màu đậm hơn + text khi vừa thêm thành công */}
              <div className="product-detail-action-grid">
                <button onClick={handleAddToCart}
                  className={`product-detail-add-btn ${added ? "product-detail-add-btn-added" : ""}`}>
                  {added ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── Tab thông tin chi tiết ────────────────────────────────────────── */}
        <div className="product-detail-tabs-card">

          {/* Thanh tab — gạch chân màu hồng khi active */}
          <div className="product-detail-tabs">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`product-detail-tab-btn ${activeTab === key ? "product-detail-tab-btn-active" : ""}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Nội dung từng tab */}
          <div className="product-detail-tab-content">
            {/* Tab "Thông số": hiển thị dạng bảng key-value */}
            {activeTab === "spec" && (
              <div>
                {[
                  ["Thương hiệu", product.brand],
                  ["Xuất xứ", product.origin || "Đang cập nhật"],
                  ["Danh mục", product.category],
                ].map(([title, value]) => (
                  <div key={title} className="product-detail-spec-row">
                    <span className="product-detail-spec-label">{title}</span>
                    <span className="product-detail-spec-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Tab "Thành phần" và "Hướng dẫn sử dụng": hiển thị text thường */}
            {activeTab === "ingredients" && <p className="product-detail-tab-text">{product.ingredients}</p>}
            {activeTab === "usage" && <p className="product-detail-tab-text">{product.usage}</p>}
          </div>
        </div>

        {/* ── Sản phẩm liên quan — chỉ hiện khi có kết quả ────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="product-detail-related">
            <div className="product-detail-related-head">
              <h3>Có thể bạn thích</h3>
              <div>Một vài lựa chọn có thể bạn quan tâm</div>
            </div>
            <div className="row g-3">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="col-12 col-sm-6 col-lg-3">
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
