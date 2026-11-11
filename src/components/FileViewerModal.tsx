import React from 'react';
import { X, Download, Trash2, Calendar, HardDrive, Shield, FileText } from 'lucide-react';
import { VaultFileItem } from '../types';

interface FileViewerModalProps {
  file: VaultFileItem | null;
  onClose: () => void;
  onDelete: (fileId: string) => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, onClose, onDelete }) => {
  if (!file) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3 truncate">
            <span className="px-2 py-0.5 bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase rounded">
              {file.category}
            </span>
            <h3 className="text-sm font-semibold truncate text-slate-100" title={file.name}>
              {file.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={file.url}
              download={file.name}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Permanently delete "${file.name}"?`)) {
                  onDelete(file.id);
                  onClose();
                }
              }}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
              title="Delete file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Preview Area */}
        <div className="flex-1 bg-black/95 flex items-center justify-center overflow-auto p-4 min-h-[300px]">
          {file.category === 'photo' ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
            />
          ) : file.category === 'video' ? (
            <video
              src={file.url}
              controls
              autoPlay
              className="max-h-[60vh] max-w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-medium text-slate-300 mb-2">{file.name}</p>
              <a
                href={file.url}
                download={file.name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </a>
            </div>
          )}
        </div>

        {/* File Metadata Info Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDate(file.uploaded_at)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
              <span>MIME: {file.mime_type}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span>Vault Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
