import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold">Fresh Groceries Delivered</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Order fresh vegetables and groceries with convenient delivery to your nearest landmark.
          Quality products at great prices with minimum order quantities to ensure freshness.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg">
            <p className="italic">"Always fresh and delivered on time. Great service!"</p>
            <p className="mt-4 font-semibold">- Sarah M.</p>
          </div>
          <div className="bg-card p-6 rounded-lg">
            <p className="italic">"The quality is consistently excellent. Highly recommend!"</p>
            <p className="mt-4 font-semibold">- John D.</p>
          </div>
          <div className="bg-card p-6 rounded-lg">
            <p className="italic">"Convenient ordering and reliable delivery. My go-to for fresh produce."</p>
            <p className="mt-4 font-semibold">- Maria R.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
