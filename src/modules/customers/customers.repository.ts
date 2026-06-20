import { supabaseAdmin } from '../../database/supabase.client';

export const getCustomers = async (shopId: string) => {
  const { data, error } = await supabaseAdmin.from('customers').select('*').eq('shop_id', shopId);
  if (error) throw error;
  return data;
};

export const getCustomerById = async (id: string, shopId: string) => {
  const { data, error } = await supabaseAdmin.from('customers').select('*, customer_addresses(*)').eq('id', id).eq('shop_id', shopId).single();
  if (error) throw error;
  return data;
};

export const createCustomer = async (customerData: any) => {
  const { data, error } = await supabaseAdmin.from('customers').insert(customerData).select().single();
  if (error) throw error;
  return data;
};

export const updateCustomer = async (id: string, shopId: string, updates: any) => {
  const { data, error } = await supabaseAdmin.from('customers').update(updates).eq('id', id).eq('shop_id', shopId).select().single();
  if (error) throw error;
  return data;
};

export const deleteCustomer = async (id: string, shopId: string) => {
  const { error } = await supabaseAdmin.from('customers').delete().eq('id', id).eq('shop_id', shopId);
  if (error) throw error;
  return true;
};
