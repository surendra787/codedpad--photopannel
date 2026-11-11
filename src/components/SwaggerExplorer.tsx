import React, { useState } from 'react';
import {
  Lock,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  Server,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface SwaggerExplorerProps {
  token: string | null;
  vaultId: string | null;
}

interface EndpointItem {
  id: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  isSecured: boolean;
  defaultPayload?: string;
  parameters?: { name: string; type: string; in: string; description: string; defaultVal?: string }[];
}

const ENDPOINTS: EndpointItem[] = [
  {
    id: 'home',
    method: 'GET',
    path: '/',
    summary: 'Home',
    description: 'Get API welcome message and status overview',
    isSecured: false,
  },
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    summary: 'Health',
    description: 'Check active vaults count, storage directory status, and server uptime',
    isSecured: false,
  },
  {
    id: 'open_vault',
    method: 'POST',
    path: '/api/vault/open',
    summary: 'Open Vault',
    description: 'Verify password, derive vault key, and generate an authenticated session token',
    isSecured: false,
    defaultPayload: JSON.stringify({ password: 'password123' }, null, 2),
  },
  {
    id: 'me_vault',
    method: 'GET',
    path: '/api/vault/me',
    summary: 'Current Vault',
    description: 'Fetch vault metrics: file counts, photos/videos tally, and disk usage',
    isSecured: true,
  },
  {
    id: 'close_vault',
    method: 'POST',
    path: '/api/vault/close',
    summary: 'Close Vault',
    description: 'Terminate active session and lock access to the private vault',
    isSecured: true,
  },
  {
    id: 'upload_file',
    method: 'POST',
    path: '/api/files/upload',
    summary: 'Upload File',
    description: 'Upload a private photo or video (multipart/form-data with "file" parameter)',
    isSecured: true,
  },
  {
    id: 'list_files',
    method: 'GET',
    path: '/api/files',
    summary: 'List Files',
    description: 'Retrieve list of all files in current vault with optional category or search filters',
    isSecured: true,
    parameters: [
      { name: 'category', type: 'string', in: 'query', description: 'Filter: photo, video, document, or all', defaultVal: 'all' },
      { name: 'search', type: 'string', in: 'query', description: 'Search term by filename', defaultVal: '' },
    ],
  },
  {
    id: 'view_file',
    method: 'GET',
    path: '/api/files/{file_id}',
    summary: 'View File',
    description: 'Stream binary media or download with appropriate content-type headers',
    isSecured: true,
    parameters: [
      { name: 'file_id', type: 'string', in: 'path', description: 'Unique file ID (e.g. demo-photo-1)', defaultVal: 'demo-photo-1' },
    ],
  },
];

