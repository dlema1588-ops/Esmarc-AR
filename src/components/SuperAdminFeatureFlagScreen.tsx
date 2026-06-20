import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Beaker, Plus, Settings, ShieldAlert, Sparkles, Building, Briefcase
} from 'lucide-react';
import { Feature, FeatureStatus, FeatureVisibility, SubscriptionTier } from '../types/saas.types';

export default function SuperAdminFeatureFlagScreen() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Create state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<FeatureStatus>('enabled');
  const [newVisibility, setNewVisibility] = useState<FeatureVisibility>('public');
  const [newTier, setNewTier] = useState<SubscriptionTier>('free');
  const [newIsBeta, setNewIsBeta] = useState(false);

  // Shop Override State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideShopId, setOverrideShopId] = useState('');
  const [overrideFeatureId, setOverrideFeatureId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<FeatureStatus>('enabled');
  const [overrideConfig, setOverrideConfig] = useState('{"ar_enabled": true}');

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = () => {
    setLoading(true);
    fetch('/api/v1/saas/features')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setFeatures(d.data || []);
        } else {
          setMessage('Failed to load features: ' + d.message);
        }
      })
      .catch(err => setMessage('Error calling API: ' + err.message))
      .finally(() => setLoading(false));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      key: newKey,
      name: newName,
      description: newDesc,
      status: newStatus,
      visibility: newVisibility,
      required_tier: newTier,
      is_beta: newIsBeta
    };

    fetch('/api/v1/saas/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMessage('Feature created successfully!');
          setShowCreateModal(false);
          loadFeatures();
          // Reset
          setNewKey('');
          setNewName('');
          setNewDesc('');
        } else {
          alert('Failed to create: ' + d.message);
        }
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const updateStatus = (id: string, status: FeatureStatus) => {
    fetch(`/api/v1/saas/features/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          loadFeatures();
          setMessage('Status updated successfully');
        } else {
          alert('Failed: ' + d.message);
        }
      });
  };

  const updateTier = (id: string, required_tier: SubscriptionTier) => {
    fetch(`/api/v1/saas/features/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ required_tier })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          loadFeatures();
          setMessage('Tier changed successfully');
        }
      });
  };

  const triggerShopOverride = (e: React.FormEvent) => {
    e.preventDefault();
    let configObj = {};
    try {
      configObj = JSON.parse(overrideConfig);
    } catch (err) {
      alert('Invalid config JSON');
      return;
    }

    fetch(`/api/v1/saas/shop-features/${overrideFeatureId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-shop-id': overrideShopId
      },
      body: JSON.stringify({
        status: overrideStatus,
        config_values: configObj
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          alert('Shop feature override assigned successfully!');
          setShowOverrideModal(false);
        } else {
          alert('Failed: ' + d.message);
        }
      });
  };

  const getStatusBadge = (status: FeatureStatus) => {
    switch (status) {
      case 'enabled':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Enabled</span>;
      case 'disabled':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"><XCircle className="w-3.5 h-3.5" /> Disabled</span>;
      case 'coming_soon':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Coming Soon</span>;
      case 'beta':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"><Beaker className="w-3.5 h-3.5" /> Beta</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            SaaS Feature Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Control multi-tenant capability maps, visibility parameters, and customer-specific tier structures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowOverrideModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Building className="w-4 h-4" />
            Shop Override
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Feature
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 mb-6 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Key / Identifier</th>
                <th className="px-6 py-4">Feature Name</th>
                <th className="px-6 py-4">Required Tier</th>
                <th className="px-6 py-4">Status Map</th>
                <th className="px-6 py-4 text-right">Interactive Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {features.map((feature) => (
                <tr key={feature.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-800 font-semibold">{feature.key}</span>
                    {feature.is_beta && (
                      <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase border border-indigo-200 bg-indigo-50 text-indigo-700 rounded">BETA</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{feature.name}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{feature.description || 'No summary'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={feature.required_tier}
                      onChange={(e) => updateTier(feature.id, e.target.value as SubscriptionTier)}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="free">Free Tier</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro Plan</option>
                      <option value="business">Business</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(feature.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => updateStatus(feature.id, 'enabled')}
                        className="px-2 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded hover:bg-emerald-100 cursor-pointer"
                      >
                        Enable
                      </button>
                      <button 
                        onClick={() => updateStatus(feature.id, 'coming_soon')}
                        className="px-2 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded hover:bg-amber-100 cursor-pointer"
                      >
                        Coming Soon
                      </button>
                      <button 
                        onClick={() => updateStatus(feature.id, 'beta')}
                        className="px-2 py-1 bg-indigo-50 text-indigo-800 text-xs font-semibold rounded hover:bg-indigo-100 cursor-pointer"
                      >
                        Beta
                      </button>
                      <button 
                        onClick={() => updateStatus(feature.id, 'disabled')}
                        className="px-2 py-1 bg-rose-50 text-rose-800 text-xs font-semibold rounded hover:bg-rose-100 cursor-pointer"
                      >
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE FEATURE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-150">
              <h3 className="text-lg font-bold text-slate-900">Register New SaaS Feature</h3>
              <p className="text-slate-400 text-xs mt-1">Introduces a global feature module controllable across all tenants.</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Feature Key (Unique lowercase identifier)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. clinic_mode"
                    value={newKey}
                    onChange={e => setNewKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Feature Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Clinic Records Management"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Description</label>
                  <textarea 
                    placeholder="Provide a functional overview of this module..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-indigo-500 h-20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Status</label>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value as FeatureStatus)} className="w-full text-sm px-3 py-2 border border-slate-200 bg-white rounded-lg">
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                      <option value="coming_soon">Coming Soon</option>
                      <option value="beta">Beta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Min. Required Tier</label>
                    <select value={newTier} onChange={e => setNewTier(e.target.value as SubscriptionTier)} className="w-full text-sm px-3 py-2 border border-slate-200 bg-white rounded-lg">
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="business">Business</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_beta" 
                    checked={newIsBeta}
                    onChange={e => setNewIsBeta(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="is_beta" className="text-sm font-semibold text-slate-700">Flag as Premium Alpha/Beta Testing Feature</label>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm cursor-pointer hover:bg-indigo-700"
                >
                  Register Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERRIDE SHOP FEATURES MODAL */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-150">
              <h3 className="text-lg font-bold text-slate-900">Custom Shop Feature Override</h3>
              <p className="text-slate-400 text-xs mt-1">Force-activate/deactivate specific flags for an individual host merchant.</p>
            </div>
            <form onSubmit={triggerShopOverride}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Target Shop ID (UUID format)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. s1"
                    value={overrideShopId}
                    onChange={e => setOverrideShopId(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Feature Scope</label>
                  <select 
                    required
                    value={overrideFeatureId}
                    onChange={e => setOverrideFeatureId(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 bg-white rounded-lg"
                  >
                    <option value="">-- Choose Module --</option>
                    {features.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.key})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Overridden Status</label>
                  <select value={overrideStatus} onChange={e => setOverrideStatus(e.target.value as FeatureStatus)} className="w-full text-sm px-3 py-2 border border-slate-200 bg-white rounded-lg overflow-x-hidden">
                    <option value="enabled">Enabled (Overridden)</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="beta">Beta (White-labeled)</option>
                    <option value="disabled">Disabled (Overridden)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Custom Settings Parameter Values (JSON notation)</label>
                  <textarea 
                    value={overrideConfig}
                    onChange={e => setOverrideConfig(e.target.value)}
                    className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-indigo-500 h-24"
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 cursor-pointer"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
