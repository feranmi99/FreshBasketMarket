import { type InsertUser, type User, type Product, type InsertProduct, type Landmark, type InsertLandmark, type Order, type InsertOrder, type OrderItem, type InsertOrderItem } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;

  // Landmark operations
  getLandmarks(): Promise<Landmark[]>;
  getLandmark(id: number): Promise<Landmark | undefined>;
  createLandmark(landmark: InsertLandmark): Promise<Landmark>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private landmarks: Map<number, Landmark>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  sessionStore: session.SessionStore;
  
  private userId: number = 1;
  private productId: number = 1;
  private landmarkId: number = 1;
  private orderId: number = 1;
  private orderItemId: number = 1;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.landmarks = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Fresh Tomatoes",
        description: "Ripe and juicy tomatoes, perfect for salads and cooking",
        price: "2.99",
        imageUrl: "https://images.unsplash.com/photo-1463123081488-789f998ac9c4",
        minOrder: 5,
        inStock: true
      },
      {
        name: "Red Onions",
        description: "Sweet and flavorful red onions",
        price: "1.99",
        imageUrl: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d",
        minOrder: 3,
        inStock: true
      },
      {
        name: "Bell Peppers",
        description: "Colorful and crisp bell peppers",
        price: "3.99",
        imageUrl: "https://images.unsplash.com/photo-1489450278009-822e9be04dff",
        minOrder: 2,
        inStock: true
      }
    ];

    const sampleLandmarks: InsertLandmark[] = [
      { name: "Downtown", deliveryFee: "5.00" },
      { name: "Suburb Area", deliveryFee: "7.50" },
      { name: "Business District", deliveryFee: "6.00" }
    ];

    sampleProducts.forEach(product => this.createProduct(product));
    sampleLandmarks.forEach(landmark => this.createLandmark(landmark));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getLandmarks(): Promise<Landmark[]> {
    return Array.from(this.landmarks.values());
  }

  async getLandmark(id: number): Promise<Landmark | undefined> {
    return this.landmarks.get(id);
  }

  async createLandmark(landmark: InsertLandmark): Promise<Landmark> {
    const id = this.landmarkId++;
    const newLandmark: Landmark = { ...landmark, id };
    this.landmarks.set(id, newLandmark);
    return newLandmark;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { ...order, id };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }
}

export const storage = new MemStorage();
