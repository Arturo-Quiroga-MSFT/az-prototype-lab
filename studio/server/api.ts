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
const TIMEOUT_MS = 300_000; // 5 minutes

app.use(express.json());

// ─── CLI executor ───────────────────────────────────────────────

interface CliResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  json: unknown | null;
}

async function runPrototype(args: string[], cwd?: string): Promise<CliResult> {
  try {
    const { stdout, stderr } = await execFileAsync('az', ['prototype', ...args], {
      cwd: cwd || process.cwd(),
      timeout: TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env },
    });
    let json: unknown | null = null;
    try { json = JSON.parse(stdout); } catch { /* not JSON */ }
    return { success: true, stdout, stderr, exitCode: 0, json };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number; message?: string };
    return {
      success: false,
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? e.message ?? 'Unknown error',
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
  const args = ['init'];
  if (name) args.push('--name', name);
  if (location) args.push('--location', location);
  if (iacTool) args.push('--iac-tool', iacTool);
  if (aiProvider) args.push('--ai-provider', aiProvider);
  if (environment) args.push('--environment', environment);
  if (template) args.push('--template', template);
  res.json(await runPrototype(args, req.body.cwd));
});

app.post('/api/design', async (req, res) => {
  res.json(await runPrototype(['design'], req.body.cwd));
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

// ─── Start ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`az prototype Studio API running on http://localhost:${PORT}`);
});
