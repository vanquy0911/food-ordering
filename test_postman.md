# Hướng dẫn Kiểm thử (Test Plan) bằng Postman - YumEats Project

Tài liệu này cung cấp các bước và dữ liệu mẫu để bạn có thể kiểm tra toàn bộ các tính năng của hệ thống Back-end.

## 1. Thiết lập chung
- **Base URL:** `http://localhost:5000/api`
- **Headers yêu cầu:**
    - `Content-Type: application/json`
    - `Authorization: Bearer <TOKEN>` (Dành cho các API bảo mật)
    - `X-Idempotency-Key: <UUID>` (Dành riêng cho API Đặt hàng)

---

## 2. Luồng Xác thực (Authentication)

### 2.1. Đăng nhập (Login - Lấy Token Admin hoặc User)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body:**
```json
{
    "email": "admin@example.com",
    "password": "password123"
}
```

---

## 3. Luồng Người dùng (Customer Flow)

### 3.1. Đặt hàng với Vị trí Ghim (Pin Location)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/orders`
- **Body:**
```json
{
    "address": {
        "street": "123 Street",
        "city": "HCMC",
        "district": "District 1",
        "latitude": 10.762622, 
        "longitude": 106.660172
    },
    "phone": "0987654321",
    "paymentMethod": "cash"
}
```

---

## 4. Luồng Quản trị (Admin Flow)
*Lưu ý: Bạn cần dùng Token của tài khoản Admin.*

### 4.1. Pin Vị trí Quán & Cấu hình Phí Ship
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/settings`
- **Body:**
```json
{
    "shopLocation": {
        "lat": 10.762622,
        "lng": 106.660172
    },
    "shopAddress": "123 Shop Street, HCM City",
    "shippingConfig": {
        "baseFee": 15000,
        "perKmFee": 5000,
        "freeShipThreshold": 500000,
        "maxDeliveryDistance": 20
    }
}
```
*Lưu ý: Thay đổi tọa độ này sẽ ảnh hưởng trực tiếp đến việc tính phí ship các đơn hàng mới.*

### 4.2. Quản lý Mã giảm giá (Thêm mới)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/coupons`
- **Body:**
```json
{
    "code": "PROMO2024",
    "discountType": "percentage",
    "discountValue": 20,
    "expiryDate": "2024-12-31T23:59:59Z"
}
```

---

## 5. Kịch bản lỗi và Quy tắc hệ thống

| Kịch bản | Hành động | Kết quả mong đợi |
| :--- | :--- | :--- |
| **Admin ghim vị trí quán mới** | PUT `settings` | Phí ship các đơn hàng sau đó sẽ thay đổi theo vị trí mới. |
| **User ghim vị trí quá xa** | POST `orders` | Lỗi 400: "Distance limit exceeded" |
| **Ghim thiếu tọa độ** | Bỏ Lat/Lng | Đơn hàng vẫn tạo được nhưng chỉ tính phí Ship cơ bản (Base Fee). |

---
*Tài liệu này hỗ trợ team Dev và Tester kiểm soát chất lượng API dự án.*
