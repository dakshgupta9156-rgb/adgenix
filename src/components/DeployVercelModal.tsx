import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Triangle,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  KeyRound,
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowRight,
  Globe,
} from 'lucide-react';

interface DeployVercelModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubRepoUrl?: string;
}

export const DeployVercelModal: React.FC<DeployVercelModalProps> = ({
  isOpen,
  onClose,
  githubRepoUrl = 'https://github.com/dakshgupta9156-rgb/adgenix',
}) => {
  const [vercelToken, setVercelToken] = useState('');
  const [projectName, setProjectName] = useState('adgenix');
  const [isLoading, setIsLoading] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    success: boolean;
    url?: string;
    message?: string;
    log?: string;
  } | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [activeTab, setActiveTab] = useState<'1click' | 'direct' | 'cli'>('1click');

  if (!isOpen) return null;

  const vercelCloneUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(
    githubRepoUrl.replace(/\.git$/, '')
  )}&project-name=adgenix&framework=vite`;

  const cliCommands = `npm install -g vercel
vercel login
vercel --prod`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommands);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleDirectDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vercelToken.trim()) return;

    setIsLoading(true);
    setDeployResult(null);

    try {
      const res = await fetch('/api/vercel/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vercelToken: vercelToken.trim(),
          projectName: projectName.trim() || 'adgenix',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDeployResult({
          success: true,
          url: data.url,
          message: data.message || `Successfully deployed to ${data.url}!`,
          log: data.log,
        });
      } else {
        setDeployResult({
          success: false,
          message: data.error || 'Deployment failed. Please verify your token or project settings.',
          log: data.log,
        });
      }
    } catch (err: any) {
      setDeployResult({
        success: false,
        message: err.message || 'Network error connecting to Vercel deployment service.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center border border-slate-800 shadow-md">
              <Triangle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Deploy to Vercel</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Vercel Ready • vercel.json Configured
                </span>
              </div>
              <p className="text-xs text-slate-400">Launch AdGenix globally with instant CDN, edge caching & serverless API</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('1click')}
            className={`pb-2.5 px-3 font-semibold text-xs transition border-b-2 ${
              activeTab === '1click'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🚀 1-Click Vercel Deploy (Recommended)
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-2.5 px-3 font-semibold text-xs transition border-b-2 ${
              activeTab === 'direct'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Deploy with Vercel Token
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`pb-2.5 px-3 font-semibold text-xs transition border-b-2 ${
              activeTab === 'cli'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            💻 Terminal / CLI
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {activeTab === '1click' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Instant Vercel Git Integration
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Zero config needed</span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  AdGenix comes pre-packaged with <strong className="text-white">vercel.json</strong> and{' '}
                  <strong className="text-white">api/index.ts</strong>. Clicking below imports your GitHub repository directly into Vercel and sets up automated CI/CD for all future commits.
                </p>

                <div className="pt-2">
                  <a
                    href={vercelCloneUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition group"
                  >
                    <Triangle className="w-4 h-4 fill-slate-950" />
                    Deploy to Vercel (1-Click)
                    <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition ml-1" />
                  </a>
                </div>
              </div>

              {/* Recommended Environment Variables Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Recommended Environment Variables for Vercel:
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span><strong className="text-emerald-400">GEMINI_API_KEY</strong> (optional: for autonomous AI pitch scouting)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span><strong className="text-indigo-400">NODE_ENV</strong> = <span className="text-slate-400">production</span></span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  You can set these in your Vercel Project Dashboard under <em>Settings ➔ Environment Variables</em>.
                </p>
              </div>

              {/* Architecture Info */}
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
                <div className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  How AdGenix Runs on Vercel:
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                  <li><strong>Frontend:</strong> React 19 + Vite compiled into high-speed static assets on Vercel Global Edge Network.</li>
                  <li><strong>Backend & Webhooks:</strong> Express router running as a Vercel Serverless Function via <code className="text-indigo-300">/api</code>.</li>
                  <li><strong>UPI & Retainer System:</strong> Fully functional FamPay/UPI verification and PDF contract generation.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'direct' && (
            <form onSubmit={handleDirectDeploy} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-white" />
                    Deploy Directly Using Vercel Token
                  </span>
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 underline"
                  >
                    Get Vercel Token <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Vercel Personal Access Token:
                  </label>
                  <input
                    type="password"
                    required
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    placeholder="Enter your Vercel Token (from vercel.com/account/tokens)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Used securely for this deployment build. Never saved to disk or database.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Vercel Project Name:
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="adgenix"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !vercelToken.trim()}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-black text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Triangle className="w-4 h-4 fill-black" />
                  {isLoading ? 'Deploying to Vercel (Compiling & Uploading)...' : 'Deploy to Vercel Production'}
                </button>
              </div>

              {deployResult && (
                <div
                  className={`p-3.5 rounded-xl border ${
                    deployResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-bold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      {deployResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      {deployResult.message}
                    </span>

                    {deployResult.url && (
                      <a
                        href={deployResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" /> Visit Live App <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {deployResult.log && (
                    <pre className="mt-2 p-2 rounded bg-black/60 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                      {deployResult.log}
                    </pre>
                  )}
                </div>
              )}
            </form>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-white" />
                    Deploy via Vercel CLI from your Terminal
                  </span>
                  <button
                    onClick={handleCopyCli}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] transition border border-slate-800"
                  >
                    {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCli ? 'Copied' : 'Copy Commands'}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-black/80 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                  {cliCommands}
                </pre>
                <p className="text-[10px] text-slate-400">
                  Run these commands in the root of your project after downloading or cloning from GitHub.
                </p>
              </div>

              {/* Configuration File Previews */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white text-xs">Included Vercel Config (vercel.json):</div>
                <pre className="p-2.5 rounded bg-black/60 font-mono text-[10px] text-slate-400 overflow-x-auto">
{`{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Triangle className="w-3.5 h-3.5 fill-white" />
            Vercel Production Deployment Architecture
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
