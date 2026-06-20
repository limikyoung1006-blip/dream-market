import { createClient } from '@supabase/supabase-js';

const OLD_URL = 'https://sonclubhpzygnocwbsyg.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmNsdWJocHp5Z25vY3dic3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDY4NjIsImV4cCI6MjA5ODg4Mjg2Mn0.p8sMgSzcmrTSOdE4HyqEFE7fbroio6NnI0zjO2zz8ho';

const NEW_URL = 'https://nyezaplitbaflzfempav.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZXphcGxpdGJhZmx6ZmVtcGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2NjQsImV4cCI6MjA5NDI0MDY2NH0.PnZr41ao-UCyKMeW0Tx9ed5kfZbpDFpJQ07sSK-ZBR4';

const oldClient = createClient(OLD_URL, OLD_KEY);
const newClient = createClient(NEW_URL, NEW_KEY);

async function migrateTable(tableName) {
  console.log(`\n=== Migrating table: ${tableName} ===`);
  
  // 1. Fetch from old
  const { data: oldData, error: fetchErr } = await oldClient.from(tableName).select('*');
  if (fetchErr) {
    console.error(`Error fetching from old database [${tableName}]:`, fetchErr);
    return;
  }
  console.log(`Fetched ${oldData.length} records from old database.`);
  
  if (oldData.length === 0) {
    console.log('No data to migrate.');
    return;
  }

  // 2. Adjust columns if necessary
  const modifiedData = oldData.map(item => {
    if (tableName === 'dream_products') {
      // In the old DB, original_stock didn't exist, so we set it to current stock
      return {
        ...item,
        original_stock: item.original_stock !== undefined && item.original_stock !== null 
          ? item.original_stock 
          : item.stock
      };
    }
    return item;
  });

  // 3. Upsert into new (to prevent duplicate errors if some data is already there)
  const { error: insertErr } = await newClient.from(tableName).upsert(modifiedData);
  if (insertErr) {
    console.error(`Error inserting into new database [${tableName}]:`, insertErr);
  } else {
    console.log(`Successfully migrated ${oldData.length} records to new database!`);
  }
}

async function run() {
  try {
    await migrateTable('dream_users');
    await migrateTable('dream_products');
    await migrateTable('dream_transactions');
    console.log('\nMigration process finished.');
  } catch (err) {
    console.error('Fatal migration error:', err);
  }
}

run();
