import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { googleSignIn, logoutGoogle } from '../utils/googleAuth';
import { Mail, CheckCircle2, Send, LogOut, Sparkles, AlertCircle } from 'lucide-react';

interface GoogleWorkspaceAuthBarProps {
  currentUser: User | null;
  accessToken: string | null;
  onAuthSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  onOpenSendTestModal: () => void;
  onFindAndEmailLeadsLive?: () => void;
  ownerEmail: string;
}

export const GoogleWorkspaceAuthBar: React.FC<GoogleWorkspaceAuthBarProps> = ({
  currentUser,
  accessToken,
  onAuthSuccess,
  onLogout,
  onOpenSendTestModal,
  onFindAndEmailLeadsLive,
  ownerEmail,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onAuthSuccess(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setLoginError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      onLogout();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Gmail Connection State */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            accessToken
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
          }`}>
            <Mail className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Google Workspace • Gmail API
              </span>
              {accessToken ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> CONNECTED
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  ACTION REQUIRED
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              {accessToken && currentUser ? (
                <>
                  Connected as <strong className="text-slate-200 font-mono">{currentUser.email}</strong>. Outreach & invoices signed as <strong className="text-emerald-300">Daksh Gupta</strong> with official <strong className="text-amber-300">FamPay / UPI QR Code</strong>.
                </>
              ) : (
                <>
                  Connect Google to enable live outreach & invoices sent directly from your Gmail, with official <strong className="text-amber-300">FamPay UPI QR Code</strong> and signed by <strong className="text-slate-200">Daksh Gupta</strong>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {accessToken ? (
            <>
              {onFindAndEmailLeadsLive && (
                <button
                  onClick={onFindAndEmailLeadsLive}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Find & Email Leads Live</span>
                </button>
              )}

              <button
                onClick={onOpenSendTestModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Email (QR + Daksh)</span>
              </button>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Disconnect Google Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Official Google Sign-In Button */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button transition shadow-md"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google to Enable Gmail'}
                  </span>
                  <span style={{ display: 'none' }}>Sign in with Google</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {loginError && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}
    </div>
  );
};
