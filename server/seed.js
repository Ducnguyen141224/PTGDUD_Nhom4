import "dotenv/config"; // Nạp biến môi trường từ file .env 
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose"; // Thư viện kết nối và thao tác với MongoDB


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, ".."); // Thư mục gốc dự án
const DATA_DIR = path.join(ROOT_DIR, "src", "data"); // Thư mục chứa các file JSON mẫu
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pinkycloud"; // Địa chỉ kết nối DB

/**
 * Hàm đọc file JSON và chuyển thành đối tượng JavaScript
 */
async function readJsonFile(fileName) {
  const fullPath = path.join(DATA_DIR, fileName);
  const raw = await fs.readFile(fullPath, "utf8");
  return JSON.parse(raw);
}

/**
 * Hàm thay thế toàn bộ dữ liệu của một Collection (Bảng)
 * 1. Xóa sạch dữ liệu cũ
 * 2. Chèn dữ liệu mới vào
 */
async function replaceCollection(collectionName, documents) {
  const collection = mongoose.connection.db.collection(collectionName);

  // Xóa toàn bộ dữ liệu hiện có trong collection này
  await collection.deleteMany({});

  // Nếu danh sách mới có dữ liệu thì tiến hành chèn
  if (documents.length > 0) {
    await collection.insertMany(documents);
  }

  console.log(`Đã nạp dữ liệu cho ${collectionName}: ${documents.length} bản ghi`);
}


async function seedDatabase() {
  console.log("Đang kết nối tới MongoDB...");
  await mongoose.connect(MONGODB_URI);

  // --- ĐỌC DỮ LIỆU TỪ CÁC FILE JSON ---

  // 1. Đọc sản phẩm (xử lý trường hợp file JSON có cấu trúc khác nhau)
  const productsSource = await readJsonFile("products.json");
  const products = Array.isArray(productsSource)
    ? productsSource
    : productsSource.products || [];

  // 2. Chuyển đổi dữ liệu Thương hiệu từ dạng Object sang mảng để lưu vào DB
  const brandUrlsSource = await readJsonFile("brandUrls.json");
  const brandUrls = Object.entries(brandUrlsSource).map(([brand, url]) => ({
    brand,
    url,
  }));

  // 3. Đọc các file dữ liệu khác
  const hotVouchers = await readJsonFile("hotVouchers.json");
  const megaMenu = await readJsonFile("megaMenu.json");
  const newsItems = await readJsonFile("newsItems.json");
  const officeLocations = await readJsonFile("officeLocations.json");

  // 4. Tạo collection user với tài khoản admin mặc định
  const users = [
    {
      id: "admin-local",
      contact: "admin@pinkycloud.vn",
      email: "admin@pinkycloud.vn",
      phone: "",
      password: "Admin@123",
      name: "Quản trị viên",
      gender: "khong_xac_dinh",
      dob: "",
      role: "admin",
      createdAt: "2026-04-13T00:00:00.000Z",
    },
  ];

  // 5. Chuyển đổi dữ liệu Địa chỉ Việt Nam sang dạng mảng
  const vietnamAddressSource = await readJsonFile("vietnamAddress.json");
  const vietnamAddresses = Object.entries(vietnamAddressSource).map(
    ([province, districts]) => ({
      province,
      districts,
    }),
  );

  // --- ĐẨY DỮ LIỆU VÀO MONGODB ---
  await replaceCollection("products", products);
  await replaceCollection("brand_urls", brandUrls);
  await replaceCollection("hot_vouchers", hotVouchers);
  await replaceCollection("mega_menu", megaMenu);
  await replaceCollection("news_items", newsItems);
  await replaceCollection("office_locations", officeLocations);
  await replaceCollection("users", users);
  await replaceCollection("vietnam_addresses", vietnamAddresses);

  console.log("Hoàn thành nạp dữ liệu!");

  // Ngắt kết nối sau khi xong việc
  await mongoose.disconnect();
}

// Chạy hàm seed và bắt lỗi nếu có
seedDatabase().catch((error) => {
  console.error("Lỗi khi nạp dữ liệu MongoDB:", error);
  process.exit(1);
});
