import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Landmark } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [landmarkId, setLandmarkId] = useState("");
  const [recurringDays, setRecurringDays] = useState<number | "">("");

  const { data: landmarks, isLoading: isLoadingLandmarks } = useQuery<Landmark[]>({
    queryKey: ["/api/landmarks"],
  });

  const selectedLandmark = landmarks?.find((l) => l.id === Number(landmarkId));
  const totalWithDelivery = total + (selectedLandmark ? Number(selectedLandmark.deliveryFee) : 0);

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!landmarkId || !address) {
        throw new Error("Please fill in all required fields");
      }

      const orderData = {
        landmarkId: Number(landmarkId),
        address,
        total: totalWithDelivery,
        recurringDays: recurringDays || null,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and will be delivered soon.",
      });
      clearCart();
    },
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some products to your cart to get started.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${item.product.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Delivery Location</Label>
              <Select
                value={landmarkId}
                onValueChange={setLandmarkId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a landmark" />
                </SelectTrigger>
                <SelectContent>
                  {landmarks?.map((landmark) => (
                    <SelectItem
                      key={landmark.id}
                      value={landmark.id.toString()}
                    >
                      {landmark.name} (${landmark.deliveryFee})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Delivery Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address"
              />
            </div>

            <div>
              <Label>Recurring Order (Optional)</Label>
              <Input
                type="number"
                value={recurringDays}
                onChange={(e) => setRecurringDays(e.target.value ? Number(e.target.value) : "")}
                placeholder="Enter number of days (optional)"
                min="0"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee</span>
                <span>${selectedLandmark?.deliveryFee || "0.00"}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totalWithDelivery.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => orderMutation.mutate()}
              disabled={orderMutation.isPending || !landmarkId || !address}
            >
              {orderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
