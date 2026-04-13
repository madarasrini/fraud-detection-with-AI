
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, ScamStatus } from '../types';
import { AlertTriangleIcon, BadgeCheckIcon, EyeIcon, InfoIcon, LoaderIcon, BanknotesIcon, LinkIcon, DevicePhoneMobileIcon, IdentificationIcon, CopyIcon, CheckIcon } from './icons';

interface AnalysisPanelProps {
  analysisHistory: AnalysisResult[];
  isLoading: boolean;
  error: string | null;
}

const getStatusAttributes = (status: ScamStatus | undefined) => {
    switch (status) {
        case ScamStatus.SCAM_CONFIRMED:
            return { icon: <AlertTriangleIcon className="h-6 w-6" />, label: "Scam Confirmed", color: "text-red-400", iconOnly: <AlertTriangleIcon className="h-5 w-5 text-red-400" /> };
        case ScamStatus.MONITORING:
            return { icon: <EyeIcon className="h-6 w-6" />, label: "Monitoring", color: "text-yellow-400", iconOnly: <EyeIcon className="h-5 w-5 text-yellow-400" /> };
        case ScamStatus.NOT_DETECTED:
             return { icon: <BadgeCheckIcon className="h-6 w-6" />, label: "Not Detected", color: "text-green-400", iconOnly: <BadgeCheckIcon className="h-5 w-5 text-green-400" /> };
        default:
            return { icon: <InfoIcon className="h-6 w-6" />, label: "Awaiting Analysis", color: "text-gray-400", iconOnly: <InfoIcon className="h-5 w-5 text-gray-400" /> };
    }
}

const ScamScoreGauge: React.FC<{ score: number | undefined; isLoading: boolean }> = ({ score = 0, isLoading }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const [justUpdated, setJustUpdated] = useState(false);
    const [animationKey, setAnimationKey] = useState(0); // For ripple effect
    const prevScoreRef = useRef<number>();

    useEffect(() => {
        const targetScore = isLoading || score === undefined ? prevScoreRef.current || 0 : score;
        if (displayScore !== targetScore) {
            const animation = requestAnimationFrame(() => {
                setDisplayScore(prev => {
                    if (Math.abs(targetScore - prev) < 1) return targetScore;
                    return prev + (targetScore - prev) * 0.1;
                });
            });
            return () => cancelAnimationFrame(animation);
        }
    }, [score, displayScore, isLoading]);

    useEffect(() => {
        if (score !== undefined && prevScoreRef.current !== undefined && score !== prevScoreRef.current) {
            setJustUpdated(true);
            setAnimationKey(prev => prev + 1); // Trigger ripple
            const timer = setTimeout(() => setJustUpdated(false), 300); // For score text pop
            return () => clearTimeout(timer);
        }
        if (score !== undefined) {
            prevScoreRef.current = score;
        }
    }, [score]);


    const getScoreColor = (s: number) => {
        if (s >= 75) return "#ef4444"; // red-500
        if (s >= 40) return "#f59e0b"; // amber-500
        return "#22c55e"; // green-500
    };

    const radius = 52;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;
    const currentScoreColor = getScoreColor(score ?? prevScoreRef.current ?? 0);

    return (
        <div className="relative h-40 w-40 flex items-center justify-center">
            <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 128 128">
                <circle
                    cx="64" cy="64" r={radius}
                    className="text-gray-700/50"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {animationKey > 0 && (
                    <circle
                        key={animationKey}
                        cx="64" cy="64"
                        stroke={currentScoreColor}
                        fill="transparent"
                        className="animate-ripple"
                    />
                )}
                <circle
                    cx="64" cy="64" r={radius}
                    stroke={getScoreColor(displayScore)}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 64 64)"
                    style={{ transition: 'stroke-dashoffset 0.3s ease-in-out, stroke 0.3s ease-in-out' }}
                />
            </svg>
            <div className="z-10 text-center">
                {isLoading && score === undefined ? (
                    <LoaderIcon className="h-8 w-8 text-blue-400 animate-spin" />
                ) : (
                    <>
                        <span 
                            className={`text-4xl font-bold ${justUpdated ? 'animate-score-pop' : ''}`}
                            style={{ color: getScoreColor(displayScore) }}
                        >
                            {Math.round(displayScore)}
                        </span>
                        <span className="text-sm text-gray-400 block">Scam Score</span>
                    </>
                )}
            </div>
        </div>
    );
};

const StatusIndicator: React.FC<{ status: ScamStatus | undefined; isLoading: boolean }> = ({ status, isLoading }) => {
    const { icon, label, color } = getStatusAttributes(isLoading && !status ? undefined : status);
    
    return (
        <div className={`flex items-center justify-center gap-2 text-xl font-bold ${color}`}>
            {isLoading && !status ? <span>ANALYZING...</span> : <>{icon}<span>{label}</span></>}
        </div>
    );
};

