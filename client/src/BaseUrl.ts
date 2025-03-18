let baseUrl: string;

if (process.env.NODE_ENV === "production") {
    baseUrl = 'https://food-pile-backend.onrender.com/api/v1';
} else {
    baseUrl = 'http://localhost:8000/api/v1';
}

export default baseUrl;