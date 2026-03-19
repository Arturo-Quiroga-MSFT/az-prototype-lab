/**
 * Express API server — wraps `az prototype` CLI commands
 * and exposes them as REST endpoints for the Studio frontend.
 */
import express from 'express';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const app = express();
const PORT = 3001;
const TIMEOUT_MS = 900_000; // 15 minutes — design phase can be long

app.use(express.json());

// Strip ANSI escape codes from CLI output
function stripAnsi(str: string): string {
  return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

// ─── CLI executor ───────────────────────────────────────────────

interface CliResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  json: unknown | null;
  projectDir?: string;
}

async function runPrototype(args: string[], cwd?: string): Promise<CliResult> {
  try {
    const { stdout, stderr } = await execFileAsync('az', ['prototype', ...args, '--only-show-errors'], {
      cwd: cwd || process.cwd(),
      timeout: TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, NO_COLOR: '1' },
    });
    const cleanOut = stripAnsi(stdout);
    const cleanErr = stripAnsi(stderr);
    let json: unknown | null = null;
    try { json = JSON.parse(cleanOut); } catch { /* not JSON */ }
    return { success: true, stdout: cleanOut, stderr: cleanErr, exitCode: 0, json };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number; message?: string };
    return {
      success: false,
      stdout: stripAnsi(e.stdout ?? ''),
      stderr: stripAnsi(e.stderr ?? e.message ?? 'Unknown error'),
      exitCode: e.code ?? 1,
      json: null,
    };
  }
}

async function checkAzPrerequisites(): Promise<CliResult> {
  try {
    const { stdout } = await execFileAsync('az', ['version', '--output', 'json'], {
      timeout: 15_000,
    });
    return { success: true, stdout, stderr: '', exitCode: 0, json: JSON.parse(stdout) };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return { success: false, stdout: '', stderr: e.message ?? 'az CLI not found', exitCode: 1, json: null };
  }
}

// ─── Routes ─────────────────────────────────────────────────────

app.get('/api/prerequisites', async (_req, res) => {
  res.json(await checkAzPrerequisites());
});

app.post('/api/init', async (req, res) => {
  const { name, location, iacTool, aiProvider, environment, template } = req.body as Record<string, string>;

  const cwd = req.body.cwd || process.cwd();

  // Guard: refuse to init if prototype.yaml already exists in target
  const path = await import('node:path');
  const fs = await import('node:fs');
  const targetDir = name ? path.default.resolve(cwd, name) : cwd;
  for (const checkDir of [targetDir, cwd]) {
    try {
      await fs.promises.access(path.default.join(checkDir, 'prototype.yaml'));
      res.json({
        success: false,
        stdout: '',
        stderr: `Project already exists at ${checkDir}. Use "Open Existing Project" instead.`,
        exitCode: 1,
        json: null,
        projectDir: checkDir,
      } satisfies CliResult);
      return;
    } catch { /* not found — good, we can init */ }
  }

  const args = ['init'];
  if (name) args.push('--name', name);
  if (location) args.push('--location', location);
  if (iacTool) args.push('--iac-tool', iacTool);
  if (aiProvider) args.push('--ai-provider', aiProvider);
  if (environment) args.push('--environment', environment);
  if (template) args.push('--template', template);
  const result = await runPrototype(args, cwd);

  // Detect the created project directory so the frontend can track it
  if (result.success && name) {
    const path = await import('node:path');
    const fs = await import('node:fs');
    const candidate = path.default.resolve(cwd, name);
    try {
      await fs.promises.access(path.default.join(candidate, 'prototype.yaml'));
      result.projectDir = candidate;
    } catch {
      // prototype.yaml not found in expected subdir — may have been created in cwd
      try {
        await fs.promises.access(path.default.join(cwd, 'prototype.yaml'));
        result.projectDir = cwd;
      } catch { /* leave projectDir unset */ }
    }
  }

  res.json(result);
});

app.post('/api/design', async (req, res) => {
  const args = ['design', '--skip-discovery'];
  if (req.body.context) args.push('--context', req.body.context);
  res.json(await runPrototype(args, req.body.cwd));
});

app.post('/api/build', async (req, res) => {
  res.json(await runPrototype(['build'], req.body.cwd));
});

app.post('/api/deploy/preview', async (req, res) => {
  res.json(await runPrototype(['deploy', '--preview'], req.body.cwd));
});

app.post('/api/deploy/stage', async (req, res) => {
  res.json(await runPrototype(['deploy', '--stage'], req.body.cwd));
});

app.post('/api/status', async (req, res) => {
  res.json(await runPrototype(['status'], req.body.cwd));
});

app.post('/api/analyze/costs', async (req, res) => {
  res.json(await runPrototype(['analyze-costs'], req.body.cwd));
});

app.post('/api/analyze/error', async (req, res) => {
  const args = ['analyze-error'];
  if (req.body.error) args.push('--error', req.body.error);
  res.json(await runPrototype(args, req.body.cwd));
});

app.post('/api/generate/docs', async (req, res) => {
  res.json(await runPrototype(['generate-docs'], req.body.cwd));
});

app.post('/api/generate/speckit', async (req, res) => {
  res.json(await runPrototype(['generate-speckit'], req.body.cwd));
});

app.post('/api/generate/backlog', async (req, res) => {
  res.json(await runPrototype(['generate-backlog'], req.body.cwd));
});

app.post('/api/config/show', async (req, res) => {
  res.json(await runPrototype(['config', 'show'], req.body.cwd));
});

app.post('/api/config/set', async (req, res) => {
  const { key, value } = req.body as Record<string, string>;
  res.json(await runPrototype(['config', 'set', '--key', key, '--value', value], req.body.cwd));
});

app.get('/api/agents', async (_req, res) => {
  res.json(await runPrototype(['agent', 'list']));
});

app.post('/api/agents/test', async (req, res) => {
  const args = ['agent', 'test'];
  if (req.body.agent) args.push('--agent', req.body.agent);
  res.json(await runPrototype(args));
});

// ─── File system helpers ────────────────────────────────────────

import path from 'node:path';
import fs from 'node:fs';

app.post('/api/browse', async (req, res) => {
  const dir = req.body.path || process.env.HOME || '/';
  try {
    const resolved = path.resolve(dir);
    const entries = await fs.promises.readdir(resolved, { withFileTypes: true });
    const folders = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    res.json({ success: true, path: resolved, folders });
  } catch (err: unknown) {
    const e = err as { message?: string };
    res.json({ success: false, path: dir, folders: [], error: e.message });
  }
});

app.post('/api/open-project', async (req, res) => {
  const dir = req.body.path;
  if (!dir) {
    res.json({ success: false, error: 'No path provided' });
    return;
  }
  const yamlPath = path.join(path.resolve(dir), 'prototype.yaml');
  try {
    const content = await fs.promises.readFile(yamlPath, 'utf-8');
    // Parse basic fields from YAML (lightweight — no yaml lib needed)
    const get = (key: string) => {
      const m = content.match(new RegExp(`^\\s*${key}:\\s*'?([^'\\n]+)'?`, 'm'));
      return m ? m[1].trim() : '';
    };
    res.json({
      success: true,
      projectDir: path.resolve(dir),
      project: {
        name: get('name'),
        location: get('location'),
        environment: get('environment'),
        iacTool: get('iac_tool'),
        aiProvider: get('provider'),
      },
      raw: content,
    });
  } catch {
    res.json({ success: false, error: `No prototype.yaml found in ${dir}` });
  }
});

// ─── Start ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`az prototype Studio API running on http://localhost:${PORT}`);
});
