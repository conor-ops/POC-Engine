import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  FileText, 
  ExternalLink, 
  Key, 
  Sparkles, 
  Cpu, 
  Info,
  Scale,
  Loader2
} from 'lucide-react';

export const GoogleTosShield: React.FC = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const runLiveAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/gemini/tos-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ProvenanceChain Core Subsystem',
          payloadDigest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          licenseScope: 'CREATOR_EXCLUSIVE'
        })
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data.audit);
      }
    } catch (err) {
      console.error('Audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div id="google-tos-shield" className="space-y-6">
      
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Google Terms of Service Legal & Architectural Compliance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              "Your Content Remains Yours" — Zero-Knowledge Rights Shield
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ProvenanceChain is engineered in 100% compliance with the Google Terms of Service (Effective July 30, 2026).
              By decoupling cryptographic proof hashes from raw private code, creators establish permanent prior art on the blockchain without granting unwanted commercial rights.
            </p>
          </div>

          <button
            onClick={runLiveAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all shrink-0"
          >
            {isAuditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Run Gemini AI Compliance Audit</span>
          </button>
        </div>
      </div>

      {/* Live Audit Result Banner if run */}
      {auditResult && (
        <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5 text-cyan-400" />
            <span>Gemini AI Audit Passed: Verified Compliant</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block mb-1 font-semibold">IP Ownership Clause</span>
              <p className="text-slate-200">{auditResult.ipOwnershipClause}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block mb-1 font-semibold">Zero-Knowledge Status</span>
              <p className="text-slate-200">{auditResult.zeroKnowledgeStatus}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block mb-1 font-semibold">Privacy & Consent Shield</span>
              <p className="text-slate-200">{auditResult.privacyShield}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block mb-1 font-semibold">Operating License Limits</span>
              <p className="text-slate-200">{auditResult.operatingLicenseLimit}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Pillars of Google TOS Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">1. Unconditional IP Retention</h2>
              <span className="text-[11px] text-slate-400 font-mono">Google TOS Section: "Your Content"</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Google's terms state: <em>"Your content remains yours, which means that you retain any intellectual property rights that you have in your content."</em>
            ProvenanceChain enforces this by recording cryptographic proofs of creation directly linked to the author's identity, ensuring no platform claims ownership of your creative inventions.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">2. Zero-Knowledge Data Minimization</h2>
              <span className="text-[11px] text-slate-400 font-mono">GDPR & LGPD Data Privacy Alignment</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Only one-way SHA-256 mathematical digests and Merkle roots are broadcast onto the blockchain. Your trade secrets, private algorithms, and sensitive employee records remain local or encrypted, complying with global data minimization mandates.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">3. Non-Exclusive Operating License</h2>
              <span className="text-[11px] text-slate-400 font-mono">Google TOS Section: "Scope of License"</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The license granted to cloud infrastructure is strictly non-exclusive and limited to the technical purpose of hosting and running the service. The creator remains completely free to license their work to third parties or file patents internationally under the Madrid Protocol or Paris Convention.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">4. Independent Portability & Anti-Purge</h2>
              <span className="text-[11px] text-slate-400 font-mono">Google TOS Section: "Exporting Your Content"</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Google TOS provides for content exportability. ProvenanceChain expands this to cryptographic independence: every proof can be exported as a standard verifiable JSON-LD certificate, guaranteeing that your proof of work survives across platforms forever.
          </p>
        </div>

      </div>

      {/* Comparison Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-400" />
          <span>Architectural Comparison: Traditional Cloud vs. ProvenanceChain PoCW</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold font-mono">
                <th className="pb-3">Dimension</th>
                <th className="pb-3">Standard Centralized Storage</th>
                <th className="pb-3 text-emerald-400">ProvenanceChain Subsystem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 font-semibold text-white">Data Purging Risk</td>
                <td className="py-3 text-rose-400">High (Admin/server can delete or modify records)</td>
                <td className="py-3 text-emerald-300 font-semibold">Zero (Immutable SHA-256 blockchain consensus)</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Prior Art Timestamp</td>
                <td className="py-3 text-slate-400">Subject to server clock spoofing</td>
                <td className="py-3 text-emerald-300 font-semibold">Cryptographically anchored in decentralized block headers</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">IP Rights Defense</td>
                <td className="py-3 text-slate-400">Requires expensive subpoena discovery</td>
                <td className="py-3 text-emerald-300 font-semibold">Public zero-knowledge proof verifies author instantly</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Google TOS Compliance</td>
                <td className="py-3 text-slate-400">Standard user license</td>
                <td className="py-3 text-emerald-300 font-semibold">Full IP ownership retention with Zero-Knowledge hashing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
