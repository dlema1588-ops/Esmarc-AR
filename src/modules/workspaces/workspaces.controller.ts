import { Request, Response } from 'express';
import { supabaseAdmin } from '../../database/supabase.client';

export const listWorkspaces = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
      res.json({ success: true, count: 0, data: [] });
      return;
    }
    const { data, error } = await supabaseAdmin.from('workspaces').select('*');
    if (error) {
      console.error('listWorkspaces database error:', error);
      res.json({ success: true, count: 0, data: [] });
      return;
    }
    res.json({ success: true, count: (data || []).length, data: data || [] });
  } catch (error: any) {
    console.error('listWorkspaces throw error:', error);
    res.json({ success: true, count: 0, data: [] });
  }
};

export const getWorkspaceDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
      res.status(404).json({ success: false, message: 'Workspace not found (No database connection)' });
      return;
    }
    const { data: ws, error: wsError } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (wsError || !ws) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    let website = null;
    let modules: any[] = [];

    try {
      const { data: webData } = await supabaseAdmin.from('websites').select('*').eq('workspace_id', ws.id).maybeSingle();
      if (webData) website = webData;
    } catch (e) {
      console.warn('websites query failed, returning null website:', e);
    }

    try {
      const { data: modData } = await supabaseAdmin.from('website_modules').select('*').eq('workspace_id', ws.id);
      if (modData) modules = modData;
    } catch (e) {
      console.warn('website_modules query failed, returning empty website_modules:', e);
    }

    res.json({
      success: true,
      data: {
        workspace: ws,
        website: website || null,
        modules: modules || []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, subdomain, workspace_type, owner_name } = req.body;
    if (!name || !subdomain || !workspace_type) {
      res.status(400).json({ success: false, message: 'Missing name, subdomain, or workspace_type' });
      return;
    }

    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
      res.status(500).json({ success: false, message: 'No database connection' });
      return;
    }

    const { data: existingWs } = await supabaseAdmin.from('workspaces').select('*').eq('subdomain', subdomain.toLowerCase());
    if (existingWs && existingWs.length > 0) {
      res.status(400).json({ success: false, message: `Subdomain '${subdomain}' is already taken.` });
      return;
    }

    const { data: newWs, error: insertWsErr } = await supabaseAdmin.from('workspaces').insert({
      name,
      subdomain: subdomain.toLowerCase(),
      workspace_type,
      owner_id: '00000000-0000-0000-0000-000000000000'
    }).select().single();

    if (insertWsErr || !newWs) {
      throw insertWsErr || new Error('Workspace creation failed');
    }

    try {
      await supabaseAdmin.from('websites').insert({
        workspace_id: newWs.id,
        title: `${name} Website`,
        description: `Welcome to the official ${name} portal.`,
        theme_primary: 'indigo',
        theme_dark: false,
        hero_title: `Welcome to ${name}`,
        hero_subtitle: 'Configured and designed dynamically with ESMARC OS'
      });
    } catch (err) {
      console.warn('Failed to insert default website:', err);
    }

    res.status(211).json({ success: true, message: 'Workspace created successfully', data: { ...newWs, owner_name: owner_name || 'Anonymous Creator' } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWebsiteSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, theme_primary, theme_dark, hero_title, hero_subtitle } = req.body;

    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
      res.status(500).json({ success: false, message: 'No database connection' });
      return;
    }

    const { data: ws, error: wsErr } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (wsErr || !ws) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    const { data: updatedWeb, error: webErr } = await supabaseAdmin.from('websites').upsert({
      workspace_id: ws.id,
      title,
      description,
      theme_primary,
      theme_dark: !!theme_dark,
      hero_title,
      hero_subtitle,
      updated_at: new Date().toISOString()
    }, { onConflict: 'workspace_id' }).select().single();

    if (webErr) throw webErr;

    res.json({ success: true, message: 'Website settings updated', data: updatedWeb });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleWorkspaceModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, moduleKey } = req.params;
    const { is_enabled } = req.body;

    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) {
      res.status(500).json({ success: false, message: 'No database connection' });
      return;
    }

    const { data: ws, error: wsErr } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (wsErr || !ws) {
      res.status(404).json({ success: false, message: 'Workspace not found' });
      return;
    }

    const isEnabledBool = typeof is_enabled === 'boolean' ? is_enabled : true;

    const { data: mod, error: modErr } = await supabaseAdmin.from('website_modules').upsert({
      workspace_id: ws.id,
      module_key: moduleKey,
      is_enabled: isEnabledBool,
      updated_at: new Date().toISOString()
    }, { onConflict: 'workspace_id,module_key' }).select().single();

    if (modErr) throw modErr;

    res.json({ success: true, message: `Module '${moduleKey}' state updated`, data: mod });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ISOLATED CORE MODULE CURATORS ---

