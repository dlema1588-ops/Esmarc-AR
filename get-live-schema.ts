import { env } from './src/config/env.js';

async function main() {
  console.log('=== START LIVE BACKEND EXTRACT ===');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!env.SUPABASE_URL || !serviceKey) {
    console.error('No credentials matching');
    return;
  }

  const tables = [
    'shops',
    'shop_members',
    'subscriptions',
    'shop_stats',
    'products',
    'orders',
    'contact_messages',
    'conversations',
    'media',
    'profiles',
    'platform_admins',
    'messages',
    'notifications',
    'system_messages'
  ];

  for (const table of tables) {
    const url = `${env.SUPABASE_URL}/rest/v1/${table}?limit=0`;
    const res = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Accept': 'text/csv'
      }
    });

    if (!res.ok) {
      console.log(`Table: ${table} -> DOES NOT EXIST (Error: ${res.status})`);
    } else {
      const csv = await res.text();
      const columns = csv.trim().split(',');
      console.log(`Table: ${table} -> EXISTS`);
      console.log(`  Columns: ${JSON.stringify(columns)}`);
    }
  }
}

main().catch(console.error);
