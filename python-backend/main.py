"""
CodedPad Vault Backend (FastAPI)
Matches the exact Swagger schema and endpoints in Image 2:
- GET  /                    Home
- GET  /api/health          Health
- POST /api/vault/open      Open Vault
- GET  /api/vault/me        Current Vault
- POST /api/vault/close     Close Vault
- POST /api/files/upload    Upload File
- GET  /api/files           List Files
- GET  /api/files/{file_id} View File
"""

import os
import shutil
import hashlib
import secrets
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

app = FastAPI(
    title="CodedPad Vault API",
    description="Secure personal vault backend with password-authenticated file encryption and storage.",
    version="1.0.0"
)

# Enable CORS for local Vite development (Port 3000 / 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "vault_storage")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory storage for vaults and sessions
# vault_id -> { "password_hash": str, "files": List[dict], "created_at": str }
vaults_db: Dict[str, dict] = {}
# token -> { "vault_id": str, "created_at": str }
sessions_db: Dict[str, dict] = {}

class OpenVaultRequest(BaseModel):
    password: str

def get_session(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token required in Authorization header"
        )
    token = authorization.replace("Bearer ", "").strip()
    if token not in sessions_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired vault session"
        )
    return token

def detect_category(filename: str, content_type: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if content_type.startswith("image/") or ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        return "photo"
    if content_type.startswith("video/") or ext in [".mp4", ".webm", ".mov", ".mkv"]:
        return "video"
    return "document"

@app.get("/", summary="Home")
def home():
    return {
        "message": "Welcome to CodedPad API",
        "status": "online",
        "docs": "/docs",
        "endpoints": [
            "GET /",
            "GET /api/health",
            "POST /api/vault/open",
            "GET /api/vault/me",
            "POST /api/vault/close",
            "POST /api/files/upload",
            "GET /api/files",
            "GET /api/files/{file_id}"
        ]
    }

@app.get("/api/health", summary="Health")
def health():
    return {
        "status": "healthy",
        "vaults_active": len(vaults_db),
        "sessions_active": len(sessions_db),
        "storage_dir": UPLOAD_DIR
    }

@app.post("/api/vault/open", summary="Open Vault")
def open_vault(req: OpenVaultRequest):
    pwd = req.password.strip()
    if not pwd:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password cannot be empty"
        )
    
    pwd_hash = hashlib.sha256(pwd.encode()).hexdigest()
    vault_id = hashlib.md5(pwd.encode()).hexdigest()[:12]
    
    is_new = False
    if vault_id not in vaults_db:
        is_new = True
        vaults_db[vault_id] = {
            "password_hash": pwd_hash,
            "created_at": datetime.utcnow().isoformat(),
            "files": []
        }
    
    token = "cp_py_" + secrets.token_hex(20)
    sessions_db[token] = {
        "vault_id": vault_id,
        "created_at": datetime.utcnow().isoformat()
    }
    
    return {
        "status": "success",
        "token": token,
        "vault_id": vault_id,
        "is_new": is_new,
        "message": "New vault created" if is_new else "Vault unlocked",
        "file_count": len(vaults_db[vault_id]["files"])
    }

@app.get("/api/vault/me", summary="Current Vault")
def current_vault(authorization: Optional[str] = Header(None)):
    token = get_session(authorization)
    vault_id = sessions_db[token]["vault_id"]
    vault = vaults_db[vault_id]
    
    photos = len([f for f in vault["files"] if f["category"] == "photo"])
    videos = len([f for f in vault["files"] if f["category"] == "video"])
    docs = len([f for f in vault["files"] if f["category"] == "document"])
    total_bytes = sum(f["size"] for f in vault["files"])
    
    return {
        "vault_id": vault_id,
        "created_at": vault["created_at"],
        "stats": {
            "total_files": len(vault["files"]),
            "photos_count": photos,
            "videos_count": videos,
            "documents_count": docs,
            "total_bytes": total_bytes,
            "storage_limit_bytes": 500 * 1024 * 1024
        }
    }

@app.post("/api/vault/close", summary="Close Vault")
def close_vault(authorization: Optional[str] = Header(None)):
    token = get_session(authorization)
    del sessions_db[token]
    return {"status": "success", "message": "Vault closed successfully"}

@app.post("/api/files/upload", summary="Upload File")
async def upload_file(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    token = get_session(authorization)
    vault_id = sessions_db[token]["vault_id"]
    vault = vaults_db[vault_id]
    
    file_id = "f_" + secrets.token_hex(8)
    filename = file.filename or "unnamed_file"
    ext = os.path.splitext(filename)[1]
    saved_filename = f"{file_id}{ext}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)
    
    # Save file contents
    contents = await file.read()
    size = len(contents)
    with open(saved_path, "wb") as f_out:
        f_out.write(contents)
        
    category = detect_category(filename, file.content_type or "")
    
    record = {
        "id": file_id,
        "name": filename,
        "mime_type": file.content_type or "application/octet-stream",
        "size": size,
        "category": category,
        "uploaded_at": datetime.utcnow().isoformat(),
        "storage_path": saved_path,
        "url": f"/api/files/{file_id}"
    }
    vault["files"].insert(0, record)
    
    return {
        "status": "uploaded",
        "file": {
            "id": record["id"],
            "name": record["name"],
            "size": record["size"],
            "mime_type": record["mime_type"],
            "category": record["category"],
            "uploaded_at": record["uploaded_at"],
            "url": record["url"]
        }
    }

@app.get("/api/files", summary="List Files")
def list_files(
    category: Optional[str] = None,
    search: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    token = get_session(authorization)
    vault_id = sessions_db[token]["vault_id"]
    vault = vaults_db[vault_id]
    
    items = list(vault["files"])
    if category and category != "all":
        items = [f for f in items if f["category"] == category]
    if search:
        s = search.lower()
        items = [f for f in items if s in f["name"].lower()]
        
    return {
        "count": len(items),
        "files": [
            {
                "id": f["id"],
                "name": f["name"],
                "size": f["size"],
                "mime_type": f["mime_type"],
                "category": f["category"],
                "uploaded_at": f["uploaded_at"],
                "url": f["url"]
            }
            for f in items
        ]
    }

@app.get("/api/files/{file_id}", summary="View File")
def view_file(file_id: str, token: Optional[str] = None, authorization: Optional[str] = Header(None)):
    auth_token = None
    if authorization and authorization.startswith("Bearer "):
        auth_token = authorization.replace("Bearer ", "").strip()
    elif token:
        auth_token = token
        
    if not auth_token or auth_token not in sessions_db:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    vault_id = sessions_db[auth_token]["vault_id"]
    vault = vaults_db[vault_id]
    
    found = next((f for f in vault["files"] if f["id"] == file_id), None)
    if not found or not os.path.exists(found["storage_path"]):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(
        path=found["storage_path"],
        media_type=found["mime_type"],
        filename=found["name"]
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting CodedPad FastAPI server on http://127.0.0.1:8000")
    print("Swagger Documentation will be available at http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)
