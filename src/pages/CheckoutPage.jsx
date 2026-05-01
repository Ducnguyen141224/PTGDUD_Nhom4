import React, { useState, useEffect } from "react";
import { useCart } from "../components/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import AddressModal from "../components/AddressModal";
import PaymentModal from "../components/PaymentModal";
import VoucherPopup from "../components/VoucherPopup";
import "../css/CheckoutPage.css";

function formatVnd(value) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function getDeliveryDates() {
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const now = new Date();
  const fast = new Date(now); fast.setDate(now.getDate() + 1);
  const normal = new Date(now); normal.setDate(now.getDate() + 2);
  return {
    fast: { label: `${days[fast.getDay()]}. Trước 10h, ${fast.getDate()}/${fast.getMonth() + 1}`, sub: "NowFree Giao Nhanh 2H", tag: "Trợ giá 100k", price: 0 },
    normal: { label: `${days[normal.getDay()]}. ${normal.getDate()}/${normal.getMonth() + 1}`, sub: "Giao trong 48 giờ", price: 0 },
  };
}

const PAYMENT_METHODS = [
  { id: "cod", icon: "💵", label: "Thanh toán khi nhận hàng (COD)" },
  { id: "bank", icon: "🏦", label: "Chuyển khoản ngân hàng" },
  { id: "momo", icon: "💜", label: "Ví MoMo" },
  { id: "vnpay", icon: "💳", label: "VNPay" },
];

// ── Hook validate voucher ──
function useVoucher(initialVoucher = null) {
  const [voucherCode, setVoucherCode] = useState(initialVoucher?.code || "");
  const [voucherInfo, setVoucherInfo] = useState(initialVoucher || null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);

  const applyVoucher = async (totalAmount, code) => {
    const finalCode = (code || voucherCode).trim();
    if (!finalCode) { setVoucherError("Vui lòng nhập mã voucher."); return; }
    setVoucherLoading(true); setVoucherError(""); setVoucherInfo(null);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: finalCode, totalAmount }),
      });
      const data = await res.json();
      if (!res.ok) setVoucherError(data.message || "Mã voucher không hợp lệ.");
      else { setVoucherInfo(data.voucher); setVoucherCode(finalCode); }
    } catch { setVoucherError("Không thể kết nối server."); }
    finally { setVoucherLoading(false); }
  };

  const removeVoucher = () => { setVoucherInfo(null); setVoucherCode(""); setVoucherError(""); };

  return { voucherCode, setVoucherCode, voucherInfo, voucherError, voucherLoading, applyVoucher, removeVoucher };
}

