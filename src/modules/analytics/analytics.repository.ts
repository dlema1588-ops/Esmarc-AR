import { supabaseAdmin } from '../../database/supabase.client';

export const getRevenueAnalytics = async () => {
  const { data, error } = await supabaseAdmin
    .from('analytics_daily_aggregates')
    .select('date, revenue')
    .order('date', { ascending: true })
    .limit(30);
  
  if (error) throw error;
  return data;
};

export const getShopGrowthAnalytics = async () => {
  const { data, error } = await supabaseAdmin
    .from('analytics_daily_aggregates')
    .select('date, new_shops')
    .order('date', { ascending: true })
    .limit(30);

  if (error) throw error;
  return data;
};

export const getTrafficAnalytics = async () => {
  const { data, error } = await supabaseAdmin
    .from('analytics_events')
    .select('source')
    .not('source', 'is', null);

  if (error) throw error;

  const initialSources: Record<string, number> = {
    Google: 0,
    Facebook: 0,
    Instagram: 0,
    TikTok: 0,
    Telegram: 0,
    YouTube: 0,
    LinkedIn: 0,
    Referral: 0,
    UTM: 0
  };

  const sources = (data || []).reduce((acc: Record<string, number>, curr: any) => {
    const src = curr.source as string;
    if (acc[src] !== undefined) {
      acc[src]++;
    } else {
      acc[src] = 1;
    }
    return acc;
  }, initialSources);

  return sources;
};

