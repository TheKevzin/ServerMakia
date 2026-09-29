import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { ServerManager } from '@/lib/server-manager';

const SERVER_DIR = path.resolve(process.cwd(), '../server');
const PROPS_PATH = path.join(SERVER_DIR, 'server.properties');

export async function GET() {
  try {
    if (!fs.existsSync(PROPS_PATH)) {
      return NextResponse.json({ whitelist: false, pvp: true, cracked: false });
    }
    
    const props = fs.readFileSync(PROPS_PATH, 'utf8');
    const whitelist = props.match(/white-list=(true|false)/)?.[1] === 'true';
    const pvp = props.match(/pvp=(true|false)/)?.[1] !== 'false';
    const cracked = props.match(/online-mode=(true|false)/)?.[1] === 'false';

    return NextResponse.json({ whitelist, pvp, cracked });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, enabled } = await req.json();
    
    if (!fs.existsSync(PROPS_PATH)) {
      return NextResponse.json({ error: 'server.properties not found' }, { status: 404 });
    }

    let props = fs.readFileSync(PROPS_PATH, 'utf8');

    const updateProp = (key: string, val: string | boolean) => {
      const regex = new RegExp('^(\\s*)' + key + '\\s*=.*$', 'm');
      if (regex.test(props)) {
        props = props.replace(regex, '$1' + key + '=' + val);
      } else {
        props += '\n' + key + '=' + val;
      }
    };

    if (id === 'whitelist') {
      updateProp('white-list', enabled);
      ServerManager.sendCommand(`whitelist ${enabled ? 'on' : 'off'}`);
    } else if (id === 'pvp') {
      updateProp('pvp', enabled);
    } else if (id === 'cracked') {
      updateProp('online-mode', !enabled);
    }

    fs.writeFileSync(PROPS_PATH, props);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
