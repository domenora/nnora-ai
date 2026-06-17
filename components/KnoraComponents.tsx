
import React, { useState } from 'react';
import { ClipboardList, Table, FileText, CheckCircle, Share2, Printer, X, Eye } from 'lucide-react';
import { Button } from './Shared';

// --- NNORA IDENTITY (SVG) ---
export const KnoraAvatar = ({ className = "w-full h-full", mood = 'HAPPY' }: { className?: string, mood?: 'HAPPY' | 'THINKING' | 'ACTING' | 'SAD' | 'CONFUSED' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nnora-skin" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#D4A478"/>
        <stop offset="0.6" stopColor="#AC7E54"/>
        <stop offset="1" stopColor="#805638"/>
      </linearGradient>
      <linearGradient id="nnora-hair" x1="0" y1="0" x2="0" y2="100%">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="50%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
      <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <style>
        {`
          @keyframes blink { 0%, 96%, 100% { transform: scaleY(1); } 98% { transform: scaleY(0.1); } }
          @keyframes lookAround { 0%, 40% { transform: translate(0, 0); } 45%, 55% { transform: translate(1.5px, 0); } 60%, 85% { transform: translate(-1.5px, 0.5px); } 90%, 100% { transform: translate(0, 0); } }
          @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
          @keyframes nod { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(1.5px); } }
          @keyframes tilt { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(1deg); } }
          .nnora-eye { animation: blink 4.5s infinite; transform-origin: center; }
          .nnora-pupil { animation: lookAround 8s infinite; }
          .nnora-brain { animation: pulse 2s infinite; }
          .nnora-head-group { 
            transform-origin: center 80px;
            animation: ${mood === 'THINKING' ? 'tilt 4s infinite ease-in-out' : mood === 'ACTING' ? 'nod 2s infinite ease-in-out' : 'none'};
          }
        `}
      </style>
    </defs>
    
    <g className="nnora-body">
        {/* Neck and Collar */}
        <path d="M40 80 L60 80 L65 95 L35 95 Z" fill="url(#nnora-skin)" />
        <path d="M30 90 L70 90 L75 100 L25 100 Z" fill="#1e1b4b" /> {/* Blazer/Shirt */}
        <path d="M50 90 L35 98 L65 98 Z" fill="#f8fafc" opacity="0.8" /> {/* Shirt Collar */}
    </g>

    <g className="nnora-head-group">
        {/* Full "Old School" Hair Back */}
        <path d="M15 40 C15 10 85 10 85 40 L88 65 C88 80 75 85 50 85 C25 85 12 80 12 65 Z" fill="url(#nnora-hair)" />
        
        {/* Face */}
        <path d="M25 42 C25 20 75 20 75 42 C75 62 68 82 50 82 C32 82 25 62 25 42 Z" fill="url(#nnora-skin)" />
        
        {/* Hair Front/Volume */}
        <path d="M18 38 C18 10 35 5 50 5 C65 5 82 10 82 38 C82 25 70 15 50 15 C30 15 18 25 18 38 Z" fill="url(#nnora-hair)" opacity="0.95" />
        
        {/* Wisdom Lines */}
        <g stroke="#5D4037" strokeWidth="0.6" opacity="0.4" fill="none">
            <path d="M35 32 Q50 30 65 32" /> {/* Forehead */}
            <path d="M38 35 Q50 33 62 35" />
            <path d="M28 48 Q26 48 24 50" /> {/* Crow's feet */}
            <path d="M72 48 Q74 48 76 50" />
            <path d="M40 74 Q42 76 44 78" /> {/* Nasolabial folds */}
            <path d="M60 74 Q58 76 56 78" />
        </g>

        {/* Brain Light (Now a small pin in her hair) */}
        <circle 
            cx="75" cy="25" r="1.8" 
            fill={mood === 'SAD' ? '#ef4444' : mood === 'CONFUSED' ? '#f59e0b' : '#818cf8'} 
            filter="url(#soft-glow)" 
            className="nnora-brain" 
        />

        {/* Eyes Container */}
        <g transform={mood === 'SAD' ? "translate(0, 4)" : ""}>
            <g className="nnora-eye" style={{transformOrigin: '40px 45px'}}>
                <circle cx="40" cy="45" r="5.5" fill="#FDFDFD" />
                <g className="nnora-pupil">
                    <circle cx="40" cy="45.5" r={mood === 'SAD' ? 1.8 : 2.5} fill={mood === 'SAD' ? '#1e1b4b' : '#4f46e5'} />
                </g>
            </g>
            <g className="nnora-eye" style={{transformOrigin: '60px 45px'}}>
                <circle cx="60" cy="45" r="5.5" fill="#FDFDFD" />
                <g className="nnora-pupil">
                    <circle cx="60" cy="45.5" r={mood === 'SAD' ? 1.8 : 2.5} fill={mood === 'SAD' ? '#1e1b4b' : '#4f46e5'} />
                </g>
            </g>
        </g>

        {/* Glasses */}
        <g stroke="#334155" strokeWidth="1.5" fill="none" opacity="0.9">
            <rect x="30" y="38" width="20" height="14" rx="4" />
            <rect x="50" y="38" width="20" height="14" rx="4" />
            <path d="M48 45 Q50 44 52 45" /> {/* Bridge */}
            <path d="M30 45 L25 44" /> {/* Left temple */}
            <path d="M70 45 L75 44" /> {/* Right temple */}
        </g>

        {/* Expressions */}
        {mood === 'SAD' && (
            <>
               <path d="M32 36 L42 39" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
               <path d="M58 39 L68 36" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
               <path d="M44 72 Q50 68 56 72" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </>
        )}
        {mood === 'CONFUSED' && (
            <>
               <path d="M32 36 L42 36" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
               <path d="M58 34 L68 32" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
               <path d="M46 68 L54 68" stroke="#5D4037" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </>
        )}
        {(mood === 'HAPPY' || mood === 'THINKING' || mood === 'ACTING') && (
             <path d="M40 68 Q50 76 60 68" stroke="#5D4037" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        )}
    </g>
  </svg>
);

// --- DYNAMIC FORM WIDGET ---
export const DynamicForm = ({ 
    fields, 
    title, 
    onSubmit 
}: { 
    fields: { key: string, label: string, type: string, options?: string[] }[], 
    title: string, 
    onSubmit: (data: any) => void 
}) => {
    const [formData, setFormData] = useState<any>({});

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 mt-2 border border-gray-200">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ClipboardList size={16} className="text-brand-400" /> {title || "Information Required"}
            </h4>
            <div className="space-y-3">
                {fields?.map((field) => (
                    <div key={field.key}>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{field.label || field.key}</label>
                        {field.type === 'select' ? (
                            <select 
                                className="w-full bg-white border border-gray-200 text-white rounded p-2 text-sm focus:border-brand-500 outline-none"
                                onChange={(e) => handleChange(field.key, e.target.value)}
                            >
                                <option value="">Select...</option>
                                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        ) : field.type === 'date' ? (
                            <input 
                                type="date" 
                                className="w-full bg-white border border-gray-200 text-white rounded p-2 text-sm focus:border-brand-500 outline-none"
                                onChange={(e) => handleChange(field.key, e.target.value)}
                            />
                        ) : (
                            <input 
                                type="text" 
                                className="w-full bg-white border border-gray-200 text-white rounded p-2 text-sm focus:border-brand-500 outline-none"
                                placeholder={`Enter ${field.label ? field.label.toLowerCase() : (field.key || 'value').toLowerCase()}...`}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                            />
                        )}
                    </div>
                ))}
            </div>
            <button 
                onClick={() => onSubmit(formData)}
                className="w-full mt-4 bg-brand-600 hover:bg-brand-50 text-white font-bold py-2 rounded-lg text-sm transition-colors"
            >
                Submit Details
            </button>
        </div>
    );
};

