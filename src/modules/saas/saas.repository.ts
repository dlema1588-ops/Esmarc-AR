import { supabaseAdmin } from '../../database/supabase.client';
import { 
  Feature, ShopFeature, Integration, IntegrationProvider, 
  AIAgent, AIProvider, MediaAsset, ARAsset, Location, Job, AuditLog 
} from '../../types/saas.types';

// ============================================================================
// FEATURE FLAGS & SYSTEM SERVICES
// ============================================================================

export const getFeatures = async (): Promise<Feature[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data, error } = await supabaseAdmin.from('features').select('*, categories(*)');
    if (error) {
      console.error('Supabase Features select failed:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getFeatures caught error:', err);
    return [];
  }
};

export const createFeature = async (feature: any): Promise<Feature> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('features').insert(feature).select().single();
  if (error) throw error;
  return data;
};

export const updateFeature = async (id: string, updates: any): Promise<Feature> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('features').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const getShopFeatures = async (shopId: string): Promise<any[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data: globalFeatures, error: err1 } = await supabaseAdmin.from('features').select('*');
    if (err1) {
      console.error('getShopFeatures err1:', err1);
      return [];
    }
    const { data: shopOverrides, error: err2 } = await supabaseAdmin.from('shop_features').select('*').eq('shop_id', shopId);
    
    const overrides = shopOverrides || [];
    return (globalFeatures || []).map(f => {
      const override = overrides.find((o: any) => o.feature_id === f.id);
      return {
        ...f,
        status: override ? override.status : f.status,
        config_values: override ? override.config_values : {}
      };
    });
  } catch (err) {
    console.error('getShopFeatures caught error:', err);
    return [];
  }
};

export const assignFeatureToShop = async (shopId: string, featureId: string, status: string, configValues: any): Promise<any> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('shop_features').upsert({
    shop_id: shopId,
    feature_id: featureId,
    status,
    config_values: configValues,
    updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
};

// ============================================================================
// INTEGRATION MATRIX
// ============================================================================

export const getIntegrationProviders = async (): Promise<IntegrationProvider[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data, error } = await supabaseAdmin.from('integration_providers').select('*');
    if (error) {
      console.error('getIntegrationProviders error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getIntegrationProviders caught error:', err);
    return [];
  }
};

export const getShopIntegrations = async (shopId: string): Promise<any[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data: providers, error: err1 } = await supabaseAdmin.from('integration_providers').select('*');
    if (err1) {
      console.error('getShopIntegrations err1:', err1);
      return [];
    }
    const { data: integrations, error: err2 } = await supabaseAdmin.from('integrations').select('*').eq('shop_id', shopId);
    
    const cleanInts = integrations || [];
    return (providers || []).map(p => {
      const matched = cleanInts.find((i: any) => i.provider_id === p.id);
      return {
        provider: p,
        id: matched?.id,
        is_enabled: matched ? matched.is_enabled : false,
        config: matched ? matched.config : {}
      };
    });
  } catch (err) {
    console.error('getShopIntegrations caught error:', err);
    return [];
  }
};

export const toggleIntegration = async (shopId: string, providerId: string, isEnabled: boolean, config: any): Promise<any> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('integrations').upsert({
    shop_id: shopId,
    provider_id: providerId,
    is_enabled: isEnabled,
    config,
    updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
};

// ============================================================================
// AI AGENTS & CAPABILITIES
// ============================================================================

export const getAIProviders = async (): Promise<AIProvider[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data, error } = await supabaseAdmin.from('ai_providers').select('*');
    if (error) {
      console.error('getAIProviders error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getAIProviders caught error:', err);
    return [];
  }
};

export const getShopAIAgents = async (shopId: string): Promise<AIAgent[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data, error } = await supabaseAdmin.from('ai_agents').select('*').or(`shop_id.is.null,shop_id.eq.${shopId}`);
    if (error) {
      console.error('getShopAIAgents failed:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getShopAIAgents caught error:', err);
    return [];
  }
};

export const createAIAgent = async (agent: any): Promise<AIAgent> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('ai_agents').insert(agent).select().single();
  if (error) throw error;
  return data;
};

// ============================================================================
// MEDIA & ASSET VAULT
// ============================================================================

