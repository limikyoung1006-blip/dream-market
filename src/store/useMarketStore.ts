import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  birthdate: string; // YYYYMMDD
  phone: string;     // Last 4 digits
  password: string;
  address?: string;  // 주소
  role: 'user' | 'admin';
  grade: string;     // 등급 (미혼모, 차상위, 저소득, 기타 등)
  points: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  marketPrice: number; // 시장가 (혜택 계산용)
  stock: number;
}

interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'charge' | 'use';
  amount: number;
  benefitAmount: number; // 시장가 대비 아낀 금액
  timestamp: number;
  description: string;
  items?: TransactionItem[];
}

interface MarketStore {
  users: User[];
  products: Product[];
  transactions: Transaction[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (productId: string, quantity: number) => void;
  updatePoints: (userId: string, amount: number, type: 'charge' | 'use', desc: string, items?: TransactionItem[], benefit?: number) => boolean;
}

// Mock initial data
const INITIAL_USERS: User[] = [
  { 
    id: 'user-1', 
    name: '홍길동', 
    birthdate: '900101', 
    phone: '01012345678', 
    password: '123', 
    role: 'user', 
    grade: 'A', 
    points: 100000 
  },
  { 
    id: 'admin-1', 
    name: '백동희', 
    birthdate: '800101', 
    phone: '01011112222', 
    password: 'admin', 
    role: 'admin', 
    grade: 'A', 
    points: 0 
  },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: '햇반 210g', price: 1000, marketPrice: 1500, stock: 100 },
  { id: 'p2', name: '신라면 5봉', price: 3000, marketPrice: 4500, stock: 50 },
  { id: 'p3', name: '계란 10구', price: 2000, marketPrice: 3500, stock: 30 },
];

export const useMarketStore = create<MarketStore>((set, get) => ({
  users: INITIAL_USERS,
  products: INITIAL_PRODUCTS,
  transactions: [],
  currentUser: null, // 초기에는 비로그인 상태
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),

  updateUser: (userId, updates) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, ...updates } : u),
    currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...updates } : state.currentUser
  })),

  deleteUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id !== userId)
  })),
  
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),

  updateProduct: (productId, updates) => set((state) => ({
    products: state.products.map(p => p.id === productId ? { ...p, ...updates } : p)
  })),

  deleteProduct: (productId) => set((state) => ({
    products: state.products.filter(p => p.id !== productId)
  })),

  updateStock: (productId, quantity) => set((state) => ({
    products: state.products.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + quantity) } : p)
  })),
  
  updatePoints: (userId, amount, type, desc, items, benefit = 0) => {
    const user = get().users.find(u => u.id === userId);
    if (!user) return false;
    
    if (type === 'use' && user.points < amount) return false;
    
    const newPoints = type === 'use' ? user.points - amount : user.points + amount;
    
    // 재고 차산 로직 (결제 시)
    if (type === 'use' && items) {
      items.forEach(item => {
        get().updateStock(item.productId, -item.quantity);
      });
    }

    set((state) => ({
      users: state.users.map(u => u.id === userId ? { ...u, points: newPoints } : u),
      transactions: [
        {
          id: Math.random().toString(36).substr(2, 9),
          userId,
          type,
          amount,
          benefitAmount: benefit,
          timestamp: Date.now(),
          description: desc,
          items
        },
        ...state.transactions
      ],
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, points: newPoints } : state.currentUser
    }));
    
    return true;
  }
}));
