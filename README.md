# 🚀 Hybrid Wash - Frontend Web Application

Hệ thống đặt lịch rửa xe, chăm sóc xe detailing & tích điểm thành viên thông minh.

---

## 💻 Tech Stack & Thư Viện Đã Setup

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) - Siêu nhanh & tối ưu bundler
- **Routing**: [React Router DOM v7](https://reactrouter.com/) - Quản lý điều hướng trang & phân quyền
- **Styling & UI Systems**:
  - **Tailwind CSS v3** + PostCSS + Autoprefixer
  - **Design System**: Dark Mode Theme, Glassmorphism backdrop, Custom Gradients & Micro-animations
  - **Utility Helpers**: `clsx` & `tailwind-merge` (xử lý kết hợp Tailwind class động)
- **UI Components & Icons**:
  - **Lucide React**: Bộ icon vector phong phú & hiện đại
  - **Framer Motion v12**: Thư viện xử lý hiệu ứng chuyển động & animation mượt mà
  - **Sonner**: Thư viện thông báo Toast chuyên nghiệp

---

## 🛠️ 1. Hướng Dẫn Chạy Dự Án (Getting Started)

Cài đặt phụ thuộc và khởi chạy dự án ở môi trường local:

```bash
# Cài đặt các thư viện (chạy 1 lần đầu tiên)
npm install

# Khởi chạy máy chủ phát triển (Dev Server)
npm run dev

# Kiểm tra & Build sản phẩm (Production)
npm run build
```

---

## 📌 2. Tổng Hợp Các Lệnh Git Thường Dùng (Common Git Commands)

### 🔹 Luồng làm việc hằng ngày (Basic Daily Workflow)

```bash
# 1. Kiểm tra trạng thái các file đã chỉnh sửa, thêm mới hoặc xóa
git status

# 2. Thêm tất cả file thay đổi vào Staging Area
git add .

# Hoặc chỉ thêm 1 file cụ thể:
git add src/pages/HomePage.tsx

# 3. Tạo Commit lưu lại lịch sử thay đổi (kèm ghi chú rõ ràng)
git commit -m "feat: cập nhật giao diện trang chủ và mock data"

# 4. Kéo code mới nhất từ repository remote về máy (để tránh xung đột)
git pull origin main

# 5. Đẩy commit local lên GitHub/Remote
git push origin main
```

---

### 🌿 Quản lý Nhánh (Branching)

```bash
# Xem danh sách các nhánh hiện có (nhánh đang đứng có dấu *)
git branch

# Tạo nhánh mới và chuyển sang nhánh đó ngay lập tức
git checkout -b feature/login-page
# Hoặc lệnh mới:
git switch -c feature/login-page

# Chuyển đổi giữa các nhánh
git checkout main
# Hoặc:
git switch main

# Gộp nhánh feature vào nhánh hiện tại (ví dụ đang ở main)
git merge feature/login-page

# Xóa nhánh local sau khi đã gộp xong
git branch -d feature/login-page
```

---

### 🔍 Kiểm tra Lịch sử & Thay đổi (History & Diff)

```bash
# Xem lịch sử các commit ngắn gọn (1 dòng / commit)
git log --oneline

# Xem chi tiết các dòng code đã bị thay đổi chưa stage
git diff

# Lấy thông tin các nhánh mới từ remote mà chưa gộp vào local
git fetch origin
```

---

### 📦 Lưu tạm & Khôi phục code (Stash & Restore)

```bash
# Lưu tạm các thay đổi dở dang khi cần chuyển nhánh gấp mà chưa muốn commit
git stash

# Xem danh sách các lần stash
git stash list

# Lấy lại thay đổi dở dang gần nhất và xóa khỏi danh sách stash
git stash pop

# Hủy bỏ toàn bộ thay đổi chưa stage của 1 file về trạng thái commit gần nhất
git restore <tên-file>

# Hủy commit gần nhất nhưng giữ lại toàn bộ code đã sửa ở Working Directory
git reset --soft HEAD~1
```

---

### 🔗 Khởi tạo & Kết nối Repository (Initial Setup)

```bash
# Khởi tạo Git cho thư mục mới
git init

# Đặt tên nhánh mặc định là main
git branch -M main

# Liên kết thư mục local với GitHub remote repository
git remote add origin <URL_REPOSITORY_GITHUB>

# Đẩy code lên GitHub lần đầu tiên
git push -u origin main
```
