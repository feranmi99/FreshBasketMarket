import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Product> }) => {
      const res = await apiRequest("PATCH", `/api/products/${id}`, updates);
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
  });

  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>

      <div className="bg-card rounded-lg border">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-4">Product</th>
                <th className="pb-4">Price</th>
                <th className="pb-4">Min Order</th>
                <th className="pb-4">Stock Status</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>${product.price}</td>
                  <td>{product.minOrder}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.inStock}
                        onCheckedChange={(checked) =>
                          updateProductMutation.mutate({
                            id: product.id,
                            updates: { inStock: checked },
                          })
                        }
                      />
                      <span>{product.inStock ? "In Stock" : "Out of Stock"}</span>
                    </div>
                  </td>
                  <td>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateProductMutation.mutate({
                          id: product.id,
                          updates: { inStock: !product.inStock },
                        })
                      }
                      disabled={updateProductMutation.isPending}
                    >
                      Toggle Stock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
