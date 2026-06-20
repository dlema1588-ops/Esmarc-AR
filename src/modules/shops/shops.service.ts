import { supabaseAdmin } from '../../database/supabase.client';

export const provisionShop = async (shopData: any, ownerId: string, initialPlanId: string, initialThemeId: string) => {
  // Ideally use an RPC for a transaction. Here we simulate the steps.
  
  // 1. Create shop record
  const { data: shop, error: shopError } = await supabaseAdmin
    .from('shops')
    .insert({ ...shopData, status: 'active' })
    .select()
    .single();

  if (shopError) throw shopError;

  // 2. Owner membership
  const { error: memberError } = await supabaseAdmin
    .from('shop_members')
    .insert({ shop_id: shop.id, user_id: ownerId, role: 'owner' });

  if (memberError) console.error("Failed to add owner membership", memberError); // rollback strategy in real app

  // 3. Default theme
  const { error: themeError } = await supabaseAdmin
    .from('shop_themes')
    .insert({ shop_id: shop.id, theme_id: initialThemeId });

  if (themeError) console.error("Failed to assign default theme", themeError);

  // 4. Default subscription
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .insert({ shop_id: shop.id, plan_id: initialPlanId, status: 'active' });

  if (subError) console.error("Failed to assign default subscription", subError);

  // 5. Default settings (creating a settings record if you have a shop_settings table)
  const { error: settingsError } = await supabaseAdmin
    .from('shop_settings')
    .insert({ shop_id: shop.id, currency: 'USD', timezone: 'UTC' });

  if (settingsError) console.error("Failed to set default settings", settingsError);

  return shop;
};
