import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  birthdate: string; // YYYYMMDD
  phone: string;     // Full digits without hyphens
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
  isLoading: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateStock: (productId: string, quantity: number) => Promise<void>;
  updatePoints: (userId: string, amount: number, type: 'charge' | 'use', desc: string, items?: TransactionItem[], benefit?: number) => Promise<boolean>;
}

export const useMarketStore = create<MarketStore>()(
  persist(
    (set, get) => ({
      users: [],
      products: [],
      transactions: [],
      currentUser: null,
      isLoading: false,

      fetchInitialData: async () => {
        set({ isLoading: true });
        try {
          const [usersRes, productsRes, transactionsRes] = await Promise.all([
            supabase.from('dream_users').select('*').order('name'),
            supabase.from('dream_products').select('*').order('name'),
            supabase.from('dream_transactions').select('*').order('timestamp', { ascending: false })
          ]);

          const users = (usersRes.data || []).map(u => ({ ...u, address: u.address || '' }));
          const products = (productsRes.data || []).map(p => ({ 
            id: p.id,
            name: p.name,
            price: p.price,
            marketPrice: p.market_price || 0,
            stock: p.stock
          }));
          const transactions = (transactionsRes.data || []).map(t => ({ 
            id: t.id,
            userId: t.user_id,
            type: t.type,
            amount: t.amount,
            benefitAmount: t.benefit_amount || 0,
            timestamp: t.timestamp,
            description: t.description,
            items: t.items
          }));

          set((state) => ({
            users,
            products,
            transactions,
            isLoading: false,
            // Update currentUser points if they are already logged in
            currentUser: state.currentUser 
              ? users.find(u => u.id === state.currentUser?.id) || state.currentUser 
              : null
          }));
        } catch (error) {
          console.error('Error fetching initial data:', error);
          set({ isLoading: false });
        }
      },
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      addUser: async (user) => {
        const cleanPhone = user.phone.replace(/[^0-9]/g, '');
        // Explicitly only send database columns
        const dbUser = {
          id: user.id,
          name: user.name,
          birthdate: user.birthdate,
          phone: cleanPhone,
          password: user.password,
          address: user.address || '',
          role: user.role,
          grade: user.grade,
          points: user.points || 0
        };
        
        const { error } = await supabase.from('dream_users').insert(dbUser);
        if (error) {
          console.error('Supabase addUser error:', error);
          alert(`등록 실패: ${error.message}`);
          return;
        }
        set((state) => ({ users: [...state.users, { ...user, phone: cleanPhone }] }));
      },

      updateUser: async (userId, updates) => {
        // Explicitly map keys to match DB columns and exclude temporary UI fields like phoneMain
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.birthdate !== undefined) dbUpdates.birthdate = updates.birthdate;
        if (updates.password !== undefined) dbUpdates.password = updates.password;
        if (updates.address !== undefined) dbUpdates.address = updates.address;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.grade !== undefined) dbUpdates.grade = updates.grade;
        if (updates.points !== undefined) dbUpdates.points = updates.points;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone.replace(/[^0-9]/g, '');

        const { error } = await supabase.from('dream_users').update(dbUpdates).eq('id', userId);
        if (error) {
          console.error('Supabase updateUser error:', error);
          alert(`수정 실패: ${error.message}`);
          return;
        }

        set((state) => {
          const updatedUsers = state.users.map(u => u.id === userId ? { ...u, ...updates } : u);
          const newCurrentUser = state.currentUser?.id === userId 
            ? updatedUsers.find(u => u.id === userId) || null 
            : state.currentUser;
          return { users: updatedUsers, currentUser: newCurrentUser };
        });
      },

      deleteUser: async (userId) => {
        const { error } = await supabase.from('dream_users').delete().eq('id', userId);
        if (error) {
          console.error('Supabase deleteUser error:', error);
          return;
        }
        set((state) => ({ users: state.users.filter(u => u.id !== userId) }));
      },
      
      addProduct: async (product) => {
        const { error } = await supabase.from('dream_products').insert({
          id: product.id,
          name: product.name,
          price: product.price,
          market_price: product.marketPrice || 0,
          stock: product.stock
        });
        if (error) {
          console.error('Supabase addProduct error:', error);
          return;
        }
        set((state) => ({ products: [...state.products, product] }));
      },

      updateProduct: async (productId, updates) => {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.marketPrice !== undefined) dbUpdates.market_price = updates.marketPrice;
        
        const { error } = await supabase.from('dream_products').update(dbUpdates).eq('id', productId);
        if (error) {
          console.error('Supabase updateProduct error:', error);
          return;
        }
        set((state) => ({
          products: state.products.map(p => p.id === productId ? { ...p, ...updates } : p)
        }));
      },

      deleteProduct: async (productId) => {
        const { error } = await supabase.from('dream_products').delete().eq('id', productId);
        if (error) {
          console.error('Supabase deleteProduct error:', error);
          return;
        }
        set((state) => ({ products: state.products.filter(p => p.id !== productId) }));
      },

      updateStock: async (productId, quantity) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) return;
        const newStock = Math.max(0, product.stock + quantity);
        
        const { error } = await supabase.from('dream_products').update({ stock: newStock }).eq('id', productId);
        if (error) {
          console.error('Supabase updateStock error:', error);
          return;
        }
        set((state) => ({
          products: state.products.map(p => p.id === productId ? { ...p, stock: newStock } : p)
        }));
      },
      
      updatePoints: async (userId, amount, type, desc, items, benefit = 0) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) return false;
        if (type === 'use' && user.points < amount) return false;
        
        const newPoints = type === 'use' ? user.points - amount : user.points + amount;
        
        // 1. Update User Points
        const { error: userError } = await supabase.from('dream_users').update({ points: newPoints }).eq('id', userId);
        if (userError) {
          console.error('Supabase updatePoints(user) error:', userError);
          return false;
        }

        // 2. Create Transaction
        const transaction: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          userId,
          type,
          amount,
          benefitAmount: benefit,
          timestamp: Date.now(),
          description: desc,
          items
        };

        const { error: txError } = await supabase.from('dream_transactions').insert({
          id: transaction.id,
          user_id: transaction.userId,
          type: transaction.type,
          amount: transaction.amount,
          benefit_amount: transaction.benefitAmount,
          description: transaction.description,
          items: transaction.items,
          timestamp: transaction.timestamp
        });

        if (txError) {
          console.error('Supabase updatePoints(tx) error:', txError);
          return false;
        }

        // 3. Update Stock (if use)
        if (type === 'use' && items) {
          for (const item of items) {
            await get().updateStock(item.productId, -item.quantity);
          }
        }

        set((state) => ({
          users: state.users.map(u => u.id === userId ? { ...u, points: newPoints } : u),
          transactions: [transaction, ...state.transactions],
          currentUser: state.currentUser?.id === userId ? { ...state.currentUser, points: newPoints } : state.currentUser
        }));
        
        return true;
      }
    }),
    {
      name: 'dream-market-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);