export const getProductsByWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.json({ success: true, data: [] }); return; }
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('workspace_id', id);
    if (error) {
      console.error('getProductsByWorkspace error:', error);
      res.json({ success: true, data: [] });
      return;
    }
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    res.json({ success: true, data: [] });
  }
};

export const createProductForWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image_url, category } = req.body;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.status(500).json({ success: false, message: 'No database connection' }); return; }

    const { data: ws } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (!ws) { res.status(404).json({ success: false, message: 'Workspace not found' }); return; }

    const { data: prod, error } = await supabaseAdmin.from('products').insert({
      workspace_id: ws.id,
      name,
      description: description || '',
      price: Number(price) || 0.00,
      stock: Number(stock) || 0,
      image_url: image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80',
      category: category || 'general'
    }).select().single();

    if (error) throw error;
    res.json({ success: true, message: 'Product created under workspace scope', data: prod });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getOrdersByWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.json({ success: true, data: [] }); return; }
    const { data, error } = await supabaseAdmin.from('orders').select('*').eq('workspace_id', id);
    if (error) {
      console.error('getOrdersByWorkspace error:', error);
      res.json({ success: true, data: [] });
      return;
    }
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    res.json({ success: true, data: [] });
  }
};

export const createOrderForWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { customer_name, customer_email, items, total } = req.body;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.status(500).json({ success: false, message: 'No database connection' }); return; }

    const { data: ws } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (!ws) { res.status(404).json({ success: false, message: 'Workspace not found' }); return; }

    const { data: ord, error } = await supabaseAdmin.from('orders').insert({
      workspace_id: ws.id,
      customer_name: customer_name || 'Anonymous Shopper',
      customer_email: customer_email || 'shopper@example.com',
      total: Number(total) || 0.00,
      status: 'completed',
      items: items || []
    }).select().single();

    if (error) throw error;
    res.json({ success: true, message: 'Order transactions ledger updated', data: ord });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAppointmentsByWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.json({ success: true, data: [] }); return; }
    const { data, error } = await supabaseAdmin.from('appointments').select('*').eq('workspace_id', id);
    if (error) {
      console.error('getAppointmentsByWorkspace error:', error);
      res.json({ success: true, data: [] });
      return;
    }
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    res.json({ success: true, data: [] });
  }
};

export const createAppointmentForWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { patient_name, doctor_name, scheduled_at, notes } = req.body;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.status(500).json({ success: false, message: 'No database connection' }); return; }

    const { data: ws } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (!ws) { res.status(404).json({ success: false, message: 'Workspace not found' }); return; }

    const { data: app, error } = await supabaseAdmin.from('appointments').insert({
      workspace_id: ws.id,
      patient_name: patient_name || 'Guest Patient',
      doctor_name: doctor_name || 'Dr. Sarah Jenkins',
      scheduled_at: scheduled_at || new Date().toISOString(),
      notes: notes || 'General checkup reservation',
      status: 'confirmed'
    }).select().single();

    if (error) throw error;
    res.json({ success: true, message: 'Appointment booked successfully', data: app });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getCoursesByWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.json({ success: true, data: [] }); return; }
    const { data, error } = await supabaseAdmin.from('courses').select('*').eq('workspace_id', id);
    if (error) {
      console.error('getCoursesByWorkspace error:', error);
      res.json({ success: true, data: [] });
      return;
    }
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    res.json({ success: true, data: [] });
  }
};

