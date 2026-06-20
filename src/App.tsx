import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import { 
  Building2, 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings,
  Bell,
  Search,
  LogOut,
  Sparkles,
  Layers,
  Sliders,
  ChevronRight,
  Plus,
  BookOpen,
  Calendar,
  Layers2,
  Trash2,
  ListFilter,
  Eye,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  Cpu,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Globe2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import SuperAdminFeatureFlagScreen from './components/SuperAdminFeatureFlagScreen';
import ShopOwnerFeatureCenter from './components/ShopOwnerFeatureCenter';
import AuditLogViewer from './components/AuditLogViewer';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- Main Layout ---
interface LayoutProps {
  children: React.ReactNode;
  viewMode: 'super_admin' | 'workspace_owner';
  setViewMode: (mode: 'super_admin' | 'workspace_owner') => void;
  workspaces: any[];
  selectedWorkspaceId: string;
  setSelectedWorkspaceId: (id: string) => void;
}

function DashboardLayout({ children, viewMode, setViewMode, workspaces, selectedWorkspaceId, setSelectedWorkspaceId }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const superAdminNav = [
    { icon: LayoutDashboard, label: 'Platform Summary', path: '/' },
    { icon: Building2, label: 'Workspaces Directory', path: '/workspaces' },
    { icon: Sliders, label: 'Audit Logs & Telemetry', path: '/audit' },
  ];

  const workspaceOwnerNav = [
    { icon: Globe2, label: 'Live Website & Builder', path: '/' },
  ];

  const activeNav = viewMode === 'super_admin' ? superAdminNav : workspaceOwnerNav;
  const currentWsObj = workspaces.find(w => w.id === selectedWorkspaceId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 flex flex-col hidden md:flex text-slate-305 border-r border-slate-900 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-900 justify-between">
          <span className="text-lg font-black tracking-wider text-white">ESMARC OS</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-black px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase tracking-widest">v2.0</span>
        </div>

        {/* Workspace Perspective Switcher */}
        <div className="p-4 border-b border-slate-900 bg-slate-900/10">
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Switch Workspace Perspective</label>
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="w-full text-xs font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white p-2 rounded-lg cursor-pointer transition-colors focus:outline-none"
          >
            <option value="super_admin">⚡ Platform Super Admin</option>
            <option value="workspace_owner">🚀 Workspace Site Builder</option>
          </select>
        </div>

        {viewMode === 'workspace_owner' && (
          <div className="p-4 border-b border-slate-900 bg-slate-900/30">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Active Tenant Workspace</label>
            <select 
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 text-indigo-300 p-2 rounded-lg cursor-pointer transition-colors focus:outline-none"
            >
              {workspaces.map(w => (
                <option key={w.id} value={w.id} className="text-white">
                  {w.name} ({w.workspace_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4 px-2">
            {viewMode === 'super_admin' ? 'Super Admin Terminal' : 'Workspace Operations'}
          </div>
          <nav className="space-y-1">
            {activeNav.map((item) => {
              const active = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                    active 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 mr-3 shrink-0", active ? "text-white" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-900 bg-slate-950">
          <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>Status: Online</span>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Stage */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center text-sm font-semibold text-slate-700">
            <span className={cn(
              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mr-3 border",
              viewMode === 'super_admin' ? "bg-rose-50 text-rose-800 border-rose-100" : "bg-indigo-50 text-indigo-800 border-indigo-100"
            )}>
              {viewMode === 'super_admin' ? 'Super Admin Console' : `Workspace Manager`}
            </span>
            {viewMode === 'super_admin' 
              ? 'Multi-Tenant Aggregates & System Logs' 
              : `Designing ${currentWsObj ? currentWsObj.name : 'Workspace'}`}
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 uppercase">
              {viewMode === 'super_admin' ? 'SYSTEM_ROOT' : currentWsObj?.workspace_type || 'workspace'}
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-905 bg-slate-900 flex items-center justify-center text-white font-extrabold text-xs">
              {viewMode === 'super_admin' ? 'SA' : 'WM'}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Platform Stats Dashboard ---
function PlatformDashboard({ workspaces, reloadWorkspaces }: { workspaces: any[], reloadWorkspaces: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newType, setNewType] = useState('restaurant');
  const [newOwner, setNewOwner] = useState('');
  const [msg, setMsg] = useState('');

  // Count modules
  const enabledModulesCount = workspaces.length * 2; // Simulated base

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (!newName || !newSubdomain) return;

    fetch('/api/v1/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        subdomain: newSubdomain.toLowerCase(),
        workspace_type: newType,
        owner_name: newOwner || 'General Manager'
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg(`Successfully spawned ${newName}! Website config initialized.`);
          setNewName('');
          setNewSubdomain('');
          setNewOwner('');
          setShowAddForm(false);
          reloadWorkspaces();
        } else {
          setMsg(`Failure matching parameters: ${d.message}`);
        }
      })
      .catch(err => setMsg(`Network failure: ${err.message}`));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Platform Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Cross-tenant core infrastructure analytics and workspace management.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Workspace
        </button>
      </div>

      {msg && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-lg text-xs font-semibold flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="font-bold hover:text-slate-800">✕</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Workspaces', value: workspaces.length.toString(), desc: 'Verified live tenants' },
          { label: 'Total Modules Enabled', value: enabledModulesCount.toString(), desc: 'Pluggable modular components' },
          { label: 'Platform Health Status', value: '100% OK', desc: 'All regional clusters operational' },
          { label: 'Database Isolation Mode', value: 'workspace_id', desc: 'Secure headers isolated policies' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:shadow transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</h3>
            <div className="mt-2 text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
            <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">{stat.desc}</p>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-md space-y-4 max-w-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase">Create Workspace of any Business Type</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Workspace/Business Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Apex Dental Care"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unique Subdomain</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. apexdental"
                  value={newSubdomain}
                  onChange={e => setNewSubdomain(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Business Workspace Type</label>
                <select 
                  value={newType} 
                  onChange={e => setNewType(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg cursor-pointer"
                >
                  <option value="restaurant">🍴 Restaurant (Online Ordering, Booking)</option>
                  <option value="clinic">🩺 Medical Clinic (Appointments, Bookings)</option>
                  <option value="school">🏫 Academic School (Curriculums, Courses)</option>
                  <option value="ecommerce">🛒 Ecommerce Brand (Product Catalog, Cart)</option>
                  <option value="blog">✍️ Editorial Blog & News Website</option>
                  <option value="directory">📁 Directory, Marketplace & Real Estate</option>
                  <option value="custom">⚙️ General Custom Business Website</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Manager/Owner Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Jennifer Park"
                  value={newOwner}
                  onChange={e => setNewOwner(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow cursor-pointer"
            >
              Provision Tenant Workspace Instance
            </button>
          </form>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Multi-Tenant Workspaces Ledger</h3>
          <span className="text-[10px] text-slate-400 font-mono">DB Isolation enforces workspace_id isolation on all objects</span>
        </div>
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#F1F5F9] text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Workspace UUID</th>
              <th className="px-6 py-4">Business Name</th>
              <th className="px-6 py-4">Workspace Type</th>
              <th className="px-6 py-4">Subdomain Scope</th>
              <th className="px-6 py-4">Active Manager</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 text-slate-700">
            {workspaces.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-xs text-slate-400 font-mono italic">
                  No registered tenant workspaces in the database.
                </td>
              </tr>
            ) : (
              workspaces.map(w => (
                <tr key={w.id} className="hover:bg-slate-50/50 bg-white/40">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{w.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{w.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-50 border border-indigo-100 text-indigo-700">
                      {w.workspace_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {w.subdomain}.esmarc.app
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {w.owner_name}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- DYNAMIC SITE BUILDER & LIVE PREVIEWER FRAME ---
function WorkspaceSiteBuilder({ workspaceId, setViewMode }: { workspaceId: string, setViewMode?: (mode: 'super_admin' | 'workspace_owner') => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // website editor controls
  const [webTitle, setWebTitle] = useState('');
  const [webDesc, setWebDesc] = useState('');
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSub, setHeroSub] = useState('');
  const [accentColor, setAccentColor] = useState('indigo');
  const [darkMode, setDarkMode] = useState(false);

  // database arrays
  const [products, setProducts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // creation forms
  const [showCatalogCreator, setShowCatalogCreator] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(10);
  const [prodDesc, setProdDesc] = useState('');

  const [showBlogCreator, setShowBlogCreator] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');

  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [coursePrice, setCoursePrice] = useState(299);

  // user customer flow triggers
  const [bookingPatient, setBookingPatient] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  const [forumUser, setForumUser] = useState('');
  const [forumTitle, setForumTitle] = useState('');
  const [forumMsg, setForumMsg] = useState('');

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');

  const [activePreviewTab, setActivePreviewTab] = useState<'home' | 'catalog' | 'booking' | 'blog' | 'forum'>('home');
  const [showArModal, setShowArModal] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadWorkspaceState();
  }, [workspaceId]);

  const loadWorkspaceState = () => {
    if (!workspaceId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/v1/workspaces/${workspaceId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const w = res.data;
          setData(w);
          if (w.website) {
            setWebTitle(w.website.title);
            setWebDesc(w.website.description);
            setHeroHeading(w.website.hero_title);
            setHeroSub(w.website.hero_subtitle);
            setAccentColor(w.website.theme_primary || 'indigo');
            setDarkMode(!!w.website.theme_dark);
          }
        }
      })
      .then(() => {
        // Fetch specific sub collections
        return Promise.all([
          fetch(`/api/v1/workspaces/${workspaceId}/products`).then(r => r.json()),
          fetch(`/api/v1/workspaces/${workspaceId}/orders`).then(r => r.json()),
          fetch(`/api/v1/workspaces/${workspaceId}/appointments`).then(r => r.json()),
          fetch(`/api/v1/workspaces/${workspaceId}/courses`).then(r => r.json()),
          fetch(`/api/v1/workspaces/${workspaceId}/blog_posts`).then(r => r.json()),
          fetch(`/api/v1/workspaces/${workspaceId}/community_posts`).then(r => r.json())
        ]);
      })
      .then(([p, o, a, c, b, cp]) => {
        if (p.success) setProducts(p.data || []);
        if (o.success) setOrders(o.data || []);
        if (a.success) setAppointments(a.data || []);
        if (c.success) setCourses(c.data || []);
        if (b.success) setBlogPosts(b.data || []);
        if (cp.success) setCommunityPosts(cp.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleUpdateWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/v1/workspaces/${workspaceId}/website`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: webTitle,
        description: webDesc,
        theme_primary: accentColor,
        theme_dark: darkMode,
        hero_title: heroHeading,
        hero_subtitle: heroSub
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Website specifications updated in real-time!');
          loadWorkspaceState();
        }
      });
  };

  const toggleModule = (moduleKey: string, currentEnabled: boolean) => {
    fetch(`/api/v1/workspaces/${workspaceId}/modules/${moduleKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_enabled: !currentEnabled })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg(`Module '${moduleKey}' state toggled!`);
          loadWorkspaceState();
        }
      });
  };

  // Creator Form Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName) return;
    fetch(`/api/v1/workspaces/${workspaceId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: prodName, price: prodPrice, description: prodDesc })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Catalog modified: product item added!');
          setProdName('');
          setProdDesc('');
          setShowCatalogCreator(false);
          loadWorkspaceState();
        }
      });
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle) return;
    fetch(`/api/v1/workspaces/${workspaceId}/blog_posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: blogTitle, summary: blogSummary, content: blogContent })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Press column expanded: post created!');
          setBlogTitle('');
          setBlogSummary('');
          setBlogContent('');
          setShowBlogCreator(false);
          loadWorkspaceState();
        }
      });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle) return;
    fetch(`/api/v1/workspaces/${workspaceId}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: courseTitle, instructor: courseInstructor, price: coursePrice })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Syllabus item added successfully!');
          setCourseTitle('');
          setCourseInstructor('');
          setShowCourseCreator(false);
          loadWorkspaceState();
        }
      });
  };

  // Customer Transaction Workflows
  const addToCart = (prod: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === prod.id);
      if (existing) {
        return prev.map(item => item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...prod, quantity: 1 }];
    });
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    const totalCost = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    fetch(`/api/v1/workspaces/${workspaceId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: checkoutName || 'Jane Smith',
        customer_email: checkoutEmail || 'jane@example.com',
        items: cartItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        total: totalCost
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Checkout transaction complete! Order processed persistently.');
          setCartItems([]);
          setCheckoutName('');
          setCheckoutEmail('');
          loadWorkspaceState();
        }
      });
  };

  const handleBookAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPatient || !bookingDate) return;

    fetch(`/api/v1/workspaces/${workspaceId}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_name: bookingPatient,
        doctor_name: data.workspace.owner_name || 'Staff Doctor',
        scheduled_at: bookingDate + 'T12:00:00Z',
        notes: bookingNotes
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Appointment scheduled successfully under clinic context.');
          setBookingPatient('');
          setBookingNotes('');
          loadWorkspaceState();
        }
      });
  };

  const handleBroadPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumTitle || !forumMsg) return;

    fetch(`/api/v1/workspaces/${workspaceId}/community_posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: forumUser || 'anonymous_coder',
        title: forumTitle,
        content: forumMsg
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Live community post published!');
          setForumTitle('');
          setForumMsg('');
          loadWorkspaceState();
        }
      });
  };

  const likePost = (postId: string) => {
    fetch(`/api/v1/workspaces/${workspaceId}/community_posts/${postId}/like`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          loadWorkspaceState();
        }
      });
  };

  if (!workspaceId) {
    return (
      <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl text-center px-4 space-y-4">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900">No Target Workspace Loaded</h2>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            Please switch to the **⚡ Platform Super Admin** view using the sidebar perspective dropdown and create your first workspace tenant.
          </p>
        </div>
        <button
          onClick={() => setViewMode && setViewMode('super_admin')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg cursor-pointer transition-colors"
        >
          Go to Super Admin Console
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <span className="text-xs text-slate-500 font-semibold font-mono">Reassembling Workspace Components...</span>
      </div>
    );
  }

  const { workspace, website, modules } = data;
  const isModuleActive = (key: string) => {
    return (modules || []).some((m: any) => m.module_key === key && m.is_enabled);
  };

  // Color Mapping for Visual Themes
  const bgThemeColors: any = {
    indigo: 'bg-[#4F46E5]',
    emerald: 'bg-[#10B981]',
    sky: 'bg-[#0EA5E9]',
    rose: 'bg-[#F43F5E]',
    slate: 'bg-[#64748B]',
  };

  const borderThemeColors: any = {
    indigo: 'border-[#4F46E5]/20',
    emerald: 'border-[#10B981]/20',
    sky: 'border-[#0EA5E9]/20',
    rose: 'border-[#F43F5E]/20',
    slate: 'border-[#64748B]/20',
  };

  const textThemeColors: any = {
    indigo: 'text-[#4F46E5]',
    emerald: 'text-[#10B981]',
    sky: 'text-[#0EA5E9]',
    rose: 'text-[#F43F5E]',
    slate: 'text-[#64748B]',
  };

  const activeColor = bgThemeColors[accentColor] || bgThemeColors.indigo;
  const activeText = textThemeColors[accentColor] || textThemeColors.indigo;
  const activeBorder = borderThemeColors[accentColor] || borderThemeColors.indigo;

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Workspace General Context */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 border px-2 py-0.5 rounded w-fit mb-2 inline-block">
            Subdomain: {workspace.subdomain}.esmarc.app
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{workspace.name} Sandbox</h1>
          <p className="text-slate-500 text-xs mt-1">
            Workspace Type: <span className="font-bold underline capitalize">{workspace.workspace_type}</span> ➔ Managed by <span className="font-bold">{workspace.owner_name}</span>.
          </p>
        </div>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-xs font-semibold flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="font-bold hover:text-slate-800">✕</button>
        </div>
      )}

      {/* Grid Configuration Controls vs Visual Builder Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDE BAR LAYOUT CONTROLLER PANEL */}
        <div className="lg:col-span-4 space-y-6 shrink-0">
          
          {/* Active Modules Matrix Modifier */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Toggle Website Modules
            </h3>
            <p className="text-[11px] text-slate-500">Enable or disable pluggable workspace modules to dynamically adjust output markup.</p>
            
            <div className="space-y-2.5 pt-1">
              {[
                { key: 'shopping_cart', label: 'Product Catalog & Carts', desc: 'Adds products catalog & online cart checkout.' },
                { key: 'menu_ordering', label: 'Dish Menu & Ordering', desc: 'Adds menus for restaurants & food joints.' },
                { key: 'patient_scheduling', label: 'Doctor Scheduling Calendar', desc: 'Active appointment slot booker.' },
                { key: 'course_enrollment', label: 'Academy Syllabus', desc: 'Registers core curriculum tables.' },
                { key: 'blogging', label: 'Magazine Editorial & Blog', desc: 'Publishes articles/drafting boards.' },
                { key: 'live_community', label: 'Cooperative Forum Threads', desc: 'Real-time feedback threads.' },
                { key: 'ar_viewer', label: '3D Spatial AR viewport', desc: 'Interactive visual models.' }
              ].map(opt => {
                const active = isModuleActive(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleModule(opt.key, active)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all flex items-start justify-between gap-4 cursor-pointer",
                      active 
                        ? "bg-slate-50 border-slate-300 text-slate-800 shadow-sm" 
                        : "bg-white hover:bg-slate-50/50 border-slate-200 text-slate-450 text-slate-500"
                    )}
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold block">{opt.label}</span>
                      <span className="text-[10px] opacity-80 block truncate max-w-[200px] font-normal">{opt.desc}</span>
                    </div>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide shrink-0",
                      active ? "bg-emerald-100 text-emerald-805" : "bg-slate-100 text-slate-400"
                    )}>
                      {active ? 'Active' : 'Off'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Creator Injects */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Package className="w-4 h-4 text-indigo-600" /> Manage Workspace Catalog
            </h3>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setShowCatalogCreator(v => !v); setShowBlogCreator(false); setShowCourseCreator(false); }}
                className="w-full text-left px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border text-xs font-semibold rounded-md text-slate-700 flex items-center justify-between"
              >
                <span>🚀 Add Product / Menu Dish</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
              
              <button 
                onClick={() => { setShowBlogCreator(v => !v); setShowCatalogCreator(false); setShowCourseCreator(false); }}
                className="w-full text-left px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border text-xs font-semibold rounded-md text-slate-700 flex items-center justify-between"
              >
                <span>✍️ Create Blog / Press Post</span>
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => { setShowCourseCreator(v => !v); setShowCatalogCreator(false); setShowBlogCreator(false); }}
                className="w-full text-left px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border text-xs font-semibold rounded-md text-slate-700 flex items-center justify-between"
              >
                <span>🏫 Add Academic Syllabus Course</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showCatalogCreator && (
              <form onSubmit={handleCreateProduct} className="p-3 bg-slate-50/50 border border-dashed rounded-lg space-y-3 pt-4">
                <input 
                  type="text" required placeholder="Item title" value={prodName} onChange={e => setProdName(e.target.value)}
                  className="w-full bg-white border p-1.5 text-xs rounded-md"
                />
                <input 
                  type="number" required placeholder="Price" value={prodPrice} onChange={e => setProdPrice(Number(e.target.value))}
                  className="w-full bg-white border p-1.5 text-xs rounded-md"
                />
                <textarea 
                  placeholder="Short spec/details..." value={prodDesc} onChange={e => setProdDesc(e.target.value)}
                  className="w-full bg-white border p-1.5 text-xs rounded-md h-12"
                />
                <button type="submit" className="w-full text-white bg-indigo-600 hover:bg-indigo-700 uppercase p-1.5 rounded text-[10px] font-bold">Inject Product</button>
              </form>
            )}

            {showBlogCreator && (
              <form onSubmit={handleCreateDraft} className="p-3 bg-slate-50/50 border border-dashed rounded-lg space-y-3 pt-4">
                <input 
                  type="text" required placeholder="Post Title" value={blogTitle} onChange={e => setBlogTitle(e.target.value)}
                  className="w-full bg-white border p-1.5 text-xs rounded-md"
                />
                <input 
                  type="text" required placeholder="Post Summary" value={blogSummary} onChange={e => setBlogSummary(e.target.value)}
                  className="w-full bg-white border p-1.5 text-xs rounded-md"
                />
                <textarea 
                  required placeholder="Content text..." value={blogContent} onChange={e => setBlogContent(e.target.value)}
                  className="w-full bg-white border p-1.5 text-xs rounded-md h-20"
                />
                <button type="submit" className="w-full text-white bg-indigo-600 hover:bg-indigo-700 uppercase p-1.5 rounded text-[10px] font-bold">Inscribe Article</button>
              </form>
            )}

            {showCourseCreator && (
              <form onSubmit={handleCreateCourse} className="p-3 bg-slate-50/50 border border-dashed rounded-lg space-y-3 pt-4">
                <input 
                  type="text" required placeholder="Module Title" value={courseTitle} onChange={e => setCourseTitle(e.target.value)}
                  className="w-full bg-white border p-1.5 text-xs rounded-md"
                />
                <input 
                  type="text" required placeholder="Instructor Name" value={courseInstructor} onChange={e => setCourseInstructor(e.target.value)}
                  className="w-full bg-white border p-1.5 text-xs rounded-md"
                />
                <input 
                  type="number" required placeholder="Tuition Fee ($)" value={coursePrice} onChange={e => setCoursePrice(Number(e.target.value))}
                  className="w-full bg-white border p-1.5 text-xs rounded-md"
                />
                <button type="submit" className="w-full text-white bg-indigo-600 hover:bg-indigo-700 uppercase p-1.5 rounded text-[10px] font-bold">Publish Course</button>
              </form>
            )}
          </div>

          {/* Website Specifications Theme Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Settings className="w-4 h-4 text-indigo-600" /> Custom branding & Styles
            </h3>
            
            <form onSubmit={handleUpdateWebsite} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] uppercase text-slate-550 mb-1">Brand Title Slug</label>
                <input 
                  type="text" value={webTitle} onChange={e => setWebTitle(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-550 mb-1">Meta Description</label>
                <textarea 
                  value={webDesc} onChange={e => setWebDesc(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-550 mb-1">Primary Color</label>
                  <select 
                    value={accentColor} onChange={e => setAccentColor(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-lg cursor-pointer font-bold"
                  >
                    <option value="indigo">💜 Indigo Accent</option>
                    <option value="emerald">💚 Emerald Mint</option>
                    <option value="sky">💙 Sky Ocean</option>
                    <option value="rose">💖 Rose Cyberpunk</option>
                    <option value="slate">🖤 Classic Slate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-550 mb-1">Canvas Style</label>
                  <button 
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className={cn(
                      "w-full p-2 border rounded-lg text-center cursor-pointer transition-colors font-bold",
                      darkMode ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-800 border-slate-200"
                    )}
                  >
                    {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wide rounded-lg flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                Compile Brand Specification
              </button>
            </form>
          </div>
        </div>

        {/* VISUAL BUILDER LIVING CONTAINER */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Builder Top Bar Bar */}
          <div className="bg-slate-950 text-white/90 p-4 border-b border-indigo-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-mono font-bold text-slate-450 ml-2 select-none">
                PREVIEW: {workspace.subdomain}.esmarc.app
              </span>
            </div>
            <div className="flex bg-slate-900/50 rounded-lg p-0.5 border border-slate-800 shrink-0 text-[10px] font-bold">
              <button 
                className={cn("px-2.5 py-1 rounded cursor-pointer", activePreviewTab === 'home' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400')}
                onClick={() => setActivePreviewTab('home')}
              >
                Homepage
              </button>
              {(isModuleActive('shopping_cart') || isModuleActive('menu_ordering')) && (
                <button 
                  className={cn("px-2.5 py-1 rounded cursor-pointer", activePreviewTab === 'catalog' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400')}
                  onClick={() => setActivePreviewTab('catalog')}
                >
                  Products / Menu
                </button>
              )}
              {isModuleActive('patient_scheduling') && (
                <button 
                  className={cn("px-2.5 py-1 rounded cursor-pointer", activePreviewTab === 'booking' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400')}
                  onClick={() => setActivePreviewTab('booking')}
                >
                  Appointments
                </button>
              )}
              {isModuleActive('blogging') && (
                <button 
                  className={cn("px-2.5 py-1 rounded cursor-pointer", activePreviewTab === 'blog' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400')}
                  onClick={() => setActivePreviewTab('blog')}
                >
                  Articles
                </button>
              )}
              {isModuleActive('live_community') && (
                <button 
                  className={cn("px-2.5 py-1 rounded cursor-pointer", activePreviewTab === 'forum' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400')}
                  onClick={() => setActivePreviewTab('forum')}
                >
                  Community
                </button>
              )}
            </div>
          </div>

          {/* DYNAMIC FRAMEWORK CONTAINER DISPLAY */}
          <div className={cn(
            "flex-1 p-8 duration-300 flex flex-col",
            darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
          )}>
            
            {/* Website Home Spec */}
            {activePreviewTab === 'home' && (
              <div className="flex-1 flex flex-col justify-between space-y-12">
                <div className="space-y-6 max-w-2xl">
                  {/* Hero Header */}
                  <div className="space-y-3">
                    <span className={cn("text-xs font-bold uppercase tracking-wider block", activeText)}>
                      Welcome to {website.title || 'Brand Concept'}
                    </span>
                    <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                      {heroHeading || 'Pioneering Dynamic Multi-Module Experiences'}
                    </h2>
                    <p className={darkMode ? 'text-slate-400 text-sm font-medium' : 'text-slate-600 text-sm font-medium'}>
                      {heroSub || 'Adjust accent colors, toggle modular pages, check online order checkout logs immediately.'}
                    </p>
                  </div>

                  {/* Call to actions based on modules */}
                  <div className="flex flex-wrap gap-3">
                    {isModuleActive('ar_viewer') && (
                      <button 
                        onClick={() => setShowArModal(true)}
                        className={cn("px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm", activeColor)}
                      >
                        <Cpu className="w-4 h-4 animate-pulse" /> Launch Spatial AR 3D Viewport
                      </button>
                    )}
                    {isModuleActive('shopping_cart') && (
                      <button 
                        onClick={() => setActivePreviewTab('catalog')}
                        className="px-4 py-2.5 bg-slate-900 border border-slate-750 text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wide rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        Browse Digital Store ➔
                      </button>
                    )}
                  </div>
                </div>

                {/* dynamic bento module grid indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-slate-800/20 pt-8">
                  <div className="p-4 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-1">
                    <h4 className="font-bold text-xs uppercase tracking-wider">Workspace isolation engine</h4>
                    <p className="text-[11px] opacity-70">Strictly enforcing row filtering inside SQL queries using tenant uuid key parameters.</p>
                  </div>
                  <div className="p-4 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-1">
                    <h4 className="font-bold text-xs uppercase tracking-wider">Enabled Module Blocks</h4>
                    <p className="text-[11px] opacity-70">
                      Active: {modules.filter((m: any) => m.is_enabled).map((m: any) => m.module_key).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog / Products / Ordering View */}
            {activePreviewTab === 'catalog' && (
              <div className="space-y-8 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide">
                      {isModuleActive('menu_ordering') ? '🍴 Fresh Kitchen Dishes' : '🛒 Shop Products Catalog'}
                    </h3>
                    <p className="text-xs opacity-75">Select items to place orders persistently inside the tenant order logs ledger.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map(p => (
                      <div key={p.id} className="p-4 rounded-xl border flex flex-col justify-between shadow-sm bg-[#505050]/5">
                        <img 
                          src={p.image_url} 
                          alt={p.name} 
                          referrerPolicy="no-referrer"
                          className="h-32 w-full object-cover rounded-lg mb-3"
                        />
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-sm tracking-tight">{p.name}</h4>
                            <span className="font-mono font-bold text-xs">{`$${p.price.toFixed(2)}`}</span>
                          </div>
                          <p className="text-[11px] opacity-70 mt-1 line-clamp-2 h-8">{p.description}</p>
                        </div>
                        <button 
                          onClick={() => addToCart(p)}
                          className={cn("w-full py-1.5 text-white rounded text-[10px] font-black uppercase tracking-wider mt-3 cursor-pointer", activeColor)}
                        >
                          + Add item to checkout
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart & Checkout block */}
                {cartItems.length > 0 && (
                  <div className="mt-8 border-t-2 border-dashed border-slate-500/20 pt-6 space-y-4 max-w-md">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" />
                      <h4 className="font-bold text-sm uppercase tracking-wide">Checkout Order List</h4>
                    </div>
                    <div className="space-y-1 text-xs font-semibold">
                      {cartItems.map((item, ip) => (
                        <div key={ip} className="flex justify-between">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-mono">{`$${(item.price * item.quantity).toFixed(2)}`}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleCheckout} className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" placeholder="Full name" required value={checkoutName} onChange={e => setCheckoutName(e.target.value)}
                          className="w-full bg-slate-500/10 border p-1 rounded font-bold text-xs"
                        />
                        <input 
                          type="email" placeholder="Email" required value={checkoutEmail} onChange={e => setCheckoutEmail(e.target.value)}
                          className="w-full bg-slate-500/10 border p-1 rounded font-bold text-xs"
                        />
                      </div>
                      <button type="submit" className="w-full py-1.5 bg-slate-900 border text-white font-extrabold uppercase rounded text-[10px] cursor-pointer">Place Persistent Order ({`$${cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}`})</button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Doctor Booking Appointment Calendar */}
            {activePreviewTab === 'booking' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" /> Book Specialist Consulting Appointment
                    </h3>
                    <p className="text-xs opacity-75">Check in directly with {workspace.owner_name} and schedule private patient consult sessions.</p>
                  </div>

                  <form onSubmit={handleBookAppt} className="space-y-4 max-w-md text-xs font-bold text-slate-800">
                    <div>
                      <label className="block text-[10px] uppercase opacity-75 mb-1">Patient Full Name</label>
                      <input 
                        type="text" required placeholder="Patient Name" value={bookingPatient} onChange={e => setBookingPatient(e.target.value)}
                        className="w-full bg-slate-500/5 border p-2 rounded-lg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase opacity-75 mb-1">Assigned Doctor Counselor</label>
                        <input 
                          type="text" disabled value={workspace.owner_name}
                          className="w-full bg-slate-500/10 border p-2 rounded-lg font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase opacity-75 mb-1">Choose Scheduled Date</label>
                        <input 
                          type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                          className="w-full bg-slate-500/5 border p-2 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase opacity-75 mb-1">Pre-clinical symptoms checklist / Notes</label>
                      <textarea 
                        placeholder="Detail any diagnostic prerequisites or specific issues..." value={bookingNotes} onChange={e => setBookingNotes(e.target.value)}
                        className="w-full bg-slate-500/5 border p-2 rounded-lg h-16 resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className={cn("w-full py-2.5 text-white font-extrabold uppercase text-xs tracking-wider rounded-lg shadow cursor-pointer", activeColor)}
                    >
                      Process Persistent Booking
                    </button>
                  </form>
                </div>

                {/* Appointment lists */}
                <div className="border-t border-dashed border-slate-500/20 pt-6">
                  <h4 className="font-extrabold text-xs uppercase tracking-wide mb-3">Live Consulting Schedule Ledger</h4>
                  <div className="space-y-2">
                    {appointments.map(appt => (
                      <div key={appt.id} className="p-3 bg-slate-500/5 rounded-lg border border-slate-500/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-205">{appt.patient_name}</span>
                          <span className="opacity-75 block text-[10px]">Attending: {appt.doctor_name} ➔ Key notes: "{appt.notes}"</span>
                        </div>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-150 text-amber-900 border border-amber-200">
                          {appt.scheduled_at.split('T')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Syllabus School Curriculum List */}
            {activePreviewTab === 'catalog' && isModuleActive('course_enrollment') && (
              <div className="space-y-6 border-t border-dashed border-slate-500/10 pt-8 animate-in fade-in">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#4F46E5]" /> Academy Curriculum & Syllabuses
                  </h3>
                  <p className="text-xs opacity-75">Master technical courses and bootcamp tracks coordinated by staff professors.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <div key={course.id} className="p-4 bg-slate-500/5 rounded-xl border border-slate-500/10 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase py-0.5 px-2 rounded bg-indigo-50 border border-indigo-200 text-indigo-800">
                          Duration: {course.duration_weeks} Weeks
                        </span>
                        <h4 className="font-extrabold text-sm tracking-tight pt-1">{course.title}</h4>
                        <p className="text-[11px] opacity-75">Led by {course.instructor || 'Staff Professor'}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-500/10 flex items-center justify-between">
                        <span className="font-mono text-xs font-black">{course.price > 0 ? `$${course.price.toFixed(2)}` : 'Full Scholarship'}</span>
                        <button 
                          onClick={() => setMsg(`Syllabus registration logged for ${course.title}!`)}
                          className={cn("px-3 py-1.5 text-white font-bold rounded text-[9px] uppercase tracking-wide cursor-pointer", activeColor)}
                        >
                          Secure Enrollment Hook
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Post / Editorial Press posts */}
            {activePreviewTab === 'blog' && (
              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wide">✍️ Editorial Press & Publications</h3>
                  <p className="text-xs opacity-75">Check reviews, technical releases, and research updates published by our chief editors.</p>
                </div>

                <div className="space-y-4">
                  {blogPosts.map(post => (
                    <div key={post.id} className="p-5 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-2 font-medium">
                      <img 
                        src={post.image_url} 
                        alt="Article Cover" 
                        referrerPolicy="no-referrer"
                        className="h-44 w-full object-cover rounded-lg mb-2"
                      />
                      <h4 className="text-base font-extrabold tracking-tight pt-1">{post.title}</h4>
                      <p className="text-xs italic opacity-75 h-16">{post.summary}</p>
                      <p className="text-xs opacity-80 leading-relaxed font-normal">{post.content}</p>
                      <div className="text-[10px] font-bold opacity-60 flex gap-4 pt-2">
                        <span>By {post.author}</span>
                        <span>Published persistently under {workspace.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cooperative live community chat threads */}
            {activePreviewTab === 'forum' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide flex items-center gap-1.5">
                      <MessageSquare className="w-5 h-5 text-indigo-500" /> Cooperative Forum Logs
                    </h3>
                    <p className="text-xs opacity-75">Exchange queries and review developer commits on our decentralized live board.</p>
                  </div>

                  <form onSubmit={handleBroadPost} className="space-y-3 pt-2 max-w-sm text-xs font-bold text-slate-805">
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" required placeholder="Display Alias" value={forumUser} onChange={e => setForumUser(e.target.value)}
                        className="w-full bg-slate-500/5 border p-2 rounded-lg"
                      />
                      <input 
                        type="text" required placeholder="Topic Title" value={forumTitle} onChange={e => setForumTitle(e.target.value)}
                        className="w-full bg-slate-500/5 border p-2 rounded-lg"
                      />
                    </div>
                    <textarea 
                      required placeholder="Write a broadcast message thread..." value={forumMsg} onChange={e => setForumMsg(e.target.value)}
                      className="w-full bg-slate-500/5 border p-2 rounded-lg h-16 resize-none"
                    />
                    <button 
                      type="submit"
                      className={cn("w-full py-2.5 text-white font-extrabold uppercase text-xs tracking-wider rounded-lg shadow-sm cursor-pointer", activeColor)}
                    >
                      Publish Broadcast Comment
                    </button>
                  </form>
                </div>

                {/* Forum posts list */}
                <div className="border-t border-dashed border-slate-500/10 pt-6">
                  <div className="space-y-3">
                    {communityPosts.map(post => (
                      <div key={post.id} className="p-4 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono bg-indigo-50 text-indigo-805 border border-indigo-200 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wide">
                            @{post.author}
                          </span>
                          <span className="opacity-70 font-mono text-[9px]">{post.created_at?.split('T')[0]}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-105">{post.title}</h5>
                        <p className="opacity-80 font-normal leading-relaxed">{post.content}</p>
                        
                        <div className="pt-2 flex items-center justify-between">
                          <button 
                            onClick={() => likePost(post.id)}
                            className="flex items-center gap-1 opacity-70 hover:opacity-100 text-indigo-600 font-extrabold cursor-pointer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> Likes: {post.likes}
                          </button>
                          <span className="text-[10px] opacity-50 font-mono">Scope key: {workspaceId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Spatial 3D AR simulation modal */}
      {showArModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-950 text-white rounded-xl border border-indigo-500/30 overflow-hidden w-full max-w-lg p-6 space-y-6 hover:border-indigo-500/50 transition-colors shadow-2xl">
            <div className="flex justify-between items-center border-b border-indigo-950 pb-3">
              <span className="flex items-center gap-2 text-indigo-400 font-black tracking-widest text-xs uppercase animate-pulse">
                <Cpu className="w-4 h-4" /> Spatial AR Model Viewport
              </span>
              <button onClick={() => setShowArModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>
            
            <div className="h-64 bg-[#0A0B10] border border-indigo-950 rounded-xl relative overflow-hidden flex flex-col items-center justify-center text-center p-4">
              {/* simulated 3D model grid */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent"></div>
              <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full animate-ping absolute opacity-30"></div>
              
              <Sparkles className="w-12 h-12 text-indigo-500 animate-pulse relative z-10" />
              <h4 className="font-mono text-xs font-bold mt-4 tracking-wider uppercase relative z-10">Vector Spatial Poly Mesh online</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1 relative z-10">Simulating real-time WebGL rendering viewport. Connect spatial iOS/Android camera views for full room scaling capabilities.</p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-indigo-950 pt-4">
              <span>Tenant Scope Ref: {workspaceId}</span>
              <span>Model rendering at 90FPS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Platform Sub-routers ---
function DefaultAdminView({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center justify-center h-[55vh] text-center bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-4 text-slate-400 select-none">
        <Sliders className="w-5 h-5 text-indigo-505 text-indigo-500" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
      <p className="text-slate-500 text-xs max-w-sm">{desc}</p>
    </div>
  );
}

// --- Pure routing entry point ---
export default function App() {
  const [viewMode, setViewMode] = useState<'super_admin' | 'workspace_owner'>('workspace_owner');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');

  const loadWorkspaces = () => {
    fetch('/api/v1/workspaces')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setWorkspaces(d.data || []);
          if (d.data?.length > 0) {
            setSelectedWorkspaceId(d.data[0].id);
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return (
    <BrowserRouter>
      <DashboardLayout 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        workspaces={workspaces}
        selectedWorkspaceId={selectedWorkspaceId}
        setSelectedWorkspaceId={setSelectedWorkspaceId}
      >
        <Routes>
          {viewMode === 'super_admin' ? (
            <>
              <Route path="/" element={<PlatformDashboard workspaces={workspaces} reloadWorkspaces={loadWorkspaces} />} />
              <Route path="/workspaces" element={<PlatformDashboard workspaces={workspaces} reloadWorkspaces={loadWorkspaces} />} />
              <Route path="/audit" element={<AuditLogViewer />} />
              <Route path="*" element={<PlatformDashboard workspaces={workspaces} reloadWorkspaces={loadWorkspaces} />} />
            </>
          ) : (
            <>
              <Route path="/" element={<WorkspaceSiteBuilder workspaceId={selectedWorkspaceId} setViewMode={setViewMode} />} />
              <Route path="*" element={<WorkspaceSiteBuilder workspaceId={selectedWorkspaceId} setViewMode={setViewMode} />} />
            </>
          )}
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}
