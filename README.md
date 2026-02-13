# 🍔 Food Ordering Backend API

Backend API cho hệ thống đặt món ăn được xây dựng với Node.js, Express và MongoDB.

## 🚀 Công nghệ sử dụng

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service

## 📦 Cài đặt

1. Clone repository:
```bash
git clone https://github.com/vanquy0911/food-ordering.git
cd food-ordering
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Cấu hình biến môi trường:
- Copy file `.env.example` thành `.env`
- Cập nhật các giá trị trong file `.env`

4. Chạy server:
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## 🔧 Cấu trúc dự án

```
food-ordering/
├── config/          # Cấu hình database, env
├── controller/      # Xử lý logic nghiệp vụ
├── middleware/      # Authentication, validation
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── services/        # Business logic layer
├── utils/           # Helper functions
└── server.js        # Entry point
```

## 📝 API Endpoints

### Health Check
- `GET /` - Welcome message
- `GET /api/health` - Server health status

*Các endpoints khác sẽ được thêm vào sau*

## 👨‍💻 Development

```bash
npm run dev  # Chạy với nodemon (auto-reload)
```

## 📄 License

ISC
