import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Eye,
  Plus,
  HardDrive,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { VaultFileItem, VaultStats } from '../types';

interface VaultDashboardProps {
  files: VaultFileItem[];
  stats: VaultStats | null;
  vaultId: string;
  token: string;
  onUploadFile: (file: File) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onSelectFile: (file: VaultFileItem) => void;
  onRefresh: () => void;
  isUploading: boolean;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({
  files,
  stats,
  vaultId,
  token,
  onUploadFile,
  onDeleteFile,
  onSelectFile,
  onRefresh,
  isUploading,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'photo' | 'video' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter files
  const filteredFiles = files.filter((file) => {
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        await onUploadFile(e.dataTransfer.files[i]);
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        await onUploadFile(e.target.files[i]);
      }
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const totalBytes = stats?.total_bytes ?? files.reduce((acc, f) => acc + f.size, 0);
  const storageLimit = stats?.storage_limit_bytes ?? 500 * 1024 * 1024;
  const storagePercent = Math.min(100, Math.round((totalBytes / storageLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900">Your Private Vault</h2>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/60 font-semibold">
                ID: {vaultId}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Encrypted end-to-end with SHA-256 key derivation. Only accessible with your password.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Refresh vault contents"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Upload New File</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-500 font-medium mb-1">Total Files</div>
            <div className="text-2xl font-bold text-slate-900">{files.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">In current vault</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="text-xs text-blue-700 font-medium mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {files.filter((f) => f.category === 'photo').length}
            </div>
            <div className="text-[11px] text-blue-500 mt-0.5">PNG, JPG, WebP</div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="text-xs text-indigo-700 font-medium mb-1 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              <span>Videos</span>
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {files.filter((f) => f.category === 'video').length}
            </div>
            <div className="text-[11px] text-indigo-500 mt-0.5">MP4, WebM, MOV</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="text-xs text-emerald-700 font-medium mb-1 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Storage Used</span>
            </div>
            <div className="text-lg font-bold text-emerald-900">
              {formatFileSize(totalBytes)}{' '}
              <span className="text-xs font-normal text-emerald-600">/ 500 MB</span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full bg-emerald-200/60 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, storagePercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer bg-white ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/40 scale-[1.005]'
            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.txt,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            {isUploading ? 'Encrypting & Storing File...' : 'Click to upload or drag & drop files here'}
          </h3>
          <p className="text-xs text-slate-500 mb-2">
            Secure storage for personal photos, private home videos, and sensitive documents.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>PNG, JPG, WebP, MP4, WebM up to 50MB</span>
            <span>·</span>
            <span className="text-blue-600 font-medium">Automatic category detection</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filter segmented control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Files ({files.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('photo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              filterCategory === 'photo'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos ({files.filter((f) => f.category === 'photo').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('video')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              filterCategory === 'video'
                ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos ({files.filter((f) => f.category === 'video').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('document')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              filterCategory === 'document'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Docs ({files.filter((f) => f.category === 'document').length})</span>
          </button>
        </div>

        {/* Search & View Mode */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid view"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display Section */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">No files match your filter</h4>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            {searchQuery
              ? `No files found matching "${searchQuery}". Clear your search or try another keyword.`
              : 'Your vault is ready. Upload private photos or videos above to store them securely.'}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Upload First Memory
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col"
            >
              {/* Media Thumbnail */}
              <div
                className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center"
                onClick={() => onSelectFile(file)}
              >
                {file.category === 'photo' ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : file.category === 'video' ? (
                  <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                    <video src={file.url} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-blue-600 ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                    <FileText className="w-12 h-12 text-slate-400 mb-2" />
                    <span className="text-xs uppercase font-mono">{file.mime_type.split('/')[1] || 'DOC'}</span>
                  </div>
                )}

                {/* Category badge */}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium rounded-md uppercase tracking-wider">
                  {file.category}
                </span>

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFile(file);
                    }}
                    className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white hover:text-blue-600 transition shadow-sm cursor-pointer"
                    title="View file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white hover:text-blue-600 transition shadow-sm cursor-pointer"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${file.name}" from vault?`)) {
                        onDeleteFile(file.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-sm cursor-pointer"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h4
                    className="text-xs font-semibold text-slate-800 truncate hover:text-blue-600 cursor-pointer"
                    title={file.name}
                    onClick={() => onSelectFile(file)}
                  >
                    {file.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>·</span>
                    <span>{formatDate(file.uploaded_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4 hidden md:table-cell">Uploaded Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => onSelectFile(file)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {file.category === 'photo' ? (
                          <img src={file.url} alt="" className="w-full h-full object-cover" />
                        ) : file.category === 'video' ? (
                          <Video className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <span className="font-medium text-slate-800 group-hover:text-blue-600 truncate max-w-xs">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-slate-500 capitalize">
                    {file.category}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-slate-500">
                    {formatDate(file.uploaded_at)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectFile(file)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={file.url}
                        download={file.name}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${file.name}"?`)) onDeleteFile(file.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
