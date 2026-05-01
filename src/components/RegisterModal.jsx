import React, { useState } from "react";
import { Link } from "react-router-dom";
import { isContactTaken, registerUser } from "../hooks/userStorage.jsx";
import "../css/RegisterModal.css";

// Hàm hỗ trợ tạo mã Captcha ngẫu nhiên gồm 5 ký tự
function generateCaptcha() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function RegisterModal({ show, onClose, onSwitchToLogin }) {
  // --- QUẢN LÝ CÁC TRẠNG THÁI (STATE) ---
  const [gender, setGender] = useState("nu");
  const [agreed, setAgreed] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0); // Đếm ngược gửi lại OTP
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState({}); // Lưu trữ các lỗi nhập liệu
  const [simulatedOtp, setSimulatedOtp] = useState(""); // Lưu OTP giả lập để kiểm tra
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Nếu không ở trạng thái hiển thị (show = false) thì không render modal
  if (!show) return null;

  // Khởi tạo dữ liệu cho các ô chọn Ngày/Tháng/Năm
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, index) => currentYear - index);

  // --- HÀM KIỂM TRA LỖI NHẬP LIỆU (VALIDATION) ---
  function validate() {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;

    // Kiểm tra Email/SĐT
    if (!contact.trim()) nextErrors.contact = "Vui lòng nhập email hoặc số điện thoại.";
    else if (!emailRegex.test(contact) && !phoneRegex.test(contact)) nextErrors.contact = "Email hoặc số điện thoại không hợp lệ.";

    // Kiểm tra Captcha
    if (!captchaInput.trim()) nextErrors.captcha = "Vui lòng nhập mã captcha.";
    else if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) nextErrors.captcha = "Mã captcha không đúng.";

    // Kiểm tra mã OTP
    if (!otp.trim()) nextErrors.otp = "Vui lòng nhập mã OTP.";
    else if (!/^\d{6}$/.test(otp)) nextErrors.otp = "Mã OTP phải gồm đúng 6 chữ số.";
    else if (otp !== simulatedOtp) nextErrors.otp = "Mã OTP không đúng. Vui lòng kiểm tra lại.";

    // Kiểm tra mật khẩu (độ dài 6-32 ký tự)
    if (!password) nextErrors.password = "Vui lòng nhập mật khẩu.";
    else if (password.length < 6 || password.length > 32) nextErrors.password = "Mật khẩu phải từ 6 đến 32 ký tự.";

    // Xác nhận mật khẩu
    if (!confirmPassword) nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";

    // Kiểm tra họ tên
    if (!name.trim()) nextErrors.name = "Vui lòng nhập họ tên.";
    else if (name.trim().length < 2) nextErrors.name = "Họ tên phải có ít nhất 2 ký tự.";

    // Kiểm tra ngày sinh (yêu cầu trên 13 tuổi)
    if (!day || !month || !year) nextErrors.dob = "Vui lòng chọn đầy đủ ngày sinh.";
    else if (currentYear - parseInt(year, 10) < 13) nextErrors.dob = "Bạn phải từ 13 tuổi trở lên để đăng ký.";

    // Kiểm tra các hộp chọn đồng ý điều khoản
    if (!agreed) nextErrors.agreed = "Bạn cần đồng ý với điều khoản để tiếp tục.";
    if (!privacy) nextErrors.privacy = "Bạn cần đồng ý với chính sách xử lý dữ liệu.";

    return nextErrors;
  }

  // --- HÀM XỬ LÝ GỬI MÃ OTP GIẢ LẬP ---
  async function handleSendOtp() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;

    if (!contact.trim() || (!emailRegex.test(contact) && !phoneRegex.test(contact))) {
      setErrors((prev) => ({ ...prev, contact: "Vui lòng nhập email hoặc SĐT hợp lệ trước khi lấy mã." }));
      return;
    }

    if (!captchaInput || captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      setErrors((prev) => ({ ...prev, captcha: "Vui lòng nhập đúng captcha trước khi lấy mã OTP." }));
      return;
    }

    // Kiểm tra xem Email/SĐT này đã có người dùng chưa
    if (await isContactTaken(contact.trim())) {
      setErrors((prev) => ({ ...prev, contact: "Email hoặc SĐT này đã được đăng ký. Vui lòng đăng nhập." }));
      return;
    }

    setErrors((prev) => ({ ...prev, contact: undefined, captcha: undefined, otp: undefined }));

    // Tạo mã OTP ngẫu nhiên 6 chữ số và bắt đầu đếm ngược 60 giây
    const fakeOtp = String(Math.floor(100000 + Math.random() * 900000));
    setSimulatedOtp(fakeOtp);
    setOtpSent(true);
    setOtpCountdown(60);

    const timer = setInterval(() => {
      setOtpCountdown((countdown) => {
        if (countdown <= 1) {
          clearInterval(timer);
          return 0;
        }
        return countdown - 1;
      });
    }, 1000);
  }

  // --- HÀM XỬ LÝ KHI BẤM NÚT ĐĂNG KÝ ---
  async function handleSubmit() {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return; // Nếu có lỗi thì dừng lại

    setSubmitting(true);

    try {
      // Gọi hàm lưu người dùng vào MongoDB
      const result = await registerUser({
        contact,
        password,
        name,
        gender,
        newsletter,
        dob: `${day}/${month}/${year}`,
      });

      if (!result.success) {
        setErrors((prev) => ({ ...prev, contact: result.error }));
        return;
      }

      setRegisterSuccess(true); // Hiển thị thông báo đăng ký thành công
    } finally {
      setSubmitting(false);
    }
  }

  // Hàm làm mới mã Captcha
  function refreshCaptcha() {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
    setErrors((prev) => ({ ...prev, captcha: undefined }));
  }

  // Cấu trúc CSS cho giao diện đã được tách sang src/css/RegisterModal.css

  return (
    <div className="register-modal-overlay">
      <div className="register-modal-panel">

        {/* Nút đóng X ở góc trên bên phải */}
        <button onClick={onClose} className="register-modal-close">×</button>

        {registerSuccess ? (
          /* GIAO DIỆN KHI ĐĂNG KÝ THÀNH CÔNG */
          <div className="register-success">
            <div className="register-success-icon">✔</div>
            <h5 className="register-success-title">Đăng ký thành công!</h5>
            <p className="register-success-text">
              Xin chào <b>{name}</b>! Tài khoản của bạn đã được tạo thành công.
            </p>
            <div className="register-success-account">
              Tài khoản: <b>{contact}</b>
            </div>
            <button onClick={() => { setRegisterSuccess(false); onSwitchToLogin(); }}
              className="register-primary-btn register-success-login-btn">
              Đăng nhập ngay
            </button>
            <button onClick={onClose}
              className="register-home-btn">
              Về trang chủ
            </button>
          </div>
        ) : (
          /* GIAO DIỆN FORM ĐĂNG KÝ */
          <>
            <div className="register-form-heading">
              <h5>ĐĂNG KÝ TÀI KHOẢN</h5>
            </div>

            {/* Ô nhập Email hoặc Số điện thoại */}
            <div className="register-field">
              <input type="text" placeholder="Nhập email hoặc số điện thoại *" value={contact}
                onChange={(e) => { setContact(e.target.value); setErrors((prev) => ({ ...prev, contact: undefined })); }}
                className={`register-input ${errors.contact ? "register-input-error" : ""}`} />
              {errors.contact && <div className="register-error-text">{errors.contact}</div>}
            </div>

            {/* Ô nhập Captcha và hình ảnh mã */}
            <div className="register-field">
              <div className="register-inline-field">
                <input type="text" placeholder="Nhập mã captcha *" value={captchaInput}
                  onChange={(e) => { setCaptchaInput(e.target.value); setErrors((prev) => ({ ...prev, captcha: undefined })); }}
                  className={`register-input register-input-grow ${errors.captcha ? "register-input-error" : ""}`} />
                <div className="register-captcha-code">
                  {captchaCode}
                </div>
                <button onClick={refreshCaptcha} title="Làm mới" className="register-refresh-btn">↻</button>
              </div>
              {errors.captcha && <div className="register-error-text">{errors.captcha}</div>}
            </div>

            {/* Ô nhập mã OTP */}
            <div className="register-field">
              <div className="register-inline-field">
                <input type="text" placeholder="Nhập mã OTP 6 số *" value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setErrors((prev) => ({ ...prev, otp: undefined })); }}
                  maxLength={6} className={`register-input register-input-grow ${errors.otp ? "register-input-error" : ""}`} />
                <button onClick={handleSendOtp} disabled={otpCountdown > 0}
                  className={`register-otp-btn ${otpCountdown > 0 ? "register-btn-disabled" : ""}`}>
                  {otpCountdown > 0 ? `Gửi lại (${otpCountdown}s)` : "Lấy mã OTP"}
                </button>
              </div>
              {errors.otp && <div className="register-error-text">{errors.otp}</div>}
              {/* Hiển thị mã OTP giả lập cho mục đích demo */}
              {otpSent && simulatedOtp && (
                <div className="register-otp-demo">
                  Mã OTP gửi đến <b>{contact}</b>:
                  <div className="register-otp-code">{simulatedOtp}</div>
                  <div className="register-otp-note">(Hệ thống thử nghiệm, thực tế sẽ gửi qua email/SMS)</div>
                </div>
              )}
            </div>

            {/* Ô nhập mật khẩu */}
            <div className="register-field">
              <div className="register-password-wrap">
                <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu từ 6 - 32 ký tự *"
                  value={password} onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                  className={`register-input register-input-password ${errors.password ? "register-input-error" : ""}`} />
                <button onClick={() => setShowPassword((value) => !value)}
                  className="register-password-toggle">
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {errors.password && <div className="register-error-text">{errors.password}</div>}
            </div>

            {/* Ô xác nhận mật khẩu */}
            <div className="register-field">
              <input type="password" placeholder="Xác nhận mật khẩu *" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: undefined })); }}
                className={`register-input ${errors.confirmPassword ? "register-input-error" : ""}`} />
              {errors.confirmPassword && <div className="register-error-text">{errors.confirmPassword}</div>}
            </div>

            {/* Ô nhập họ và tên */}
            <div className="register-field">
              <input type="text" placeholder="Họ và tên *" value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
                className={`register-input ${errors.name ? "register-input-error" : ""}`} />
              {errors.name && <div className="register-error-text">{errors.name}</div>}
            </div>

            {/* Lựa chọn giới tính */}
            <div className="register-gender-row">
              {[{ value: "khong_xac_dinh", label: "Khác" }, { value: "nam", label: "Nam" }, { value: "nu", label: "Nữ" }].map((option) => (
                <label key={option.value} className="register-inline-label">
                  <input type="radio" name="gender" value={option.value} checked={gender === option.value} onChange={() => setGender(option.value)} className="register-accent-input" />
                  {option.label}
                </label>
              ))}
            </div>

            {/* Ô chọn ngày sinh */}
            <div className="register-dob-row">
              {[
                { label: "Ngày", value: day, setter: setDay, options: days },
                { label: "Tháng", value: month, setter: setMonth, options: months },
                { label: "Năm", value: year, setter: setYear, options: years },
              ].map((item) => (
                <select key={item.label} value={item.value}
                  onChange={(e) => { item.setter(e.target.value); setErrors((prev) => ({ ...prev, dob: undefined })); }}
                  className={`register-dob-select ${errors.dob ? "register-input-error" : ""} ${item.value ? "" : "register-dob-placeholder"}`}>
                  <option value="">{item.label}</option>
                  {item.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ))}
            </div>
            {errors.dob && <div className="register-error-text register-dob-error">{errors.dob}</div>}

            <div className="register-divider" />

            {/* KHỐI CÁC ĐIỀU KHOẢN VÀ CHÍNH SÁCH */}
            <div className="register-terms">
              <label className="register-check-label">
                <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors((prev) => ({ ...prev, agreed: undefined })); }}
                  className="register-checkbox" />
                <span className="register-term-text register-term-text-spaced">
                  Tôi đã đọc và đồng ý với{" "}
                  <Link to="/chinh-sach/dieu-kien-giao-dich-chung" target="_blank" className="register-link">Điều kiện giao dịch chung</Link>
                  {" "}và{" "}
                  <Link to="/chinh-sach/chinh-sach-bao-mat" target="_blank" className="register-link">Chính sách bảo mật</Link>
                </span>
              </label>
              {errors.agreed && <div className="register-error-text register-check-error">{errors.agreed}</div>}

              <label className="register-check-label">
                <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="register-checkbox" />
                <span className="register-term-text">
                  Nhận thông tin khuyến mãi qua e-mail -{" "}
                  <Link to="/chinh-sach/chinh-sach-khuyen-mai" target="_blank" className="register-link">Xem chính sách</Link>
                </span>
              </label>

              <label className="register-check-label register-check-label-last">
                <input type="checkbox" checked={privacy} onChange={(e) => { setPrivacy(e.target.checked); setErrors((prev) => ({ ...prev, privacy: undefined })); }}
                  className="register-checkbox" />
                <span className="register-term-text">
                  Tôi đồng ý với{" "}
                  <Link to="/chinh-sach/chinh-sach-du-lieu-ca-nhan" target="_blank" className="register-link">chính sách xử lý dữ liệu cá nhân</Link>
                </span>
              </label>
              {errors.privacy && <div className="register-error-text register-check-error-top">{errors.privacy}</div>}
            </div>

            {/* Nút hoàn tất đăng ký */}
            <button onClick={handleSubmit} disabled={submitting}
              className={`register-submit-btn ${submitting ? "register-btn-disabled" : ""}`}>
              {submitting ? "Đang tạo tài khoản..." : "ĐĂNG KÝ"}
            </button>

            <p className="register-login-text">
              Bạn đã có tài khoản?{" "}
              <span onClick={onSwitchToLogin} className="register-login-link">ĐĂNG NHẬP</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
