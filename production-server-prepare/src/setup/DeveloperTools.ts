import { ensureFileContains } from '../utils/Files';
import { setupRoot } from './Root';
import { addAptDependencies } from './aptDependencies';

addAptDependencies('screen', 'git', 'yarn');

export const screenConfig =
  "\ncaption always '%{= dg} %H %{G}| %{B}%l %{G}|%=%?%{d}%-w%?%{r}(%{d}%n %t%? {%u} %?%{r})%{d}%?%+w%?%=%{G}| %{B}%M %d %c:%s '\n";

/**
 * Tools to help devs if they need to connect to server manually
 */
export async function setupDevTools() {
  return Promise.all([
    // Handy screen config (multiple tabs)
    ensureFileContains('/etc/screenrc', screenConfig),

    setupRoot(),

    // ensureFileIs('/etc/sudoers.d/ono-prod', `${user} ALL=(ALL) NOPASSWD:ALL\n`),
  ]);
}
