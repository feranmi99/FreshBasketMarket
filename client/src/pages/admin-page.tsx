import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { Loader2, Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CreateProduct from "@/components/Admin/CraeteProduct/CreateProduct";
import EditProduct from "@/components/Admin/CraeteProduct/EditProduct";
import { Product } from "@/types/Auth";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<any>({
    queryKey: ["products"],
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: "",
    minOrder: 1,
    image: "",
    description: "",
    id: "",
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const res = await apiRequest("PATCH", `products/${id}`, updates);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
  });

  const handleEditClick = (product: Product) => {
    setFormData(product);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button className="border-primary border-2" variant="outline" size="icon" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 text-primary" />
        </Button>
      </div>

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
              {products?.data?.map((product: Product, index: number) => (
                <tr key={index} className="border-b last:border-0 hover:bg-slate-200  cursor-pointer">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className=" w-32 h-20 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>₦{product.price}</td>
                  <td>{product.minOrder}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.inStock}
                        onCheckedChange={(checked) =>
                          updateProductMutation.mutate({
                            id: product._id,
                            updates: { inStock: !product?.inStock },
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
                      onClick={() => handleEditClick(product)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateProduct
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditProduct
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        setFormData={setFormData}
        formData={formData}
      />
    </div>
  );
}