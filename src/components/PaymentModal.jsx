import React, { useState, useEffect } from "react";
import "../css/PaymentModal.css";

// ────────────────────────────────────────────────
// ⚙️  CẤU HÌNH — chỉnh thông tin ngân hàng thật ở đây
// ────────────────────────────────────────────────
const BANK_INFO = {
  bankName: "Vietcombank",
  accountNo: "1234567890",
  accountName: "NGUYEN VAN A",
  branch: "Chi nhánh TP. Hồ Chí Minh",
};

// QR chuyển khoản dùng VietQR (free, không cần đăng ký)
// Định dạng: https://img.vietqr.io/image/{bank}-{stk}-{template}.png?amount={amount}&addInfo={note}&accountName={name}
const BANK_CODES = { Vietcombank: "VCB", Techcombank: "TCB", MBBank: "MB", VietinBank: "CTG", BIDV: "BIDV", Agribank: "AGR" };

function getQRUrl(amount, orderCode) {
  const bankCode = BANK_CODES[BANK_INFO.bankName] || "VCB";
  const info = encodeURIComponent(`Thanh toan don hang ${orderCode}`);
  const name = encodeURIComponent(BANK_INFO.accountName);
  return `https://img.vietqr.io/image/${bankCode}-${BANK_INFO.accountNo}-compact2.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
}

// ────────────────────────────────────────────────
export default function PaymentModal({ show, onClose, onSuccess, paymentMethod, totalAmount }) {
  const [step, setStep] = useState("idle"); // idle | processing | success | failed
  const [countdown, setCountdown] = useState(300);  // 5 phút cho bank transfer
  const [copied, setCopied] = useState("");
  const orderCode = `DH${Date.now().toString().slice(-8)}`;

  // Reset khi mở modal
  useEffect(() => {
    if (show) { setStep("idle"); setCountdown(300); setCopied(""); }
  }, [show, paymentMethod]);

  // Countdown cho chuyển khoản
  useEffect(() => {
    if (!show || paymentMethod !== "bank" || step !== "idle") return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [show, paymentMethod, step]);

  if (!show) return null;

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const formatVnd = (v) => `${v.toLocaleString("vi-VN")} đ`;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  // Giả lập xử lý thanh toán (MoMo / VNPay)
  const simulatePayment = () => {
    setStep("processing");
    setTimeout(() => {
      const success = Math.random() > 0.15; // 85% thành công
      setStep(success ? "success" : "failed");
    }, 2500);
  };

  // Xác nhận đã chuyển khoản
  const confirmBankTransfer = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 2000);
  };

  const modalClassName = `payment-modal-card ${paymentMethod === "bank" ? "payment-modal-card-bank" : "payment-modal-card-standard"}`;

  // ─── BƯỚC: PROCESSING ───
  if (step === "processing") return (
    <div className="payment-modal-overlay">
      <div className={`${modalClassName} payment-state-body`}>
        <div className="payment-state-icon">
          {paymentMethod === "momo" ? "💜" : paymentMethod === "vnpay" ? "💳" : "🏦"}
        </div>
        <ProcessingSpinner />
        <div className="payment-state-title">
          {paymentMethod === "bank" ? "Đang xác nhận thanh toán..." : "Đang xử lý thanh toán..."}
        </div>
        <div className="payment-state-subtitle">Vui lòng không đóng cửa sổ này</div>
      </div>
    </div>
  );

  // ─── BƯỚC: SUCCESS ───
  if (step === "success") return (
    <div className="payment-modal-overlay">
      <div className={`${modalClassName} payment-state-body`}>
        <div className="payment-success-icon">✅</div>
        <div className="payment-success-title">Thanh toán thành công!</div>
        <div className="payment-success-order">Mã đơn hàng: <b>#{orderCode}</b></div>
        <div className="payment-success-amount">{formatVnd(totalAmount)}</div>
        <button onClick={() => { onSuccess(); onClose(); }}
          className="payment-primary-btn payment-full-btn">
          Về trang chủ
        </button>
      </div>
    </div>
  );

  // ─── BƯỚC: FAILED ───
  if (step === "failed") return (
    <div className="payment-modal-overlay">
      <div className={`${modalClassName} payment-state-body`}>
        <div className="payment-failed-icon">❌</div>
        <div className="payment-failed-title">Thanh toán thất bại</div>
        <div className="payment-failed-text">Giao dịch không thành công. Vui lòng thử lại.</div>
        <div className="payment-failed-actions">
          <button onClick={() => setStep("idle")} className="payment-primary-btn payment-flex-btn">Thử lại</button>
          <button onClick={onClose} className="payment-secondary-btn payment-flex-btn">Hủy</button>
        </div>
      </div>
    </div>
  );

  // ─── BƯỚC: IDLE (nội dung chính) ───
  return (
    <div className="payment-modal-overlay">
      <div className={modalClassName}>

        {/* Header modal */}
        <div className="payment-modal-header">
          <div className="payment-modal-heading">
            <span className="payment-modal-method-icon">
              {paymentMethod === "bank" ? "🏦" : paymentMethod === "momo" ? "💜" : "💳"}
            </span>
            <div>
              <div className="payment-modal-title">
                {paymentMethod === "bank" && "Chuyển khoản ngân hàng"}
                {paymentMethod === "momo" && "Thanh toán MoMo"}
                {paymentMethod === "vnpay" && "Thanh toán VNPay"}
              </div>
              <div className="payment-modal-order-code">Mã đơn: #{orderCode}</div>
            </div>
          </div>
          <button onClick={onClose} className="payment-modal-close">✕</button>
        </div>

        <div className="payment-modal-content">

          {/* Số tiền cần thanh toán */}
          <div className="payment-amount-box">
            <div className="payment-amount-label">Số tiền thanh toán</div>
            <div className="payment-amount-value">{formatVnd(totalAmount)}</div>
          </div>

          {/* ═══ NỘI DUNG THEO PHƯƠNG THỨC ═══ */}

          {/* CHUYỂN KHOẢN NGÂN HÀNG */}
          {paymentMethod === "bank" && (
            <div>
              {/* QR Code */}
              <div className="payment-bank-qr">
                <div className="payment-bank-qr-title">Quét mã QR để chuyển khoản</div>
                <div className="payment-bank-qr-frame">
                  <img
                    src={getQRUrl(totalAmount, orderCode)}
                    alt="QR chuyển khoản"
                    className="payment-bank-qr-image"
                    onError={e => { e.currentTarget.classList.add("payment-hidden"); }}
                  />
                </div>
                <div className="payment-bank-qr-note">Hỗ trợ tất cả ứng dụng ngân hàng</div>
              </div>

              <div className="payment-divider-text">
                <div />
                <span>hoặc chuyển khoản thủ công</span>
                <div />
              </div>

              {/* Thông tin tài khoản */}
              <div className="payment-bank-info">
                {[
                  { label: "Ngân hàng", value: BANK_INFO.bankName, key: "bank" },
                  { label: "Số tài khoản", value: BANK_INFO.accountNo, key: "stk" },
                  { label: "Chủ tài khoản", value: BANK_INFO.accountName, key: "name" },
                  { label: "Chi nhánh", value: BANK_INFO.branch, key: "branch" },
                  { label: "Nội dung CK", value: `Thanh toan don hang ${orderCode}`, key: "note" },
                ].map(row => (
                  <div key={row.key} className="payment-bank-row">
                    <span className="payment-bank-label">{row.label}</span>
                    <div className="payment-bank-value-wrap">
                      <span className={`payment-bank-value ${row.key === "stk" || row.key === "note" ? "payment-bank-value-bold" : ""}`}>{row.value}</span>
                      {(row.key === "stk" || row.key === "note") && (
                        <button onClick={() => copyToClipboard(row.value, row.key)}
                          className={`payment-copy-btn ${copied === row.key ? "payment-copy-btn-done" : ""}`}>
                          {copied === row.key ? "✓ Đã sao chép" : "Sao chép"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Countdown */}
              <div className={`payment-countdown ${countdown < 60 ? "payment-countdown-warning" : ""}`}>
                ⏱ Giao dịch hết hạn sau: <b>{fmtTime(countdown)}</b>
              </div>

              {/* Cảnh báo */}
              <div className="payment-bank-warning">
                ⚠️ Nhập đúng nội dung chuyển khoản để đơn hàng được xác nhận tự động.
              </div>

              <button onClick={confirmBankTransfer}
                className="payment-primary-btn payment-full-btn">
                ✅ Tôi đã chuyển khoản xong
              </button>
            </div>
          )}

          {/* MOMO */}
          {paymentMethod === "momo" && (
            <div className="payment-wallet-section">
              <div className="payment-wallet-icon payment-momo-icon">💜</div>
              <div className="payment-wallet-title">Ví MoMo</div>
              <div className="payment-wallet-text">
                Bấm nút bên dưới để chuyển sang ứng dụng MoMo và hoàn tất thanh toán.
              </div>

              {/* Giả lập màn hình MoMo */}
              <div className="payment-wallet-box payment-momo-box">
                <div className="payment-wallet-box-title payment-momo-text">📱 Thông tin thanh toán MoMo</div>
                <div className="payment-wallet-line">🏪 Người nhận: <b>PinkyCloud Shop</b></div>
                <div className="payment-wallet-line">💰 Số tiền: <b className="payment-momo-text">{formatVnd(totalAmount)}</b></div>
                <div className="payment-wallet-line-last">📝 Nội dung: <b>#{orderCode}</b></div>
              </div>

              <button onClick={simulatePayment}
                className="payment-wallet-pay-btn payment-momo-btn">
                💜 Thanh toán qua MoMo
              </button>
              <button onClick={onClose} className="payment-wallet-cancel-btn">
                Hủy
              </button>

              <div className="payment-demo-note">
                * Đây là demo — không thực hiện giao dịch thật
              </div>
            </div>
          )}

          {/* VNPAY */}
          {paymentMethod === "vnpay" && (
            <div className="payment-wallet-section">
              <div className="payment-wallet-icon payment-vnpay-icon">💳</div>
              <div className="payment-wallet-title">Cổng thanh toán VNPay</div>
              <div className="payment-wallet-text payment-vnpay-intro">
                Thanh toán an toàn qua cổng VNPay. Hỗ trợ tất cả thẻ ATM nội địa, thẻ quốc tế Visa/Mastercard.
              </div>

              {/* Các loại thẻ hỗ trợ */}
              <div className="payment-card-tags">
                {["🏧 ATM nội địa", "💳 Visa", "💳 Mastercard", "📱 QR Code"].map(card => (
                  <span key={card} className="payment-card-tag">{card}</span>
                ))}
              </div>

              {/* Giả lập thông tin đơn */}
              <div className="payment-wallet-box payment-vnpay-box">
                <div className="payment-wallet-box-title payment-vnpay-text">🔒 Thông tin giao dịch VNPay</div>
                <div className="payment-wallet-line">🏪 Merchant: <b>PinkyCloud</b></div>
                <div className="payment-wallet-line">💰 Số tiền: <b className="payment-vnpay-amount">{formatVnd(totalAmount)}</b></div>
                <div className="payment-wallet-line-last">🔑 Mã GD: <b>#{orderCode}</b></div>
              </div>

              <button onClick={simulatePayment}
                className="payment-wallet-pay-btn payment-vnpay-btn">
                💳 Tiến hành thanh toán
              </button>
              <button onClick={onClose} className="payment-wallet-cancel-btn">
                Hủy
              </button>

              <div className="payment-demo-note">
                * Đây là demo — không thực hiện giao dịch thật
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProcessingSpinner() {
  return (
    <div className="payment-spinner-wrap">
      <div className="payment-spinner" />
    </div>
  );
}