export const getMediaAssets = async (shopId: string): Promise<MediaAsset[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data, error } = await supabaseAdmin.from('media_assets').select('*').eq('shop_id', shopId);
    if (error) {
      console.error('getMediaAssets failed:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getMediaAssets caught error:', err);
    return [];
  }
};

export const createMediaAsset = async (asset: any): Promise<MediaAsset> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('media_assets').insert(asset).select().single();
  if (error) throw error;
  return data;
};

// ============================================================================
// AR ASSETS & EXTENSIONS
// ============================================================================

export const getARAssets = async (shopId: string): Promise<ARAsset[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data, error } = await supabaseAdmin.from('ar_assets').select('*').eq('shop_id', shopId);
    if (error) {
      console.error('getARAssets error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getARAssets caught error:', err);
    return [];
  }
};

export const createARAsset = async (asset: any): Promise<ARAsset> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('ar_assets').insert(asset).select().single();
  if (error) throw error;
  return data;
};

// ============================================================================
// GEOLOCATION MAP SYSTEM
// ============================================================================

export const getLocations = async (shopId: string): Promise<Location[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const { data, error } = await supabaseAdmin.from('locations').select('*').eq('shop_id', shopId);
    if (error) {
      console.error('getLocations failed:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getLocations caught error:', err);
    return [];
  }
};

export const createLocation = async (location: any): Promise<Location> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('locations').insert(location).select().single();
  if (error) throw error;
  return data;
};

// ============================================================================
// SYSTEM RUNTIME JOBS
// ============================================================================

export const getJobs = async (shopId?: string): Promise<Job[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const query = supabaseAdmin.from('jobs').select('*');
    if (shopId) {
      query.eq('shop_id', shopId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('getJobs failed:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getJobs caught error:', err);
    return [];
  }
};

export const createJob = async (job: any): Promise<Job> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('jobs').insert(job).select().single();
  if (error) throw error;
  return data;
};

// ============================================================================
// AUDIT LOGS & LEDGERS
// ============================================================================

export const createAuditLog = async (log: any): Promise<AuditLog> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('audit_logs').insert(log).select().single();
  if (error) throw error;
  return data;
};

export const getAuditLogs = async (shopId?: string): Promise<AuditLog[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const query = supabaseAdmin.from('audit_logs').select('*');
    if (shopId) {
      query.eq('shop_id', shopId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('getAuditLogs failed:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getAuditLogs caught error:', err);
    return [];
  }
};

export const createActivityLog = async (log: any): Promise<any> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('activity_logs').insert(log).select().single();
  if (error) throw error;
  return data;
};

export const createSecurityLog = async (log: any): Promise<any> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('security_logs').insert(log).select().single();
  if (error) throw error;
  return data;
};

export const getUnifiedActivityLogs = async (shopId?: string): Promise<any[]> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return [];
    const query = supabaseAdmin.from('activity_logs').select('*');
    if (shopId) {
      query.eq('shop_id', shopId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('getUnifiedActivityLogs failed:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('getUnifiedActivityLogs caught error:', err);
    return [];
  }
};

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export const getPlatformSettings = async (): Promise<any> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return {};
    const { data, error } = await supabaseAdmin.from('platform_settings').select('*');
    if (error) {
      console.error('getPlatformSettings failed:', error);
      return {};
    }
    const settings: Record<string, any> = {};
    (data || []).forEach((row: any) => {
      settings[row.key] = row.value;
    });
    return settings;
  } catch (err) {
    console.error('getPlatformSettings caught error:', err);
    return {};
  }
};

export const updatePlatformSetting = async (key: string, value: any): Promise<void> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { error } = await supabaseAdmin.from('platform_settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
};

export const getShopSettings = async (shopId: string): Promise<any> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) return {};
    const { data, error } = await supabaseAdmin.from('shop_settings').select('*').eq('shop_id', shopId).single();
    if (error) {
      console.error('getShopSettings failed:', error);
      return {};
    }
    return data ? data.settings : {};
  } catch (err) {
    console.error('getShopSettings caught error:', err);
    return {};
  }
};

export const updateShopSettings = async (shopId: string, settings: any): Promise<any> => {
  if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
    throw new Error('Supabase client is not initialized');
  }
  const { data, error } = await supabaseAdmin.from('shop_settings').upsert({
    shop_id: shopId,
    settings,
    updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data ? data.settings : {};
};
