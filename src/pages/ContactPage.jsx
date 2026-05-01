import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/ContactPage.css";

// ── Thông tin liên hệ — chỉnh tại đây ──
const CONTACT_INFO = {
  address: "Số 57, đường Quang Trung, Quận Gò Vấp, TP. Hồ Chí Minh",
  phone: "0909 123 456",
  email: "pinkycloudvietnam@gmail.com",
  website: "www.pinkycloud.vn",
  hours: [
    { day: "Thứ 2 – Thứ 6", time: "8:00 – 21:00" },
    { day: "Thứ 7 – Chủ nhật", time: "9:00 – 20:00" },
  ],
};

const SOCIAL_LINKS = [
  { name: "Facebook", icon: "f", color: "#1877f2", bg: "#e7f0fd", href: "#" },
  { name: "Instagram", icon: "IG", color: "#e1306c", bg: "#fce4ec", href: "#" },
  { name: "TikTok", icon: "TT", color: "#010101", bg: "#f0f0f0", href: "#" },
  { name: "YouTube", icon: "YT", color: "#ff0000", bg: "#ffe8e8", href: "#" },
];

// Google Maps embed — thay src bằng địa chỉ thật 
const MAP_SRC = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4851!2d106.6654!3d10.8384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529f77b37c5a9%3A0x9c6e7a36!2zUXXhuq1uIEfDsiBW4bqlcA!5e0!3m2!1svi!2svn";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên.";
    if (!form.email.trim()) errs.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email không hợp lệ.";
    if (form.phone && !/^0\d{9}$/.test(form.phone)) errs.phone = "SĐT phải 10 số, bắt đầu bằng 0.";
    if (!form.message.trim()) errs.message = "Vui lòng nhập nội dung.";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    // Giả lập gửi form
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="contact-page">

      {/* ── HERO BANNER ── */}
      <div className="contact-hero">
        {/* Decorative circles */}
        <div className="contact-hero-circle contact-hero-circle-large" />
        <div className="contact-hero-circle contact-hero-circle-medium" />
        <div className="contact-hero-circle contact-hero-circle-small" />

        <div className="container contact-hero-inner">
          {/* Breadcrumb */}
          <div className="contact-breadcrumb">
            <Link to="/" className="contact-breadcrumb-link">Trang chủ</Link>
            <span className="contact-breadcrumb-separator">›</span>
            <span className="contact-breadcrumb-current">Liên hệ</span>
          </div>
          <h1 className="contact-hero-title">Liên hệ với chúng tôi</h1>
          <p className="contact-hero-subtitle">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 💗
          </p>
        </div>
      </div>

      <div className="container">

        {/* ── 3 THỐNG KÊ NHỎ ── */}
        <div className="row g-3 contact-stats-row">
          {[
            { icon: "⚡", title: "Phản hồi nhanh", desc: "Trong vòng 2 giờ làm việc" },
            { icon: "💯", title: "Hỗ trợ tận tâm", desc: "Đội ngũ tư vấn chuyên nghiệp" },
            { icon: "🎁", title: "Tư vấn miễn phí", desc: "Không mất phí tư vấn sản phẩm" },
          ].map((s, i) => (
            <div key={i} className="col-md-4">
              <div className="contact-stat-card">
                <div className="contact-stat-icon">{s.icon}</div>
                <div>
                  <div className="contact-stat-title">{s.title}</div>
                  <div className="contact-stat-desc">{s.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 2 CỘT CHÍNH ── */}
        <div className="row g-4 contact-main-row">

          {/* ════ CỘT TRÁI: FORM ════ */}
          <div className="col-lg-7">
            <div className="contact-form-card">

              {submitted ? (
                // Màn hình thành công
                <div className="contact-success">
                  <div className="contact-success-icon">💌</div>
                  <h4>Gửi thành công!</h4>
                  <p>
                    Cảm ơn bạn đã liên hệ với <b>PinkyCloud</b>!<br />
                    Chúng tôi sẽ phản hồi trong vòng <b>2 giờ làm việc</b>.
                  </p>
                  <button onClick={() => setSubmitted(false)}
                    className="contact-primary-btn">
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="contact-form-title">Gửi tin nhắn cho chúng tôi</h4>
                  <p className="contact-form-subtitle">Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại sớm nhất.</p>

                  <div className="row g-3">
                    {/* Họ tên */}
                    <div className="col-md-6">
                      <label className="contact-label">Họ và tên <span>*</span></label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Nhập họ tên của bạn" className={`contact-input ${errors.name ? "contact-input-error" : ""}`} />
                      {errors.name && <div className="contact-error">{errors.name}</div>}
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <label className="contact-label">Email <span>*</span></label>
                      <input name="email" value={form.email} onChange={handleChange} placeholder="example@email.com" className={`contact-input ${errors.email ? "contact-input-error" : ""}`} />
                      {errors.email && <div className="contact-error">{errors.email}</div>}
                    </div>

                    {/* SĐT */}
                    <div className="col-md-6">
                      <label className="contact-label">Số điện thoại</label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="0909 123 456" inputMode="numeric" maxLength={10} className={`contact-input ${errors.phone ? "contact-input-error" : ""}`} />
                      {errors.phone && <div className="contact-error">{errors.phone}</div>}
                    </div>

                    {/* Chủ đề */}
                    <div className="col-md-6">
                      <label className="contact-label">Chủ đề</label>
                      <select name="subject" value={form.subject} onChange={handleChange}
                        className={`contact-input contact-select ${form.subject ? "" : "contact-select-placeholder"}`}>
                        <option value="">Chọn chủ đề</option>
                        <option value="tuvan">Tư vấn sản phẩm</option>
                        <option value="donhang">Vấn đề đơn hàng</option>
                        <option value="doitra">Đổi trả & hoàn tiền</option>
                        <option value="hopTac">Hợp tác kinh doanh</option>
                        <option value="khac">Khác</option>
                      </select>
                    </div>

                    {/* Nội dung */}
                    <div className="col-12">
                      <label className="contact-label">Nội dung <span>*</span></label>
                      <textarea name="message" value={form.message} onChange={handleChange}
                        placeholder="Nhập nội dung bạn cần hỗ trợ..." rows={5}
                        className={`contact-input contact-textarea ${errors.message ? "contact-input-error" : ""}`} />
                      <div className="contact-message-foot">
                        {errors.message ? <div className="contact-error">{errors.message}</div> : <div />}
                        <div className="contact-char-count">{form.message.length}/500</div>
                      </div>
                    </div>

                    {/* Nút gửi */}
                    <div className="col-12">
                      <button onClick={handleSubmit} disabled={loading}
                        className={`contact-submit-btn ${loading ? "contact-submit-btn-disabled" : ""}`}>
                        {loading ? <><BtnSpinner /> Đang gửi...</> : "💌 Gửi tin nhắn"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ════ CỘT PHẢI: THÔNG TIN + MXH ════ */}
          <div className="col-lg-5">

            {/* Thông tin liên hệ */}
            <div className="contact-info-card">
              <h5>📋 Thông tin liên hệ</h5>

              {[
                { icon: "📍", label: "Địa chỉ", value: CONTACT_INFO.address },
                { icon: "📞", label: "Hotline", value: CONTACT_INFO.phone },
                { icon: "✉️", label: "Email", value: CONTACT_INFO.email },
                { icon: "🌐", label: "Website", value: CONTACT_INFO.website },
              ].map((item, i) => (
                <div key={i} className="contact-info-item">
                  <div className="contact-info-icon">
                    {item.icon}
                  </div>
                  <div>
                    <div className="contact-info-label">{item.label}</div>
                    <div className="contact-info-value">{item.value}</div>
                  </div>
                </div>
              ))}

              {/* Giờ làm việc */}
              <div className="contact-hours">
                <div className="contact-hours-title">
                  <span>🕐</span>
                  <span>Giờ làm việc</span>
                </div>
                {CONTACT_INFO.hours.map((h, i) => (
                  <div key={i} className="contact-hours-row">
                    <span>{h.day}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mạng xã hội */}
            <div className="contact-social-card">
              <h6>🌸 Theo dõi PinkyCloud</h6>
              <div className="contact-social-list">
                {SOCIAL_LINKS.map(s => (
                  <a key={s.name} href={s.href} target="_blank" rel="noreferrer"
                    className={`contact-social-link contact-social-${s.name.toLowerCase()}`}>
                    <div className="contact-social-icon">
                      {s.icon}
                    </div>
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Hỗ trợ nhanh */}
            <div className="contact-quick-card">
              <h6>⚡ Hỗ trợ nhanh</h6>
              {[
                { icon: "💬", label: "Chat Zalo", desc: "Nhắn tin ngay", href: "#" },
                { icon: "📞", label: "Gọi Hotline", desc: CONTACT_INFO.phone, href: `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}` },
                { icon: "✉️", label: "Gửi Email", desc: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
              ].map((item, i) => (
                <a key={i} href={item.href}
                  className={`contact-quick-link ${i < 2 ? "contact-quick-link-bordered" : ""}`}>
                  <div className="contact-quick-icon">
                    {item.icon}
                  </div>
                  <div>
                    <div className="contact-quick-label">{item.label}</div>
                    <div className="contact-quick-desc">{item.desc}</div>
                  </div>
                  <span className="contact-quick-arrow">›</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── BẢN ĐỒ GOOGLE MAPS ── */}
        <div className="contact-map-card">
          <div className="contact-map-head">
            <span className="contact-map-icon">🗺️</span>
            <div>
              <h6>Tìm đường đến PinkyCloud</h6>
              <div>{CONTACT_INFO.address}</div>
            </div>
          </div>
          <iframe
            src={MAP_SRC}
            width="100%" height="380"
            className="contact-map-frame"
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="PinkyCloud Map"
          />
        </div>

      </div>
    </div>
  );
}

function BtnSpinner() {
  return (
    <span className="contact-btn-spinner" />
  );
}
