import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
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

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: "",
    minOrder: 1,
    imageUrl: "",
    description: "",
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Product> }) => {
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

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: Partial<Product>) => {
      const res = await apiRequest("POST", "products", newProduct);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      setIsAddModalOpen(false);
    },
  });

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      minOrder: product.minOrder,
      imageUrl: product.imageUrl,
      description: product.description,
    });
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
              {products?.data?.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-white/20 cursor-pointer">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className=" w-32 h-20 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
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
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input value={formData.price} type="number" onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          <Input value={formData.minOrder} type="number" onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })} />
          <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
          <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Button className="w-full mt-4" onClick={() => updateProductMutation.mutate({ id: selectedProduct!.id, updates: formData })}>
            Update Product
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const AddProductModal = ({
  isOpen, onClose }:
  { isOpen: boolean; onClose: () => void }
) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    minOrder: "",
    image: null as File | null, // Store the image file
    description: "",
  });
  const [preview, setPreview] = useState<string | null>(null); // Image preview

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: FormData) => {
      const res = await apiRequest("POST", "products", newProduct);
      console.log(newProduct);
      
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Success", description: "Product added successfully" });
      onClose();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("minOrder", formData.minOrder);
    formDataToSend.append("description", formData.description);
    if (formData.image) {
      formDataToSend.append("image", formData.image); // Append the image file
    }

    addProductMutation.mutate(formDataToSend);
  };

  return (
    <Dialog  open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[90%] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <Label>Name</Label>
        <Input placeholder="Product Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

        <Label>Price</Label>
        <Input type="number" placeholder="Price" onChange={(e) => setFormData({ ...formData, price: e.target.value })} />

        <Label>Min Order</Label>
        <Input type="number" placeholder="Minimum Order" onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })} />

        <Label>Image</Label>
        <Input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-md mt-2" />}

        <Label>Description</Label>
        <Input placeholder="Product Description" onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

        <Button className="w-full mt-4" onClick={handleAddProduct} disabled={addProductMutation.isPending}>
          {addProductMutation.isPending ? "Adding..." : "Add Product"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}