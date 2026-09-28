import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  GitBranch,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Terminal,
  KeyRound,
  FolderGit2,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function normalizeGitHubUrl(input: string, defaultUsername = 'dakshgupta9156-rgb'): string {
  let url = (input || '').trim();
  if (!url) return '';

  url = url.replace(/\/+$/, '');

  if (url.startsWith('git@github.com:')) {
    url = url.replace('git@github.com:', 'https://github.com/');
  }

  if (url.startsWith('github.com/')) {
    url = `https://${url}`;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('/')) {
      const parts = url.split('/').filter(Boolean);
      url = `https://github.com/${parts[0]}/${parts[1]}`;
    } else {
      const cleanRepo = url.replace(/\.git$/, '');
      url = `https://github.com/${defaultUsername}/${cleanRepo}`;
    }
  }

  if (!url.endsWith('.git')) {
    url = `${url}.git`;
  }

  return url;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/dakshgupta9156-rgb/adgenix.git');
  const [personalToken, setPersonalToken] = useState('');
  const [branch, setBranch] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; log?: string; normalizedUrl?: string } | null>(null);
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGitStatus();
    }
  }, [isOpen]);

  const normalizedTargetUrl = useMemo(() => {
    return normalizeGitHubUrl(repoUrl);
  }, [repoUrl]);

  const fetchGitStatus = async () => {
    try {
      const res = await fetch('/api/github/status');
      const data = await res.json();
      if (data.success) {
        setGitStatus(data);
      }
    } catch (e) {
      console.error('Failed to get git status:', e);
    }
  };

  if (!isOpen) return null;

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    if (!personalToken.trim()) {
      setPushResult({
        success: false,
        message: 'GitHub Personal Access Token (PAT) is required for automated HTTPS push. GitHub does not allow password or unauthenticated pushes.',
        log: 'Action: Click "Generate Token (repo scope)" above to generate a token, or use the 1-click Download Bundle / Terminal Commands below.',
      });
      return;
    }

    setIsLoading(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: normalizedTargetUrl,
          personalAccessToken: personalToken.trim(),
          branch,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPushResult({
          success: true,
          normalizedUrl: data.normalizedUrl || normalizedTargetUrl,
          message: data.message || `Successfully hosted and pushed to ${data.normalizedUrl || normalizedTargetUrl}!`,
          log: data.log,
        });
        fetchGitStatus();
      } else {
        setPushResult({
          success: false,
          normalizedUrl: data.normalizedUrl || normalizedTargetUrl,
          message: data.error || 'Push failed. Please check repository URL and GitHub permissions.',
          log: data.commandLog || data.hint,
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: err.message || 'Failed to connect to push service.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manualCliCommands = `git remote add origin ${normalizedTargetUrl || 'https://github.com/dakshgupta9156/adgenix.git'}
git branch -M main
git push -u origin main`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(manualCliCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center border border-slate-700">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Host on GitHub</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Git Initialized • Branch main
                </span>
              </div>
              <p className="text-xs text-slate-400">Push your AdGenix Autonomous Agency codebase directly to GitHub</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Git Repository Status Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">
                  Active Branch: <span className="font-mono text-indigo-400">{gitStatus?.currentBranch || 'main'}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate max-w-md">
                  Commit: {gitStatus?.lastCommitHash || 'f3f1416'} - {gitStatus?.lastCommitMessage || 'Production Build'}
                </div>
              </div>
            </div>

            <button
              onClick={fetchGitStatus}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Direct Push Form */}
          <form onSubmit={handlePush} className="space-y-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="font-bold text-white text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                Push Directly from Dashboard
              </span>
              <a
                href="https://github.com/new?name=adgenix"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 underline"
              >
                1. Create Repo on GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-300 font-semibold">
                  GitHub Repository URL or Name:
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRepoUrl('https://github.com/dakshgupta9156-rgb/adgenix.git')}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
                  >
                    Reset Default
                  </button>
                </div>
              </div>
              <input
                type="text"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/dakshgupta9156-rgb/adgenix.git or simply 'adgenix'"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              {normalizedTargetUrl && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="text-slate-500">Destination:</span>
                  <span className="truncate">{normalizedTargetUrl}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  GitHub Personal Access Token (PAT):
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=AdGenix-Deploy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1"
                >
                  Generate Token (repo scope) <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={personalToken}
                onChange={(e) => setPersonalToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Paste token here to authenticate)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                GitHub requires a PAT with <strong>repo</strong> permissions. The token is used in-memory for this push operation only.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !repoUrl.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              {isLoading ? 'Pushing to GitHub...' : 'Host & Push to GitHub Main Branch'}
            </button>
          </form>

          {/* Push Status / Output */}
          {pushResult && (
            <div
              className={`p-3.5 rounded-xl border ${
                pushResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                {pushResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{pushResult.message}</span>
              </div>
              {pushResult.log && (
                <pre className="mt-1.5 p-2 rounded bg-black/60 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {pushResult.log}
                </pre>
              )}
              {!pushResult.success && (
                <div className="mt-2 pt-2 border-t border-rose-900/50 flex flex-wrap items-center gap-2">
                  <a
                    href="https://github.com/new?name=adgenix"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800/80 text-[11px] text-white font-semibold transition flex items-center gap-1"
                  >
                    1. Create Repo on GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=AdGenix-Deploy"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800/80 text-[11px] text-white font-semibold transition flex items-center gap-1"
                  >
                    2. Generate Token with repo Scope <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Quick Download Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              Instant 1-Click Offline Download (No Token Needed)
            </div>
            <p className="text-slate-400 text-[11px]">
              You can also download the complete repository files or git bundle and drag-and-drop or upload directly to GitHub:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="/api/github/download-bundle"
                download="adgenix-git-repo.bundle"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Download Git Bundle (.bundle)
              </a>
              <a
                href="/api/github/download-tar"
                download="adgenix-source.tar.gz"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Download Full Source (.tar.gz)
              </a>
            </div>
          </div>

          {/* CLI Commands */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Manual Terminal Commands
              </span>
              <button
                onClick={handleCopyCli}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] transition border border-slate-800"
              >
                {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCmd ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-black/70 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              {manualCliCommands}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
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
