import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export default function Footer() {
  return (
    <footer className="text-white w-100 site-footer">
      <div className="container-fluid footer-inner">
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-3">
            <h5 className="fw-bold text-uppercase mb-4 footer-heading">
              PinkyCloud Office
            </h5>

            <p className="mb-3 footer-copy">
              Địa chỉ: Số 57, đường Quang Trung, quận Gò Vấp, TP. HCM
            </p>

            <p className="mb-3 footer-copy">
              Mail:{" "}
              <a href="mailto:pinkycloudvietnam@gmail.com" className="text-white footer-link">
                pinkycloudvietnam@gmail.com
              </a>
            </p>

            <p className="mb-0 footer-copy">
              Website:{" "}
              <a href="#" className="text-white footer-link">
                www.pinkycloud.vn
              </a>
            </p>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h5 className="fw-bold text-uppercase mb-4 footer-heading">
              Danh mục
            </h5>

            <ul className="list-unstyled mb-0 footer-list">
              <li><Link to="/san-pham?category=R%E1%BB%ADa%20m%E1%BA%B7t" className="text-white text-decoration-none">Chăm Sóc Da Mặt</Link></li>
              <li><Link to="/san-pham?category=Ch%E1%BB%91ng%20n%E1%BA%AFng" className="text-white text-decoration-none">Bảo Vệ Da</Link></li>
              <li><Link to="/san-pham?category=Trang%20%C4%91i%E1%BB%83m" className="text-white text-decoration-none">Trang Điểm</Link></li>
              <li><Link to="/san-pham?category=Ch%C4%83m%20s%C3%B3c%20t%C3%B3c" className="text-white text-decoration-none">Chăm Sóc Tóc</Link></li>
              <li><Link to="/san-pham?category=Ch%C4%83m%20s%C3%B3c%20c%C6%A1%20th%E1%BB%83" className="text-white text-decoration-none">Chăm Sóc Cơ Thể</Link></li>
              <li><Link to="/san-pham?category=N%C6%B0%E1%BB%9Bc%20hoa" className="text-white text-decoration-none">Nước Hoa</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h5 className="fw-bold text-uppercase mb-4 footer-heading">
              Chính sách hỗ trợ
            </h5>

            <ul className="list-unstyled mb-0 footer-list">
              <li><Link to="/chinh-sach/dieu-khoan-su-dung" className="text-white text-decoration-none">Điều khoản sử dụng</Link></li>
              <li><Link to="/chinh-sach/chinh-sach-bao-mat" className="text-white text-decoration-none">Chính sách bảo mật</Link></li>
              <li><Link to="/chinh-sach/chinh-sach-doi-tra" className="text-white text-decoration-none">Chính sách đổi trả</Link></li>
              <li><Link to="/chinh-sach/chinh-sach-van-chuyen" className="text-white text-decoration-none">Chính sách vận chuyển</Link></li>
              <li><Link to="/chinh-sach/dieu-kien-giao-dich-chung" className="text-white text-decoration-none">Điều kiện giao dịch chung</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h5 className="fw-bold text-uppercase mb-4 footer-heading">
              Theo dõi chúng tôi
            </h5>

            <div className="d-flex align-items-center flex-wrap footer-social-row">
              <a href="https://facebook.com"><img src="/IMG/fbf.png" alt="Facebook" width="40" /></a>
              <a href="https://instagram.com"><img src="/IMG/linkedin-54890.png" alt="LinkedIn" width="40" /></a>
              <a href="https://tiktok.com"><img src="/IMG/tiktok-56510.png" alt="TikTok" width="40" /></a>
              <a href="https://youtube.com"><img src="/IMG/youtube-11341.png" alt="YouTube" width="40" /></a>
              <a href="https://twitter.com"><img src="/IMG/twitter.png" alt="Twitter" width="40" /></a>
            </div>

            <div>
              <img src="/IMG/bocongthuong.png" alt="Bộ Công Thương" className="footer-cert-image" />
            </div>
          </div>
        </div>

        <hr className="border-white footer-divider" />

        <div className="text-center">
          <p className="mb-0 footer-copyright">
            2023 Copyright PinkyCloud.vn - Sản phẩm chăm sóc da, Mỹ phẩm trang điểm, Mỹ phẩm chính hãng
          </p>
        </div>
      </div>

      <button type="button" onClick={scrollToTop} className="footer-scroll-btn">
        ↑
      </button>
    </footer>
  );
}
