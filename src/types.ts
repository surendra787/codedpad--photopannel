export interface VaultFileItem {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  category: 'photo' | 'video' | 'document';
  uploaded_at: string;
  url: string;
}

export interface VaultStats {
  total_files: number;
  photos_count: number;
  videos_count: number;
  documents_count: number;
  total_bytes: number;
  storage_limit_bytes: number;
}

export interface VaultSessionData {
  token: string;
  vault_id: string;
  is_new: boolean;
  message: string;
}

export interface EndpointSpec {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  summary: string;
  requiresAuth: boolean;
  requestBodySample?: Record<string, any>;
  description: string;
}
