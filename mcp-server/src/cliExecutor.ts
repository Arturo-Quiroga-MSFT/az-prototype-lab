// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * CLI Executor — runs `az prototype` commands as child processes
 * and returns structured JSON output.
 *
 * All commands are executed with `--output json` or `--json` where
 * supported to get machine-readable output. For commands that don't
 * support JSON output, raw text is captured and returned.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** Maximum execution time for any single CLI command (5 minutes). */
const TIMEOUT_MS = 300_000;

export interface CliResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  json: unknown | null;
}

/**
 * Execute an `az prototype` command and return the result.
 *
 * @param args - Arguments to pass after `az prototype` (e.g. ['init', '--name', 'demo'])
 * @param cwd - Working directory for the command (defaults to process.cwd())
 */
export async function runPrototype(
  args: string[],
  cwd?: string,
): Promise<CliResult> {
  const fullArgs = ['prototype', ...args];

  try {
    const { stdout, stderr } = await execFileAsync('az', fullArgs, {
      cwd: cwd ?? process.cwd(),
      timeout: TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024, // 10 MB
      env: { ...process.env },
    });

    let json: unknown | null = null;
    try {
      json = JSON.parse(stdout);
    } catch {
      // Output is not JSON — that's fine for some commands
    }

    return { success: true, stdout, stderr, exitCode: 0, json };
  } catch (err: unknown) {
    const error = err as {
      stdout?: string;
      stderr?: string;
      code?: number;
      message?: string;
    };
    return {
      success: false,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? error.message ?? 'Unknown error',
      exitCode: error.code ?? 1,
      json: null,
    };
  }
}

/**
 * Check if `az` CLI is available and the prototype extension is installed.
 */
export async function checkPrerequisites(): Promise<{
  azCliAvailable: boolean;
  azCliVersion: string | null;
  prototypeExtensionInstalled: boolean;
  prototypeExtensionVersion: string | null;
}> {
  // Check az CLI
  let azCliAvailable = false;
  let azCliVersion: string | null = null;
  try {
    const { stdout } = await execFileAsync('az', ['version', '--output', 'json'], {
      timeout: 15_000,
    });
    const ver = JSON.parse(stdout);
    azCliAvailable = true;
    azCliVersion = ver['azure-cli'] ?? null;
  } catch {
    // az CLI not found
  }

  // Check prototype extension
  let prototypeExtensionInstalled = false;
  let prototypeExtensionVersion: string | null = null;
  if (azCliAvailable) {
    try {
      const { stdout } = await execFileAsync(
        'az',
        ['extension', 'show', '--name', 'prototype', '--output', 'json'],
        { timeout: 15_000 },
      );
      const ext = JSON.parse(stdout);
      prototypeExtensionInstalled = true;
      prototypeExtensionVersion = ext.version ?? null;
    } catch {
      // Extension not installed
    }
  }

  return {
    azCliAvailable,
    azCliVersion,
    prototypeExtensionInstalled,
    prototypeExtensionVersion,
  };
}