export const SwaggerExplorer: React.FC<SwaggerExplorerProps> = ({ token, vaultId }) => {
  const [expandedId, setExpandedId] = useState<string | null>('health');
  const [paramInputs, setParamInputs] = useState<Record<string, string>>({
    file_id: 'demo-photo-1',
    category: 'all',
  });
  const [requestBodies, setRequestBodies] = useState<Record<string, string>>({
    open_vault: JSON.stringify({ password: 'password123' }, null, 2),
  });
  const [responses, setResponses] = useState<
    Record<string, { status: number; durationMs: number; data: any; headers: any }>
  >({});
  const [isExecuting, setIsExecuting] = useState<Record<string, boolean>>({});
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);

  const toggleEndpoint = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExecute = async (endpoint: EndpointItem) => {
    setIsExecuting((prev) => ({ ...prev, [endpoint.id]: true }));
    const startTime = performance.now();

    try {
      let resolvedPath = endpoint.path;
      if (resolvedPath.includes('{file_id}')) {
        const idVal = paramInputs['file_id'] || 'demo-photo-1';
        resolvedPath = resolvedPath.replace('{file_id}', encodeURIComponent(idVal));
      }

      if (endpoint.id === 'list_files') {
        const queryParams = new URLSearchParams();
        if (paramInputs['category'] && paramInputs['category'] !== 'all') {
          queryParams.append('category', paramInputs['category']);
        }
        if (paramInputs['search']) {
          queryParams.append('search', paramInputs['search']);
        }
        const qs = queryParams.toString();
        if (qs) resolvedPath += `?${qs}`;
      }

      const headers: Record<string, string> = {};
      if (endpoint.method === 'GET' && endpoint.path === '/') {
        headers['Accept'] = 'application/json';
      }

      if (endpoint.isSecured && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers,
      };

      if (endpoint.method === 'POST') {
        if (endpoint.id === 'open_vault') {
          headers['Content-Type'] = 'application/json';
          options.body = requestBodies['open_vault'] || JSON.stringify({ password: 'password123' });
        }
      }

      const res = await fetch(resolvedPath, options);
      const durationMs = Math.round(performance.now() - startTime);

      let data: any;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else if (contentType.includes('image/') || contentType.includes('video/')) {
        data = `[Binary Media Stream: ${contentType}, Content-Length: ${res.headers.get('content-length') || 'dynamic'}]`;
      } else {
        data = await res.text();
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      setResponses((prev) => ({
        ...prev,
        [endpoint.id]: {
          status: res.status,
          durationMs,
          data,
          headers: resHeaders,
        },
      }));
    } catch (err: any) {
      setResponses((prev) => ({
        ...prev,
        [endpoint.id]: {
          status: 500,
          durationMs: Math.round(performance.now() - startTime),
          data: { error: err.message },
          headers: {},
        },
      }));
    } finally {
      setIsExecuting((prev) => ({ ...prev, [endpoint.id]: false }));
    }
  };

  const copyCurl = (endpoint: EndpointItem) => {
    let resolvedPath = endpoint.path.replace('{file_id}', paramInputs['file_id'] || 'demo-photo-1');
    let curl = `curl -X ${endpoint.method} "http://localhost:3000${resolvedPath}"`;
    if (endpoint.isSecured && token) {
      curl += ` \\\n  -H "Authorization: Bearer ${token}"`;
    }
    if (endpoint.method === 'POST' && endpoint.id === 'open_vault') {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBodies['open_vault'] || '{"password":"password123"}'}'`;
    }

    navigator.clipboard.writeText(curl);
    setCopiedCurl(endpoint.id);
    setTimeout(() => setCopiedCurl(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCode2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Swagger OpenAPI 3.1 Explorer</h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono font-semibold border border-emerald-200">
              Live Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Interactive API test console matching your backend Swagger documentation. Test endpoints live with or without session authentication.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500">Auth Token: </span>
            {token ? (
              <span className="font-mono font-semibold text-emerald-600">
                {token.substring(0, 10)}...
              </span>
            ) : (
              <span className="text-amber-600 font-medium">None (Vault Locked)</span>
            )}
          </div>
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 font-medium transition cursor-pointer"
          >
            <span>OpenAPI Spec</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Swagger Container - Exactly matching image_cbc4d20d.png */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Swagger default section header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-slate-900 font-mono">default</span>
            <span className="text-xs text-slate-500">8 Endpoints defined</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">CodedPad REST API</span>
        </div>

        {/* Endpoints List */}
        <div className="divide-y divide-slate-100 p-4 space-y-3">
          {ENDPOINTS.map((ep) => {
            const isExpanded = expandedId === ep.id;
            const resp = responses[ep.id];
            const isGet = ep.method === 'GET';
            const isPost = ep.method === 'POST';

            return (
              <div
                key={ep.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isGet
                    ? 'border-blue-200 bg-blue-50/20'
                    : isPost
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Endpoint Header Bar (Exact match to Swagger UI in screenshot) */}
                <button
                  type="button"
                  onClick={() => toggleEndpoint(ep.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-black/5 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 text-xs font-bold font-mono rounded-md uppercase tracking-wider text-white ${
                        isGet ? 'bg-blue-600' : isPost ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {ep.path}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {ep.summary}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {ep.isSecured && (
                      <span
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Requires Authorization: Bearer token"
                      >
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Endpoint Body */}
                {isExpanded && (
                  <div className="p-5 bg-white border-t border-slate-100 space-y-5 text-xs">
                    <div className="text-slate-600">{ep.description}</div>

                    {/* Parameters if any */}
                    {ep.parameters && ep.parameters.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                          Parameters
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-3">
                          {ep.parameters.map((p) => (
                            <div key={p.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-semibold text-slate-800">{p.name}</span>{' '}
                                <span className="text-slate-400 text-[10px]">({p.in})</span>
                                <p className="text-slate-500 text-[11px]">{p.description}</p>
                              </div>
                              <input
                                type="text"
                                value={paramInputs[p.name] ?? p.defaultVal ?? ''}
                                onChange={(e) =>
                                  setParamInputs((prev) => ({ ...prev, [p.name]: e.target.value }))
                                }
                                className="w-full sm:w-48 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Request Body if POST */}
                    {ep.defaultPayload && (
                      <div className="space-y-2">
                        <div className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                          Request Body (application/json)
                        </div>
                        <textarea
                          rows={4}
                          value={requestBodies[ep.id] ?? ep.defaultPayload}
                          onChange={(e) =>
                            setRequestBodies((prev) => ({ ...prev, [ep.id]: e.target.value }))
                          }
                          className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Execute and Copy Curl buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleExecute(ep)}
                        disabled={isExecuting[ep.id]}
                        className={`flex items-center gap-1.5 px-4 py-2 font-semibold text-white rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50 ${
                          isGet ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{isExecuting[ep.id] ? 'Executing...' : 'Execute Request'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => copyCurl(ep)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium transition cursor-pointer"
                      >
                        {copiedCurl === ep.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied cURL!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy cURL</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Response display */}
                    {resp && (
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                              Server Response
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                resp.status >= 200 && resp.status < 300
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {resp.status} {resp.status === 200 ? 'OK' : resp.status === 201 ? 'Created' : ''}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {resp.durationMs}ms
                            </span>
                          </div>
                        </div>

                        {/* Response Body code block */}
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-emerald-400 font-mono text-xs max-h-64">
                          <pre>
                            {typeof resp.data === 'object'
                              ? JSON.stringify(resp.data, null, 2)
                              : String(resp.data)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Schemas Section (Matching screenshot image_cbc4d20d.png bottom section) */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wider">
              Schemas
            </h3>
            <span className="text-xs text-slate-400 font-mono">Pydantic / OpenAPI Models</span>
          </div>

          <div className="space-y-2">
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-800">
                Body_upload_file_api_files_upload_post
              </span>
              <span className="text-slate-400">multipart/form-data: file (binary)</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-800">HTTPValidationError</span>
              <span className="text-slate-400">detail: ValidationError[]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
