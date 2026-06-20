import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Terminal, RefreshCw, Eye
} from 'lucide-react';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = () => {
    setLoading(true);
    fetch('/api/v1/saas/audit')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          // Sort by date newest first
          setLogs(d.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const getSeverityBadge = (log: any) => {
    // If security event has explicit severity:
    const sev = log.severity || 'low';
    if (log.type === 'security' || sev === 'high' || sev === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-800 border border-rose-100">
          <ShieldAlert className="w-3 h-3 animate-bounce" /> {sev.toUpperCase()} SEC
        </span>
      );
    }
    if (log.type === 'audit') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-50 border text-slate-700 font-bold">
          AUDIT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold uppercase font-mono">
        ACTIVE
      </span>
    );
  };

  const filteredLogs = moduleFilter === 'all' 
    ? logs 
    : logs.filter(l => l.module === moduleFilter || l.type === moduleFilter);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-800" />
            Audit Ledger & Security Logs
          </h2>
          <p className="text-slate-500 text-xs mt-1">Immutable SaaS system, feature toggles, login authorizations, and multi-tenant telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={moduleFilter} 
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold cursor-pointer"
          >
            <option value="all">-- All Activity Types --</option>
            <option value="features">Features Activity</option>
            <option value="settings">Platform Settings updates</option>
            <option value="security">Security incidents</option>
            <option value="audit">Admin audits</option>
          </select>
          <button 
            onClick={loadAuditLogs}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg transition-transform cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-12 border border-slate-150 border-dashed rounded-xl text-center text-slate-400 text-xs font-semibold">
              No matching activity events logged in current session container.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">
                        {log.action || `Audit: Modified ${log.module || 'System'}`}
                      </span>
                      {getSeverityBadge(log)}
                    </div>
                    <div className="text-xs text-slate-450 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Module: <strong className="font-mono text-slate-600">{log.module || 'Default'}</strong></span>
                      {log.shop_id && (
                        <span>Shop Key: <strong className="font-mono bg-slate-200/50 text-slate-700 px-1 rounded">{log.shop_id}</strong></span>
                      )}
                      {log.actor_id && (
                        <span>Actor ID: <strong className="font-mono text-slate-500">{log.actor_id.substring(0, 8)}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] font-mono text-slate-405 font-bold">
                    {new Date(log.created_at || Date.now()).toLocaleTimeString()}
                  </span>
                  <div className="bg-slate-200/50 hover:bg-slate-200 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-slate-600 cursor-help mt-1 flex items-center gap-1 max-w-[200px] truncate" title={JSON.stringify(log.new_state || log.details || {})}>
                    <Eye className="w-3 h-3" /> State Payload: {JSON.stringify(log.new_state || log.details || {}).substring(0, 20)}...
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
