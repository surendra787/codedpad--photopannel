import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';

interface VaultFile {
  id: string;
  vaultId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: 'photo' | 'video' | 'document';
  uploadedAt: string;
  url: string;
  storagePath: string;
}

interface VaultSession {
  vaultId: string;
  token: string;
  passwordHash: string;
  createdAt: string;
  lastActive: string;
}

// Storage setup
const STORAGE_ROOT = path.resolve(process.cwd(), 'vault_storage');
if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

// Memory database for fast, reliable state
const vaults = new Map<string, { passwordHash: string; createdAt: string; files: VaultFile[] }>();
const sessions = new Map<string, VaultSession>();

// Seed a default demo vault for instant preview testing
const demoPasswordHash = crypto.createHash('sha256').update('password123').digest('hex');
const demoVaultId = crypto.createHash('md5').update('password123').digest('hex').substring(0, 12);
vaults.set(demoVaultId, {
  passwordHash: demoPasswordHash,
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  files: [
    {
      id: 'demo-photo-1',
      vaultId: demoVaultId,
      name: 'Scenic_Mountain_Trip.jpg',
      originalName: 'Scenic_Mountain_Trip.jpg',
      mimeType: 'image/jpeg',
      size: 2450000,
      category: 'photo',
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
      storagePath: ''
    },
    {
      id: 'demo-photo-2',
      vaultId: demoVaultId,
      name: 'Sunset_Coastline_Walk.jpg',
      originalName: 'Sunset_Coastline_Walk.jpg',
      mimeType: 'image/jpeg',
      size: 3120000,
      category: 'photo',
      uploadedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      storagePath: ''
    },
    {
      id: 'demo-video-1',
      vaultId: demoVaultId,
      name: 'Ocean_Waves_Drone_4K.mp4',
      originalName: 'Ocean_Waves_Drone_4K.mp4',
      mimeType: 'video/mp4',
      size: 14800000,
      category: 'video',
      uploadedAt: new Date(Date.now() - 86400000 * 0.8).toISOString(),
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      storagePath: ''
    },
    {
      id: 'demo-photo-3',
      vaultId: demoVaultId,
      name: 'Secret_Project_Notes.png',
      originalName: 'Secret_Project_Notes.png',
      mimeType: 'image/png',
      size: 890000,
      category: 'photo',
      uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&q=80',
      storagePath: ''
    }
  ]
});

// Multer storage
const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, STORAGE_ROOT);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Helper for category
function detectCategory(mimeType: string, filename: string): 'photo' | 'video' | 'document' {
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.startsWith('video/')) return 'video';
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) return 'photo';
  if (['.mp4', '.webm', '.mov', '.mkv', '.avi'].includes(ext)) return 'video';
  return 'document';
}

