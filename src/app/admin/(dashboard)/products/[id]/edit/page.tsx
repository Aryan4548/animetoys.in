import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductForm from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id).lean();
  if (!product) notFound();

  const initialValues = {
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    brand: product.brand ? String(product.brand) : "",
    category: product.category ? String(product.category) : "",
    series: product.series,
    character: product.character,
    price: product.price,
    mrp: product.mrp,
    costPrice: product.costPrice,
    wholesalePrice: product.wholesalePrice,
    wholesaleMoq: product.wholesaleMoq,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    weight: product.weight,
    images: product.images,
    tags: product.tags,
    featured: product.featured,
    newArrival: product.newArrival,
    bestSeller: product.bestSeller,
    isPreorder: product.isPreorder,
    releaseDate: product.releaseDate ? new Date(product.releaseDate).toISOString() : "",
    preorderClosingDate: product.preorderClosingDate ? new Date(product.preorderClosingDate).toISOString() : "",
    status: product.status,
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Edit Product</h1>
      <ProductForm productId={String(product._id)} initialValues={initialValues} />
    </div>
  );
}
