/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { VaultLoginCard } from './components/VaultLoginCard';
import { VaultDashboard } from './components/VaultDashboard';
import { SwaggerExplorer } from './components/SwaggerExplorer';
import { ExaminerGuideModal } from './components/ExaminerGuideModal';
import { FileViewerModal } from './components/FileViewerModal';
import { VaultFileItem, VaultStats } from './types';
import { Shield, Sparkles, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('cp_token'));
  const [vaultId, setVaultId] = useState<string | null>(() => sessionStorage.getItem('cp_vault_id'));
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => !!sessionStorage.getItem('cp_token'));
  
  const [files, setFiles] = useState<VaultFileItem[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'vault' | 'swagger'>('vault');
  const [isExaminerGuideOpen, setIsExaminerGuideOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<VaultFileItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch files and vault statistics
  const fetchVaultData = useCallback(async (authToken: string) => {
    try {
      // Fetch files
      const filesRes = await fetch('/api/files', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setFiles(filesData.files || []);
      }

      // Fetch stats
      const statsRes = await fetch('/api/vault/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch vault data:', err);
    }
  }, []);

  // Sync state if already has token
  useEffect(() => {
    if (token) {
      fetchVaultData(token);
    }
  }, [token, fetchVaultData]);

  // Open / Create Vault
  const handleOpenVault = async (password: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/vault/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail?.[0]?.msg || data.detail || data.error || 'Failed to open vault');
      }

      setToken(data.token);
      setVaultId(data.vault_id);
      setIsUnlocked(true);

      sessionStorage.setItem('cp_token', data.token);
      sessionStorage.setItem('cp_vault_id', data.vault_id);

      showNotification(data.is_new ? 'New private vault created!' : 'Vault unlocked successfully!');
      await fetchVaultData(data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to open vault. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Lock / Close Vault
  const handleLockVault = async () => {
    if (token) {
      try {
        await fetch('/api/vault/close', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Error during lock:', err);
      }
    }

    setToken(null);
    setVaultId(null);
    setIsUnlocked(false);
    setFiles([]);
    setStats(null);
    sessionStorage.removeItem('cp_token');
    sessionStorage.removeItem('cp_vault_id');
    showNotification('Vault locked securely.');
  };

  // Upload file
  const handleUploadFile = async (file: File) => {
    if (!token) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail?.[0]?.msg || data.detail || 'Upload failed');
      }

      showNotification(`"${file.name}" uploaded and encrypted!`);
      await fetchVaultData(token);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showNotification('File removed from vault.');
        await fetchVaultData(token);
      } else {
        const data = await res.json();
        alert(`Delete failed: ${data.detail || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-slate-50 to-blue-50/40 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        isUnlocked={isUnlocked}
        vaultId={vaultId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExaminerGuide={() => setIsExaminerGuideOpen(true)}
        onLockVault={handleLockVault}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        {activeTab === 'swagger' ? (
          <SwaggerExplorer token={token} vaultId={vaultId} />
        ) : isUnlocked ? (
          <VaultDashboard
            files={files}
            stats={stats}
            vaultId={vaultId || '000000'}
            token={token || ''}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
            onSelectFile={(f) => setSelectedFile(f)}
            onRefresh={() => token && fetchVaultData(token)}
            isUploading={isUploading}
          />
        ) : (
          <div className="my-auto py-6">
            <VaultLoginCard
              onOpenVault={handleOpenVault}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />

            {/* Presentation Helper Callout */}
            <div className="max-w-md mx-auto mt-6">
              <div className="bg-white/80 backdrop-blur-xs border border-amber-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-800 font-medium">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Presenting to an External Examiner?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExaminerGuideOpen(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition cursor-pointer whitespace-nowrap"
                >
                  View Guide
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* File Lightbox / Player Modal */}
      <FileViewerModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDeleteFile}
      />

      {/* Examiner Guide Modal */}
      <ExaminerGuideModal
        isOpen={isExaminerGuideOpen}
        onClose={() => setIsExaminerGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 py-4 bg-white/50 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>CodedPad · End-to-End Encrypted Private Storage</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>FastAPI & Express REST API Compliant</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsExaminerGuideOpen(true)}
              className="hover:text-blue-600 underline cursor-pointer"
            >
              Examiner Troubleshooting
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
