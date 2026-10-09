# Quy tắc code

Adapted from template-source/docs/CODING_RULES.md theo source thực tế.

- Backend CommonJS; frontend ES modules/JSX; indentation 2 spaces.
- Route → middleware/Joi validator → controller → service/repository/model; dùng catchAsync, AppError và ApiResponse hiện có.
- Giữ package-lock.json, cài bằng npm ci. MongoDB 4.0 cần driver tương thích và smoke trên server thật.
- Biến môi trường qua server/src/config/env.js. Không commit env thật, không log token/cookie/URI có credential/query nhạy cảm.
- Không lưu access JWT vào localStorage. RBAC đọc User/Role từ backend; không tin role client gửi.
- Cấp admin bằng CLI chỉ cho email đã tồn tại, ghi audit; không seed admin/demo trong startup production.
- Production Compose và rollback chỉ thao tác server/client. Không xóa/purge volume hay thao tác dịch vụ dùng chung để sửa deploy.
- Thay đổi schema/storage phải nêu ảnh hưởng dữ liệu, backup và cách quay lại; giữ tương thích các record tệp local.
- Chạy kiểm tra liên quan, ghi kết quả thật và giới hạn vào prompts; git diff --check trước hoàn tất. Không tự commit/push nếu người dùng chưa yêu cầu.
