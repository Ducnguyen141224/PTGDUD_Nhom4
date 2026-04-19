// Tài khoản Admin mặc định để phục vụ việc kiểm thử trang Quản trị

/**
 * Hàm bổ trợ gọi API backend và trả về dữ liệu JSON.
 * Tự động xử lý lỗi và thiết lập Header mặc định.
 */
async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Cố gắng parse JSON, nếu lỗi (ví dụ API trả về chuỗi trống) thì trả về Object rỗng
  const data = await response.json().catch(() => ({}));

  // Nếu mã trạng thái không nằm trong khoảng 200-299, ném ra lỗi
  if (!response.ok) {
    throw new Error(data.message || "Có lỗi xảy ra khi gọi API.");
  }

  return data;
}

/**
 * Lấy danh sách người dùng từ MongoDB (Dùng cho kiểm tra admin).
 */
export const getUsers = async () => {
  try {
    const result = await apiRequest("/api/auth/check-contact", {
      method: "POST",
      body: JSON.stringify({ contact: DEFAULT_ADMIN.contact }),
    });

    // Nếu admin tồn tại trong DB thì trả về mảng chứa admin, ngược lại trả về mảng rỗng
    return result.exists ? [DEFAULT_ADMIN] : [];
  } catch {
    return [];
  }
};

/**
 * Xử lý đăng ký tài khoản mới.
 * Gửi yêu cầu lưu thông tin người dùng vào cơ sở dữ liệu MongoDB qua Backend.
 */
export const registerUser = async ({ contact, password, name, gender, dob }) => {
  try {
    const result = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        contact,
        password,
        name,
        gender,
        dob,
      }),
    });

    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Xử lý kiểm tra thông tin đăng nhập.
 * Gửi thông tin tài khoản và mật khẩu tới Backend để xác thực.
 */
export const loginUser = async (contact, password) => {
  try {
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ contact, password }),
    });

    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Kiểm tra nhanh sự tồn tại của Email/SĐT (Dùng cho validation phía giao diện).
 */
export const isContactTaken = async (contact) => {
  try {
    const result = await apiRequest("/api/auth/check-contact", {
      method: "POST",
      body: JSON.stringify({ contact }),
    });

    return Boolean(result.exists);
  } catch {
    return false;
  }
};