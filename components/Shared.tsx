
import React, { useState, useEffect } from 'react';
import { STANDARD_GRADES, getSubjectsForGrade } from '../constants';
import { ChevronDown, List, AlertTriangle, Radio, Monitor } from 'lucide-react';
import { Session, SessionStatus } from '../types';

// Robust Video URL Parser (Centralized)
export const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
        const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const ytMatch = url.match(ytRegex);

        if (ytMatch && ytMatch[2].length === 11) {
            return `https://www.youtube.com/embed/${ytMatch[2]}?rel=0&modestbranding=1`;
        }
        
        if (url.includes('vimeo.com')) {
            const vimeoRegex = /vimeo.*\/(\d+)/i;
            const vimeoMatch = url.match(vimeoRegex);
            if (vimeoMatch && vimeoMatch[1]) {
                return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
            }
        }
    } catch (e) {
        console.error("Video parse error", e);
        return '';
    }
    return ''; 
};

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white text-brand-700 border-2 border-brand-100 hover:border-brand-200 hover:bg-brand-50 disabled:opacity-50",
    outline: "border-2 border-white text-white hover:bg-white/10",
    ghost: "text-slate-600 hover:bg-slate-100"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge = ({ children, color = 'blue', ...props }: { children?: React.ReactNode, color?: string } & React.HTMLAttributes<HTMLSpanElement>) => {
  const colors: Record<string, string> = {
    blue: 'bg-brand-50 text-brand-700 border-brand-100',
    green: 'bg-accent-50 text-accent-600 border-accent-100',
    yellow: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    red: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${colors[color] || colors.gray}`} {...props}>
      {children}
    </span>
  );
};

export const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmLabel = "Confirm", 
    cancelLabel = "Cancel",
    isDanger = false 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title?: string; 
    message?: string; 
    confirmLabel?: string; 
    cancelLabel?: string;
    isDanger?: boolean;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden transform transition-all scale-100">
                <div className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">{message}</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                        >
                            {cancelLabel}
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className={`flex-1 py-3 px-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95 text-sm ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200'}`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ClassSubjectSelector = ({
    grade,
    subject,
    onGradeChange,
    onSubjectChange,
    labelClass = "Grade / Class",
    labelSubject = "Subject",
    horizontal = false,
    enableSubjectSelection = true
}: {
    grade: string;
    subject: string;
    onGradeChange: (g: string) => void;
    onSubjectChange: (s: string) => void;
    labelClass?: string;
    labelSubject?: string;
    horizontal?: boolean;
    enableSubjectSelection?: boolean;
}) => {
    // Check if the current values are standard or custom
    const [isCustomGrade, setIsCustomGrade] = useState(() => grade && !STANDARD_GRADES.includes(grade));
    const [isCustomSubject, setIsCustomSubject] = useState(false);

    // Effect to check if subject is custom relative to the *current* grade's list
    useEffect(() => {
        if (enableSubjectSelection && subject) {
            const standards = getSubjectsForGrade(grade);
            if (!standards.includes(subject) && subject !== '') {
                setIsCustomSubject(true);
            } else {
                setIsCustomSubject(false);
            }
        }
    }, [grade, subject, enableSubjectSelection]);

    const handleGradeSelect = (val: string) => {
        if (val === 'OTHERS') {
            setIsCustomGrade(true);
            onGradeChange(''); // Clear for user input
        } else {
            setIsCustomGrade(false);
            onGradeChange(val);
        }
    };

    const handleSubjectSelect = (val: string) => {
        if (val === 'OTHERS') {
            setIsCustomSubject(true);
            onSubjectChange(''); // Clear for user input
        } else {
            setIsCustomSubject(false);
            onSubjectChange(val);
        }
    };

    const availableSubjects = getSubjectsForGrade(grade);

    return (
        <div className={`grid gap-4 ${horizontal && enableSubjectSelection ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {/* GRADE SELECTION */}
            <div>
                {labelClass && <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{labelClass}</label>}
                {isCustomGrade ? (
                    <div className="flex gap-2">
                        <input 
                            className="w-full border border-brand-300 rounded-xl p-3 bg-white text-slate-900 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                            placeholder="Type custom class name..."
                            value={grade}
                            onChange={(e) => onGradeChange(e.target.value)}
                            autoFocus
                        />
                        <button 
                            onClick={() => { setIsCustomGrade(false); onGradeChange(''); }}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-slate-600 border border-gray-200"
                            title="Back to List"
                        >
                            <List size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <select 
                            className="w-full border border-gray-300 rounded-xl p-3 pr-10 bg-white text-slate-900 focus:ring-brand-500 focus:border-brand-500 appearance-none cursor-pointer"
                            value={grade}
                            onChange={(e) => handleGradeSelect(e.target.value)}
                        >
                            <option value="">Select Class Level...</option>
                            {STANDARD_GRADES.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                            <option value="OTHERS" className="font-bold text-brand-600">+ Other (Type in)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
                    </div>
                )}
            </div>

            {/* SUBJECT SELECTION */}
            {enableSubjectSelection && labelSubject && (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{labelSubject}</label>
                    {isCustomSubject ? (
                        <div className="flex gap-2">
                            <input 
                                className="w-full border border-brand-300 rounded-xl p-3 bg-white text-slate-900 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                                placeholder="Type custom subject..."
                                value={subject}
                                onChange={(e) => onSubjectChange(e.target.value)}
                                autoFocus
                            />
                            <button 
                                onClick={() => { setIsCustomSubject(false); onSubjectChange(''); }}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-slate-600 border border-gray-200"
                                title="Back to List"
                            >
                                <List size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <select 
                                className="w-full border border-gray-300 rounded-xl p-3 pr-10 bg-white text-slate-900 focus:ring-brand-500 focus:border-brand-500 appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                                value={subject}
                                onChange={(e) => handleSubjectSelect(e.target.value)}
                                disabled={!grade && !isCustomGrade}
                            >
                                <option value="">{(!grade && !isCustomGrade) ? 'Select Class First' : 'Select Subject...'}</option>
                                {availableSubjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                                <option value="OTHERS" className="font-bold text-brand-600">+ Other (Type in)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const LiveClassMonitor: React.FC<{ sessions: Session[], onJoin: (s: Session) => void }> = ({ sessions, onJoin }) => {
    const activeSessions = sessions.filter(s => s.status === SessionStatus.LIVE);
    
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2"><Radio size={18} className="text-red-500 animate-pulse"/> Live Learning Monitor</h3>
                <Badge color="red">{activeSessions.length} Active</Badge>
            </div>
            <div className="p-4 space-y-4">
                {activeSessions.length > 0 ? activeSessions.map(s => (
                    <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">
                                <Monitor size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex -space-x-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-300 text-[8px] flex items-center justify-center font-bold">S{i}</div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-medium">3 Students • 12m elapsed</span>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => onJoin(s)} className="h-8 px-3 text-[10px] bg-brand-600 text-white">Enter Room</Button>
                    </div>
                )) : (
                    <div className="py-8 text-center">
                        <p className="text-xs text-slate-400 italic">No live sessions currently active.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
