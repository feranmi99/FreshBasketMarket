import { useState } from "react";
import { Product } from "@shared/schema";
import { useCart } from "./CartContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(product.minOrder);
  const { addToCart } = useCart();

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(value, product.minOrder));
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-cover w-full h-full"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-muted-foreground text-sm mt-1">
          {product.description}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold">${product.price}</span>
          <span className="text-sm text-muted-foreground">
            Min: {product.minOrder}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= product.minOrder}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || product.minOrder)}
              className="w-16 text-center border-0"
              min={product.minOrder}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="flex-1"
            onClick={() => addToCart(product, quantity)}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
