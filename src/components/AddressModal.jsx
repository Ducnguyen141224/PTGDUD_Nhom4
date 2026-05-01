import React, { useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";
import "../css/AddressModal.css";

// editData: truyền vào khi muốn chỉnh sửa địa chỉ đã có (không truyền = thêm mới)
export default function AddressModal({ show, onClose, onSave, editData = null }) {
  const { data: addressDataSource } = useFetch("/api/vietnam-addresses");
  const addressData = addressDataSource && typeof addressDataSource === "object"
    ? addressDataSource
    : {};
  const provinces = Object.keys(addressData);

  function getDistricts(province) {
    if (!province || !addressData[province]) return [];
    return Object.keys(addressData[province]);
  }

  function getWards(province, district) {
    if (!province || !district) return [];
    return addressData[province]?.[district] || [];
  }

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");
  const [addressType, setAddressType] = useState("Nhà riêng");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Khi mở modal chỉnh sửa → điền sẵn dữ liệu cũ vào form
  useEffect(() => {
    if (show && editData) {
      setPhone(editData.phone || "");
      setFullName(editData.fullName || "");
      setProvince(editData.province || "");
      setDistrict(editData.district || "");
      setWard(editData.ward || "");
      setStreet(editData.street || "");
      setAddressType(editData.addressType || "Nhà riêng");
      setIsDefault(editData.isDefault || false);
    }
    if (show && !editData) {
      // Reset form khi thêm mới
      setPhone(""); setFullName(""); setProvince(""); setDistrict("");
      setWard(""); setStreet(""); setAddressType("Nhà riêng"); setIsDefault(false);
    }
    setError(""); setPhoneError("");
  }, [show, editData]);

  if (!show) return null;

  const handleProvinceChange = (e) => { setProvince(e.target.value); setDistrict(""); setWard(""); };
  const handleDistrictChange = (e) => { setDistrict(e.target.value); setWard(""); };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) setPhone(value);
    if (value.length === 0) setPhoneError("");
    else if (!/^0/.test(value)) setPhoneError("Số điện thoại phải bắt đầu bằng số 0.");
    else if (value.length < 10) setPhoneError(`Còn thiếu ${10 - value.length} chữ số.`);
    else setPhoneError("");
  };

  const validatePhone = (value) => {
    if (!value) return "Vui lòng nhập số điện thoại.";
    if (!/^0/.test(value)) return "Số điện thoại phải bắt đầu bằng số 0.";
    if (value.length !== 10) return "Số điện thoại phải có đúng 10 chữ số.";
    return "";
  };

  const handleSave = () => {
    const pErr = validatePhone(phone);
    if (pErr) { setPhoneError(pErr); return; }
    if (!fullName || !province || !district || !ward || !street) {
      setError("Vui lòng điền đầy đủ tất cả thông tin địa chỉ."); return;
    }
    setError(""); setPhoneError("");
    onSave({ phone, fullName, province, district, ward, street, addressType, isDefault });
  };

  return (
    <div className="address-modal-overlay">
      <div className="address-modal-panel">

        <button onClick={onClose} className="address-modal-close">✕</button>

        <h5 className="address-modal-title">
          {editData ? "✏️ Chỉnh sửa địa chỉ" : "📍 Thêm địa chỉ mới"}
        </h5>

        {/* Hàng 1: SĐT + Họ tên */}
        <div className={`address-modal-row ${phoneError ? "address-modal-row-tight" : ""}`}>
          <div className="address-modal-field address-modal-field-relative">
            <input type="tel" placeholder="Số điện thoại" value={phone} onChange={handlePhoneChange}
              maxLength={10} inputMode="numeric"
              className={`address-modal-input address-modal-input-icon ${phoneError ? "address-modal-input-error" : phone.length === 10 ? "address-modal-input-valid" : ""}`}
            />
            <span className="address-modal-input-status">
              {phone.length === 10 && !phoneError ? "✅" : phoneError ? "❌" : "📋"}
            </span>
          </div>
          <div className="address-modal-field">
            <input type="text" placeholder="Họ và tên" value={fullName} onChange={e => setFullName(e.target.value)} className="address-modal-input" />
          </div>
        </div>
        {phoneError && <div className="address-modal-phone-error">⚠️ {phoneError}</div>}
        {!phoneError && phone.length > 0 && phone.length < 10 && (
          <div className="address-modal-phone-help">Đã nhập {phone.length}/10 số</div>
        )}

        {/* Hàng 2: Tỉnh/TP + Quận/Huyện */}
        <div className="address-modal-row">
          <div className="address-modal-field address-modal-field-relative">
            <select value={province} onChange={handleProvinceChange} className={`address-modal-input address-modal-select ${province ? "" : "address-modal-select-placeholder"}`}>
              <option value="">Chọn Tỉnh/ TP</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="address-modal-select-arrow">▼</span>
          </div>
          <div className="address-modal-field address-modal-field-relative">
            <select value={district} onChange={handleDistrictChange} disabled={!province} className={`address-modal-input address-modal-select ${district ? "" : "address-modal-select-placeholder"}`}>
              <option value="">Chọn Quận/ Huyện</option>
              {getDistricts(province).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="address-modal-select-arrow">▼</span>
          </div>
        </div>

        {/* Phường/Xã */}
        <div className="address-modal-select-row">
          <select value={ward} onChange={e => setWard(e.target.value)} disabled={!district} className={`address-modal-input address-modal-select ${ward ? "" : "address-modal-select-placeholder"}`}>
            <option value="">Chọn Phường/ Xã</option>
            {getWards(province, district).map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <span className="address-modal-select-arrow">▼</span>
        </div>

        {/* Số nhà + Tên đường */}
        <div className="address-modal-street-row">
          <input type="text" placeholder="Số nhà + Tên đường" value={street} onChange={e => setStreet(e.target.value)} disabled={!ward}
            className="address-modal-input" />
        </div>
        {!ward
          ? <p className="address-modal-street-help">Vui lòng chọn Tỉnh/TP, Quận/Huyện và Phường/Xã trước khi nhập Số nhà + Tên Đường</p>
          : <div className="address-modal-spacer" />
        }

        {error && <div className="address-modal-error">{error}</div>}

        {/* Loại địa chỉ */}
        <div className="address-modal-type-row">
          <span className="address-modal-type-label">Chọn loại địa chỉ</span>
          {["Nhà riêng", "Công ty"].map(type => (
            <button key={type} onClick={() => setAddressType(type)} className={`address-modal-type-btn ${addressType === type ? "address-modal-type-btn-active" : ""}`}>
              {type}
            </button>
          ))}
        </div>

        {/* Toggle mặc định */}
        <div className="address-modal-default-row">
          <span className="address-modal-default-label">Đặt làm địa chỉ mặc định</span>
          <div onClick={() => setIsDefault(!isDefault)} className={`address-modal-switch ${isDefault ? "address-modal-switch-on" : ""}`}>
            <div className="address-modal-switch-knob" />
          </div>
        </div>

        <div className="address-modal-actions">
          <button onClick={onClose} className="address-modal-cancel">Hủy</button>
          <button onClick={handleSave} className="address-modal-save">
            {editData ? "Cập nhật" : "Tiếp tục"}
          </button>
        </div>
      </div>
    </div>
  );
}