const IntelligenceItem: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => {
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(text);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    if (!items || items.length === 0) return null;
    return (
        <div className="bg-black/20 p-4 rounded-lg border border-blue-500/10 transition-all duration-200 hover:bg-blue-900/20 hover:border-blue-500/30 hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-2">
                <div className="text-blue-400">{icon}</div>
                <h4 className="font-semibold text-gray-300">{title}</h4>
            </div>
            <ul className="space-y-1 pl-8">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center justify-between text-sm text-blue-300 font-mono bg-gray-900/50 px-2 py-1 rounded-md group">
                        <span className="break-all">{item}</span>
                        <button onClick={() => handleCopy(item)} className="ml-2 p-1 rounded-md hover:bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Copy ${item}`}>
                           {copiedItem === item ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4 text-gray-400" />}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const AnalysisTimeline: React.FC<{ history: AnalysisResult[] }> = ({ history }) => {
    if (history.length === 0) return null;

    return (
        <div>
            <h3 className="text-md font-semibold text-gray-300 mb-4 ml-2">Analysis Timeline</h3>
            <div className="space-y-2">
                {history.map((analysis, index) => {
                    const { iconOnly, color } = getStatusAttributes(analysis.scam_status);
                    const scoreColor = analysis.scam_score >= 75 ? 'bg-red-500' : analysis.scam_score >= 40 ? 'bg-yellow-500' : 'bg-green-500';
                    return (
                        <div key={index} className="bg-black/20 p-3 rounded-lg border border-blue-500/10 flex items-center gap-4 animate-fadeIn">
                            <div className="text-xs font-bold bg-gray-700 px-2 py-1 rounded-full">TURN {index + 1}</div>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                {iconOnly}
                                <span className={color}>{analysis.scam_status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                                    <div className={`${scoreColor} h-2.5 rounded-full`} style={{ width: `${analysis.scam_score}%`, transition: 'width 0.5s ease-out' }}></div>
                                </div>
                                <span className={`font-bold text-sm w-8 text-right ${color}`}>{analysis.scam_score}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysisHistory, isLoading, error }) => {
  const latestAnalysis = analysisHistory.length > 0 ? analysisHistory[analysisHistory.length - 1] : null;

  return (
    <div className="flex flex-col bg-black/20 backdrop-blur-md rounded-xl border border-blue-500/20 shadow-2xl shadow-blue-500/10 h-full max-h-[calc(100vh-8rem)]">
        <div className="p-4 border-b border-blue-500/20 text-lg font-semibold text-gray-200">
            Live Analysis
        </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-6 [scrollbar-width:thin] [scrollbar-color:#3b82f6_#1f2937]">
        {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangleIcon className="h-6 w-6 flex-shrink-0 mt-1"/>
                <div>
                    <h3 className="font-bold text-lg">System Error</h3>
                    <p className="text-sm font-mono">{error}</p>
                </div>
            </div>
        )}

        <div className="flex flex-col items-center justify-center gap-4 py-4 bg-black/20 rounded-lg border border-blue-500/10">
            <ScamScoreGauge score={latestAnalysis?.scam_score} isLoading={isLoading && !latestAnalysis} />
            <StatusIndicator status={latestAnalysis?.scam_status} isLoading={isLoading && !latestAnalysis} />
        </div>
        
        <div className="bg-black/20 p-4 rounded-lg border border-blue-500/10">
            <h3 className="text-md font-semibold text-gray-300 mb-2">Agent's Reasoning</h3>
            <p className="text-sm text-gray-400 italic">
                {isLoading && !latestAnalysis ? "Awaiting model response..." : (latestAnalysis?.reasoning || 'No reasoning provided yet.')}
            </p>
        </div>

        <AnalysisTimeline history={analysisHistory} />

        <div>
            <h3 className="text-md font-semibold text-gray-300 mb-4 ml-2">Extracted Intelligence</h3>
            <div className="space-y-4">
                {isLoading && !latestAnalysis ? (
                    <div className="text-center text-gray-500">Scanning for intelligence...</div>
                ) : latestAnalysis?.extracted_intelligence ? (
                    <>
                        <IntelligenceItem title="Names" items={latestAnalysis.extracted_intelligence.names} icon={<IdentificationIcon className="w-5 h-5"/>} />
                        <IntelligenceItem title="Phone Numbers" items={latestAnalysis.extracted_intelligence.phone_numbers} icon={<DevicePhoneMobileIcon className="w-5 h-5"/>} />
                        <IntelligenceItem title="Bank Accounts" items={latestAnalysis.extracted_intelligence.bank_accounts} icon={<BanknotesIcon className="w-5 h-5"/>} />
                        <IntelligenceItem title="UPI IDs" items={latestAnalysis.extracted_intelligence.upi_ids} icon={<IdentificationIcon className="w-5 h-5"/>} />
                        <IntelligenceItem title="Phishing Links" items={latestAnalysis.extracted_intelligence.phishing_links} icon={<LinkIcon className="w-5 h-5"/>} />
                         {(
                            !latestAnalysis.extracted_intelligence.names?.length &&
                            !latestAnalysis.extracted_intelligence.phone_numbers?.length &&
                            !latestAnalysis.extracted_intelligence.bank_accounts?.length &&
// FIX: Corrected typo from `upi_s` to `upi_ids` to match the type definition.
                            !latestAnalysis.extracted_intelligence.upi_ids?.length &&
                            !latestAnalysis.extracted_intelligence.phishing_links?.length
                         ) && <p className="text-sm text-center text-gray-500">No intelligence extracted yet.</p>}
                    </>
                ) : (
                    <p className="text-sm text-center text-gray-500">No intelligence extracted yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
