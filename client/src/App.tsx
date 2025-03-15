import { Switch, Route } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/components/CartContext";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CartPage from "@/pages/cart-page";
import AdminPage from "@/pages/admin-page";
import ContactPage from "@/pages/contact-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Router />
            </main>
          </div>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;