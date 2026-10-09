# 001 — Kết hợp template-source vào source hiện tại

- Mục tiêu: đọc README và bộ mẫu, ưu tiên logic mẫu rồi ánh xạ vào ứng dụng Affiliate server/client.
- Phạm vi: Compose/Docker/Nginx, CI/CD/deploy scripts, env/storage/health/auth/admin CLI, manifest/icons và tài liệu.
- Ngoài phạm vi: dựng lại DND Drop Space, tính năng chỉ mô tả không có source, deploy GitHub/VPS thật, commit/push.
- Rủi ro dữ liệu / cách quay lại: giữ env/dữ liệu thật; volume MongoDB 4.0 mới; JWT cũ cần login lại; chuyển local files sang MinIO cần migration riêng; rollback image không đảo dữ liệu.

## Tiêu chí hoàn tất

- [x] Ánh xạ logic mẫu sang server/client, giữ schema/permissions hiện tại.
- [x] Production chỉ thao tác hai service app; pending/state/HTTPS/rollback được kiểm thử.
- [x] Lint/build, config guard, workflow/shell validation.
- [x] Compose/smoke trên MongoDB 4.0 + MinIO, upload/download/range và thu hồi phiên.
- [x] Diff kiểm tra, tài liệu cập nhật, env/project kiểm thử tạm được dọn.

## Kết quả

- npm run lint --prefix server: pass, 3 warning có sẵn. npm run lint --prefix client: pass, 3 warning có sẵn.
- npm run build --prefix client: pass. Docker build cả server/client: pass; hai image integration-20261008 đã tạo.
- npm run test:config --prefix server: pass; từ chối Mongo URI thiếu, secret yếu/trùng, HTTP/path origin, MinIO credentials thiếu, proxy hops/port sai.
- bash scripts/test-deploy-flow.sh (trong Linux container): pass; verify/rollback, lỗi HTTPS/up, reuse image phần không đổi, pending SHA isolation, manual rollback, cleanup lần đầu và legacy manifest guard.
- actionlint và Shellcheck toàn bộ script triển khai: pass.
- Compose mern-template-check dùng Dockerfiles thật: cả bốn service healthy.
- Smoke source cuối trên mern-template-runtime: pass; dùng hai image đã build, mount src/scripts/package.json cuối read-only để gồm sửa JS sau lúc build bắt đầu. Không rebuild image lần nữa sau sửa JS cuối.
- Smoke: Nginx/health, KOL chờ duyệt, bootstrap admin + audit, auth/me/refresh, token cũ bị từ chối, upload/download MinIO, byte range 206/416, public product/category, mật khẩu đổi thu hồi access JWT. Tài khoản/object thử được xóa trong finally.
- node scripts/test-readiness.js: pass; mô phỏng bucket thiếu/không phản hồi trong tiến trình riêng, readiness 503 trong khoảng 3 giây, liveness 200, storage thật phục hồi 200. Không kiểm tra bằng việc dừng storage.
- Các project/container/network kiểm thử được dọn bằng Compose down, giữ volume test; env và override tạm được xóa. Các container có sẵn tiếp tục healthy.
- Điều chỉnh sau kiểm tra: local mặc định dùng image MinIO release chính thức cùng ngày, có MINIO_IMAGE override; thêm start_period. Image custom của mẫu vượt thời gian health chờ trên máy này.
- npm audit còn advisory ở dependency có sẵn, gồm proxy-addr critical (baseline/current cùng 2.0.7); chưa nâng dependency toàn bộ trong phạm vi này.
- Giới hạn: chưa chạy workflow GitHub/VPS/rollback production thật, chưa nghiệm thu UI tương tác, chưa có service worker offline hoặc code các tính năng DND chỉ được mô tả.
- Commit: chưa tạo, người dùng chưa yêu cầu.
