# Bối cảnh dự án — 2026-10-08

Repo hiện là ứng dụng Affiliate/KOL trên MERN, không phải DND Drop Space. Đọc README và docs/template-integration.md. template-source chứa mẫu tham chiếu; lịch sử và trạng thái kiểm thử trong đó không phải bằng chứng của repo hiện tại.

Ưu tiên đã áp dụng: MongoDB 4.0, MinIO, local bốn service, production app-only qua Traefik/private storage, full-SHA images, apply/verify/rollback, secret runtime trên VPS, explicit bootstrap admin, JWT memory/refresh cookie và workflow prompt.

Duy trì schema Role ObjectId, các module Affiliate và Joi. Không có code nguồn cho note/folder/tag, share/quota, email OTP/Google auth, theme/i18n trong bộ mẫu được cung cấp. Không đánh dấu các tính năng đó hoàn tất.

Giữ env/dữ liệu thật và template-source. Không tự deploy GitHub/VPS, thay volume hay nâng quyền tài khoản thật. Phiên JWT từ bản cũ cần đăng nhập lại; chuyển upload local sang MinIO cần kế hoạch dữ liệu riêng.
