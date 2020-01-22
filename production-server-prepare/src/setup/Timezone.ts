import { ensureLinkIs } from '../utils/Files';
import { timezone } from '../config';

export async function setupTimezone() {
  const path = '/etc/localtime';
  const next = `/etc/share/zoneinfo/${timezone}`;

  ensureLinkIs(next, path);
}
