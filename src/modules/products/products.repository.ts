import { supabaseAdmin } from '../../database/supabase.client';

export const getProducts = async (shopId: string) => {
  const { data, error } = await supabaseAdmin.from('products').select('*').eq('shop_id', shopId);
  if (error) throw error;
  return data;
};

export const getProductById = async (id: string, shopId: string) => {
  let { data, error } = await supabaseAdmin.from('products').select('*, product_variants(*), product_images(*)').eq('id', id).eq('shop_id', shopId).single();
  if (error) throw error;
  return data;
};

export const createProduct = async (productData: any) => {
  const { data, error } = await supabaseAdmin.from('products').insert(productData).select().single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, shopId: string, updates: any) => {
  const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', id).eq('shop_id', shopId).select().single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string, shopId: string) => {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id).eq('shop_id', shopId);
  if (error) throw error;
  return true;
};

export const addVariant = async (variantData: any) => {
  const { data, error } = await supabaseAdmin.from('product_variants').insert(variantData).select().single();
  if (error) throw error;
  return data;
};

export const updateVariant = async (id: string, updates: any) => {
  const { data, error } = await supabaseAdmin.from('product_variants').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteVariant = async (id: string) => {
  const { error } = await supabaseAdmin.from('product_variants').delete().eq('id', id);
  if (error) throw error;
  return true;
};
