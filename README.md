# CodedPad - Secure Private Storage Vault 🔐

CodedPad is a full-stack personal vault application designed for storing and encrypting private memories, photos, and videos behind a password-authenticated security layer.

---

## 🎯 Quick Start (Examiner Presentation Guide)

When presenting to your external examiner, you have **TWO 100% reliable ways** to run CodedPad:

### 🌟 Option 1: Unified Full-Stack Mode (Recommended & Easiest)
Runs **both** the frontend and the backend from a single terminal with zero Python environment or package headaches.

```bash
# 1. Clone repository
git clone <your-github-repo-url>
cd <repo-folder>

# 2. Install all dependencies (Node.js)
npm install

# 3. Start unified server (Frontend + Backend on Port 3000)
npm run dev
```
Open your browser at: `http://localhost:3000`

---

### 🐍 Option 2: Python FastAPI Backend + Vite Frontend
If your examiner asks specifically for the Python/FastAPI architecture (with Swagger Docs at `http://127.0.0.1:8000/docs`):

#### Why Did the Backend Ask for Packages When Cloning?
> **Key Viva Question to Answer**:
> *"When cloning from Git, the virtual environment directory (`venv/`) is intentionally not committed to GitHub because packages are machine-specific. Therefore, Python packages must be restored using `pip install -r requirements.txt` inside an isolated virtual environment before launching `uvicorn`."*

#### Automated 1-Click Launch:
- **On Windows**: Double-click `python-backend/run_backend.bat`
- **On Mac/Linux**: Run `./python-backend/run_backend.sh`

#### Manual Step-by-Step (in VS Code):
**Terminal 1 (Backend - FastAPI):**
```bash
cd python-backend

# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
call venv\Scripts\activate.bat
# Mac / Linux:
source venv/bin/activate

# 3. Install required packages
pip install -r requirements.txt

# 4. Start FastAPI server
uvicorn main:app --reload --port 8000
```
Swagger UI will be live at: `http://127.0.0.1:8000/docs`

**Terminal 2 (Frontend - React Vite):**
```bash
npm install
npm run dev
```

---

## 📡 API Specification (Swagger Endpoints)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Home / Service Info | No |
| `GET` | `/api/health` | Service Health Status | No |
| `POST` | `/api/vault/open` | Unlock or Create Vault with Password | No |
| `GET` | `/api/vault/me` | Fetch Current Vault Stats & Metadata | Yes (Bearer Token) |
| `POST` | `/api/vault/close` | Lock Vault & Invalidate Session | Yes (Bearer Token) |
| `POST` | `/api/files/upload` | Multi-part Upload (Photos/Videos) | Yes (Bearer Token) |
| `GET` | `/api/files` | List Files with Search & Filter | Yes (Bearer Token) |
| `GET` | `/api/files/{file_id}` | Stream / Download File | Yes (Bearer Token) |

---

## 🔒 Security Architecture Highlights (For Viva Presentation)
1. **Zero-Knowledge Key Derivation**: Passwords are never stored in plaintext; SHA-256 / PBKDF2 hashing generates deterministic vault identifiers.
2. **Ephemeral Session Tokens**: State is governed by cryptographically random bearer tokens (`secrets.token_hex(20)`) invalidated immediately upon locking.
3. **MIME Validation & Secure Storage**: Uploaded files are categorized by binary MIME inspection and stored with unique GUID-prefixed filenames to prevent directory traversal attacks.
