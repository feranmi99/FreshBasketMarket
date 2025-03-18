export interface User {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    isAdmin: boolean;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    minOrder: number;
    inStock: boolean;
}

export interface Landmark {
    id: number;
    name: string;
    deliveryFee: number;
}

export interface Order {
    id: number;
    userId: number;
    total: number;
    status: string;
    landmarkId: number;
    address: string;
    recurringDays?: number; // Optional field
    createdAt: Date;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
}
