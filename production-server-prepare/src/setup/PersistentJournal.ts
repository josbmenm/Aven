import { promises } from 'fs';
const { mkdir } = promises;

export async function setupPersistentJournal() {
  await mkdir('/var/log/journal', { recursive: true });
}
