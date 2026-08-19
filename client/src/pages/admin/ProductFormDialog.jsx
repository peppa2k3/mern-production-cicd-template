import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Dialog from '@/components/ui/Dialog';
import { Input, Textarea, Select, Field } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/common/ImageUploader';
import { useCategoriesPublic } from '@/features/categories/hooks';
import { useCreateProduct, useUpdateProduct } from '@/features/products/hooks';

const schema = z.object({
  name: z.string().min(2, 'Tên sản phẩm quá ngắn'),
  category: z.string().min(1, 'Chọn danh mục'),
  price: z.coerce.number().min(0, 'Giá không hợp lệ'),
  salePrice: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
  affiliateLink: z.string().url('Link không hợp lệ'),
  commissionType: z.enum(['percent', 'fixed']),
  commissionValue: z.coerce.number().min(0, 'Hoa hồng không hợp lệ'),
  status: z.enum(['draft', 'published', 'archived']),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isHot: z.boolean().optional(),
});

export default function ProductFormDialog({ open, onClose, product }) {
  const { data: categoriesData } = useCategoriesPublic();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      commissionType: 'percent',
      status: 'draft',
      isFeatured: false,
      isHot: false,
    },
  });

  const images = watch('images') || [];

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        category: product.category?._id || product.category,
        salePrice: product.salePrice || '',
      });
    } else {
      reset({
        name: '',
        category: '',
        price: '',
        salePrice: '',
        affiliateLink: '',
        commissionType: 'percent',
        commissionValue: '',
        status: 'draft',
        shortDescription: '',
        description: '',
        isFeatured: false,
        isHot: false,
        images: [],
      });
    }
  }, [product, open, reset]);

  const onSubmit = (values) => {
    const payload = {
      ...values,
      salePrice: values.salePrice === '' ? undefined : values.salePrice,
      images,
    };
    if (product) {
      updateProduct.mutate({ id: product._id, payload }, { onSuccess: onClose });
    } else {
      createProduct.mutate(payload, { onSuccess: onClose });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onClose={onClose} title={product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Hình ảnh">
          <Controller
            name="images"
            control={control}
            render={() => <ImageUploader images={images} onChange={(v) => setValue('images', v)} />}
          />
        </Field>

        <Field label="Tên sản phẩm" error={errors.name?.message}>
          <Input {...register('name')} placeholder="VD: Áo thun basic" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Danh mục" error={errors.category?.message}>
            <Select {...register('category')}>
              <option value="">-- Chọn danh mục --</option>
              {categoriesData?.data?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Trạng thái">
            <Select {...register('status')}>
              <option value="draft">Nháp</option>
              <option value="published">Đã đăng</option>
              <option value="archived">Lưu trữ</option>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Giá gốc (VNĐ)" error={errors.price?.message}>
            <Input type="number" {...register('price')} placeholder="199000" />
          </Field>
          <Field label="Giá khuyến mãi (tuỳ chọn)" error={errors.salePrice?.message}>
            <Input type="number" {...register('salePrice')} placeholder="149000" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Loại hoa hồng">
            <Select {...register('commissionType')}>
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Cố định (VNĐ)</option>
            </Select>
          </Field>
          <Field label="Giá trị hoa hồng" error={errors.commissionValue?.message}>
            <Input type="number" {...register('commissionValue')} placeholder="10" />
          </Field>
        </div>

        <Field label="Link Affiliate" error={errors.affiliateLink?.message}>
          <Input {...register('affiliateLink')} placeholder="https://shop.example.com/product/..." />
        </Field>

        <Field label="Mô tả ngắn">
          <Input {...register('shortDescription')} placeholder="Một câu mô tả ngắn gọn" />
        </Field>

        <Field label="Mô tả chi tiết">
          <Textarea {...register('description')} placeholder="Mô tả chi tiết sản phẩm..." />
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input type="checkbox" {...register('isFeatured')} className="rounded accent-gold-500" />
            Nổi bật
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input type="checkbox" {...register('isHot')} className="rounded accent-hot-500" />
            Sản phẩm HOT
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Đang lưu...' : product ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
