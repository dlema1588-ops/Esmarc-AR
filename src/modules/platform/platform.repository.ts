import { supabaseAdmin } from '../../database/supabase.client';

export const getPlatformStats = async () => {
  const [
    { count: totalShops },
    { count: activeShops },
    { count: totalCustomers },
    { count: totalProducts },
    { count: totalOrders },
    { data: mrrData }
  ] = await Promise.all([
    supabaseAdmin.from('shops').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('shops').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscriptions').select('price').eq('status', 'active')
  ]);
  
  const mrr = (mrrData || []).reduce((acc: number, curr: any) => acc + (curr.price || 0), 0);

  return {
    totalShops: totalShops || 0,
    activeShops: activeShops || 0,
    totalCustomers: totalCustomers || 0,
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    mrr
  };
};

// Shops
export const getAllShops = async () => {
  const { data, error } = await supabaseAdmin.from('shops').select('*');
  if (error) throw error;
  return data;
};

export const getShopById = async (id: string) => {
  const { data, error } = await supabaseAdmin.from('shops').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createShop = async (shop: any) => {
  const { data, error } = await supabaseAdmin.from('shops').insert(shop).select().single();
  if (error) throw error;
  return data;
};

export const updateShop = async (id: string, updates: any) => {
  const { data, error } = await supabaseAdmin.from('shops').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

// Plans
export const getPlans = async () => {
  const { data, error } = await supabaseAdmin.from('plans').select('*');
  if (error) throw error;
  return data;
};

export const createPlan = async (plan: any) => {
  const { data, error } = await supabaseAdmin.from('plans').insert(plan).select().single();
  if (error) throw error;
  return data;
};

export const assignPlan = async (shopId: string, planId: string) => {
  const { data, error } = await supabaseAdmin.from('subscriptions').insert({ shop_id: shopId, plan_id: planId, status: 'active' }).select().single();
  if (error) throw error;
  return data;
};

// Themes
export const getThemes = async () => {
  const { data, error } = await supabaseAdmin.from('themes').select('*');
  if (error) throw error;
  return data;
};

export const createTheme = async (theme: any) => {
  const { data, error } = await supabaseAdmin.from('themes').insert(theme).select().single();
  if (error) throw error;
  return data;
};

export const assignTheme = async (shopId: string, themeId: string) => {
  const { data, error } = await supabaseAdmin.from('shop_themes').upsert({ shop_id: shopId, theme_id: themeId }).select().single();
  if (error) throw error;
  return data;
};

// Kept for backward compatibility if needed, but not part of step implementation
export const getSettings = async () => {
  return {};
};

