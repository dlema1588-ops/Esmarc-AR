import { supabaseAdmin } from '../../database/supabase.client';

export const getDomains = async () => {
  const { data, error } = await supabaseAdmin.from('domains').select('*');
  if (error) throw error;
  return data;
};

export const createDomain = async (domainData: any) => {
  const newDomain = { 
    status: 'pending', 
    verified: false, 
    ssl_status: 'pending',
    ...domainData 
  };
  const { data, error } = await supabaseAdmin.from('domains').insert(newDomain).select().single();
  if (error) throw error;
  return data;
};

export const verifyDomain = async (id: string) => {
  const { data, error } = await supabaseAdmin.from('domains').update({ 
    verified: true, 
    status: 'active',
    ssl_status: 'active'
  }).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteDomain = async (id: string): Promise<boolean> => {
  const { error } = await supabaseAdmin.from('domains').delete().eq('id', id);
  if (error) throw error;
  return true;
};

