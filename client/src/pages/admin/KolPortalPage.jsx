import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ExternalLink, Pin, PinOff, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '@/components/common/SEO';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select, Field } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import CommissionBadge from '@/components/product/CommissionBadge';
import {
  useOwnKolProfile,
  useKolByRoute,
  useAddKolProduct,
  useRemoveKolProduct,
  useSetKolProductPin,
  useUpdateKol,
} from '@/features/kol/hooks';
import { useProductsPublic } from '@/features/products/hooks';
import { formatCurrency } from '@/lib/utils';

export default function KolPortalPage() {
  const { data: profileData, isLoading: loadingProfile } = useOwnKolProfile();
  const kol = profileData?.data;

  const { data: pageData, isLoading: loadingPage } = useKolByRoute(kol?.route);
  const addProduct = useAddKolProduct();
  const removeProduct = useRemoveKolProduct();
  const setPin = useSetKolProductPin();
  const updateKol = useUpdateKol();

  const [productToAdd, setProductToAdd] = useState('');
  const { data: allProducts } = useProductsPublic({ limit: 100 });

  const { register, handleSubmit, reset } = useForm();

  if (loadingProfile) return <PageSpinner />;

  if (!kol) {
    return (
      <div>
        <SEO title="Trang KOL của tôi" />
        <Card>
          <CardBody>
            <p className="text-ink-500">
              Tài khoản của bạn chưa được gán trang KOL. Vui lòng liên hệ quản trị viên để được tạo trang.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const products = pageData?.data?.products || [];
  const linkedIds = new Set(products.map((p) => p.product._id));
  const availableProducts = allProducts?.data?.filter((p) => !linkedIds.has(p._id)) || [];

  const onSaveBio = (values) => {
    updateKol.mutate({ id: kol._id, payload: values }, { onSuccess: () => reset() });
  };

  const handleAddProduct = () => {
    if (!productToAdd) return;
    addProduct.mutate({ kolId: kol._id, productId: productToAdd }, { onSuccess: () => setProductToAdd('') });
  };

  return (
    <div>
      <SEO title="Trang KOL của tôi" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Trang KOL của tôi</h1>
        <Link
          to={`/kol/${kol.route}`}
          target="_blank"
          className="flex items-center gap-1 text-sm text-teal-400 hover:underline"
        >
          Xem trang công khai <ExternalLink size={14} />
        </Link>
      </div>

      <Card className="mt-6">
        <CardBody>
          <h2 className="font-display font-semibold">Chỉnh sửa thông tin</h2>
          <form onSubmit={handleSubmit(onSaveBio)} className="mt-4 space-y-4">
            <Field label="Tên hiển thị">
              <Input defaultValue={kol.displayName} {...register('displayName')} />
            </Field>
            <Field label="Giới thiệu ngắn">
              <Input defaultValue={kol.bio} {...register('bio')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Facebook">
                <Input defaultValue={kol.socials?.facebook} {...register('socials.facebook')} />
              </Field>
              <Field label="TikTok">
                <Input defaultValue={kol.socials?.tiktok} {...register('socials.tiktok')} />
              </Field>
            </div>
            <Button type="submit" disabled={updateKol.isPending}>Lưu thông tin</Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody>
          <h2 className="font-display font-semibold">Thêm sản phẩm vào trang của bạn</h2>
          <div className="mt-4 flex gap-2">
            <Select value={productToAdd} onChange={(e) => setProductToAdd(e.target.value)} className="flex-1">
              <option value="">-- Chọn sản phẩm --</option>
              {availableProducts.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </Select>
            <Button onClick={handleAddProduct} disabled={!productToAdd}>
              <Plus size={16} /> Thêm
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 font-display font-semibold">Sản phẩm đang giới thiệu ({products.length})</h2>
        {loadingPage ? (
          <PageSpinner />
        ) : (
          <div className="space-y-3">
            {products.map((kp) => (
              <div key={kp._id} className="flex items-center gap-4 rounded-xl2 border border-border bg-base-800 p-4">
                <img
                  src={kp.product.images?.[0]?.url || 'https://placehold.co/60x60'}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{kp.product.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-sm text-teal-400">
                      {formatCurrency(kp.product.salePrice || kp.product.price)}
                    </span>
                    <CommissionBadge product={kp.product} />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  title={kp.isPinned ? 'Bỏ ghim' : 'Ghim nổi bật'}
                  onClick={() =>
                    setPin.mutate({ kolId: kol._id, productId: kp.product._id, isPinned: !kp.isPinned })
                  }
                >
                  {kp.isPinned ? <PinOff size={16} className="text-gold-400" /> : <Pin size={16} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Gỡ sản phẩm này khỏi trang của bạn?')) {
                      removeProduct.mutate({ kolId: kol._id, productId: kp.product._id });
                    }
                  }}
                >
                  <Trash2 size={16} className="text-hot-500" />
                </Button>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-ink-700">Bạn chưa thêm sản phẩm nào. Hãy chọn sản phẩm ở trên.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
