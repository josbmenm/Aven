import { spawn as nodeSpawn, exec as nodeExec } from 'child_process';

import { promisify } from 'util';

/**
 * Functions that run some other program.
 * Each is some combination of these running modes.
 * 
 * - Shell vs Command + args
 * - Captured & Buffered output vs Stream to stdout/stderr
 * - Promised result/completion vs Return Streams
 */

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
export function spawn(command: string, ...args: string[]) {
  // console.log('Spawning:', command, ...args);
  return new Promise((resolve, reject) => {
    const proc = nodeSpawn(command, args, { stdio: 'inherit' });

    proc.on('exit', exitCode => {
      if (exitCode) {
        reject(new Error(`Exit code: ${exitCode}`));
      } else {
        resolve();
      }
    });
  });
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
