import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "email" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["userAuth"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null; // No token, no user
      return await apiRequest<any>("GET", "userAuth");
    },
  });


  const loginMutation = useMutation<SelectUser, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest<any>("POST", "login", credentials);  
        if (!res?.status) {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
          throw new Error("Invalid email or password"); // 🛑 Stops further execution
        }
  
        if (res?.token) {
          localStorage.setItem("token", res.token);
        }
  
        return res;
      } catch (error: any) {
        console.error("Login error:", error);
        throw new Error(error?.message || "Something went wrong");
      }
    },
    onSuccess: (user: SelectUser) => {
      if (!user) return; // 🛑 Ensures it doesn't navigate when the user is null
  
      queryClient.setQueryData(["userAuth"], user);
      toast({
        title: "Login Successful",
        description: "Welcome back! 🖐️",
      });
      navigate("/"); // ✅ Navigates only on successful login
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const data = await apiRequest<any>("POST", "register", credentials);

      if (data?.token) localStorage.setItem("token", data.token);
      return data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["userAuth"], user);
      toast({
        title: "Registration Successful",
        description: "Welcome! You have successfully registered.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      console.log(error);

      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  // const loginMutation = useMutation({
  //   mutationFn: (credentials: LoginData) =>
  //     apiRequest<{ token: string; user: SelectUser }>("POST", "login", credentials),

  //   onSuccess: ({ token, user }) => {
  //     localStorage.setItem("token", token); // Store token in localStorage
  //     queryClient.setQueryData(["/api/user"], user); // Update user state
  //   },

  //   onError: (error: Error) => {
  //     toast({
  //       title: "Login failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   },
  // });

  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      localStorage.removeItem("token"); // Remove token
    },
    onSuccess: () => {
      queryClient.setQueryData(["userAuth"], null);
      toast({
        title: "Logged out",
        description: "You have successfully logged out.",
      });
      navigate("/auth");
    },
  });


  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
