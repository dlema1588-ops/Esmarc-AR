import { supabaseAdmin } from './src/database/supabase.client.js';

async function main() {
  console.log('--- TEST PROFILES DIRECT ---');
  const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles fetched successfully:', data);
  }

  const { data: shops, error: shopsErr } = await supabaseAdmin.from('shops').select('*').limit(1);
  if (shopsErr) {
    console.error('Error fetching shops:', shopsErr);
  } else {
    console.log('Shops fetched successfully:', shops);
  }
}

main().catch(console.error);