export default function CheckoutPage() {
  const { cartItems, clearCart, addresses, addAddress, updateAddress, getDefaultAddress, currentUser } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận voucherInfo từ CartPage nếu có
  const { voucherCode, setVoucherCode, voucherInfo, voucherError, voucherLoading, applyVoucher, removeVoucher } =
    useVoucher((() => { try { const v = sessionStorage.getItem("voucherInfo"); return v ? JSON.parse(v) : null; } catch { return null; } })());

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = voucherInfo?.discountAmount || 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);
  const delivery = getDeliveryDates();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [editData, setEditData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showPaymentList, setShowPaymentList] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState("fast");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoucherPopup, setShowVoucherPopup] = useState(false);

  useEffect(() => {
    const def = getDefaultAddress();
    if (def) setSelectedAddressId(def.id);
    else setShowAddressModal(true);
  }, []);

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const def = getDefaultAddress();
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null;
  const selectedPayment = PAYMENT_METHODS.find(p => p.id === paymentMethod);

  const handleSaveAddress = (data) => {
    if (editData) { updateAddress(editData.id, data); setSelectedAddressId(editData.id); }
    else { const newAddr = addAddress(data); setSelectedAddressId(newAddr.id); }
    setShowAddressModal(false);
    setShowAddressList(false);
  };

  // ── Hàm lưu đơn hàng vào MongoDB ──
  const saveOrder = async () => {
    console.log("saveOrder called", { cartItems, selectedAddress, currentUser }); // thêm dòng này
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser?.id || currentUser?.contact || currentUser?.email || "guest",
        userContact: currentUser?.email || currentUser?.contact || "guest",
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        address: selectedAddress,
        paymentMethod,
        deliveryOption,
        totalAmount,
        discountAmount,
        finalAmount,
        voucherCode: voucherInfo?.code || null,
        note,
      }),
    });
  };

  const handleOrder = async () => {
    console.log("handleOrder called", { selectedAddress, paymentMethod });
    if (!selectedAddress) { setShowAddressModal(true); return; }
    if (paymentMethod === "cod") {
      setLoading(true);
      try {
        await saveOrder();
        setLoading(false);
        alert(`🎉 Đặt hàng thành công!\nGiao đến: ${selectedAddress.fullName} - ${selectedAddress.phone}\n${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}${voucherInfo ? `\nVoucher: ${voucherInfo.code} (-${formatVnd(discountAmount)})` : ""}\nTổng thanh toán: ${formatVnd(finalAmount)}`);
        clearCart?.();
        navigate("/");
      } catch {
        setLoading(false);
        alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
      }
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async () => {
    try { await saveOrder(); } catch { console.error("Lỗi lưu đơn hàng"); }
    clearCart?.();
    navigate("/");
  };

  return (
    <div className="checkout-page">
      <div className="checkout-topbar">
        <div className="container checkout-topbar-inner">
          <span>Thanh toán</span>
        </div>
      </div>

      <div className="container">
        <div className="row g-4 checkout-layout">

          {/* CỘT TRÁI */}
          <div className="col-lg-8">

            {/* Địa chỉ */}
            <div className="checkout-card">
              <div className={`checkout-card-head ${selectedAddress ? "checkout-card-head-spaced" : ""}`}>
                <span className="checkout-section-title">Địa chỉ nhận hàng</span>
                <button className="checkout-link-btn" onClick={() => setShowAddressList(!showAddressList)}>Thay đổi</button>
              </div>
              {selectedAddress ? (
                <div>
                  <div className="checkout-selected-address-head">
                    <span className="checkout-address-type">{selectedAddress.addressType}</span>
                    <span className="checkout-address-name">{selectedAddress.fullName}</span>
                    <span className="checkout-address-phone">- {'*'.repeat(selectedAddress.phone.length - 3)}{selectedAddress.phone.slice(-3)}</span>
                  </div>
                  <div className="checkout-address-full">{selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}</div>
                </div>
              ) : (
                <div onClick={() => setShowAddressModal(true)} className="checkout-no-address">
                  ⚠️ Chưa có địa chỉ — Bấm để thêm mới
                </div>
              )}
              {showAddressList && (
                <div className="checkout-address-list">
                  {addresses.map(addr => (
                    <div key={addr.id} onClick={() => { setSelectedAddressId(addr.id); setShowAddressList(false); }}
                      className={`checkout-address-option ${addr.id === selectedAddressId ? "checkout-address-option-active" : ""}`}>
                      <input type="radio" readOnly checked={addr.id === selectedAddressId} className="checkout-radio-top" />
                      <div className="checkout-address-option-content">
                        <div className="checkout-address-option-name">{addr.fullName} - {addr.phone}
                          {addr.isDefault && <span className="checkout-default-badge">Mặc định</span>}
                        </div>
                        <div className="checkout-address-option-full">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setEditData(addr); setShowAddressModal(true); }}
                        className="checkout-address-edit">Sửa</button>
                    </div>
                  ))}
                  <button onClick={() => { setEditData(null); setShowAddressModal(true); }}
                    className="checkout-add-address-btn">
                    + Thêm địa chỉ mới
                  </button>
                </div>
              )}
            </div>

            {/* Thanh toán */}
            <div className="checkout-card">
              <div className="checkout-card-head checkout-card-head-spaced">
                <span className="checkout-section-title">Hình thức thanh toán</span>
                <button className="checkout-link-btn" onClick={() => setShowPaymentList(!showPaymentList)}>Thay đổi</button>
              </div>
              {!showPaymentList ? (
                <div className="checkout-payment-selected">
                  <div className="checkout-radio-visual">
                    <div />
                  </div>
                  <span className="checkout-payment-icon">{selectedPayment?.icon}</span>
                  <span className="checkout-payment-label">{selectedPayment?.label}</span>
                </div>
              ) : (
                <div>
                  {PAYMENT_METHODS.map(pm => (
                    <div key={pm.id} onClick={() => { setPaymentMethod(pm.id); setShowPaymentList(false); }}
                      className={`checkout-payment-option ${paymentMethod === pm.id ? "checkout-payment-option-active" : ""}`}>
                      <input type="radio" readOnly checked={paymentMethod === pm.id} className="checkout-accent-input" />
                      <span className="checkout-payment-option-icon">{pm.icon}</span>
                      <span className="checkout-payment-label">{pm.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thông tin kiện hàng */}
            <div className="checkout-card">
              <div className="checkout-package-title"><span className="checkout-section-title">Thông tin kiện hàng</span></div>
              <div className="checkout-delivery-row">
                {["fast", "normal"].map(opt => (
                  <div key={opt} onClick={() => setDeliveryOption(opt)}
                    className={`checkout-delivery-option ${deliveryOption === opt ? "checkout-delivery-option-active" : ""}`}>
                    <div className="checkout-delivery-head">
                      <input type="radio" readOnly checked={deliveryOption === opt} className="checkout-accent-input" />
                      <span>{delivery[opt].label}</span>
                    </div>
                    <div className="checkout-delivery-sub">
                      {delivery[opt].sub}
                      {opt === "fast" && <span className="checkout-delivery-tag">{delivery.fast.tag}</span>}
                    </div>
                    <div className="checkout-delivery-price-wrap">
                      <span className="checkout-delivery-price">0 đ</span>
                    </div>
                  </div>
                ))}
              </div>
              {cartItems.map(item => (
                <div key={item.id} className="checkout-package-item">
                  <img src={item.product.image} alt={item.product.name} className="checkout-package-image" />
                  <div className="checkout-package-info">
                    <div className="checkout-package-brand">{item.product.brand}</div>
                    <div className="checkout-package-name">{item.product.name}</div>
                  </div>
                  <div className="checkout-package-price-box">
                    <div className="checkout-package-qty">{item.quantity} × {formatVnd(item.product.price)}</div>
                    <div className="checkout-package-total">{formatVnd(item.product.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher */}
            <div className="checkout-card">
              <div className="checkout-voucher-head">
                <div className="checkout-voucher-title">🎟️ Mã giảm giá</div>
                <button onClick={() => setShowVoucherPopup(true)}
                  className="checkout-voucher-list-btn">
                  Xem mã giảm giá
                </button>
              </div>
              {voucherInfo ? (
                <div className="checkout-voucher-applied">
                  <div>
                    <div className="checkout-voucher-code">✅ {voucherInfo.code}</div>
                    <div className="checkout-voucher-detail">{voucherInfo.title} — Giảm <b>{formatVnd(voucherInfo.discountAmount)}</b></div>
                  </div>
                  <button onClick={removeVoucher}
                    className="checkout-voucher-remove">
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="checkout-voucher-form">
                  <input type="text" placeholder="Nhập mã voucher (VD: PINKY15)"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && applyVoucher(totalAmount)}
                    className={`checkout-voucher-input ${voucherError ? "checkout-voucher-input-error" : ""}`} />
                  <button onClick={() => applyVoucher(totalAmount)} disabled={voucherLoading}
                    className={`checkout-voucher-apply ${voucherLoading ? "checkout-disabled-btn" : ""}`}>
                    {voucherLoading ? "..." : "Áp dụng"}
                  </button>
                </div>
              )}
              {voucherError && <div className="checkout-voucher-error">⚠ {voucherError}</div>}
            </div>

            {/* Ghi chú + đặt hàng */}
            <div className="checkout-card">
              <div className="checkout-note-row">
                <textarea placeholder="Ghi chú" value={note} onChange={e => setNote(e.target.value)} rows={2}
                  className="checkout-note-input" />
                <div className="checkout-submit-box">
                  {discountAmount > 0 && (
                    <div className="checkout-note-discount">Giảm voucher: <b>-{formatVnd(discountAmount)}</b></div>
                  )}
                  <div className="checkout-note-total">
                    Tổng tiền ({cartItems.length})
                    <span>{formatVnd(finalAmount)}</span>
                  </div>
                  <button onClick={handleOrder} disabled={loading || cartItems.length === 0}
                    className={`checkout-order-btn ${loading ? "checkout-order-btn-loading" : ""}`}>
                    {loading ? <><Spinner /> Đang xử lý...</> : "Đặt hàng"}
                  </button>
                </div>
              </div>
              <div className="checkout-policy-note">
                Nhấn "Đặt hàng" đồng nghĩa việc bạn đồng ý tuân theo{" "}
                <a href="/chinh-sach/chinh-sach-du-lieu-ca-nhan">Chính sách xử lý dữ liệu cá nhân</a> &{" "}
                <a href="/chinh-sach/dieu-khoan-su-dung">Điều khoản sử dụng</a>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="col-lg-4">
            <div className="checkout-sidebar">
              <button onClick={handleOrder} disabled={loading || cartItems.length === 0}
                className={`checkout-sidebar-order-btn ${loading ? "checkout-order-btn-loading" : ""}`}>
                {loading ? <><Spinner /> Đang xử lý...</> : "Đặt hàng"}
              </button>

              <div className="checkout-sidebar-head">
                <span>Đơn hàng ({cartItems.length} sản phẩm)</span>
                <button className="checkout-link-btn" onClick={() => navigate("/gio-hang")}>Thay đổi</button>
              </div>

              <div className="checkout-sidebar-items">
                {cartItems.map(item => (
                  <div key={item.id} className="checkout-sidebar-item">
                    <div className="checkout-sidebar-image-wrap">
                      <img src={item.product.image} alt={item.product.name} className="checkout-sidebar-image" />
                      <span className="checkout-sidebar-qty-badge">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="checkout-sidebar-product-info">
                      <div className="checkout-sidebar-brand">{item.product.brand}</div>
                      <div className="checkout-sidebar-name">{item.product.name}</div>
                    </div>
                    <div className="checkout-sidebar-price-box">
                      <div className="checkout-sidebar-item-total">{formatVnd(item.product.price * item.quantity)}</div>
                      {item.quantity > 1 && <div className="checkout-sidebar-item-unit">{item.quantity} × {formatVnd(item.product.price)}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-line">
                <span>Tạm tính ({cartItems.length})</span>
                <span>{formatVnd(totalAmount)}</span>
              </div>
              <div className="checkout-summary-line">
                <span>Giảm giá {voucherInfo ? `(${voucherInfo.code})` : ""}</span>
                <span className={discountAmount > 0 ? "checkout-summary-discount" : ""}>
                  {discountAmount > 0 ? `-${formatVnd(discountAmount)}` : "0 đ"}
                </span>
              </div>
              <div className="checkout-summary-line checkout-summary-line-last">
                <span>Phí vận chuyển</span>
                <span>0 đ</span>
              </div>
              <div className="checkout-summary-total">
                <span>Thành tiền (Đã VAT)</span>
                <span>{formatVnd(finalAmount)}</span>
              </div>
              <p className="checkout-summary-note">
                Đã bao gồm VAT, phí đóng gói, phí vận chuyển và các chi phí khác vui lòng xem{" "}
                <a href="/chinh-sach/chinh-sach-van-chuyen">Chính sách vận chuyển</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <VoucherPopup
        show={showVoucherPopup}
        onClose={() => setShowVoucherPopup(false)}
        totalAmount={totalAmount}
        onSelect={(code) => {
          setVoucherCode(code);
          applyVoucher(totalAmount, code);
        }}
      />

      <AddressModal
        show={showAddressModal}
        onClose={() => { if (addresses.length === 0) navigate("/gio-hang"); else setShowAddressModal(false); }}
        onSave={handleSaveAddress}
        editData={editData}
      />

      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        paymentMethod={paymentMethod}
        totalAmount={finalAmount}
      />
    </div>
  );
}

function Spinner() {
  return <span className="checkout-spinner" />;
}
