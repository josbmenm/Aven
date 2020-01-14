import { promises } from 'fs';

const { readFile, writeFile } = promises;

export async function ensureFileContains(
  filename: string,
  contents: string,
): Promise<void> {
  const current = (await readFile(filename).catch(() => '')).toString();

  if (current.includes(contents)) return;

  return writeFile(filename, current + contents);
}

export async function ensureFileIs(
  filename: string,
  contents: string,
): Promise<void> {
  const current = (await readFile(filename).catch(() => '')).toString();

  if (current == contents) return;

  return writeFile(filename, contents);
}