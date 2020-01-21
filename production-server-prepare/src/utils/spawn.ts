import {
  spawn as nodeSpawn,
  exec as nodeExec,
  SpawnOptions,
  ChildProcess,
} from 'child_process';

import { promisify } from 'util';

/**
 * These are functions that run some other program.
 * Each is some combination of these running modes.
 *
 * - Shell                       vs  Command + args
 * - Captured & Buffered output  vs  Stream to stdout/stderr
 * - Promised result/completion  vs  Return Streams
 */

/**
 * Run a command and send stdout/err to parent's.
 *
 * - Shell
 * - Stream to stdout/stderr
 * - Promised completion (but streams are available on returned object/promise)
 *
 * @param command Command to run
 * @param shell Should we spawn a shell
 * @param args Arguments to command
 */
export function spawn(
  command: string,
  shell: true,
  ...args: string[]
): Promise<void> & { child: ChildProcess };

/**
 * Run a command and send stdout/err to parent's.
 *
 * - Shell OR Command + args
 * - Stream to stdout/stderr (by default)
 * - Promised completion
 *
 * @param command Command to run
 * @param options Options to pass to node.spawn
 * @param args Arguments to command
 */
export function spawn(
  command: string,
  options: SpawnOptions,
  ...args: string[]
): Promise<void> & { child: ChildProcess };

/**
 * Run a command and send stdout/err to parent's.
 *
 * - Command + args
 * - Stream to stdout/stderr
 * - Promised completion
 *
 * @param command Command to run
 * @param args Arguments to command
 */
export function spawn(command: string, ...args: string[]): Promise<void>;
export function spawn(
  command: string,
  first: string | SpawnOptions | true,
  ...args: string[]
): Promise<void> & { child: ChildProcess } {
  // console.log('Spawning:', command, ...args);
  const defOpts: SpawnOptions = { stdio: 'inherit' };

  const proc =
    typeof first === 'string'
      ? nodeSpawn(command, [first, ...args], defOpts)
      : nodeSpawn(
          command,
          args,
          first === true ? { ...defOpts, shell: true } : first,
        );

  const ret = new Promise((resolve, reject) => {
    proc.on('exit', exitCode => {
      if (exitCode) {
        reject(new Error(`Exit code: ${exitCode}`));
      } else {
        resolve();
      }
    });
  }) as Promise<void> & { child: ChildProcess };

  ret.child = proc;

  return ret;
}

/**
 * Run a command and capture output.
 *
 * Prints nothing
 *
 * - Shell
 * - Captured & Buffered output
 * - Promised result
 */
export const exec = promisify(nodeExec);
