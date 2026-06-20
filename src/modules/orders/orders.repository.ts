import { supabaseAdmin } from '../../database/supabase.client';

export const createOrder = async (orderData: any, items: any[]) => {
  // Ideally this would be a real transaction. 
  // For Supabase REST, we might need a stored procedure for true transactions.
  // We'll mimic it here or use a supabase RPC if available, but for now we'll do sequential operations.
  
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItemsData = items.map(item => ({
    ...item,
    order_id: order.id
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) throw itemsError;

  // Decrease stock for each item
  for (const item of items) {
    if (item.variant_id) {
       // Fetch current stock
       const { data: variant, error: varError } = await supabaseAdmin
         .from('product_variants')
         .select('stock, product_id')
         .eq('id', item.variant_id)
         .single();
         
       if (!varError && variant) {
         const newStock = Math.max(0, (variant.stock || 0) - item.quantity);
         await supabaseAdmin.from('product_variants').update({ stock: newStock }).eq('id', item.variant_id);
         await supabaseAdmin.from('inventory_logs').insert({
            variant_id: item.variant_id,
            product_id: variant.product_id,
            change: -item.quantity,
            new_stock: newStock,
            reason: `Order ${order.id} placed`
         });
       }
    }
  }

  return order;
};

export const cancelOrder = async (id: string, shopId: string) => {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (orderError) throw orderError;

  // Increase stock back
  const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', order.id);
  
  if (items) {
    for (const item of items) {
      if (item.variant_id) {
         const { data: variant, error: varError } = await supabaseAdmin
           .from('product_variants')
           .select('stock, product_id')
           .eq('id', item.variant_id)
           .single();
           
         if (!varError && variant) {
           const newStock = (variant.stock || 0) + item.quantity;
           await supabaseAdmin.from('product_variants').update({ stock: newStock }).eq('id', item.variant_id);
           await supabaseAdmin.from('inventory_logs').insert({
              variant_id: item.variant_id,
              product_id: variant.product_id,
              change: item.quantity,
              new_stock: newStock,
              reason: `Order ${order.id} cancelled`
           });
         }
      }
    }
  }

  return order;
};

export const fulfillOrder = async (id: string, shopId: string) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'fulfilled' })
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getOrders = async (shopId: string) => {
  const { data, error } = await supabaseAdmin.from('orders').select('*').eq('shop_id', shopId);
  if (error) throw error;
  return data;
};

export const getOrderById = async (id: string, shopId: string) => {
  const { data, error } = await supabaseAdmin.from('orders').select('*, order_items(*)').eq('id', id).eq('shop_id', shopId).single();
  if (error) throw error;
  return data;
};