export const PlainEditor = ({ initialContent, onChange }: { initialContent: string, onChange: (text: string) => void }) => {
    const [content, setContent] = useState(initialContent);
    const [previewMode, setPreviewMode] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        onChange(e.target.value);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mode:</span>
                    <button onClick={() => setPreviewMode(false)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!previewMode ? 'bg-white text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Edit</button>
                    <button onClick={() => setPreviewMode(true)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${previewMode ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Preview</button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
                {previewMode ? (
                    <div className="w-full h-full p-8 overflow-y-auto bg-white font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">{content}</div>
                ) : (
                    <textarea 
                        className="w-full h-full p-6 md:p-8 resize-none outline-none border-none font-mono text-sm leading-relaxed text-slate-800 bg-white"
                        value={content}
                        onChange={handleChange}
                        placeholder="Start typing..."
                        spellCheck={false}
                    />
                )}
            </div>
        </div>
    );
};

export const SpreadsheetEditor = ({ initialContent, onChange }: { initialContent: string, onChange: (csv: string) => void }) => {
    const [grid, setGrid] = useState<string[][]>(() => initialContent.trim().split('\n').map(row => row.split(',')));

    const updateCell = (rowIdx: number, colIdx: number, value: string) => {
        const newGrid = [...grid];
        newGrid[rowIdx][colIdx] = value;
        setGrid(newGrid);
        onChange(newGrid.map(r => r.join(',')).join('\n'));
    };

    return (
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div className="bg-white border border-gray-300 shadow-lg overflow-hidden rounded-sm mx-auto max-w-5xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <tbody>
                            {grid.map((row, i) => (
                                <tr key={i}>
                                    <td className="bg-gray-50 border-b border-r border-gray-300 text-center text-xs font-bold text-gray-500 w-10">{i + 1}</td>
                                    {row.map((cell, j) => (
                                        <td key={j} className="border-b border-r border-gray-200 p-0">
                                            <input 
                                                className="w-full h-full px-2 py-1.5 border-none outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 bg-transparent text-slate-900 font-mono"
                                                value={cell}
                                                onChange={(e) => updateCell(i, j, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const ResourceViewer = ({ initialContent, title, format, onClose, onUpdate, onForward, onAssign }: { initialContent: string, title: string, format: 'csv' | 'markdown' | 'text' | 'json', onClose: () => void, onUpdate: (content: string) => void, onForward?: () => void, onAssign?: () => void }) => {
    const [content, setContent] = useState(initialContent);
    const isSpreadsheet = format === 'csv';

    const handleContentChange = (newVal: string) => {
        setContent(newVal);
        onUpdate(newVal);
    };

    return (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-fade-in">
            <div className="h-14 bg-white text-white flex items-center justify-between px-4 sm:px-6 shadow-lg shrink-0 z-20">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-1.5 bg-gray-50 rounded-lg shrink-0">
                        {isSpreadsheet ? <Table size={18} className="text-green-400"/> : <FileText size={18} className="text-brand-400"/>}
                    </div>
                    <div className="min-w-0"><h3 className="font-bold text-sm font-mono uppercase tracking-wide truncate">{title || "Creation Preview"}</h3></div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-hidden relative bg-gray-100">
                {isSpreadsheet ? <SpreadsheetEditor initialContent={initialContent} onChange={handleContentChange} /> : <PlainEditor initialContent={initialContent} onChange={handleContentChange} />}
            </div>
            <div className="p-3 bg-white border-t border-gray-200 flex justify-between items-center gap-4 z-20">
                <span className="text-xs text-gray-500 font-medium hidden sm:flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> Auto-saved</span>
                <div className="flex gap-3 w-full sm:w-auto">
                    {onForward && <Button variant="secondary" onClick={onForward} className="flex-1 sm:flex-none justify-center px-4 h-10 text-xs font-bold border-gray-300 text-slate-600 hover:bg-gray-50"><Share2 size={14} className="mr-2"/> Forward</Button>}
                    <Button variant="secondary" onClick={() => window.print()} className="flex-1 sm:flex-none justify-center px-4 h-10 text-xs font-bold border-gray-300 text-slate-600 hover:bg-gray-50"><Printer size={14} className="mr-2"/> Print</Button>
                </div>
            </div>
        </div>
    );
};

export const ForwardModal = ({ onClose, onSend, creationTitle, contacts }: { onClose: () => void, onSend: (recipientId: string) => void, creationTitle: string, contacts: { id: string, name: string }[] }) => {
    const [recipientId, setRecipientId] = useState('');
    const [search, setSearch] = useState('');
    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="absolute inset-0 z-[70] bg-white/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2"><Share2 size={18} className="text-brand-600"/> Forward Creation</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-slate-600"><X size={18}/></button>
                </div>
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg mb-4">
                    <span className="text-xs font-bold text-brand-700 uppercase block mb-1">Item</span>
                    <div className="text-sm font-medium text-brand-900 truncate">{creationTitle}</div>
                </div>
                <div className="space-y-3 mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase">To Recipient</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="Search contact..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                        {filteredContacts.map(contact => (
                            <button key={contact.id} onClick={() => setRecipientId(contact.id)} className={`text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${recipientId === contact.id ? 'bg-brand-100 text-brand-900 border border-brand-200' : 'bg-gray-50 text-slate-700 hover:bg-gray-100'}`}>
                                <div className={`w-3 h-3 rounded-full border-2 ${recipientId === contact.id ? 'bg-brand-600 border-brand-600' : 'border-gray-300'}`}></div>
                                {contact.name}
                            </button>
                        ))}
                    </div>
                </div>
                <Button onClick={() => onSend(recipientId)} disabled={!recipientId} className="w-full justify-center shadow-lg shadow-brand-200">Send Now</Button>
            </div>
        </div>
    )
};
