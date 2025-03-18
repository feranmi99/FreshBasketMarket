import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "./CartContext";
import { Button } from "./ui/button";
import { ShoppingCart, User, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const { items } = useCart();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="text max-w-[1440px] mx-auto w-full">

    <nav className="border-b bg-card ">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link className="text-3xl font-bold text-primary italic" href="/">
          Food-pile
        </Link>

        <div className="flex items-center space-x-4">
          {/* <Link href="/contact">
            <a className="text-muted-foreground hover:text-foreground">Contact</a>
          </Link> */}

          {user ? (
            <>
              <Link href="/cart">
                <div className="relative">
                  <ShoppingCart className="h-7 w-7" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>

              {user.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}

              <Button
              className="border"
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
          </div>
  );
}
