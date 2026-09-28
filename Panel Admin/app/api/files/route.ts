import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const SERVER_DIR = path.resolve(process.cwd(), '../server');

type FileNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  children?: FileNode[];
  content?: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function buildTree(dirPath: string, relativePath: string = ''): FileNode[] {
  const nodes: FileNode[] = [];
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relPath = path.join(relativePath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Evitar carpetas muy pesadas o irrelevantes si se desea
      if (item === 'libraries' || item === 'versions') continue;
      
      nodes.push({
        id: relPath,
        name: item,
        type: 'folder',
        children: buildTree(fullPath, relPath)
      });
    } else {
      let content = undefined;
      // Solo cargar contenido para archivos de texto pequeos (< 2MB)
      const isText = ['.txt', '.json', '.properties', '.yml', '.yaml', '.toml', '.log', '.sh', '.bat'].includes(path.extname(item));
      if (isText && stats.size < 2 * 1024 * 1024) {
        content = fs.readFileSync(fullPath, 'utf8');
      }

      nodes.push({
        id: relPath,
        name: item,
        type: 'file',
        size: formatSize(stats.size),
        content
      });
    }
  }

  // Ordenar carpetas primero, luego archivos
  nodes.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });

  return nodes;
}

export async function GET() {
  try {
    if (!fs.existsSync(SERVER_DIR)) {
      return NextResponse.json([]);
    }
    const tree = buildTree(SERVER_DIR);
    return NextResponse.json(tree);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, content } = await req.json();
    const fullPath = path.join(SERVER_DIR, id);
    
    // Simple path traversal check
    if (!fullPath.startsWith(SERVER_DIR)) {
       return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();
    const targetDir = path.join(SERVER_DIR, id || '');
    const fullPath = path.join(targetDir, name);

    if (!fullPath.startsWith(SERVER_DIR)) {
       return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const fullPath = path.join(SERVER_DIR, id);

    if (!fullPath.startsWith(SERVER_DIR)) {
       return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
