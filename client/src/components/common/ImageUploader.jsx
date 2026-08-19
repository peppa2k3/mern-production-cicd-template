import { useRef, useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import { adminApi } from '@/features/admin/api';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

// Uploads files to /files/multiple, then hands back the resulting
// {url,isPrimary,order} media array shape the Product model expects.
export default function ImageUploader({ images = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadMultiple(files);
      const uploaded = res.data.map((f, i) => ({
        url: f.url,
        isPrimary: images.length === 0 && i === 0,
        order: images.length + i,
      }));
      onChange([...images, ...uploaded]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  const setPrimary = (idx) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            {img.isPrimary && (
              <span className="absolute left-1 top-1 rounded bg-gold-500 p-0.5 text-base-900">
                <Star size={10} fill="currentColor" />
              </span>
            )}
            <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-base-900/70 group-hover:flex">
              {!img.isPrimary && (
                <button
                  type="button"
                  onClick={() => setPrimary(i)}
                  className="rounded bg-base-700 p-1 text-ink-100 hover:bg-base-600"
                  title="Đặt làm ảnh chính"
                >
                  <Star size={12} />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="rounded bg-hot-500 p-1 text-white hover:bg-hot-600"
                title="Xoá"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-ink-500 hover:border-gold-500 hover:text-gold-400"
        >
          {uploading ? <Spinner size={18} /> : <Upload size={18} />}
          <span className="text-[10px]">Tải ảnh</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
