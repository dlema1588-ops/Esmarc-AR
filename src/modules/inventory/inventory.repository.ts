import { supabaseAdmin } from '../../database/supabase.client';

export const increaseStock = async (variantId: string, amount: number, reason: string) => {
  const { data: variant, error: fetchError } = await supabaseAdmin
    .from('product_variants')
    .select('stock, id, product_id')
    .eq('id', variantId)
    .single();
    
  if (fetchError || !variant) throw fetchError;

  const newStock = (variant.stock || 0) + amount;

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId)
    .select()
    .single();

  if (error) throw error;

  await supabaseAdmin.from('inventory_logs').insert({
    variant_id: variantId,
    product_id: variant.product_id,
    change: amount,
    new_stock: newStock,
    reason
  });

  return data;
};

export const decreaseStock = async (variantId: string, amount: number, reason: string) => {
  const { data: variant, error: fetchError } = await supabaseAdmin
    .from('product_variants')
    .select('stock, id, product_id')
    .eq('id', variantId)
    .single();
    
  if (fetchError || !variant) throw fetchError;

  const newStock = Math.max(0, (variant.stock || 0) - amount);

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId)
    .select()
    .single();

  if (error) throw error;

  await supabaseAdmin.from('inventory_logs').insert({
    variant_id: variantId,
    product_id: variant.product_id,
    change: -amount,
    new_stock: newStock,
    reason
  });

  return data;
};

export const adjustStock = async (variantId: string, newStock: number, reason: string) => {
  const { data: variant, error: fetchError } = await supabaseAdmin
    .from('product_variants')
    .select('stock, id, product_id')
    .eq('id', variantId)
    .single();
    
  if (fetchError || !variant) throw fetchError;

  const change = newStock - (variant.stock || 0);

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId)
    .select()
    .single();

  if (error) throw error;

  await supabaseAdmin.from('inventory_logs').insert({
    variant_id: variantId,
    product_id: variant.product_id,
    change,
    new_stock: newStock,
    reason
  });

  return data;
};
