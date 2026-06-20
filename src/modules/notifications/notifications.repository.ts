import { supabaseAdmin } from '../../database/supabase.client';

export const getNotifications = async () => {
  const { data, error } = await supabaseAdmin.from('notifications').select('*');
  if (error) throw error;
  return data;
};

export const createNotification = async (data: any) => {
  const newNotification = { 
    read: false,
    ...data 
  };
  const { data: created, error } = await supabaseAdmin.from('notifications').insert(newNotification).select().single();
  if (error) throw error;
  return created;
};
