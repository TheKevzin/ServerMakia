'use client'

import { cn } from '@/lib/utils'
import { fileTree as fileTreeMock, type FileNode } from '@/lib/data'
import { useState, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'
import {
  Folder,
  FileText,
  Save,
  RotateCcw,
  Download,
  Trash2,
  Upload,
  FolderPlus,
  HardDrive,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  X,
  AlertTriangle
} from 'lucide-react'
import { toast } from '@/lib/toast'

// Recursive component for folder structure
function TreeItem({ 
  node, 
  activeId, 
  onSelect, 
  level = 0 
}: { 
  node: FileNode, 
  activeId: string, 
  onSelect: (id: string) => void, 
  level?: number 
}) {
  const [expanded, setExpanded] = useState(false)
  const isFolder = node.type === 'folder'
  const isFile = node.type === 'file'
  const isActive = node.id === activeId

  const handleToggle = () => {
    if (isFolder) setExpanded(!expanded)
    if (isFile) onSelect(node.id)
  }

  return (
    <li className="flex flex-col">
      <div 
        className={cn(
          'group relative flex w-full items-center gap-2 rounded-xl py-2 pr-3 text-sm transition-colors cursor-pointer',
          isActive ? 'bg-primary/20 text-end-stone' : 'text-foreground hover:bg-white/5'
        )}
        // eslint-disable-next-line react/forbid-dom-props
        style={{ paddingLeft: `${(level * 16) + 12}px` }}
        onClick={handleToggle}
      >
        {isFolder ? (
           expanded ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
           <span className="size-3.5 shrink-0" />
        )}
        {isFolder ? (
          <Folder className="size-4 shrink-0 text-end-stone" />
        ) : (
          <FileText className={cn("size-4 shrink-0", isActive ? "text-end-stone" : "text-muted-foreground")} />
        )}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        {node.size && (
          <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {node.size}
          </span>
        )}
        
        {/* Hover Context Menu */}
        <button 
          title="File options"
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all"
          onClick={(e) => e.stopPropagation()}
        >
           <MoreVertical className="size-3.5 text-muted-foreground" />
        </button>
      </div>
      {isFolder && expanded && node.children && (
        <ul className="flex flex-col">
           {node.children.map(child => (
             <TreeItem key={child.id} node={child} activeId={activeId} onSelect={onSelect} level={level + 1} />
           ))}
        </ul>
      )}
    </li>
  )
}

export function FilesView() {
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [activeId, setActiveId] = useState('') // Default to nothing selected
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [isServerOnline, setIsServerOnline] = useState(false)

  // Modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const fetchFiles = () => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        setFileTree(data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchFiles()

    const checkStatus = () => {
      fetch('/api/server/status')
        .then(res => res.json())
        .then(data => setIsServerOnline(data.isRunning))
        .catch(() => setIsServerOnline(false))
    }
    
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])
  const saveFile = async () => {
    if (!activeId || !(activeId in drafts)) return
    
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeId,
          content: drafts[activeId]
        })
      })
      
      if (res.ok) {
        toast.success('File saved successfully!');
        // Update local fileTree state with new content so it doesn't revert
        setFileTree(prev => {
          const newTree = JSON.parse(JSON.stringify(prev))
          const nodePath = findNodePath(newTree, activeId)
          if (nodePath) {
            const node = nodePath[nodePath.length - 1]
            node.content = drafts[activeId]
          }
          return newTree
        })
        
        // Remove from drafts (mark as clean)
        setDrafts(d => {
          const next = { ...d }
          delete next[activeId]
          return next
        })
      } else {
        const data = await res.json()
        toast.error(`Error: ${data.error || 'Failed to save file'}`)
      }
    } catch (e) {
      console.error('Error saving file', e)
      toast.error('Failed to save file')
    }
  }

  const handleDelete = async () => {
    if (!activeId || isServerOnline) return;
    
    setDeleteConfirmOpen(false);

    try {
      const res = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeId })
      });
      if (res.ok) {
        toast.success('File deleted successfully');
        setActiveId('');
        fetchFiles();
      } else {
        const data = await res.json()
        toast.error(`Error: ${data.error || 'Failed to delete file'}`)
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete file')
    }
  }

  const handleNewFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isServerOnline) return;
    if (!newFolderName) return;

    setNewFolderOpen(false);

    try {
      const activeDir = activeId ? (activeId.includes('.') ? activeId.split('/').slice(0, -1).join('/') : activeId) : '';
      const res = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeDir, name: newFolderName })
      });
      if (res.ok) {
        setNewFolderName('');
        fetchFiles();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleDownload = () => {
    if (!activeId) return;
    window.open(`/api/files/download?id=${encodeURIComponent(activeId)}`);
  }

  const handleUploadClick = () => {
    if (isServerOnline) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('file', file);
      const activeDir = activeId ? (activeId.includes('.') ? activeId.split('/').slice(0, -1).join('/') : activeId) : '';
      formData.append('path', activeDir);

      try {
        const res = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) fetchFiles();
      } catch (err) {
        console.error(err);
      }
    };
    input.click();
  }

  // Recursive search to find the active node and its breadcrumb path
  function findNodePath(nodes: FileNode[], targetId: string, currentPath: FileNode[] = []): FileNode[] | null {
    for (const node of nodes) {
      const path = [...currentPath, node]
      if (node.id === targetId) return path
      if (node.children) {
        const found = findNodePath(node.children, targetId, path)
        if (found) return found
      }
    }
    return null
  }

  const activePath = findNodePath(fileTree, activeId) || []
  const active = activePath[activePath.length - 1]
  const isFile = active?.type === 'file'
  const isFolder = active?.type === 'folder'
  const original = active?.content ?? ''
  const value = activeId in drafts ? drafts[activeId] : original
  const dirty = isFile && value !== original

  // Determine language for Monaco
  let language = 'plaintext'
  if (active?.name.endsWith('.json')) language = 'json'
  if (active?.name.endsWith('.properties')) language = 'ini'
  if (active?.name.endsWith('.xml') || active?.name.endsWith('.html')) language = 'xml'
  if (active?.name.endsWith('.js') || active?.name.endsWith('.ts')) language = 'javascript'

  return (
    <div 
      className="relative flex flex-col gap-6"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 rounded-3xl border-2 border-dashed border-primary bg-background/80 flex items-center justify-center backdrop-blur-sm transition-all animate-in fade-in">
           <div className="text-center flex flex-col items-center">
             <Upload className="size-12 text-primary mb-4 animate-bounce" />
             <p className="text-xl font-bold text-foreground">Drop files here</p>
             <p className="text-sm text-muted-foreground">They will be uploaded automatically to the current directory</p>
           </div>
        </div>
      )}

      {/* Toolbar & Breadcrumbs */}
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HardDrive className="size-4 text-end-stone" />
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-end-stone/70">/enderlab</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-end-stone/70">server</span>
            {activePath.map(node => (
              <span key={node.id} className="flex items-center gap-1">
                <span className="text-muted-foreground">/</span>
                <span className={node.id === activeId ? "text-end-stone font-semibold" : "text-end-stone/70"}>
                  {node.name}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isServerOnline && (
             <span className="text-xs text-rose-400 mr-2 font-medium bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">Server is running. Stop to edit files.</span>
          )}
          <button 
            disabled={isServerOnline}
            onClick={handleUploadClick}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
          >
            <Upload className="size-3.5" />
            Upload
          </button>
          <button 
            disabled={isServerOnline}
            onClick={() => {
              if (isServerOnline) return;
              setNewFolderOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
          >
            <FolderPlus className="size-3.5" />
            New Folder
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* File Tree Sidebar */}
        <div className="glass flex flex-col overflow-hidden rounded-3xl max-h-[700px]">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Files
            </h2>
          </div>
          <ul className="flex flex-col p-2 overflow-y-auto">
            {isLoading ? (
              <li className="p-4 text-center text-sm text-muted-foreground animate-pulse">Loading files...</li>
            ) : (
              fileTree.map((node: FileNode) => (
                <TreeItem key={node.id} node={node} activeId={activeId} onSelect={setActiveId} />
              ))
            )}
          </ul>
        </div>

        {/* Editor Area */}
        <div className="glass flex h-[700px] flex-col overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-end-stone" />
              <span className="font-mono text-sm text-foreground">
                {active?.name || 'Select a file'}
              </span>
              {dirty && (
                <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                  Unsaved
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setDrafts((d) => {
                    const next = { ...d }
                    delete next[activeId]
                    return next
                  })
                }
                disabled={!dirty}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw className="size-3.5" />
                Revert
              </button>
              <button 
                title="Download File" 
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40"
              >
                <Download className="size-3.5" />
              </button>
              <button 
                title={isServerOnline ? "Stop server to delete files" : "Delete File"} 
                onClick={() => {
                  if (isServerOnline || !activeId) return;
                  setDeleteConfirmOpen(true);
                }}
                disabled={isServerOnline || !activeId}
                className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-destructive/20 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
              <button
                disabled={!dirty || isServerOnline}
                title={isServerOnline ? "Stop server to save files" : "Save"}
                onClick={saveFile}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Save className="size-3.5" />
                Save
              </button>
            </div>
          </div>

          {/* Monaco Editor Integration */}
          <div className="relative flex flex-1 overflow-hidden bg-[#0b0930]/60">
            {!activeId ? (
              <div className="flex flex-col h-full w-full items-center justify-center text-muted-foreground gap-3">
                <FileText className="size-8 opacity-20" />
                <p>Select a file from the left panel to start editing</p>
              </div>
            ) : isFile && active?.content !== undefined ? (
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={value}
                onChange={(val) => setDrafts((d) => ({ ...d, [activeId]: val || '' }))}
                options={{
                  minimap: { enabled: false },
                  readOnly: isServerOnline,
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  wordWrap: "on",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                {isFolder ? "Cannot edit a folder. Select a text file." : "The file does not contain editable text."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW FOLDER MODAL */}
      {newFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glass w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading font-bold text-foreground">New Folder</h3>
              <button onClick={() => setNewFolderOpen(false)} className="text-muted-foreground hover:text-foreground" title="Close" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleNewFolder} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-foreground">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. plugins"
                  autoFocus
                  className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setNewFolderOpen(false)} className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!newFolderName} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border-2 border-destructive/50 bg-[#1a0f14] p-6 shadow-[0_0_50px_rgba(225,29,72,0.15)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/20 text-rose-500">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-xl font-heading font-bold text-rose-500">Delete File</h3>
            </div>
            
            <p className="text-sm text-foreground/80 mb-6">
              Are you sure you want to delete <strong className="text-foreground">{activeId}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setDeleteConfirmOpen(false)} className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
