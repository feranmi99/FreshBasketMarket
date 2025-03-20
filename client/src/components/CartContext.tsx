import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Product } from "@/types/Auth";

interface CartItem {
  _id: string;
  id: string;
  name: string;
  image: string;
  price: number;
  minOrder: number;
  quantity: number;
  status: "Pending" | "Completed" | "Cancelled";
  user: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data,
    error,
    isLoading
  } = useQuery<any | null, Error>({
    queryKey: ["cart"],
    queryFn: async () => {
      return await apiRequest<any>("GET", "cart");
    },
  });

  const items: CartItem[] = data?.data || [];

  const addProductMutation = useMutation({
    mutationFn: async ({ item, quantity }: { item: Product; quantity: number }) => {
      return await apiRequest("POST", "cart", { item, quantity });
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Added to cart",
        description: `Product added successfully`,
      });
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    },
  });

  const addToCart = async (product: Product, quantity: number) => {
    if (quantity < product.minOrder) {
      toast({
        title: "Invalid quantity",
        description: `Minimum order quantity is ${product.minOrder}`,
        variant: "destructive",
      });
      return;
    }
    addProductMutation.mutate({ item: product, quantity });
  };
  const deleteItemMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      return await apiRequest("DELETE", `deleteItem/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product quantity",
        variant: "destructive",
      });
    },
  });

  const removeFromCart = (productId: string) => {
    deleteItemMutation.mutate({ productId });
  };

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return await apiRequest("PATCH", `updateQuantity/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product quantity",
        variant: "destructive",
      });
      console.error("Error updating product:", error);
    },
  });

  const updateQuantity = (productId: string, quantity: number) => {
    const product = items.find((item: any) => item._id === productId);

    if (product && quantity < product.minOrder) {
      toast({
        title: "Invalid quantity",
        description: `Minimum order quantity is ${product.minOrder}`,
        variant: "destructive",
      });
      return;
    }
    // console.log(product);
    updateQuantityMutation.mutate({ productId, quantity });
  };

  const clearCart = () => {
    // setItems([]);
  };

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
