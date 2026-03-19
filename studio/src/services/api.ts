interface ApiResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  json: unknown | null;
  projectDir?: string;
}

interface InitParams {
  name: string;
  location?: string;
  iacTool?: string;
  aiProvider?: string;
  environment?: string;
  template?: string;
  cwd?: string;
}

interface CwdParams {
  cwd?: string;
}

async function post(endpoint: string, body: object = {}): Promise<ApiResult> {
  const res = await fetch(`/api${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(endpoint: string): Promise<ApiResult> {
  const res = await fetch(`/api${endpoint}`);
  return res.json();
}

export const api = {
  checkPrerequisites: () => get('/prerequisites'),

  init: (params: InitParams) => post('/init', params),

  design: (params: CwdParams) => post('/design', params),

  build: (params: CwdParams) => post('/build', params),

  deployPreview: (params: CwdParams) => post('/deploy/preview', params),

  deployStage: (params: CwdParams) => post('/deploy/stage', params),

  status: (params: CwdParams) => post('/status', params),

  analyzeCosts: (params: CwdParams) => post('/analyze/costs', params),

  analyzeError: (params: CwdParams & { error?: string }) =>
    post('/analyze/error', params),

  generateDocs: (params: CwdParams) => post('/generate/docs', params),

  generateSpeckit: (params: CwdParams) => post('/generate/speckit', params),

  generateBacklog: (params: CwdParams) => post('/generate/backlog', params),

  configShow: (params: CwdParams) => post('/config/show', params),

  configSet: (params: CwdParams & { key: string; value: string }) =>
    post('/config/set', params),

  agentList: () => get('/agents'),

  agentTest: (params: { agent: string }) => post('/agents/test', params),

  browse: (dirPath?: string) =>
    post('/browse', { path: dirPath }) as Promise<ApiResult & { path?: string; folders?: string[] }>,

  openProject: (dirPath: string) =>
    post('/open-project', { path: dirPath }) as Promise<
      ApiResult & { projectDir?: string; project?: Record<string, string>; raw?: string; error?: string }
    >,
};
