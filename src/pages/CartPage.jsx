import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import VoucherPopup from "../components/VoucherPopup";
import "../css/CartPage.css";

function formatVnd(value) {
    return `${value.toLocaleString("vi-VN")} đ`;
}

function useVoucher() {
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherInfo, setVoucherInfo] = useState(null);
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

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, isLoggedIn, login } = useCart();
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showVoucherPopup, setShowVoucherPopup] = useState(false);
    const { voucherCode, setVoucherCode, voucherInfo, voucherError, voucherLoading, applyVoucher, removeVoucher } = useVoucher();

    const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountAmount = voucherInfo?.discountAmount || 0;
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    const handleCheckout = () => {
        if (isLoggedIn) { if (voucherInfo) sessionStorage.setItem("voucherInfo", JSON.stringify(voucherInfo)); else sessionStorage.removeItem("voucherInfo"); navigate("/checkout"); }
        else setShowLoginModal(true);
    };

    const handleLoginSuccess = (userInfo, token) => {
        login(userInfo || {}, token || "");
        setShowLoginModal(false);
        if (voucherInfo) sessionStorage.setItem("voucherInfo", JSON.stringify(voucherInfo)); else sessionStorage.removeItem("voucherInfo"); navigate("/checkout");
    };

    const openRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
    const openLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

    return (
        <div className="container cart-page">
            <div className="cart-breadcrumb">
                <Link to="/" className="cart-breadcrumb-link">Trang chủ</Link>
                <span className="cart-breadcrumb-separator">{'>'}</span>
                <span className="cart-breadcrumb-current">Giỏ hàng</span>
            </div>

            <h3 className="cart-title">
                Giỏ hàng <span>({cartItems.length} sản phẩm)</span>
            </h3>

            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    {cartItems.length === 0 ? (
                        <div className="text-center p-5 bg-light rounded">
                            <h5 className="text-muted mb-3">Giỏ hàng của bạn đang trống</h5>
                            <Link to="/san-pham" className="btn cart-primary-link">Tiếp tục mua sắm</Link>
                        </div>
                    ) : (
                        <>
                            <div className="row align-items-center py-3 mb-2 cart-table-head">
                                <div className="col-5">Sản phẩm</div>
                                <div className="col-3 text-center">Giá tiền</div>
                                <div className="col-2 text-center">Số lượng</div>
                                <div className="col-2 text-end">Thành tiền</div>
                            </div>

                            {cartItems.map((item) => (
                                <div key={item.id} className="row align-items-center py-4 cart-item-row">
                                    <div className="col-5 d-flex gap-3">
                                        <div className="cart-item-image-box">
                                            <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                                        </div>
                                        <div className="d-flex flex-column justify-content-between py-1">
                                            <div>
                                                <div className="cart-item-brand">{item.product.brand}</div>
                                                <Link to={`/san-pham/${item.product.id}`} className="cart-item-name">
                                                    {item.product.name.length > 40 ? item.product.name.substring(0, 40) + "..." : item.product.name}
                                                </Link>
                                            </div>
                                            <button type="button" className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>✕ Xóa</button>
                                        </div>
                                    </div>
                                    <div className="col-3 text-center fw-bold">{formatVnd(item.product.price)}</div>
                                    <div className="col-2 d-flex justify-content-center">
                                        <input type="number" min="1" className="form-control text-center w-75"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="col-2 text-end fw-bold">{formatVnd(item.product.price * item.quantity)}</div>
                                </div>
                            ))}

                            {/* ── Ô nhập voucher ── */}
                            <div className="cart-voucher-box">
                                <div className="cart-voucher-head">
                                    <div className="cart-voucher-title">🎟️ Mã giảm giá</div>
                                    {/* Nút xem danh sách voucher */}
                                    <button
                                        onClick={() => setShowVoucherPopup(true)}
                                        className="cart-voucher-list-btn"
                                    >
                                        Xem mã giảm giá
                                    </button>
                                </div>

                                {voucherInfo ? (
                                    <div className="cart-voucher-applied">
                                        <div>
                                            <div className="cart-voucher-code">✅ {voucherInfo.code}</div>
                                            <div className="cart-voucher-detail">{voucherInfo.title} — Giảm <b>{formatVnd(voucherInfo.discountAmount)}</b></div>
                                        </div>
                                        <button onClick={removeVoucher}
                                            className="cart-voucher-remove">
                                            Hủy
                                        </button>
                                    </div>
                                ) : (
                                    <div className="cart-voucher-form">
                                        <input type="text" placeholder="Nhập mã voucher (VD: PINKY15)"
                                            value={voucherCode}
                                            onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                                            onKeyDown={e => e.key === "Enter" && applyVoucher(totalAmount)}
                                            className={`cart-voucher-input ${voucherError ? "cart-voucher-input-error" : ""}`} />
                                        <button onClick={() => applyVoucher(totalAmount)} disabled={voucherLoading}
                                            className={`cart-voucher-apply ${voucherLoading ? "cart-btn-disabled" : ""}`}>
                                            {voucherLoading ? "..." : "Áp dụng"}
                                        </button>
                                    </div>
                                )}
                                {voucherError && <div className="cart-voucher-error">⚠ {voucherError}</div>}
                            </div>

                            {/* Footer */}
                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <Link to="/san-pham" className="cart-continue-link">◄ Tiếp tục mua hàng</Link>
                                <div className="text-end">
                                    {discountAmount > 0 && (
                                        <div className="cart-discount-line">
                                            Tạm tính: <span className="cart-line-through">{formatVnd(totalAmount)}</span>
                                            <span className="cart-discount-value">-{formatVnd(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="cart-total-line">
                                        Tổng tiền: <span>{formatVnd(finalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Cột phải */}
                <div className="col-12 col-lg-4">
                    <div className="p-4 border-top border-3 cart-summary-card">
                        <h5 className="fw-bold mb-4">Hóa đơn của bạn</h5>
                        <div className="d-flex justify-content-between mb-3">
                            <span>Tạm tính:</span><b>{formatVnd(totalAmount)}</b>
                        </div>
                        {discountAmount > 0 && (
                            <div className="d-flex justify-content-between mb-3 cart-summary-discount">
                                <span>Giảm giá ({voucherInfo?.code}):</span>
                                <b>-{formatVnd(discountAmount)}</b>
                            </div>
                        )}
                        <hr />
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <span>Tổng cộng:</span>
                            <span className="fs-4 fw-bold cart-summary-total">{formatVnd(finalAmount)}</span>
                        </div>
                        <button className="btn w-100 py-3 fw-bold cart-summary-btn"
                            disabled={cartItems.length === 0} onClick={handleCheckout}>
                            Tiến hành đặt hàng
                        </button>
                    </div>
                </div>
            </div>

            {/* Voucher Popup */}
            <VoucherPopup
                show={showVoucherPopup}
                onClose={() => setShowVoucherPopup(false)}
                totalAmount={totalAmount}
                onSelect={(code) => {
                    setVoucherCode(code);
                    applyVoucher(totalAmount, code);
                }}
            />

            <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLoginSuccess} onSwitchToRegister={openRegister} />
            <RegisterModal show={showRegisterModal} onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={openLogin} />
        </div>
    );
}
