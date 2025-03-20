// import baseUrl from "@/BaseUrl";
// import { QueryClient } from "@tanstack/react-query";
// import axios from "axios";

// // Create an Axios instance
// const apiClient = axios.create({
//   baseURL: baseUrl,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   // withCredentials: true,
// });

// export async function apiRequest<T>(
//   method: "GET" | "POST" | "PUT" | "DELETE",
//   url: string,
//   data?: unknown
// ): Promise<T> {
//   const token = localStorage.getItem("token"); // Get token from storage

//   const response = await apiClient.request<T>({
//     method,
//     url,
//     data,
//   });
//   return response.data;
// }

// // Simplified queryClient setup
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       queryFn: async ({ queryKey }) => {
//         try {
//           const { data } = await apiClient.get(queryKey[0] as string);
//           return data;
//         } catch (error: any) {
//           if (error.response?.status === 401) {
//             throw new Error("Unauthorized");
//           }
//           throw new Error(error.message || "An error occurred");
//         }
//       },
//       refetchOnWindowFocus: false,
//       staleTime: Infinity,
//       retry: false,
//     },
//     mutations: {
//       retry: false,
//     },
//   },
// });


import baseUrl from "@/BaseUrl";
import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

// Create Axios instance
const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Auto logout if token is invalid
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); 
      queryClient.setQueryData(["/api/user"], null); 
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: unknown
): Promise<T> {
  const response = await apiClient.request<T>({
    method,
    url,
    data,
  });
  return response.data;
}

// ✅ Global QueryClient setup
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const { data } = await apiClient.get(queryKey[0] as string);
          return data;
        } catch (error: any) {
          if (error.response?.status === 401) {
            throw new Error("Unauthorized");
          }
          throw new Error(error.message || "An error occurred");
        }
      },
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
