import React from "react";
import "../css/Footer.css";

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export default function Footer() {
  return (
    <footer
      className="text-white w-100"
      style={{
        backgroundColor: "#f76c85",
        marginTop: 30,
      }}
    >
      <div className="container-fluid" style={{ padding: "48px 40px 20px" }}>
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-3">
            <h5
              className="fw-bold text-uppercase mb-4"
              style={{ fontSize: 20, letterSpacing: 0.4 }}
            >
              PinkyCloud Office
            </h5>

            <p className="mb-3" style={{ lineHeight: 1.8 }}>
              Dia chi: So 57, duong Quang Trung, quan Go Vap, TP. HCM
            </p>

            <p className="mb-3" style={{ lineHeight: 1.8 }}>
              Mail:{" "}
              <a
                href="mailto:pinkycloudvietnam@gmail.com"
                className="text-white"
                style={{ textUnderlineOffset: 3 }}
              >
                pinkycloudvietnam@gmail.com
              </a>
            </p>

            <p className="mb-0" style={{ lineHeight: 1.8 }}>
              Website:{" "}
              <a
                href="#"
                className="text-white"
                style={{ textUnderlineOffset: 3 }}
              >
                www.pinkycloud.vn
              </a>
            </p>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h5
              className="fw-bold text-uppercase mb-4"
              style={{ fontSize: 20, letterSpacing: 0.4 }}
            >
              Danh muc
            </h5>

            <ul className="list-unstyled mb-0" style={{ lineHeight: 2 }}>
              <li><a href="#" className="text-white text-decoration-none">Suc khoe va lam dep</a></li>
              <li><a href="#" className="text-white text-decoration-none">Cham soc co the</a></li>
              <li><a href="#" className="text-white text-decoration-none">Cham soc da mat</a></li>
              <li><a href="#" className="text-white text-decoration-none">Cham soc toc</a></li>
              <li><a href="#" className="text-white text-decoration-none">Clinic & Spa</a></li>
              <li><a href="#" className="text-white text-decoration-none">Trang diem</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h5
              className="fw-bold text-uppercase mb-4"
              style={{ fontSize: 20, letterSpacing: 0.4 }}
            >
              Chinh sach ho tro
            </h5>

            <ul className="list-unstyled mb-0" style={{ lineHeight: 2 }}>
              <li><a href="#" className="text-white text-decoration-none">Ho tro dat hang</a></li>
              <li><a href="#" className="text-white text-decoration-none">Chinh sach tra hang</a></li>
              <li><a href="#" className="text-white text-decoration-none">Chinh sach bao hanh</a></li>
              <li><a href="#" className="text-white text-decoration-none">Chinh sach nguoi dung</a></li>
              <li><a href="#" className="text-white text-decoration-none">Chinh sach mua hang</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h5
              className="fw-bold text-uppercase mb-4"
              style={{ fontSize: 20, letterSpacing: 0.4 }}
            >
              Theo doi chung toi
            </h5>

            <div
              className="d-flex align-items-center flex-wrap"
              style={{ gap: 12, marginBottom: 20 }}
            >
              <a href="https://facebook.com"><img src="/IMG/fbf.png" alt="Facebook" width="40" /></a>
              <a href="https://instagram.com"><img src="/IMG/linkedin-54890.png" alt="LinkedIn" width="40" /></a>
              <a href="https://tiktok.com"><img src="/IMG/tiktok-56510.png" alt="TikTok" width="40" /></a>
              <a href="https://youtube.com"><img src="/IMG/youtube-11341.png" alt="YouTube" width="40" /></a>
              <a href="https://twitter.com"><img src="/IMG/twitter.png" alt="Twitter" width="40" /></a>
            </div>

            <div>
              <img
                src="/IMG/bocongthuong.png"
                alt="Bo Cong Thuong"
                style={{ width: 140, maxWidth: "100%" }}
              />
            </div>
          </div>
        </div>

        <hr
          className="border-white"
          style={{ opacity: 0.35, margin: "28px 0 16px" }}
        />

        <div className="text-center">
          <p className="mb-0" style={{ fontSize: 14, lineHeight: 1.7 }}>
            2023 Copyright PinkyCloud.vn - San pham cham soc da, My pham trang diem, My pham chinh hang
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        className="footer-scroll-btn"
      >
        ↑
      </button>
    </footer>
  );
}
