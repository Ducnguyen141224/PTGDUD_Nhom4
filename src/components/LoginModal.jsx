import React, { useState } from "react";
import { loginUser } from "../hooks/userStorage";
import ForgotPasswordModal from "./ForgotPasswordModal";
import "../css/LoginModal.css";

// Thông tin giả lập khi đăng nhập bằng bên thứ ba (OAuth)
const FAKE_GOOGLE_USER = { name: "Nguyễn Google", email: "user@gmail.com" };
const FAKE_FACEBOOK_USER = { name: "Nguyễn Facebook", email: "user@facebook.com" };

export default function LoginModal({ show, onClose, onLoginSuccess, onSwitchToRegister }) {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(null); // Trạng thái chờ: "google", "facebook", "normal" hoặc null
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  // Nếu props 'show' là false thì không hiển thị Modal
  if (!show) return null;

  // --- GIẢ LẬP ĐĂNG NHẬP MẠNG XÃ HỘI (OAuth) ---
  const simulateOAuth = (provider) => {
    setError("");
    setLoading(provider);
    setSuccessMsg("");

    // Giả lập thời gian chờ kết nối server (1.5 giây)
    setTimeout(() => {
      const fakeUser = provider === "google" ? FAKE_GOOGLE_USER : FAKE_FACEBOOK_USER;
      setLoading(null);
      setSuccessMsg(`✅ Đăng nhập bằng ${provider === "google" ? "Google" : "Facebook"} thành công!`);

      // Chờ một chút để người dùng thấy thông báo thành công trước khi đóng modal
      setTimeout(() => onLoginSuccess(fakeUser), 900);
    }, 1500);
  };

  // --- ĐĂNG NHẬP THÔNG THƯỜNG (Kiểm tra dữ liệu từ MongoDB/Storage) ---
  const handleNormalLogin = async () => {
    setError("");

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!emailInput.trim() || !passwordInput) {
      setError("Vui lòng nhập email/SĐT và mật khẩu.");
      return;
    }

    setLoading("normal");

    // Gọi hàm kiểm tra tài khoản từ hooks đã viết
    const result = await loginUser(emailInput.trim(), passwordInput);
    setLoading(null);

    if (result.success) {
      setSuccessMsg(`✅ Đăng nhập thành công! Xin chào ${result.user.name}`);
      setTimeout(() => onLoginSuccess(result.user), 900);
    } else {
      setError(`❌ ${result.error}`);
    }
  };

  // Định nghĩa CSS chung cho các ô Input
  // CSS chung cho input được tách sang src/css/ExtractedInline.css

  return (
    <div className="modal-overlay">
      <div className="auth-modal">

        {/* Nút đóng Modal (X) */}
        <button onClick={onClose} className="login-modal-close">×</button>

        <h5 className="login-modal-title">Đăng nhập</h5>

        {/* Hiển thị thông báo thành công */}
        {successMsg && (
          <div className="login-modal-alert login-modal-alert--success">
            {successMsg}
          </div>
        )}

        {/* Hiển thị thông báo lỗi */}
        {error && (
          <div className="login-modal-alert login-modal-alert--error">
            {error}
          </div>
        )}

        {/* Nút Đăng nhập bằng Facebook */}
        <button onClick={() => simulateOAuth("facebook")} disabled={!!loading}
          className={`login-oauth-btn login-oauth-btn--facebook${loading === "facebook" ? " is-loading" : ""}`}>
          {loading === "facebook" ? <><Spinner /> Đang kết nối...</> : <><FbIcon /> Facebook</>}
        </button>

        {/* Nút Đăng nhập bằng Google */}
        <button onClick={() => simulateOAuth("google")} disabled={!!loading}
          className="login-oauth-btn login-oauth-btn--google">
          {loading === "google" ? <><Spinner color="#4285F4" /> Đang kết nối...</> : <><GoogleIcon /> Đăng nhập bằng Google</>}
        </button>

        {/* Đường phân cách */}
        <div className="login-divider">
          <hr />
          <span>
            Hoặc đăng nhập bằng tài khoản
          </span>
        </div>

        {/* Ô nhập Email hoặc Số điện thoại */}
        <div className="login-field">
          <input type="text" placeholder="Email hoặc số điện thoại" value={emailInput}
            onChange={e => { setEmailInput(e.target.value); setError(""); }}
            className="login-input" />
        </div>

        {/* Ô nhập Mật khẩu (có nút hiện/ẩn mật khẩu) */}
        <div className="login-field login-field--password">
          <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu"
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleNormalLogin()}
            className="login-input login-input--password" />
          <button onClick={() => setShowPassword(s => !s)}
            className="login-password-toggle">
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Lựa chọn Nhớ mật khẩu và Quên mật khẩu */}
        <div className="login-options-row">
          <label className="login-remember-label">
            <input type="checkbox" className="login-checkbox" /> Nhớ mật khẩu
          </label>
          <p className="login-forgot-link" onClick={() => { setShowForgot(true); }}>
            Quên mật khẩu?
          </p>
        </div>

        {/* Nút Đăng nhập chính */}
        <button onClick={handleNormalLogin} disabled={!!loading}
          className={`login-submit-btn${loading === "normal" ? " is-loading" : ""}`}>
          {loading === "normal" ? <><Spinner /> Đang đăng nhập...</> : "Đăng nhập"}
        </button>

        {/* Chuyển sang đăng ký */}
        <p className="login-switch-copy">
          Chưa có tài khoản?{" "}
          <span onClick={onSwitchToRegister} className="login-switch-link">
            ĐĂNG KÝ NGAY
          </span>
        </p>

        {/* Hiển thị Modal Quên mật khẩu nếu được chọn */}
        {showForgot && (
          <ForgotPasswordModal onClose={() => setShowForgot(false)} />
        )}
      </div>
    </div>
  );
}

// --- CÁC COMPONENT PHỤ (SPINNER & ICONS) ---

function Spinner({ color = "#fff" }) {
  return <span className={`login-spinner${color === "#4285F4" ? " login-spinner--google" : ""}`} />;
}

function FbIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" /></svg>;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// Hi?u ?ng xoay (animation) cho Spinner ???c chuy?n sang src/css/LoginModal.css
