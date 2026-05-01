import React, { useState, useEffect } from "react";
import "../css/ForgotPasswordModal.css";

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // countdown OTP
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // ✅ RESET PASSWORD (CALL API)
  const handleReset = async () => {
    setError("");
    setSuccess("");

    if (!email.trim() || !newPassword || !confirmPassword || !otp) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (otp !== generatedOtp) {
      setError("Mã OTP không đúng.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: email,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi server");
      }

      setSuccess("✅ Đổi mật khẩu thành công!");

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ GENERATE OTP (FRONTEND DEMO)
  const handleGetOtp = () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email trước khi lấy mã OTP.");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setShowOtp(true);
    setSuccess("📩 Mã OTP đã được tạo");
    setCountdown(60);
  };

  return (
    <div className="forgot-modal-overlay">
      <div className="forgot-modal">
        {/* Close */}
        <button
          onClick={onClose}
          className="forgot-modal-close"
        >
          ×
        </button>

        <h5
          className="forgot-modal-title"
        >
          Quên mật khẩu
        </h5>

        {/* SUCCESS */}
        {success && (
          <div className="forgot-alert forgot-alert--success">
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="forgot-alert forgot-alert--error">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <div className="forgot-field">
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="forgot-input"
          />
        </div>

        {/* OTP */}
        <div className="forgot-otp-row">
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
            className="forgot-input forgot-otp-input"
          />

          <button
            onClick={handleGetOtp}
            disabled={countdown > 0}
            className="forgot-otp-btn"
          >
            {countdown > 0 ? `Gửi lại (${countdown}s)` : "Lấy mã"}
          </button>
        </div>

        {/* SHOW OTP */}
        {showOtp && (
          <div className="forgot-otp-preview">
            🔑 OTP: {generatedOtp}
          </div>
        )}

        {/* PASSWORD */}
        <div className="forgot-field forgot-password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError("");
            }}
            className="forgot-input forgot-input--password"
          />
          <button
            onClick={() => setShowPassword((s) => !s)}
            className="forgot-password-toggle"
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="forgot-field forgot-field--last">
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            className="forgot-input"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleReset}
          disabled={loading}
          className={`forgot-submit-btn${loading ? " is-loading" : ""}`}
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </div>
    </div>
  );
}