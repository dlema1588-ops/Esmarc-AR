import { supabaseAdmin } from './src/database/supabase.client.js';

async function main() {
  console.log('--- TESTING rls_auto_enable PARAMETERS ---');
  
  // Test 1: Empty call
  console.log('Test 1: Empty arguments');
  const res1 = await supabaseAdmin.rpc('rls_auto_enable', {});
  console.log('Result 1:', res1);

  // Test 2: Passing raw SQL
  console.log('Test 2: Passing raw SQL query parameter');
  const res2 = await supabaseAdmin.rpc('rls_auto_enable', { sql: 'SELECT 1;' });
  console.log('Result 2:', res2);
  
  // Test 3: Passing query parameter
  console.log('Test 3: Passing query parameter');
  const res3 = await supabaseAdmin.rpc('rls_auto_enable', { query: 'SELECT 1;' });
  console.log('Result 3:', res3);
}

main().catch(console.error);
