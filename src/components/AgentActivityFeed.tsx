import React from 'react';
import { AgentLog } from '../types/agency';
import { Bot, Terminal, CheckCircle2, AlertCircle, Sparkles, Zap, ArrowRight } from 'lucide-react';

interface AgentActivityFeedProps {
  logs: AgentLog[];
  isAutopilotActive: boolean;
  onToggleAutopilot: () => void;
  onClearLogs?: () => void;
}

export const AgentActivityFeed: React.FC<AgentActivityFeedProps> = ({
  logs,
  isAutopilotActive,
  onToggleAutopilot,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg text-slate-100 flex flex-col h-[340px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              Autonomous Agent Mind & Execution Stream
              <span
                className={`w-2 h-2 rounded-full ${
                  isAutopilotActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                }`}
              />
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutopilot}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isAutopilotActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAutopilotActive ? 'text-emerald-400 fill-emerald-400' : ''}`} />
            {isAutopilotActive ? 'Autopilot Active' : 'Start Autopilot'}
          </button>
        </div>
      </div>

      {/* Stream Area */}
      <div className="p-4 space-y-2.5 overflow-y-auto flex-1 font-mono text-xs bg-slate-950/80">
        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            Agent idle. Start Autopilot or click any lead to trigger autonomous actions.
          </div>
        ) : (
          logs.map((log) => {
            const isSuccess = log.level === 'success';
            const isAlert = log.level === 'alert';
            const isAction = log.level === 'action';

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-lg border leading-relaxed flex items-start gap-2.5 transition ${
                  isSuccess
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : isAlert
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                    : isAction
                    ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isSuccess ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isAlert ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>

                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {log.brandTarget ? `[Target: ${log.brandTarget}]` : '[Agent Core]'}
                    </span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <p className="text-slate-200 text-[11px] font-sans">
                    <span className="text-slate-400 font-mono text-[10px] mr-1.5">MIND:</span>
                    {log.agentThought}
                  </p>

                  <div className="text-[10px] text-indigo-300 flex items-center gap-1 font-sans font-medium">
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                    <span>Action: {log.actionTaken}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
