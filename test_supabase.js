import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Read env variables manually
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('--- Fetching users ---');
  const { data: users, error: usersErr } = await supabase.from('dream_users').select('*').limit(3);
  if (usersErr) {
    console.error('Fetch users error:', usersErr);
  } else {
    console.log('Successfully fetched users:', users.length);
  }

  console.log('--- Fetching products ---');
  const { data: products, error: productsErr } = await supabase.from('dream_products').select('*').limit(3);
  if (productsErr) {
    console.error('Fetch products error:', productsErr);
  } else {
    console.log('Successfully fetched products:', products.length);
  }

  console.log('--- Attempting to insert a temporary test product ---');
  const tempId = 'p-test-' + Date.now();
  const { data: insertData, error: insertErr } = await supabase.from('dream_products').insert({
    id: tempId,
    name: '테스트 상품',
    price: 1000,
    market_price: 1200,
    stock: 10,
    original_stock: 10
  });

  if (insertErr) {
    console.error('Insert product error:', insertErr);
  } else {
    console.log('Successfully inserted test product!', insertData);
    
    // Clean up
    console.log('--- Deleting temporary test product ---');
    const { error: deleteErr } = await supabase.from('dream_products').delete().eq('id', tempId);
    if (deleteErr) {
      console.error('Delete product error:', deleteErr);
    } else {
      console.log('Successfully deleted test product.');
    }
  }
}

test();
