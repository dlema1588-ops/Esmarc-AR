export const createVariant = async (shopId: string, data: any) => {
  const newVariant = { id: `var-${Date.now()}`, workspace_id: shopId, ...data };
  return newVariant;
};

export const getVariant = async (id: string, shopId: string) => {
  return null;
};

export const updateVariant = async (id: string, shopId: string, data: any) => {
  return null;
};

export const deleteVariant = async (id: string, shopId: string): Promise<boolean> => {
  return true;
};
