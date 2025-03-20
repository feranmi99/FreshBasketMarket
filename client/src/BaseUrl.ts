let baseUrl: string;

if (process.env.NODE_ENV === "production") {
    baseUrl = 'https://food-pile-backend.onrender.com/api/v1';
} else {
    baseUrl = 'http://localhost:9000/api/v1';
    // baseUrl = 'https://4g68j7nv-9000.uks1.devtunnels.ms/api/v1';
}

export default baseUrl;