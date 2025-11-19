import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDailyLog } from '../api/client';

const KEY = 'log-queue-v1';
let flushing = false;

export type LogPayload = { userId: number; pain: number; mood?: string; sleep?: string; hydrationCups?: number; medsTaken?: boolean; triggers?: string[]; notes?: string };

async function readQueue(): Promise<LogPayload[]> {
  try { const s = await AsyncStorage.getItem(KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
async function writeQueue(items: LogPayload[]) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(items)); } catch {}
}

export async function enqueueLog(item: LogPayload) {
  const q = await readQueue();
  q.push(item);
  await writeQueue(q);
}

export async function flushQueueOnce(): Promise<boolean> {
  if (flushing) return false;
  flushing = true;
  try {
    let q = await readQueue();
    if (!q.length) return false;
    const remaining: LogPayload[] = [];
    for (const item of q) {
      try { await createDailyLog(item); }
      catch { remaining.push(item); break; }
    }
    await writeQueue(remaining);
    return remaining.length === 0;
  } finally {
    flushing = false;
  }
}

let interval: any = null;
export function startLogQueue() {
  if (interval) return;
  interval = setInterval(() => { flushQueueOnce(); }, 30000);
}

export async function tryFlushNow() {
  return flushQueueOnce();
}