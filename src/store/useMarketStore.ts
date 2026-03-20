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

          set({
            users: (usersRes.data || []).map(u => ({ ...u, address: u.address || '' })),
            products: (productsRes.data || []).map(p => ({ ...p, marketPrice: p.market_price, market_price: undefined })),
            transactions: (transactionsRes.data || []).map(t => ({ 
              ...t, 
              userId: t.user_id, 
              benefitAmount: t.benefit_amount,
              user_id: undefined,
              benefit_amount: undefined
            })),
            isLoading: false
          });
        } catch (error) {
          console.error('Error fetching initial data:', error);
          set({ isLoading: false });
        }
      },
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      addUser: async (user) => {
        const cleanPhone = user.phone.replace(/[^0-9]/g, '');
        const newUser = { ...user, phone: cleanPhone };
        const { error } = await supabase.from('dream_users').insert(newUser);
        if (!error) {
          set((state) => ({ users: [...state.users, newUser] }));
        }
      },

      updateUser: async (userId, updates) => {
        const nextUpdates = { ...updates };
        if (updates.phone) nextUpdates.phone = updates.phone.replace(/[^0-9]/g, '');
        
        const { error } = await supabase.from('dream_users').update(nextUpdates).eq('id', userId);
        if (!error) {
          set((state) => {
            const updatedUsers = state.users.map(u => u.id === userId ? { ...u, ...nextUpdates } : u);
            const newCurrentUser = state.currentUser?.id === userId 
              ? updatedUsers.find(u => u.id === userId) || null 
              : state.currentUser;
            return { users: updatedUsers, currentUser: newCurrentUser };
          });
        }
      },

      deleteUser: async (userId) => {
        const { error } = await supabase.from('dream_users').delete().eq('id', userId);
        if (!error) {
          set((state) => ({ users: state.users.filter(u => u.id !== userId) }));
        }
      },
      
      addProduct: async (product) => {
        const { error } = await supabase.from('dream_products').insert({
          id: product.id,
          name: product.name,
          price: product.price,
          market_price: product.marketPrice,
          stock: product.stock
        });
        if (!error) {
          set((state) => ({ products: [...state.products, product] }));
        }
      },

      updateProduct: async (productId, updates) => {
        const dbUpdates: any = { ...updates };
        if (updates.marketPrice !== undefined) {
          dbUpdates.market_price = updates.marketPrice;
          delete dbUpdates.marketPrice;
        }
        
        const { error } = await supabase.from('dream_products').update(dbUpdates).eq('id', productId);
        if (!error) {
          set((state) => ({
            products: state.products.map(p => p.id === productId ? { ...p, ...updates } : p)
          }));
        }
      },

      deleteProduct: async (productId) => {
        const { error } = await supabase.from('dream_products').delete().eq('id', productId);
        if (!error) {
          set((state) => ({ products: state.products.filter(p => p.id !== productId) }));
        }
      },

      updateStock: async (productId, quantity) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) return;
        const newStock = Math.max(0, product.stock + quantity);
        
        const { error } = await supabase.from('dream_products').update({ stock: newStock }).eq('id', productId);
        if (!error) {
          set((state) => ({
            products: state.products.map(p => p.id === productId ? { ...p, stock: newStock } : p)
          }));
        }
      },
      
      updatePoints: async (userId, amount, type, desc, items, benefit = 0) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) return false;
        if (type === 'use' && user.points < amount) return false;
        
        const newPoints = type === 'use' ? user.points - amount : user.points + amount;
        
        // 1. Update User Points
        const { error: userError } = await supabase.from('dream_users').update({ points: newPoints }).eq('id', userId);
        if (userError) return false;

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

        if (txError) return false;

        // 3. Update Stock locally & DB (if use)
        if (type === 'use' && items) {
          for (const item of items) {
            await get().updateStock(item.productId, -item.quantity);
          }
        }

        // Update local state
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
      // Prevent syncing temporary states
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);