export const createCourseForWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, duration_weeks, instructor, price } = req.body;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.status(500).json({ success: false, message: 'No database connection' }); return; }

    const { data: ws } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (!ws) { res.status(404).json({ success: false, message: 'Workspace not found' }); return; }

    const { data: course, error } = await supabaseAdmin.from('courses').insert({
      workspace_id: ws.id,
      title,
      description: description || 'No curriculum outline set',
      duration_weeks: Number(duration_weeks) || 4,
      instructor: instructor || 'Staff Professor',
      price: Number(price) || 0.00
    }).select().single();

    if (error) throw error;
    res.json({ success: true, message: 'Syllabus registered under school workspace', data: course });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getBlogPostsByWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.json({ success: true, data: [] }); return; }
    const { data, error } = await supabaseAdmin.from('blog_posts').select('*').eq('workspace_id', id);
    if (error) {
      console.error('getBlogPostsByWorkspace error:', error);
      res.json({ success: true, data: [] });
      return;
    }
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    res.json({ success: true, data: [] });
  }
};

export const createBlogPostForWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, summary, content, author, image_url } = req.body;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.status(500).json({ success: false, message: 'No database connection' }); return; }

    const { data: ws } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (!ws) { res.status(404).json({ success: false, message: 'Workspace not found' }); return; }

    const { data: draft, error } = await supabaseAdmin.from('blog_posts').insert({
      workspace_id: ws.id,
      title,
      summary: summary || 'Press release summarizing article themes.',
      content: content || 'Standard editorial post context...',
      author: author || 'Platform Editor',
      image_url: image_url || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80',
      published_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    res.json({ success: true, message: 'Editorial column drafted and published', data: draft });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getCommunityPostsByWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.json({ success: true, data: [] }); return; }
    const { data, error } = await supabaseAdmin.from('community_posts').select('*').eq('workspace_id', id);
    if (error) {
      console.error('getCommunityPostsByWorkspace error:', error);
      res.json({ success: true, data: [] });
      return;
    }
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    res.json({ success: true, data: [] });
  }
};

export const createCommunityPostForWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { author, title, content } = req.body;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.status(500).json({ success: false, message: 'No database connection' }); return; }

    const { data: ws } = await supabaseAdmin.from('workspaces').select('*').eq('id', id).maybeSingle();
    if (!ws) { res.status(404).json({ success: false, message: 'Workspace not found' }); return; }

    const { data: post, error } = await supabaseAdmin.from('community_posts').insert({
      workspace_id: ws.id,
      author: author || 'anonymous_hacker',
      title,
      content,
      likes: 0
    }).select().single();

    if (error) throw error;
    res.json({ success: true, message: 'Social post broadcasted live', data: post });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const likeCommunityPostInWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, postId } = req.params;
    if (!supabaseAdmin || Object.keys(supabaseAdmin).length === 0) { res.status(500).json({ success: false, message: 'No database connection' }); return; }

    const { data: post } = await supabaseAdmin.from('community_posts').select('*').eq('workspace_id', id).eq('id', postId).maybeSingle();
    if (!post) {
      res.status(404).json({ success: false, message: 'Community post ID not found' });
      return;
    }

    const { data: updated, error } = await supabaseAdmin.from('community_posts').update({
      likes: (post.likes || 0) + 1
    }).eq('id', postId).select().single();

    if (error) throw error;
    res.json({ success: true, data: updated });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};
