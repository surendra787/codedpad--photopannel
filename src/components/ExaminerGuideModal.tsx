import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  Code2,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ExaminerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExaminerGuideModal: React.FC<ExaminerGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'solutions' | 'viva'>('diagnosis');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">External Examiner Presentation Guide</h2>
              <p className="text-xs text-blue-100">
                Fixing the VS Code backend packages issue & presentation walkthrough
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('diagnosis')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'diagnosis'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>1. What Went Wrong in VS Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('solutions')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'solutions'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>2. How to Run It Flawlessly</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('viva')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'viva'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>3. Examiner Q&A & Architecture</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {activeTab === 'diagnosis' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm mb-1">
                    Why Did the Backend Ask for Packages When Cloned from GitHub?
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    When you clone a repository from GitHub to a new machine in VS Code, Python does <strong>not</strong> include packages in the git repository (the virtual environment folder <code className="font-mono bg-amber-100 px-1 rounded">venv/</code> is ignored by <code className="font-mono bg-amber-100 px-1 rounded">.gitignore</code>).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">
                    Reason 1: Missing Virtual Environment
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Python packages are stored inside a localized environment. When cloned fresh, you must create and activate that environment before Python knows where to find <code className="font-mono bg-slate-200 px-1 rounded">fastapi</code>, <code className="font-mono bg-slate-200 px-1 rounded">uvicorn</code>, and <code className="font-mono bg-slate-200 px-1 rounded">multipart</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">
                    Reason 2: Missing or Incomplete requirements.txt
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    If <code className="font-mono bg-slate-200 px-1 rounded">requirements.txt</code> was missing or didn't list <code className="font-mono bg-slate-200 px-1 rounded">python-multipart</code> (required for file uploads), FastAPI crashes when trying to start.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">
                    Reason 3: Windows PowerShell Execution Policy
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    In VS Code on Windows, running <code className="font-mono bg-slate-200 px-1 rounded">activate.ps1</code> often fails with <em>"Execution of scripts is disabled on this system"</em>, leaving the user with broken global imports.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">
                    Reason 4: Two Separate Terminals & CORS
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Having to run frontend on Port 3000/5173 and backend on Port 8000 in two separate terminals causes confusion and CORS errors during a live presentation.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-blue-950 text-xs">Good News: We Have Completely Solved This!</h5>
                  <p className="text-xs text-blue-700">
                    We provided a 1-command fullstack solution AND a 1-click Python runner.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('solutions')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                >
                  View Solutions
                </button>
              </div>
            </div>
          )}

          {activeTab === 'solutions' && (
            <div className="space-y-6">
              {/* Solution 1 */}
              <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      Recommended: Option 1 — 1-Command Unified Full-Stack
                    </h4>
                  </div>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Fool-proof for Presentation
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Both frontend and backend run seamlessly together via Node.js/Express. Zero python packages needed, zero CORS headaches!
                </p>
                <div className="bg-slate-900 rounded-xl p-3 text-xs font-mono text-emerald-400 relative">
                  <pre>
{`# In VS Code terminal:
npm install
npm run dev`}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyText('npm install\nnpm run dev', 'opt1')}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition cursor-pointer"
                  >
                    {copiedKey === 'opt1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Opens everything on <strong className="text-slate-700">http://localhost:3000</strong> with all 8 Swagger API endpoints fully active.
                </p>
              </div>

              {/* Solution 2 */}
              <div className="border border-blue-200 bg-blue-50/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      Option 2: Standalone Python FastAPI Backend
                    </h4>
                  </div>
                  <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    If Examiner Asks for Python
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  We built a dedicated folder <code className="font-mono bg-blue-100 px-1 rounded">python-backend/</code> with a 1-click startup script that automatically creates the virtual environment and installs all dependencies:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800 block mb-1">On Windows (1-Click):</span>
                    <p className="text-slate-500 text-[11px] mb-2">
                      Double-click this file inside VS Code or File Explorer:
                    </p>
                    <code className="font-mono bg-slate-100 text-blue-700 px-2 py-1 rounded block">
                      python-backend/run_backend.bat
                    </code>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800 block mb-1">Manual VS Code Terminal:</span>
                    <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-2 rounded relative">
                      <pre>
{`cd python-backend
python -m venv venv
pip install -r requirements.txt
uvicorn main:app --reload`}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyText('cd python-backend\npython -m venv venv\npip install -r requirements.txt\nuvicorn main:app --reload', 'opt2')}
                        className="absolute top-2 right-2 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                      >
                        {copiedKey === 'opt2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-900 text-xs block">
                  Top 4 Viva Questions the External Examiner Might Ask:
                </span>
                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-blue-700">Q1: How is the vault password secured?</strong>
                    <p className="text-slate-600 mt-0.5">
                      "We use zero-knowledge deterministic key derivation using SHA-256 and MD5 salt. The raw password is never stored anywhere on the server. Even if the database is leaked, the user's files cannot be decrypted without their password."
                    </p>
                  </div>

                  <div>
                    <strong className="text-blue-700">Q2: How does authentication work without cookies?</strong>
                    <p className="text-slate-600 mt-0.5">
                      "Upon successful vault opening, an ephemeral cryptographic bearer token (<code className="font-mono bg-slate-200 px-1 rounded">cp_...</code>) is returned. Subsequent requests include this token in the <code className="font-mono bg-slate-200 px-1 rounded">Authorization: Bearer</code> header, following standard OpenAPI/OAuth2 bearer conventions."
                    </p>
                  </div>

                  <div>
                    <strong className="text-blue-700">Q3: How are files protected against malicious uploads?</strong>
                    <p className="text-slate-600 mt-0.5">
                      "Uploads are validated through binary MIME detection, maximum payload size enforcement (50MB), and sanitized GUID storage paths to eliminate Directory Traversal (<code className="font-mono bg-slate-200 px-1 rounded">../</code>) vulnerabilities."
                    </p>
                  </div>

                  <div>
                    <strong className="text-blue-700">Q4: Why was Swagger UI implemented?</strong>
                    <p className="text-slate-600 mt-0.5">
                      "Swagger/OpenAPI 3.1 serves as the contract between our frontend React SPA and the backend REST services, allowing independent testing, automated schema validation, and complete API transparency."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Keep this guide open or switch to Swagger API to demonstrate live endpoints.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
