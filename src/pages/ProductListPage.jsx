import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import useProductsData from "../hooks/useProductsData";
import "../css/ProductListPage.css";

export default function ProductListPage({ query = "" }) {
  //  Fetch toàn bộ sản phẩm từ API 
  const { products, loading, error } = useProductsData();

  //  Lấy tham số ?category=... từ URL
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  // State điều khiển bộ lọc & phân trang 
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);

  const itemsPerPage = 12; // số sản phẩm mỗi trang

  // Khi URL thay đổi category → cập nhật state & reset về trang 1
  useEffect(() => {
    setCategory(categoryFromUrl || "all");
    setPage(1);
  }, [categoryFromUrl]);

  // Chuẩn hóa từ khóa tìm kiếm: bỏ khoảng trắng, chuyển thường
  const normalizedQuery = query.trim().toLowerCase();

  //  Tạo danh sách danh mục từ dữ liệu sản phẩm (không trùng lặp ────────
  const categories = useMemo(() => {
    const categorySet = new Set(products.map((product) => product.category));
    return ["all", ...Array.from(categorySet)];
  }, [products]);

  //  Lọc + sắp xếp sản phẩm theo query, danh mục, kiểu sort
  const filteredAndSorted = useMemo(() => {
    const result = products.filter((product) => {
      // Khớp từ khóa tìm kiếm với tên hoặc thương hiệu
      const matchQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery);

      // Khớp danh mục đang chọn
      const matchCategory =
        category === "all" ||
        product.category.toLowerCase() === category.toLowerCase();

      return matchQuery && matchCategory;
    });

    // Sắp xếp theo lựa chọn của người dùng
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);                          // giá tăng dần
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);                          // giá giảm dần
        break;
      case "hot":
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));      // discount cao nhất lên đầu
        break;
      default:
        break; // "popular" → giữ nguyên thứ tự từ API
    }

    return result;
  }, [products, normalizedQuery, category, sortBy]);

  //  Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const safePage = Math.min(page, totalPages); // tránh page vượt quá tổng số trang
  const pageItems = filteredAndSorted.slice(    // cắt đúng slice cho trang hiện tại
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  // Trạng thái loading / error 
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center text-danger">
        <h4>Lỗi: {error}</h4>
      </div>
    );
  }


  return (
    <div className="container-fluid product-list-page">

      {/* Breadcrumb: Trang chủ > Bộ sưu tập */}
      <div className="mb-3">
        <nav className="product-list-breadcrumb">
          <Link to="/" className="product-list-breadcrumb-link">Trang chủ</Link>
          <span className="product-list-breadcrumb-separator">&gt;</span>
          <span className="product-list-breadcrumb-current">Bộ sưu tập</span>
        </nav>
      </div>

      {/* Thanh lọc danh mục — scroll ngang trên mobile */}
      <div className="d-flex flex-nowrap overflow-auto mb-4 pb-2 product-list-category-scroll">
        {categories.map((value) => (
          <button
            key={value}
            onClick={() => { setCategory(value); setPage(1); }} // đổi danh mục + reset trang
            className={`product-list-category-btn ${category === value ? "product-list-category-btn-active" : ""}`}
          >
            {value === "all" ? "Tất cả" : value}
          </button>
        ))}
      </div>

      {/* Thanh thông tin kết quả + nhóm nút sắp xếp */}
      <div
        className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 p-3 product-list-toolbar"
      >
        {/* Số sản phẩm tìm được */}
        <div className="product-list-result-count">
          Tìm thấy <b className="mx-1">{filteredAndSorted.length}</b> sản phẩm phù hợp
        </div>

        {/* Nhóm nút sắp xếp */}
        <div className="d-flex flex-wrap align-items-center gap-3">
          <span className="product-list-sort-label">Sắp xếp theo</span>
          <button onClick={() => { setSortBy("popular"); setPage(1); }} className={`product-list-sort-btn ${sortBy === "popular" ? "product-list-sort-btn-active" : ""}`}>Phổ biến</button>
          <button onClick={() => { setSortBy("hot"); setPage(1); }} className={`product-list-sort-btn ${sortBy === "hot" ? "product-list-sort-btn-active" : ""}`}>Khuyến mãi HOT</button>
          <button onClick={() => { setSortBy("price-asc"); setPage(1); }} className={`product-list-sort-btn ${sortBy === "price-asc" ? "product-list-sort-btn-active" : ""}`}>Giá thấp - cao</button>
          <button onClick={() => { setSortBy("price-desc"); setPage(1); }} className={`product-list-sort-btn ${sortBy === "price-desc" ? "product-list-sort-btn-active" : ""}`}>Giá cao - thấp</button>
        </div>
      </div>

      {/* Grid sản phẩm — responsive: 1/2/3/4 cột tuỳ màn hình */}
      <div className="row g-4">
        {pageItems.length > 0 ? (
          pageItems.map((product) => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          // Hiển thị khi không có sản phẩm nào khớp
          <div className="col-12 text-center py-5">
            <h4 className="text-muted mt-3">Không tìm thấy sản phẩm nào...</h4>
            <p className="text-secondary">Hãy thử tìm kiếm với từ khóa khác hoặc đổi danh mục.</p>
          </div>
        )}
      </div>

      {/* Phân trang — chỉ hiện khi có hơn 1 trang */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
          <button className="btn btn-outline-secondary product-list-page-btn" onClick={() => setPage(1)} disabled={safePage === 1}>Đầu</button>
          <button className="btn btn-outline-secondary product-list-page-btn" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage === 1}>Trước</button>
          <div className="mx-3 product-list-page-info">
            Trang <span className="product-list-page-current">{safePage}</span> / {totalPages}
          </div>
          <button className="btn btn-outline-secondary product-list-page-btn" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage === totalPages}>Tiếp</button>
          <button className="btn btn-outline-secondary product-list-page-btn" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>Cuối</button>
        </div>
      )}
    </div>
  );
}
