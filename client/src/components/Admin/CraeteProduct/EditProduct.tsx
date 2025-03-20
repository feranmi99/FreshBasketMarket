import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import React, { useState } from 'react'

const EditProduct = ({
    isOpen,
    onClose,
    formData,
    setFormData
}: {
    isOpen: boolean;
    onClose: () => void,
    formData: any
    setFormData: any
}) => {
    console.log(formData);
    
    const { toast } = useToast();
    const [preview, setPreview] = useState<string | null>(formData.image ?? ""); // Image preview

    const editProductMutation = useMutation({
        mutationFn: async (newProduct: any) => {
            const res = await apiRequest("PATCH", "EditProducts", newProduct);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast({ title: "Success", description: "Product edited successfully" });
            onClose();
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                const base64String = reader.result as string;
                setFormData((prev: any) => ({ ...prev, image: base64String }));
                setPreview(base64String);
            };

            reader.readAsDataURL(file); // Convert to Base64
        }
    };


    const handleAddProduct = () => {
        const productData = {
            name: formData.name,
            price: formData.price,
            minOrder: formData.minOrder,
            description: formData.description,
            image: formData.image,
            id: formData._id
        };

        editProductMutation.mutate(productData);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[600px] max-h-[90%] overflow-y-auto w-full">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>

                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

                    <Label>Price</Label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />

                    <Label>Min Order</Label>
                    <Input value={formData.minOrder} type="number" onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })} />

                    <Label>Description</Label>
                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

                    <Label>Image</Label>
                    <div className="flex items-center justify-between px-6 py-6 border border-gray-300 rounded-3xl">
                        <p className="max-w-xs text-cc-dark">
                            Upload the product image
                        </p>
                        <div>
                            <div className="flex items-center">
                                <label className="border-2 border-gray-300 border-dashed w-[150px] h-[150px] rounded-2xl flex justify-center items-center hover:bg-gray-100 cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        name="image"
                                        className="w-[1px] h-[1px] absolute top-0 left-0"
                                        onChange={handleFileChange}
                                    />
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="absolute inset-0 object-cover w-full h-full rounded-2xl"
                                        />
                                    ) : (
                                        <Plus className="w-10 h-10 text-primary" />
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                    <Button
                        className="w-full mt-4"
                        onClick={handleAddProduct}
                        disabled={editProductMutation.isPending}
                        >
                        {editProductMutation.isPending ? "Updating..." : "Update Product"}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default EditProduct