import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import "../css/AccountPage.css";

const MENU_ITEMS = [
  { key: "info", label: "Quản lý tài khoản" },
  { key: "orders", label: "Đơn hàng của tôi" },
  { key: "address", label: "Sổ địa chỉ nhận hàng" },
  { key: "buyagain", label: "Mua lại" },
  { key: "faq", label: "Hỏi đáp" },
];

const STATUS_MAP = {
  processing: { label: "Đang xử lý", color: "#f59e0b", bg: "#fffbeb" },
  shipping: { label: "Đang giao", color: "#3b82f6", bg: "#eff6ff" },
  delivered: { label: "Đã giao", color: "#22c55e", bg: "#f0fdf4" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fef2f2" },
};

const ORDER_TABS = ["Tất cả", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];
const TAB_STATUS = { "Tất cả": null, "Đang xử lý": "processing", "Đang giao": "shipping", "Đã giao": "delivered", "Đã hủy": "cancelled" };

function formatVnd(v) { return `${v.toLocaleString("vi-VN")} đ`; }
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

export default function AccountPage() {
  const { currentUser, logout, addresses, addToCart } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || currentUser?.contact || "");
  const [phone, setPhone] = useState(currentUser?.phone || (!currentUser?.contact?.includes("@") ? currentUser?.contact : "") || "");
  const [gender, setGender] = useState(currentUser?.gender || "nu");
  const [dob, setDob] = useState(currentUser?.dob || "");
  const [newsletter, setNewsletter] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // ── Đơn hàng từ MongoDB ──
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState("Tất cả");
  const [buyAgainMsg, setBuyAgainMsg] = useState("");

  useEffect(() => {
    if (activeTab !== "orders" && activeTab !== "buyagain") return;
    if (!currentUser) return;
    const userId = currentUser.id || currentUser.contact || currentUser.email || "guest";
    setOrdersLoading(true);
    fetch(`/api/orders/${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [activeTab, currentUser]);

  const filteredOrders = orders.filter(o => {
    const statusFilter = TAB_STATUS[activeOrderTab];
    return !statusFilter || o.status === statusFilter;
  });

  const avatarLetter = (currentUser?.name || "U").charAt(0).toUpperCase();

  const handleSaveInfo = () => {
    setSaveMsg("✅ Lưu thành công!");
    setEditing(false);
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="account-page">
      <div className="container account-breadcrumb">
        <Link to="/" className="account-breadcrumb-link">Trang chủ</Link>
        <span className="account-breadcrumb-separator">›</span>
        <span className="account-breadcrumb-current">Thông tin tài khoản</span>
      </div>

      <div className="container">
        <div className="row g-4 account-layout">

          {/* SIDEBAR */}
          <div className="col-lg-3">
            <div className="account-profile-card">
              <div className="account-avatar">
                {avatarLetter}
              </div>
              <div>
                <div className="account-profile-name">Chào {currentUser?.name || "Người dùng"}</div>
                <div className="account-profile-edit"
                  onClick={() => { setActiveTab("info"); setEditing(true); }}>
                  Chỉnh sửa tài khoản
                </div>
              </div>
            </div>

            <div className="account-menu">
              {MENU_ITEMS.map((item, i) => (
                <div key={item.key} onClick={() => setActiveTab(item.key)}
                  className={`account-menu-item ${i < MENU_ITEMS.length - 1 ? "account-menu-item-bordered" : ""} ${activeTab === item.key ? "account-menu-item-active" : ""}`}
                >
                  {item.label}
                </div>
              ))}
              <div onClick={handleLogout}
                className="account-menu-logout"
              >
                Đăng xuất
              </div>
            </div>
          </div>

          {/* NỘI DUNG */}
          <div className="col-lg-9">

            {/* TAB: QUẢN LÝ TÀI KHOẢN */}
            {activeTab === "info" && (
              <div>
                <div className="account-card">
                  <div className="account-card-header">
                    <h5>Thông tin tài khoản</h5>
                    {!editing && (
                      <button onClick={() => setEditing(true)}
                        className="account-primary-sm-btn">
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                  {saveMsg && <div className="account-save-msg">{saveMsg}</div>}
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="account-field-label">Họ và tên</label>
                      {editing ? <input value={name} onChange={e => setName(e.target.value)} className="account-input" /> : <div className="account-value">{name || "—"}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="account-field-label">Email/SĐT</label>
                      <div className="account-value">{email || "—"}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="account-field-label">Số điện thoại</label>
                      {editing ? <input value={phone} onChange={e => setPhone(e.target.value)} className="account-input" /> : <div className="account-value">{phone || <span className="account-empty-value">Chưa cập nhật</span>}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="account-field-label">Ngày sinh</label>
                      {editing ? <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="account-input" /> : <div className="account-value">{dob || <span className="account-empty-value">Chưa cập nhật</span>}</div>}
                    </div>
                    {editing && (
                      <div className="col-12">
                        <label className="account-field-label account-field-label-spaced">Giới tính</label>
                        <div className="account-radio-row">
                          {[{ v: "nu", l: "Nữ" }, { v: "nam", l: "Nam" }, { v: "khac", l: "Khác" }].map(g => (
                            <label key={g.v} className="account-radio-label">
                              <input type="radio" name="gender" value={g.v} checked={gender === g.v} onChange={() => setGender(g.v)} className="account-accent-input" />
                              {g.l}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {editing && (
                    <div className="account-edit-actions">
                      <button onClick={handleSaveInfo} className="account-primary-btn">Lưu thay đổi</button>
                      <button onClick={() => setEditing(false)} className="account-secondary-btn">Hủy</button>
                    </div>
                  )}
                </div>

                <div className="account-card">
                  <h6 className="account-card-subtitle">Tùy chọn đăng ký, cập nhật thông tin khuyến mãi</h6>
                  <label className="account-checkbox-label">
                    <input type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} className="account-accent-input" />
                    Đăng ký nhận thông tin khuyến mãi qua email
                  </label>
                  <button className="account-newsletter-btn">
                    Lưu thay đổi
                  </button>
                </div>

                <div className="account-card">
                  <div className="account-section-heading">
                    <h6>Sổ địa chỉ</h6>
                    <span onClick={() => setActiveTab("address")} className="account-inline-link">Quản lý sổ địa chỉ</span>
                  </div>
                  {addresses.length === 0 ? (
                    <div className="account-empty-text">Chưa có địa chỉ nào</div>
                  ) : (
                    addresses.slice(0, 1).map(addr => (
                      <div key={addr.id} className="account-address-preview">
                        <div className="account-address-name">
                          {addr.fullName} – {'*'.repeat(Math.max(0, addr.phone.length - 3))}{addr.phone.slice(-3)}
                          {addr.isDefault && <span className="account-default-badge-light">Mặc định</span>}
                        </div>
                        <div className="account-address-line">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: ĐƠN HÀNG */}
            {activeTab === "orders" && (
              <div>
                <div className="account-card account-card-compact">
                  <h5 className="account-tab-title">Đơn hàng của tôi</h5>
                </div>

                {/* Tabs trạng thái */}
                <div className="account-order-tabs">
                  {ORDER_TABS.map((tab) => (
                    <div key={tab} onClick={() => setActiveOrderTab(tab)}
                      className={`account-order-tab ${activeOrderTab === tab ? "account-order-tab-active" : ""}`}>
                      {tab}
                    </div>
                  ))}
                </div>

                {ordersLoading ? (
                  <div className="account-loading">Đang tải đơn hàng...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="account-card account-empty-state">
                    <div className="account-empty-icon">📦</div>
                    <div>Chưa có đơn hàng nào</div>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const st = STATUS_MAP[order.status] || STATUS_MAP.processing;
                    return (
                      <div key={order.id} className="account-card account-order-card">
                        <div className="account-order-head">
                          <div>
                            <span className="account-order-id">#{order.id}</span>
                            <span className="account-order-date">{formatDate(order.createdAt)}</span>
                          </div>
                          <span className={`account-status account-status-${order.status || "processing"}`}>{st.label}</span>
                        </div>
                        <div className="account-order-items">
                          {order.items?.map((item, i) => (
                            <div key={i} className="account-order-item">
                              {item.image && <img src={item.image} alt={item.name} className="account-order-image" />}
                              <div>
                                <div className="account-order-brand">{item.brand}</div>
                                <div>{item.name}</div>
                              </div>
                              <div className="account-order-qty">x{item.quantity}</div>
                            </div>
                          ))}
                        </div>
                        {order.voucherCode && (
                          <div className="account-order-voucher">🎟️ Voucher: {order.voucherCode}</div>
                        )}
                        <div className="account-order-footer">
                          <span className="account-order-total">{formatVnd(order.finalAmount || order.totalAmount)}</span>
                          <div className="account-order-actions">
                            {order.status === "delivered" && (
                              <button className="account-order-buy-btn">Mua lại</button>
                            )}
                            <button className="account-order-detail-btn">Chi tiết</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: SỔ ĐỊA CHỈ */}
            {activeTab === "address" && (
              <div className="account-card">
                <div className="account-card-header">
                  <h5>Sổ địa chỉ nhận hàng</h5>
                  <Link to="/checkout" className="account-add-address-link">+ Thêm địa chỉ</Link>
                </div>
                {addresses.length === 0 ? (
                  <div className="account-empty-state">
                    <div className="account-empty-icon">📭</div>
                    <div>Chưa có địa chỉ nào</div>
                  </div>
                ) : (
                  addresses.map(addr => (
                    <div key={addr.id} className={`account-address-card ${addr.isDefault ? "account-address-card-default" : ""}`}>
                      <div className="account-address-card-inner">
                        <div className="account-address-card-content">
                          <div className="account-address-card-head">
                            <span className="account-address-fullname">{addr.fullName}</span>
                            <span className="account-address-phone">| {addr.phone}</span>
                            {addr.isDefault && <span className="account-default-badge">Mặc định</span>}
                          </div>
                          <div className="account-address-full">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</div>
                        </div>
                        <div className="account-address-actions">
                          <button className="account-address-edit-btn">Sửa</button>
                          {!addr.isDefault && <button className="account-address-delete-btn">Xóa</button>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: MUA LẠI */}
            {activeTab === "buyagain" && (
              <div className="account-card">
                <h5 className="account-section-title">Mua lại</h5>
                {buyAgainMsg && (
                  <div className="account-buyagain-msg">✅ {buyAgainMsg}</div>
                )}
                {ordersLoading ? (
                  <div className="account-loading">Đang tải...</div>
                ) : orders.length === 0 ? (
                  <div className="account-buyagain-empty">
                    <div className="account-buyagain-empty-icon">🛍️</div>
                    <div className="account-buyagain-empty-text">Chưa có sản phẩm nào để mua lại</div>
                    <Link to="/san-pham" className="account-explore-link">Khám phá sản phẩm</Link>
                  </div>
                ) : (
                  orders.flatMap(o => o.items || []).map((item, i) => (
                    <div key={i} className="account-buyagain-row">
                      {item.image && <img src={item.image} alt={item.name} className="account-buyagain-image" />}
                      <div className="account-buyagain-info">
                        <div className="account-buyagain-brand">{item.brand}</div>
                        <div className="account-buyagain-name">{item.name}</div>
                        <div className="account-buyagain-price">{formatVnd(item.price)}</div>
                      </div>
                      <button
                        onClick={() => {
                          addToCart({ id: item.productId, name: item.name, brand: item.brand, image: item.image, price: item.price });
                          setBuyAgainMsg("Đã thêm vào giỏ hàng!");
                          setTimeout(() => setBuyAgainMsg(""), 2500);
                        }}
                        className="account-buyagain-btn">
                        Mua lại
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: HỎI ĐÁP */}
            {activeTab === "faq" && (
              <div className="account-card">
                <h5 className="account-section-title">Hỏi đáp</h5>
                {[
                  { q: "Tôi có thể đổi trả hàng không?", a: "Có, bạn có thể đổi trả trong vòng 30 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên vẹn." },
                  { q: "Thời gian giao hàng là bao lâu?", a: "Giao hàng nhanh 2H trong nội thành TP.HCM và Hà Nội. Các tỉnh thành khác từ 2-5 ngày làm việc." },
                  { q: "Làm sao để tích điểm?", a: "Mỗi 1.000đ mua hàng bạn nhận được 1 điểm thưởng. Điểm được cộng tự động sau khi đơn hàng giao thành công." },
                  { q: "Tôi quên mật khẩu thì làm thế nào?", a: "Bấm vào 'Quên mật khẩu' tại màn hình đăng nhập, nhập email/SĐT để nhận OTP đặt lại mật khẩu." },
                  { q: "Làm sao theo dõi đơn hàng?", a: "Vào mục 'Đơn hàng của tôi' trong tài khoản để xem trạng thái đơn hàng chi tiết." },
                ].map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="account-faq-item">
      <div onClick={() => setOpen(!open)} className="account-faq-question">
        <span className="account-faq-title">{q}</span>
        <span className={`account-faq-plus ${open ? "account-faq-plus-open" : ""}`}>+</span>
      </div>
      {open && <div className="account-faq-answer">{a}</div>}
    </div>
  );
}
