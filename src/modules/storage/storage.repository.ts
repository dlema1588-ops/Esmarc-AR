import { supabaseAdmin } from '../../database/supabase.client';
import { v4 as uuidv4 } from 'uuid';

export const uploadImage = async (bucket: string, file: Express.Multer.File, shopId: string) => {
  const fileExt = file.originalname.split('.').pop();
  const filePath = `${shopId}/${uuidv4()}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrlData.publicUrl
  };
};

export const deleteImage = async (bucket: string, path: string) => {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
  return true;
};
