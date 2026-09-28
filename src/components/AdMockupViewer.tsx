import React, { useState } from 'react';
import { AdCampaign, UgcScriptScene } from '../types/agency';
import { Play, Sparkles, Copy, Check, Eye, Smartphone, Layers, Video, MessageSquare } from 'lucide-react';

interface AdMockupViewerProps {
  campaign: AdCampaign;
  brandName: string;
}

export const AdMockupViewer: React.FC<AdMockupViewerProps> = ({ campaign, brandName }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'ugc_script' | 'meta_copy' | 'specs'>('preview');
  const [previewPlatform, setPreviewPlatform] = useState<'meta' | 'tiktok' | 'ugc'>('meta');
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const scenes: { name: string; key: keyof NonNullable<typeof campaign.ugcScript>; data: UgcScriptScene | undefined }[] = campaign.ugcScript ? [
    { name: '1. Hook (0-3s)', key: 'hookScene', data: campaign.ugcScript.hookScene },
    { name: '2. Problem (3-8s)', key: 'problemScene', data: campaign.ugcScript.problemScene },
    { name: '3. Solution (8-18s)', key: 'solutionScene', data: campaign.ugcScript.solutionScene },
    { name: '4. Social Proof (18-24s)', key: 'socialProofScene', data: campaign.ugcScript.socialProofScene },
    { name: '5. Call to Action (24-30s)', key: 'ctaScene', data: campaign.ugcScript.ctaScene },
  ] : [];

  const handleCopyAll = () => {
    let text = `=== ${campaign.title} ===\nTarget Audience: ${campaign.targetAudience}\nHook Angle: ${campaign.hookType}\n\n`;
    if (campaign.metaAd) {
      text += `--- META AD COPY ---\nHeadline: ${campaign.metaAd.headline}\nDescription: ${campaign.metaAd.description}\nCTA: ${campaign.metaAd.callToAction}\n\nPrimary Text:\n${campaign.metaAd.primaryText}\n\n`;
    }
    if (campaign.ugcScript) {
      text += `--- UGC SCRIPT ---\nActor: ${campaign.ugcScript.actorPersona}\n`;
      scenes.forEach(s => {
        if (s.data) {
          text += `\n[${s.name}]\nVisual: ${s.data.visual}\nVoiceover: "${s.data.voiceover}"\nOn-Screen Text: ${s.data.onScreenText}\n`;
        }
      });
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              {campaign.title}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {campaign.type.toUpperCase()} SPEC READY
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Angle: <span className="text-slate-300 font-medium">{campaign.hookType}</span> • For {brandName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Full Script' : 'Copy All'}
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="px-5 pt-3 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Live Mobile Mockup
          </button>

          {campaign.ugcScript && (
            <button
              onClick={() => setActiveTab('ugc_script')}
              className={`pb-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
                activeTab === 'ugc_script'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4" /> UGC Storyboard (5-Part)
            </button>
          )}

          {campaign.metaAd && (
            <button
              onClick={() => setActiveTab('meta_copy')}
              className={`pb-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
                activeTab === 'meta_copy'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Meta Copy & Angles
            </button>
          )}
        </div>

        {activeTab === 'preview' && (
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs mb-2">
            <button
              onClick={() => setPreviewPlatform('meta')}
              className={`px-2.5 py-1 rounded-md transition ${
                previewPlatform === 'meta' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Instagram Feed
            </button>
            <button
              onClick={() => setPreviewPlatform('tiktok')}
              className={`px-2.5 py-1 rounded-md transition ${
                previewPlatform === 'tiktok' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              TikTok / Reels
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="p-6">
        {activeTab === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Phone Simulator Frame */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-[330px] rounded-[36px] p-3.5 bg-slate-950 border-4 border-slate-700 shadow-2xl relative">
                {/* Speaker notch */}
                <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

                {/* Inner Screen */}
                <div className="bg-slate-900 rounded-[24px] overflow-hidden border border-slate-800 text-xs">
                  {previewPlatform === 'meta' ? (
                    /* Instagram / Meta Feed Mockup */
                    <div>
                      {/* Meta Header */}
                      <div className="p-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-[10px] text-white">
                              {brandName.slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-1">
                              {brandName.toLowerCase().replace(/\s+/g, '')}
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                            </div>
                            <div className="text-[10px] text-slate-400">Sponsored</div>
                          </div>
                        </div>
                        <span className="text-slate-400 font-bold tracking-widest">•••</span>
                      </div>

                      {/* Meta Visual Creative Canvas */}
                      <div className="relative aspect-square w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-5 text-center border-y border-slate-800/60 overflow-hidden">
                        {/* Glow orb */}
                        <div className="absolute w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

                        {/* Creative Badge */}
                        <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {campaign.metaAd?.badgeText || 'SPECIAL OFFER'}
                        </div>

                        <div className="relative z-10 px-3 py-4 max-w-[240px]">
                          <div className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-1">
                            {brandName}
                          </div>
                          <div className="text-base font-extrabold text-white leading-tight mb-2 drop-shadow">
                            {campaign.metaAd?.headline || campaign.title}
                          </div>
                          <div className="text-[11px] text-slate-300 leading-snug mb-3">
                            {campaign.metaAd?.description || 'High-performance proven formula'}
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-950 font-bold text-[11px] shadow-lg">
                            {campaign.metaAd?.callToAction || 'Shop Now'} →
                          </div>
                        </div>

                        {/* Bottom social proof banner */}
                        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-400 font-medium">
                          ⭐️⭐️⭐️⭐️⭐️ 4.9/5 Average • 30-Day Guarantee
                        </div>
                      </div>

                      {/* Meta CTA Bar */}
                      <div className="px-3 py-2.5 bg-slate-950/80 flex items-center justify-between border-b border-slate-800">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            {brandName.toLowerCase()}.co
                          </div>
                          <div className="font-bold text-slate-200 text-[11px] truncate max-w-[170px]">
                            {campaign.metaAd?.headline || 'Claim Exclusive Offer'}
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded text-[11px] hover:bg-indigo-500">
                          {campaign.metaAd?.callToAction || 'Shop Now'}
                        </button>
                      </div>

                      {/* Meta Ad Copy Caption */}
                      <div className="p-3 text-[11px] text-slate-300 space-y-1.5 max-h-36 overflow-y-auto">
                        <span className="font-bold text-white mr-1.5">{brandName.toLowerCase().replace(/\s+/g, '')}</span>
                        <span className="whitespace-pre-line text-slate-300 leading-relaxed">
                          {campaign.metaAd?.primaryText.slice(0, 180)}...
                        </span>
                        <div className="text-[10px] text-indigo-400 font-medium pt-1 cursor-pointer">
                          View more comments (248)
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* TikTok / Reels 9:16 Mockup */
                    <div className="relative aspect-[9/16] w-full bg-slate-950 flex flex-col justify-between p-4 overflow-hidden">
                      {/* Background Visual Simulation */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-indigo-950/40 to-slate-900/60 pointer-events-none" />

                      {/* Top Header */}
                      <div className="relative z-10 flex items-center justify-between text-white text-xs pt-2">
                        <span className="text-slate-400">Following</span>
                        <span className="font-bold border-b-2 border-white pb-0.5">For You</span>
                        <Eye className="w-4 h-4 text-slate-300" />
                      </div>

                      {/* Center Hook Graphic */}
                      <div className="relative z-10 text-center my-auto px-2">
                        <div className="inline-block bg-yellow-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md mb-2 shadow-lg tracking-wide uppercase">
                          {campaign.ugcScript?.hookScene.onScreenText || 'WAIT! WATCH THIS 🛑'}
                        </div>
                        <p className="text-white text-sm font-bold drop-shadow leading-snug">
                          "{campaign.ugcScript?.hookScene.voiceover || campaign.tiktokAd?.scriptHook}"
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1 text-[10px] bg-slate-900/80 px-2 py-1 rounded text-slate-300 border border-slate-700">
                          <Play className="w-3 h-3 text-red-500 fill-red-500" /> 0:00 / 0:30
                        </div>
                      </div>

                      {/* Right-hand TikTok side buttons */}
                      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3 z-20 text-white">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {brandName.slice(0, 2)}
                        </div>
                        <div className="text-center">
                          <div className="w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-xs">❤️</div>
                          <span className="text-[9px]">42.8k</span>
                        </div>
                        <div className="text-center">
                          <div className="w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-xs">💬</div>
                          <span className="text-[9px]">1.2k</span>
                        </div>
                        <div className="text-center">
                          <div className="w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-xs">↗️</div>
                          <span className="text-[9px]">Share</span>
                        </div>
                      </div>

                      {/* Bottom Info Bar */}
                      <div className="relative z-10 text-left text-white space-y-1">
                        <div className="font-bold text-xs">@{brandName.toLowerCase().replace(/\s+/g, '')}</div>
                        <p className="text-[11px] text-slate-200 line-clamp-2">
                          {campaign.tiktokAd?.scriptHook || campaign.metaAd?.headline} #viral #ad #{brandName.toLowerCase()}
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-300">
                          <span>🎵 {campaign.tiktokAd?.trendingAudioStyle || 'Original Performance Sound'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Breakdown Details */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Targeting & Creative Strategy
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Target Persona: </span>
                    <span className="text-slate-200 font-medium">{campaign.targetAudience}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Creative Angle: </span>
                    <span className="text-indigo-400 font-medium">{campaign.hookType}</span>
                  </div>
                  {campaign.ugcScript && (
                    <div>
                      <span className="text-slate-400">Actor Persona: </span>
                      <span className="text-slate-200 font-medium">{campaign.ugcScript.actorPersona}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* UGC Quick Script Highlights */}
              {campaign.ugcScript && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-amber-400" />
                      5-Part UGC Flow Breakdown
                    </h4>
                    <span className="text-[10px] text-slate-400">30 Seconds Total</span>
                  </div>

                  <div className="space-y-2">
                    {scenes.map((s, idx) => (
                      <div
                        key={s.name}
                        onClick={() => setActiveSceneIndex(idx)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition text-xs ${
                          activeSceneIndex === idx
                            ? 'bg-indigo-950/40 border-indigo-500/60 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                          <span>{s.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {s.data?.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic">"{s.data?.voiceover}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ugc_script' && campaign.ugcScript && (
          <div className="space-y-6">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-1">Creator Casting & B-Roll Shot Notes</h4>
              <p className="text-xs text-slate-300 mb-3">{campaign.ugcScript.actorPersona}</p>
              <div className="flex flex-wrap gap-2">
                {campaign.ugcScript.bRollNotes.map((note, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    📹 {note}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {scenes.map((s) => (
                <div key={s.name} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                    <span className="font-bold text-indigo-400 text-sm">{s.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      {s.data?.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Visual Direction</div>
                      <p className="text-slate-200">{s.data?.visual}</p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">Voiceover Script</div>
                      <p className="text-white font-medium italic">"{s.data?.voiceover}"</p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">On-Screen Text (Captions)</div>
                      <p className="text-emerald-300 font-bold">{s.data?.onScreenText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'meta_copy' && campaign.metaAd && (
          <div className="space-y-5">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Primary Text</div>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {campaign.metaAd.primaryText}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Headline</div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-bold text-white">
                    {campaign.metaAd.headline}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Link Description</div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
                    {campaign.metaAd.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs pt-2">
                <div>
                  <span className="text-slate-400">Button: </span>
                  <span className="px-2.5 py-1 rounded bg-indigo-600 text-white font-semibold">
                    {campaign.metaAd.callToAction}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Aspect Ratio: </span>
                  <span className="text-slate-200 font-medium">{campaign.metaAd.aspectRatio}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
