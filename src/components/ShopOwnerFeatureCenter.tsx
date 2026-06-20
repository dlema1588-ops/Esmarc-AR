import React, { useState, useEffect } from 'react';
import { 
  Check, Lock, ArrowUpRight, Cpu, Link2, Image, Sparkles, Navigation, Layers, RefreshCw, Send, Trash2, Code, ShieldCheck
} from 'lucide-react';
import { Feature, FeatureStatus, Integration, AIAgent, MediaAsset, Location, Job } from '../types/saas.types';

export default function ShopOwnerFeatureCenter() {
  const [activeTab, setActiveTab] = useState<'apps' | 'integrations' | 'ai' | 'media' | 'ar' | 'maps' | 'jobs'>('apps');
  const [currentPlan, setCurrentPlan] = useState<'free' | 'starter' | 'pro' | 'business' | 'enterprise'>('starter');
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Loaded integrations
  const [integrations, setIntegrations] = useState<any[]>([]);
  
  // AI states
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [selectedAgentProvider, setSelectedAgentProvider] = useState('gemini');
  const [agentInstructions, setAgentInstructions] = useState('Greet the shopper and recommend best-selling products depending on their clicks.');
  const [agentName, setAgentName] = useState('Concierge bot');

  // Media States
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadName, setUploadName] = useState('hero_homepage.mp4');
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'audio' | 'document'>('video');

  // Map locations
  const [locations, setLocations] = useState<Location[]>([]);
  const [locName, setLocName] = useState('Highstreet Store');
  const [locAddress, setLocAddress] = useState('42 Broad Street');
  const [locCity, setLocCity] = useState('London');
  const [locLat, setLocLat] = useState(51.5074);
  const [locLng, setLocLng] = useState(-0.1278);

  // Background Jobs
  const [jobs, setJobs] = useState<Job[]>([]);

  const shopId = 's1'; // Standard simulated shop scope

  useEffect(() => {
    loadAllSaaSMaterials();
  }, [currentPlan]);

  const loadAllSaaSMaterials = () => {
    setLoading(true);
    setMsg('');
    Promise.all([
      fetch(`/api/v1/saas/shop-features`, { headers: { 'x-shop-id': shopId } }).then(r => r.json()),
      fetch(`/api/v1/saas/integrations`, { headers: { 'x-shop-id': shopId } }).then(r => r.json()),
      fetch(`/api/v1/saas/ai/agents`, { headers: { 'x-shop-id': shopId } }).then(r => r.json()),
      fetch(`/api/v1/saas/media`, { headers: { 'x-shop-id': shopId } }).then(r => r.json()),
      fetch(`/api/v1/saas/locations`, { headers: { 'x-shop-id': shopId } }).then(r => r.json()),
      fetch(`/api/v1/saas/jobs`, { headers: { 'x-shop-id': shopId } }).then(r => r.json())
    ])
      .then(([fRes, iRes, aiRes, mRes, lRes, jRes]) => {
        if (fRes.success) setFeatures(fRes.data || []);
        if (iRes.success) setIntegrations(iRes.data || []);
        if (aiRes.success) setAiAgents(aiRes.data || []);
        if (mRes.success) setMediaAssets(mRes.data || []);
        if (lRes.success) setLocations(lRes.data || []);
        if (jRes.success) setJobs(jRes.data || []);
      })
      .catch(err => setMsg('Error connecting: ' + err.message))
      .finally(() => setLoading(false));
  };

  // Helper to check if a feature is locked in the shop's current plan tier
  const isFeatureLocked = (featReqTier: string) => {
    const tiers = ['free', 'starter', 'pro', 'business', 'enterprise'];
    const currentIdx = tiers.indexOf(currentPlan);
    const reqIdx = tiers.indexOf(featReqTier);
    return reqIdx > currentIdx;
  };

  const promotePlan = () => {
    const tiers: any[] = ['free', 'starter', 'pro', 'business', 'enterprise'];
    const idx = tiers.indexOf(currentPlan);
    if (idx < tiers.length - 1) {
      setCurrentPlan(tiers[idx + 1]);
      setMsg(`Upgraded plan successfully! Enjoy your new core functionalities.`);
    } else {
      setCurrentPlan('free');
      setMsg(`Reset plan back to Free tier for evaluation.`);
    }
  };

  const getStatusBadge = (feat: any) => {
    const isLocked = isFeatureLocked(feat.required_tier);
    if (isLocked) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-100">
          <Lock className="w-3 h-3" /> Lock (Requires {feat.required_tier.toUpperCase()})
        </span>
      );
    }
    
    switch (feat.status) {
      case 'enabled':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">● Active</span>;
      case 'disabled':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">● Off</span>;
      case 'coming_soon':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">● Coming Soon</span>;
      case 'beta':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-150 text-indigo-800">● Premium Beta</span>;
    }
  };

  // 1. Integration toggle
  const toggleIntegrationState = (providerId: string, currentEnabled: boolean, providerKey: string) => {
    fetch(`/api/v1/saas/integrations/${providerId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-shop-id': shopId
      },
      body: JSON.stringify({
        is_enabled: !currentEnabled,
        config: { mock_key: `v1_test_param_${providerKey}` }
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          loadAllSaaSMaterials();
          setMsg(`Toggled integration client for ${providerKey}!`);
        }
      });
  };

  // 2. AI Agent add
  const addAIAgentRecord = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/v1/saas/ai/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shop-id': shopId
      },
      body: JSON.stringify({
        provider_id: 'ai1-placeholder-id-uuid-real-or-test', // will fallback robustly
        name: agentName,
        agent_type: 'customer_service',
        system_instructions: agentInstructions,
        temperature: 0.7,
        max_output_tokens: 1500
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Autonomous AI agent configured with fine-tuning constraints!');
          setAgentName('');
          loadAllSaaSMaterials();
        } else {
          alert('Failed to register: ' + d.message);
        }
      });
  };

  // 3. Media Metadata Upload Trigger
  const simulateUploadMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) {
      alert('Provide a file storage URL first');
      return;
    }
    fetch(`/api/v1/saas/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shop-id': shopId
      },
      body: JSON.stringify({
        asset_type: uploadType,
        name: uploadName,
        size_bytes: 48512202,
        mime_type: uploadType === 'video' ? 'video/mp4' : 'image/png',
        url: uploadUrl,
        metadata: { duration_seconds: 360, resolution: '4K HD stream' }
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('File reference registered in spatial media catalog!');
          setUploadUrl('');
          loadAllSaaSMaterials();
        }
      });
  };

  // 4. Map Location Pin Add
  const addBranchLocation = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/v1/saas/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shop-id': shopId
      },
      body: JSON.stringify({
        name: locName,
        address_line_1: locAddress,
        city: locCity,
        country: 'United Kingdom',
        latitude: Number(locLat),
        longitude: Number(locLng)
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Custom storefront branch pin registered globally!');
          setLocName('');
          setLocAddress('');
          loadAllSaaSMaterials();
        }
      });
  };

  // 5. Background task manual queue dispatcher
  const dispatchBackgroundTask = (type: string) => {
    fetch(`/api/v1/saas/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shop-id': shopId
      },
      body: JSON.stringify({
        job_type: type,
        payload: { source: 'manual_dashboard_dispatch', timestamp: new Date().toISOString() }
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMsg('Queued back-end worker job sequence inside ESMARC scheduler!');
          loadAllSaaSMaterials();
        }
      });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      {/* Scope Details Panel */}
      <aside className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6 shrink-0 flex flex-col gap-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4F46E5] block bg-indigo-50 px-2 py-1 rounded w-fit mb-2">Merchant View</span>
          <h3 className="text-base font-bold text-slate-800">Apps & Capabilities</h3>
          <p className="text-xs text-slate-500 mt-1">Tenant ID: <span className="font-mono text-slate-700 bg-slate-200/50 px-1 rounded">{shopId}</span></p>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between h-32 shadow">
          <div className="text-xs font-semibold text-slate-400">Merchant Active Plan:</div>
          <div className="text-2xl font-black capitalize tracking-tight">{currentPlan} Tier</div>
          <button 
            onClick={promotePlan}
            className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 shadow text-white font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {[
            { id: 'apps', icon: Layers, label: 'Capabilities Map' },
            { id: 'integrations', icon: Link2, label: 'Integration Matrix' },
            { id: 'ai', icon: Cpu, label: 'AI Agent Workspace' },
            { id: 'media', icon: Image, label: 'Media & File Vault' },
            { id: 'maps', icon: Navigation, label: 'Local Places (Maps)' },
            { id: 'jobs', icon: RefreshCw, label: 'Background Brokering' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer text-left ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 border border-slate-200/80 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-450'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Panel Content */}
      <section className="flex-1 p-8 flex flex-col gap-6">
        {msg && (
          <div className="bg-[#EEF2FF] border border-blue-200 text-slate-800 p-4 rounded-lg text-xs font-semibold flex items-center justify-between">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* 1. APPLICATIONS & CORE FEATURES */}
            {activeTab === 'apps' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Registered SaaS Module Catalog</h4>
                  <p className="text-slate-500 text-xs mt-1">Below are the modules verified on the ESMARC architecture. Lock status dynamically adjusts relative to your Tier.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feat) => {
                    const locked = isFeatureLocked(feat.required_tier);
                    return (
                      <div 
                        key={feat.id} 
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          locked 
                            ? 'bg-slate-50/50 border-slate-150 text-slate-450 border-dashed'
                            : 'bg-white border-slate-200 hover:shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                              {feat.key}
                            </span>
                            {getStatusBadge(feat)}
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm">{feat.name}</h5>
                          <p className="text-xs text-slate-500 mt-1 h-8 line-clamp-2">{feat.description || 'No module details provided'}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tier req: {feat.required_tier.toUpperCase()}</span>
                          {locked ? (
                            <button
                              onClick={promotePlan}
                              className="text-xs text-[#4F46E5] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              Unlock <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Activated
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. PLUGGABLE INTEGRATION MATRIX */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Integration provider matrix</h4>
                  <p className="text-slate-500 text-xs mt-1">Link your storefront pages into third-party socials and LLMs instantly via database configs.</p>
                </div>

                <div className="space-y-3">
                  {integrations.map((item) => (
                    <div key={item.provider.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between bg-white hover:bg-slate-50/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-slate-100 text-slate-700 rounded-lg">
                          <Link2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{item.provider.name}</span>
                            <span className="bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wide">{item.provider.category}</span>
                          </div>
                          <span className="text-xs text-slate-500 block truncate font-mono mt-0.5">Key: {item.provider.provider_key}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {item.is_enabled && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded hidden sm:inline">
                            API Connected
                          </span>
                        )}
                        <button
                          onClick={() => toggleIntegrationState(item.provider.id, item.is_enabled, item.provider.provider_key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            item.is_enabled 
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent shadow'
                          }`}
                        >
                          {item.is_enabled ? 'Disconnect API' : 'Activate pipeline'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. AI AGENT ASSISTANT */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Custom Autonomous AI Agents</h4>
                  <p className="text-slate-500 text-xs mt-1">Configure automated text descriptions, sentiment parsers, or direct shop assistant chatbots.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Register Agent Form */}
                  <div className="lg:col-span-1 bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5"><Cpu className="w-4 h-4 text-indigo-600" /> Initialize agent</h5>
                    <form onSubmit={addAIAgentRecord} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Agent Friendly Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Shopping Assistant"
                          value={agentName}
                          onChange={e => setAgentName(e.target.value)}
                          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Provider Engine Mode</label>
                        <select value={selectedAgentProvider} onChange={e => setSelectedAgentProvider(e.target.value)} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2">
                          <option value="gemini">Google Gemini AI</option>
                          <option value="openai">ChatGPT Core 4o</option>
                          <option value="claude">Anthropic Claude</option>
                          <option value="esmarc_llm">ESMARC Fine-Tuned Model</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">System Instructions Prompt</label>
                        <textarea 
                          required
                          value={agentInstructions}
                          onChange={e => setAgentInstructions(e.target.value)}
                          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 h-24 resize-none"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 hover:shadow text-white font-bold rounded-lg text-xs tracking-wide uppercase cursor-pointer"
                      >
                        Deploy Agent Pipeline
                      </button>
                    </form>
                  </div>

                  {/* Active Agents Workspace */}
                  <div className="lg:col-span-2 space-y-4">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Currently Deployed Agent Blocks</h5>
                    <div className="space-y-3">
                      {aiAgents.map((agent) => (
                        <div key={agent.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-800">{agent.name}</span>
                            <span className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                              Type: {agent.agent_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-650 bg-slate-50 p-2.5 rounded-md italic font-mono">
                            "{agent.system_instructions}"
                          </p>
                          <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400">
                            <span>Temp: {agent.temperature}</span>
                            <span>Tokens cap: {agent.max_output_tokens}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MEDIA & FILE VAULT */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Spatial Media & File Vault</h4>
                  <p className="text-slate-500 text-xs mt-1">Upload files, categorize and attach rich URLs (YouTube stream reels, TikTok, image buckets) safely without overloading the DB.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Add File Schema metadata form */}
                  <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5"><Image className="w-4 h-4 text-indigo-600" /> Reference asset</h5>
                    <form onSubmit={simulateUploadMedia} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Asset Name</label>
                        <input 
                          type="text" 
                          required
                          value={uploadName}
                          onChange={e => setUploadName(e.target.value)}
                          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Media Type</label>
                        <select value={uploadType} onChange={e => setUploadType(e.target.value as any)} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2">
                          <option value="video">Video Feed (External URL)</option>
                          <option value="image">Image Asset</option>
                          <option value="audio">Audio Podcast</option>
                          <option value="document">Legal/Tax Document PDF</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Direct Storage / Embed Link URL</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. https://youtube.com/watch?v=..."
                          value={uploadUrl}
                          onChange={e => setUploadUrl(e.target.value)}
                          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs tracking-wide uppercase cursor-pointer hover:shadow"
                      >
                        Register Media Asset
                      </button>
                    </form>
                  </div>

                  {/* Vault Assets Explorer */}
                  <div className="lg:col-span-2 space-y-4">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700">Storage Metadata Ledger</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mediaAssets.map((asset) => (
                        <div key={asset.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between h-32">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">{asset.asset_type}</span>
                              <span className="text-[10px] font-mono text-slate-400">{(asset.size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                            </div>
                            <h6 className="font-bold text-sm text-slate-800 mt-2 truncate">{asset.name}</h6>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block truncate select-all">{asset.url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. LOCATIONS & MAP PLACE PINS */}
            {activeTab === 'maps' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Local Places & Geosearch coordinate database</h4>
                  <p className="text-slate-500 text-xs mt-1">Configure your physical restaurant, clinic branch, or franchise locations. Coordinates are dynamically loaded dynamically onto Google Maps, Mapbox, or ESMARC Maps.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pin branch form */}
                  <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5"><Navigation className="w-4 h-4 text-indigo-600" /> Pin coordinate</h5>
                    <form onSubmit={addBranchLocation} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Branch Name</label>
                        <input 
                          type="text" 
                          required
                          value={locName}
                          onChange={e => setLocName(e.target.value)}
                          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Address Line</label>
                        <input 
                          type="text" 
                          required
                          value={locAddress}
                          onChange={e => setLocAddress(e.target.value)}
                          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Latitude</label>
                          <input 
                            type="number" 
                            step="0.000001"
                            required
                            value={locLat}
                            onChange={e => setLocLat(Number(e.target.value))}
                            className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Longitude</label>
                          <input 
                            type="number" 
                            step="0.000001"
                            required
                            value={locLng}
                            onChange={e => setLocLng(Number(e.target.value))}
                            className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs tracking-wide uppercase cursor-pointer"
                      >
                        Pin Store Location
                      </button>
                    </form>
                  </div>

                  {/* Registered Places list */}
                  <div className="lg:col-span-2 space-y-4">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700">Currently Configured Franchise Locations</h5>
                    <div className="space-y-3">
                      {locations.map((loc) => (
                        <div key={loc.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-slate-800 block">{loc.name}</span>
                            <span className="text-xs text-slate-450 block mt-0.5">{loc.address_line_1}, {loc.city}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. BACKGROUND BROKERING SYSTEM */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Background Job Broker queue</h4>
                  <p className="text-slate-500 text-xs mt-1">Inject process alerts, trigger AI summarization tasks, automate newsletter templates, or invoke analytical calculations asynchronously.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => dispatchBackgroundTask('email_send')} className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
                    <Send className="w-4 h-4" /> Queue Newsletter Job
                  </button>
                  <button onClick={() => dispatchBackgroundTask('ai_process')} className="px-3.5 py-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
                    <Cpu className="w-4 h-4" /> Queue AI Processing Job
                  </button>
                  <button onClick={() => dispatchBackgroundTask('image_optimize')} className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
                    <Image className="w-4 h-4" /> Queue Image Optimizer
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#F1F5F9] text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5">Job UUID</th>
                        <th className="px-6 py-3.5">Type</th>
                        <th className="px-6 py-3.5">Injected Payload</th>
                        <th className="px-6 py-3.5">Queue Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-white bg-slate-50/20">
                          <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{job.id}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{job.job_type}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[9px] text-slate-450 truncate max-w-xs">{JSON.stringify(job.payload)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wide border ${
                              job.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
                                : job.status === 'running' 
                                  ? 'bg-blue-50 text-blue-800 border-blue-150 animate-pulse'
                                  : 'bg-amber-50 text-amber-805 border-amber-150'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
