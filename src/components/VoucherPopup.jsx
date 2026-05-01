import React, { useEffect, useState } from "react";
import "../css/VoucherPopup.css";

function formatVnd(v) { return `${v.toLocaleString("vi-VN")} đ`; }

/**
 * VoucherPopup — Popup hiển thị danh sách voucher có thể dùng
 * Props:
 *   show         : boolean
 *   onClose      : () => void
 *   onSelect     : (code: string) => void  — khi bấm "Dùng ngay"
 *   totalAmount  : number                  — để kiểm tra điều kiện tối thiểu
 */
export default function VoucherPopup({ show, onClose, onSelect, totalAmount = 0 }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    fetch("/api/hot-vouchers")
      .then(r => r.json())
      .then(data => setVouchers(Array.isArray(data) ? data : []))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, [show]);

  if (!show) return null;

  // Kiểm tra voucher có đủ điều kiện không
  const isEligible = (v) => !v.minOrder || totalAmount >= v.minOrder;

  // Tính tiền giảm ước tính
  const calcDiscount = (v) => {
    if (!v.discountType) return null;
    if (v.discountType === "percent") {
      const d = Math.round(totalAmount * v.discountValue / 100);
      return v.maxDiscount ? Math.min(d, v.maxDiscount) : d;
    }
    return v.discountValue || 0;
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="voucher-popup-overlay"
      />

      {/* Panel */}
      <div className="voucher-popup-panel">
        {/* Header */}
        <div className="voucher-popup-header">
          <div>
            <div className="voucher-popup-title">🎟️ Mã giảm giá</div>
            <div className="voucher-popup-subtitle">Chọn mã phù hợp với đơn hàng của bạn</div>
          </div>
          <button onClick={onClose}
            className="voucher-popup-close">
            ×
          </button>
        </div>

        {/* Nội dung */}
        <div className="voucher-popup-body">
          {loading ? (
            <div className="voucher-popup-empty">Đang tải...</div>
          ) : vouchers.length === 0 ? (
            <div className="voucher-popup-empty">Không có voucher nào</div>
          ) : (
            vouchers.map((v, i) => {
              const eligible = isEligible(v);
              const discount = calcDiscount(v);
              return (
                <div key={i} className={`voucher-popup-ticket ${eligible ? "voucher-popup-ticket-eligible" : "voucher-popup-ticket-disabled"}`}>
                  {/* Phần trái — màu accent */}
                  <div className="voucher-popup-ticket-left">
                    <div className="voucher-popup-ticket-label">VOUCHER</div>
                    <div className="voucher-popup-ticket-code">{v.code}</div>
                  </div>

                  {/* Phần phải — thông tin */}
                  <div className="voucher-popup-ticket-right">
                    <div>
                      <div className="voucher-popup-ticket-title">{v.title}</div>
                      <div className="voucher-popup-ticket-detail">{v.detail}</div>
                      {discount !== null && eligible && (
                        <div className="voucher-popup-discount">
                          Tiết kiệm: {formatVnd(discount)}
                        </div>
                      )}
                      {!eligible && v.minOrder && (
                        <div className="voucher-popup-warning">
                          ⚠ Cần thêm {formatVnd(v.minOrder - totalAmount)} để dùng mã này
                        </div>
                      )}
                    </div>
                    <div className="voucher-popup-ticket-actions">
                      <button
                        disabled={!eligible}
                        onClick={() => { onSelect(v.code); onClose(); }}
                        className={`voucher-popup-use-btn ${eligible ? "voucher-popup-use-btn-active" : ""}`}
                      >
                        {eligible ? "Dùng ngay" : "Chưa đủ điều kiện"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