// Token auth middleware
function authenticateVault(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', detail: 'Vault session token required' });
  }

  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized', detail: 'Invalid or expired vault session' });
  }

  session.lastActive = new Date().toISOString();
  (req as any).vaultSession = session;
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS for local developer tools
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // 1. GET / (Home) - returns JSON when API or accept header asks for it
  app.get('/', (req, res, next) => {
    if (req.headers.accept?.includes('application/json')) {
      return res.json({
        message: 'Welcome to CodedPad Private Vault API',
        status: 'online',
        version: '1.0.0',
        docs: '/api/docs',
        endpoints: [
          'GET /',
          'GET /api/health',
          'POST /api/vault/open',
          'GET /api/vault/me',
          'POST /api/vault/close',
          'POST /api/files/upload',
          'GET /api/files',
          'GET /api/files/:file_id'
        ]
      });
    }
    next();
  });

  // 2. GET /api/health
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      active_vaults: vaults.size,
      active_sessions: sessions.size,
      storage_directory: STORAGE_ROOT,
      uptime_seconds: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // 3. POST /api/vault/open
  app.post('/api/vault/open', (req, res) => {
    const { password } = req.body;
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(422).json({
        detail: [
          {
            loc: ['body', 'password'],
            msg: 'field required and cannot be empty',
            type: 'value_error.missing'
          }
        ]
      });
    }

    const trimmedPassword = password.trim();
    const passwordHash = crypto.createHash('sha256').update(trimmedPassword).digest('hex');
    const vaultId = crypto.createHash('md5').update(trimmedPassword).digest('hex').substring(0, 12);

    let isNew = false;
    let vault = vaults.get(vaultId);
    if (!vault) {
      isNew = true;
      vault = {
        passwordHash,
        createdAt: new Date().toISOString(),
        files: []
      };
      vaults.set(vaultId, vault);
    }

    // Generate secure session token
    const token = 'cp_' + crypto.randomBytes(24).toString('hex');
    const session: VaultSession = {
      vaultId,
      token,
      passwordHash,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    sessions.set(token, session);

    return res.json({
      status: 'success',
      token,
      vault_id: vaultId,
      is_new: isNew,
      message: isNew ? 'New private vault created successfully' : 'Vault opened successfully',
      file_count: vault.files.length
    });
  });

  // 4. GET /api/vault/me
  app.get('/api/vault/me', authenticateVault, (req, res) => {
    const session = (req as any).vaultSession as VaultSession;
    const vault = vaults.get(session.vaultId);
    if (!vault) {
      return res.status(404).json({ detail: 'Vault not found' });
    }

    const photos = vault.files.filter(f => f.category === 'photo').length;
    const videos = vault.files.filter(f => f.category === 'video').length;
    const docs = vault.files.filter(f => f.category === 'document').length;
    const totalBytes = vault.files.reduce((sum, f) => sum + f.size, 0);

    return res.json({
      vault_id: session.vaultId,
      created_at: vault.createdAt,
      last_active: session.lastActive,
      stats: {
        total_files: vault.files.length,
        photos_count: photos,
        videos_count: videos,
        documents_count: docs,
        total_bytes: totalBytes,
        storage_limit_bytes: 1024 * 1024 * 500 // 500MB
      }
    });
  });

  // 5. POST /api/vault/close
  app.post('/api/vault/close', authenticateVault, (req, res) => {
    const session = (req as any).vaultSession as VaultSession;
    sessions.delete(session.token);
    return res.json({
      status: 'success',
      message: 'Vault closed and session securely terminated'
    });
  });

  // 6. POST /api/files/upload
  app.post('/api/files/upload', authenticateVault, upload.single('file'), (req, res) => {
    const session = (req as any).vaultSession as VaultSession;
    const vault = vaults.get(session.vaultId);
    if (!vault) {
      return res.status(404).json({ detail: 'Vault not found' });
    }

    const file = req.file;
    if (!file) {
      return res.status(422).json({
        detail: [
          {
            loc: ['body', 'file'],
            msg: 'No file uploaded in form-data field "file"',
            type: 'value_error.missing'
          }
        ]
      });
    }

    const fileId = 'file_' + crypto.randomBytes(8).toString('hex');
    const category = detectCategory(file.mimetype, file.originalname);

    const vaultFile: VaultFile = {
      id: fileId,
      vaultId: session.vaultId,
      name: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      category,
      uploadedAt: new Date().toISOString(),
      url: `/api/files/${fileId}?token=${session.token}`,
      storagePath: file.path
    };

    vault.files.unshift(vaultFile);

    return res.status(201).json({
      status: 'uploaded',
      file: {
        id: vaultFile.id,
        name: vaultFile.name,
        size: vaultFile.size,
        mime_type: vaultFile.mimeType,
        category: vaultFile.category,
        uploaded_at: vaultFile.uploadedAt,
        url: vaultFile.url
      }
    });
  });

  // 7. GET /api/files
  app.get('/api/files', authenticateVault, (req, res) => {
    const session = (req as any).vaultSession as VaultSession;
    const vault = vaults.get(session.vaultId);
    if (!vault) {
      return res.status(404).json({ detail: 'Vault not found' });
    }

    const { category, search } = req.query;
    let list = [...vault.files];

    if (category && typeof category === 'string' && category !== 'all') {
      list = list.filter(f => f.category === category);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }

    return res.json({
      count: list.length,
      files: list.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        mime_type: f.mimeType,
        category: f.category,
        uploaded_at: f.uploadedAt,
        url: f.url.startsWith('http') ? f.url : `/api/files/${f.id}?token=${session.token}`
      }))
    });
  });

  // 8. GET /api/files/:file_id
  app.get('/api/files/:file_id', authenticateVault, (req, res) => {
    const session = (req as any).vaultSession as VaultSession;
    const vault = vaults.get(session.vaultId);
    if (!vault) {
      return res.status(404).json({ detail: 'Vault not found' });
    }

    const file = vault.files.find(f => f.id === req.params.file_id);
    if (!file) {
      return res.status(404).json({ detail: 'File not found in vault' });
    }

    // If external demo URL, redirect
    if (file.url && file.url.startsWith('http')) {
      return res.redirect(file.url);
    }

    // Serve local file
    if (file.storagePath && fs.existsSync(file.storagePath)) {
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      return fs.createReadStream(file.storagePath).pipe(res);
    }

    return res.status(404).json({ detail: 'File binary data not found on disk' });
  });

  // DELETE /api/files/:file_id
  app.delete('/api/files/:file_id', authenticateVault, (req, res) => {
    const session = (req as any).vaultSession as VaultSession;
    const vault = vaults.get(session.vaultId);
    if (!vault) {
      return res.status(404).json({ detail: 'Vault not found' });
    }

    const index = vault.files.findIndex(f => f.id === req.params.file_id);
    if (index === -1) {
      return res.status(404).json({ detail: 'File not found' });
    }

    const [deleted] = vault.files.splice(index, 1);
    if (deleted.storagePath && fs.existsSync(deleted.storagePath)) {
      try {
        fs.unlinkSync(deleted.storagePath);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }

    return res.json({ status: 'deleted', id: deleted.id });
  });

  // OpenAPI Specification endpoint (for Swagger viewer matching user's Image 2)
  app.get('/api/openapi.json', (_req, res) => {
    res.json({
      openapi: '3.1.0',
      info: {
        title: 'CodedPad Vault API',
        version: '0.1.0',
        description: 'Secure personal cloud vault backend with authenticated file storage and password protection.'
      },
      paths: {
        '/': {
          get: {
            summary: 'Home',
            operationId: 'home__get',
            responses: { '200': { description: 'Successful Response' } }
          }
        },
        '/api/health': {
          get: {
            summary: 'Health',
            operationId: 'health_api_health_get',
            responses: { '200': { description: 'Successful Response' } }
          }
        },
        '/api/vault/open': {
          post: {
            summary: 'Open Vault',
            operationId: 'open_vault_api_vault_open_post',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['password'],
                    properties: { password: { type: 'string', title: 'Password' } }
                  }
                }
              }
            },
            responses: { '200': { description: 'Successful Response' } }
          }
        },
        '/api/vault/me': {
          get: {
            summary: 'Current Vault',
            operationId: 'current_vault_api_vault_me_get',
            security: [{ OAuth2PasswordBearer: [] }],
            responses: { '200': { description: 'Successful Response' } }
          }
        },
        '/api/vault/close': {
          post: {
            summary: 'Close Vault',
            operationId: 'close_vault_api_vault_close_post',
            security: [{ OAuth2PasswordBearer: [] }],
            responses: { '200': { description: 'Successful Response' } }
          }
        },
        '/api/files/upload': {
          post: {
            summary: 'Upload File',
            operationId: 'upload_file_api_files_upload_post',
            security: [{ OAuth2PasswordBearer: [] }],
            requestBody: {
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    required: ['file'],
                    properties: { file: { type: 'string', format: 'binary', title: 'File' } }
                  }
                }
              }
            },
            responses: { '200': { description: 'Successful Response' } }
          }
        },
        '/api/files': {
          get: {
            summary: 'List Files',
            operationId: 'list_files_api_files_get',
            security: [{ OAuth2PasswordBearer: [] }],
            responses: { '200': { description: 'Successful Response' } }
          }
        },
        '/api/files/{file_id}': {
          get: {
            summary: 'View File',
            operationId: 'view_file_api_files__file_id__get',
            security: [{ OAuth2PasswordBearer: [] }],
            parameters: [
              {
                name: 'file_id',
                in: 'path',
                required: true,
                schema: { type: 'string', title: 'File Id' }
              }
            ],
            responses: { '200': { description: 'Successful Response' } }
          }
        }
      }
    });
  });

  // Mount Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodedPad server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
