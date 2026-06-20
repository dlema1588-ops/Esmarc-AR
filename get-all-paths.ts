import { env } from './src/config/env.js';

async function main() {
  console.log('--- ALL REST PATHS ---');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!env.SUPABASE_URL || !serviceKey) {
    console.log('No credentials');
    return;
  }
  
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/`, {
    headers: { 'apikey': serviceKey }
  });
  
  if (!res.ok) {
    console.error('Fetch spec failed:', res.status, await res.text());
    return;
  }
  
  const spec = await res.json();
  console.log('Root keys of spec:', Object.keys(spec));
  if (spec.paths) {
    console.log('All paths:', Object.keys(spec.paths));
  } else {
    console.log('No paths found in spec.');
  }

  if (spec.definitions) {
    console.log('All definitions:', Object.keys(spec.definitions));
  } else {
    console.log('No definitions found.');
  }
}

main().catch(console.error);
