import { ParsedAPI, PlatformTransformation, PlatformFeature, CodeFile } from '../types';

export class FigmaTransformer {
  transform(api: ParsedAPI): PlatformTransformation {
    const features = this.mapApiToFigmaFeatures(api);
    const codeFiles = this.generateFigmaPluginFiles(api);

    return {
      platform: 'figma',
      features,
      codeFiles,
      configuration: this.generateConfig(api),
      documentation: this.generateDocumentation(api, features),
    };
  }

  private mapApiToFigmaFeatures(api: ParsedAPI): PlatformFeature[] {
    const hasTranslate = api.endpoints.some((e) => /translate|translation/i.test(e.path));

    const features: PlatformFeature[] = [
      {
        name: 'API Settings',
        description: `Configure ${api.name} Base URL and API Key stored in Figma client storage`,
        apiEndpoints: [],
        implementation: 'admin-ui',
      },
      {
        name: 'Endpoint Runner',
        description: 'Browse endpoints and call them from the plugin UI',
        apiEndpoints: api.endpoints.slice(0, 12).map((e) => e.id),
        implementation: 'admin-ui',
      },
    ];

    if (hasTranslate) {
      features.push({
        name: 'Apply Translation to Selection',
        description: 'Apply API translation results to selected text nodes in Figma',
        apiEndpoints: api.endpoints.filter((e) => /translate/i.test(e.path)).map((e) => e.id),
        implementation: 'admin-ui',
      });
    }

    return features;
  }

  private generateFigmaPluginFiles(api: ParsedAPI): CodeFile[] {
    const deeplLike = api.endpoints.some((e) => /\/translate|\/usage/i.test(e.path));

    const manifest = {
      name: `${api.name} Figma Plugin`,
      api: '1.0.0',
      main: 'code.js',
      ui: 'ui.html',
      editorType: ['figma', 'figjam'],
      networkAccess: { allowedDomains: ['*'] },
    } as const;

    const endpointsData = api.endpoints.slice(0, 12).map((e) => ({
      id: e.id,
      name: e.name,
      method: e.method,
      path: e.path,
      description: e.description,
      parameters: e.parameters,
    }));

    const defaults = {
      baseUrl: deeplLike ? 'https://api-free.deepl.com/v2' : this.extractBaseUrl(api) || 'https://api.example.com',
      authHeader: this.resolveAuthHeader(api) || (deeplLike ? 'Authorization' : 'Authorization'),
      authPrefix: deeplLike ? 'DeepL-Auth-Key ' : '',
    };

    const codeJs = `// Main thread for ${api.name} Figma Plugin\n\nfigma.showUI({ width: 420, height: 560 });\n\n// Relay settings between UI and main via clientStorage\nfigma.ui.onmessage = async (msg) => {\n  if (msg.type === 'get-settings') {\n    const baseUrl = await figma.clientStorage.getAsync('api_base_url');\n    const apiKey = await figma.clientStorage.getAsync('api_key');\n    figma.ui.postMessage({ type: 'settings', baseUrl, apiKey });\n  } else if (msg.type === 'set-settings') {\n    await figma.clientStorage.setAsync('api_base_url', msg.baseUrl || '');\n    await figma.clientStorage.setAsync('api_key', msg.apiKey || '');\n    figma.notify('Settings saved');\n  } else if (msg.type === 'apply-to-selection') {\n    const text = String(msg.text || '');\n    const selection = figma.currentPage.selection;\n    let applied = 0;\n    for (const node of selection) {\n      if ('characters' in node) {\n        node.characters = text;\n        applied++;\n      }\n    }\n    figma.notify(applied ? 'Applied to ' + applied + ' text node' + (applied > 1 ? 's' : '') : 'No text nodes selected');\n  }\n};\n`;

    const uiHtml = `<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>${api.name} Plugin UI</title>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <header>\n    <h1>${api.name} Plugin</h1>\n    <p class="muted">${api.description || 'Run your API directly from Figma'}</p>\n  </header>\n  <main>\n    <section class="card">\n      <h2>Settings</h2>\n      <label>\n        <span>Base URL</span>\n        <input id="baseUrl" type="text" placeholder="https://api.example.com" />\n      </label>\n      <label>\n        <span>API Key</span>\n        <input id="apiKey" type="password" placeholder="Your API Key" />\n      </label>\n      <div class="row">\n        <button id="saveSettings">Save</button>\n        <button id="loadSettings" class="secondary">Reload</button>\n      </div>\n    </section>\n\n    <section class="card">\n      <h2>Endpoint Runner</h2>\n      <label>\n        <span>Endpoint</span>\n        <select id="endpointSelect"></select>\n      </label>\n      <label>\n        <span>Method</span>\n        <input id="method" type="text" placeholder="GET/POST..." />\n      </label>\n      <label>\n        <span>Path Params (JSON)</span>\n        <textarea id="pathParams" rows="2" placeholder='{"id":"123"}'></textarea>\n      </label>\n      <label>\n        <span>Query Params (JSON)</span>\n        <textarea id="queryParams" rows="2" placeholder='{"q":"term"}'></textarea>\n      </label>\n      <label>\n        <span>Body (JSON)</span>\n        <textarea id="body" rows="4" placeholder='{"key":"value"}'></textarea>\n      </label>\n      <div class="row">\n        <button id="run">Run</button>\n        <button id="apply" class="secondary">Apply to Selection</button>\n      </div>\n      <pre id="result" class="result"></pre>\n    </section>\n  </main>\n\n  <script>\n    const ENDPOINTS = ${JSON.stringify(endpointsData)};\n    const DEFAULTS = ${JSON.stringify(defaults)};\n\n    const endpointSelect = document.getElementById('endpointSelect');\n    const methodInput = document.getElementById('method');\n    const baseUrlInput = document.getElementById('baseUrl');\n    const apiKeyInput = document.getElementById('apiKey');\n    const runBtn = document.getElementById('run');\n    const applyBtn = document.getElementById('apply');\n    const resultPre = document.getElementById('result');\n\n    // Populate endpoints\n    ENDPOINTS.forEach((e, i) => {\n      const opt = document.createElement('option');\n      opt.value = String(i);\n      opt.textContent = '[' + e.method + '] ' + e.path;\n      endpointSelect.appendChild(opt);\n    });\n    if (ENDPOINTS[0]) {\n      methodInput.value = ENDPOINTS[0].method;\n    }\n\n    endpointSelect.addEventListener('change', () => {\n      const e = ENDPOINTS[Number(endpointSelect.value)];\n      methodInput.value = e.method;\n    });\n\n    // Ask main thread for settings\n    window.parent.postMessage({ pluginMessage: { type: 'get-settings' } }, '*');\n    onmessage = (event) => {\n      const msg = event.data && event.data.pluginMessage;\n      if (!msg) return;\n      if (msg.type === 'settings') {\n        baseUrlInput.value = msg.baseUrl || DEFAULTS.baseUrl;\n        apiKeyInput.value = msg.apiKey || '';\n      }\n    };\n\n    document.getElementById('saveSettings').onclick = () => {\n      window.parent.postMessage({ pluginMessage: { type: 'set-settings', baseUrl: baseUrlInput.value, apiKey: apiKeyInput.value } }, '*');\n    };\n    document.getElementById('loadSettings').onclick = () => {\n      window.parent.postMessage({ pluginMessage: { type: 'get-settings' } }, '*');\n    };\n\n    function buildUrl(base, path, pathParams, queryParams) {\n      let p = path.replace(/\\{(\\w+)\\}/g, (_, k) => (pathParams && pathParams[k]) ? pathParams[k] : '{' + k + '}');\n      const url = new URL(base.replace(/\\/$/, '') + p);\n      if (queryParams) {\n        Object.entries(queryParams).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.append(k, String(v)); });\n      }\n      return url.toString();\n    }\n\n    runBtn.onclick = async () => {\n      resultPre.textContent = 'Running...';\n      try {\n        const e = ENDPOINTS[Number(endpointSelect.value)];\n        const baseUrl = baseUrlInput.value || DEFAULTS.baseUrl;\n        const apiKey = apiKeyInput.value || '';\n        const pathParams = JSON.parse(pathParams.value || '{}');\n        const queryParams = JSON.parse(queryParams.value || '{}');\n        const bodyVal = body.value ? JSON.stringify(JSON.parse(body.value)) : null;\n        const url = buildUrl(baseUrl, e.path, pathParams, queryParams);\n        const headers = { 'Content-Type': 'application/json' };\n        if (apiKey) headers[DEFAULTS.authHeader] = DEFAULTS.authPrefix + apiKey;\n        const res = await fetch(url, { method: methodInput.value || e.method, headers, body: bodyVal });\n        const txt = await res.text();\n        let json; try { json = JSON.parse(txt); } catch { json = { raw: txt }; }\n        resultPre.textContent = JSON.stringify(json, null, 2);\n        window.__lastResult = json;\n      } catch (err) {\n        resultPre.textContent = 'Error: ' + err.message;\n      }\n    };\n\n    applyBtn.onclick = () => {\n      const res = window.__lastResult;\n      if (!res) {\n        resultPre.textContent = 'Run an endpoint first to get a result';\n        return;\n      }\n      let text = '';\n      if (res.text) text = Array.isArray(res.text) ? res.text.join('\n') : String(res.text);\n      else if (res.translations && res.translations[0] && res.translations[0].text) text = res.translations[0].text;\n      else text = JSON.stringify(res);\n      window.parent.postMessage({ pluginMessage: { type: 'apply-to-selection', text } }, '*');\n    };\n  </script>\n</body>\n</html>\n`;

    const stylesCss = `:root{--bg:#ffffff;--muted:#6b7280;--border:#e5e7eb;--primary:#111827;}*{box-sizing:border-box}body{font:13px Inter,system-ui,Arial,sans-serif;margin:0;background:var(--bg);color:var(--primary)}header{padding:12px 16px;border-bottom:1px solid var(--border)}h1{font-size:14px;margin:0}main{padding:12px;display:grid;gap:12px}.card{border:1px solid var(--border);border-radius:8px;padding:12px}.muted{color:var(--muted)}label{display:grid;gap:6px;margin:8px 0}input,textarea,select{width:100%;padding:8px;border:1px solid var(--border);border-radius:6px}button{padding:8px 10px;border:1px solid var(--border);background:#f9fafb;border-radius:6px;cursor:pointer}button.secondary{background:#fff}button:hover{background:#f3f4f6}.row{display:flex;gap:8px}.result{max-height:220px;overflow:auto;background:#0b1022;color:#e1e7ff;padding:10px;border-radius:6px}`;

    const readme = `# ${api.name} Figma Plugin\n\nThis plugin lets you call ${api.name} endpoints from inside Figma.\n\n## Install\n1) Extract the ZIP.\n2) Open Figma desktop.\n3) Plugins → Development → Import plugin from manifest….\n4) Select figma-plugin/manifest.json.\n\n## Use\n1) Open the plugin from Plugins → Development.\n2) In Settings, set Base URL${deeplLike ? ' (prefilled: https://api-free.deepl.com/v2)' : ''} and API Key.\n3) Pick an endpoint, optionally provide params/body, then Run.\n4) For translation-like endpoints, click “Apply to Selection” to insert the result into selected text nodes.\n\n## Notes\n- Network requests run in the UI context.\n- API key stored via clientStorage (main thread).\n- Auth header used: ${defaults.authHeader} (prefix: \"${defaults.authPrefix}\").\n`;

    const files: CodeFile[] = [
      {
        path: 'figma-plugin/manifest.json',
        content: JSON.stringify(manifest, null, 2),
        type: 'config',
        language: 'json',
      },
      {
        path: 'figma-plugin/code.js',
        content: codeJs,
        type: 'component',
        language: 'javascript',
      },
      {
        path: 'figma-plugin/ui.html',
        content: uiHtml,
        type: 'component',
        language: 'javascript',
      },
      {
        path: 'figma-plugin/styles.css',
        content: stylesCss,
        type: 'component',
        language: 'javascript',
      },
      {
        path: 'figma-plugin/README.md',
        content: readme,
        type: 'documentation',
        language: 'javascript',
      },
    ];

    return files;
  }

  private resolveAuthHeader(api: ParsedAPI): string | null {
    const a = api.authentication && api.authentication[0];
    if (!a) return null;
    if (a.type === 'apiKey' && a.location === 'header' && a.name) return a.name;
    if (a.type === 'bearer' || a.scheme === 'bearer' || a.type === 'http') return 'Authorization';
    return 'Authorization';
  }

  private extractBaseUrl(api: ParsedAPI): string | null {
    // Best-effort: try to infer from common paths; otherwise null
    const first = api.endpoints[0];
    if (!first) return null;
    // No reliable base URL in OpenAPI paths alone; leave null to use defaults
    return null;
  }

  private generateConfig(api: ParsedAPI) {
    return { editorType: ['figma', 'figjam'], auth: api.authentication?.[0] || null };
  }

  private generateDocumentation(api: ParsedAPI, features: PlatformFeature[]): string {
    return `# ${api.name} Figma Plugin\n\nGenerated from your OpenAPI spec.\n\n## Features\n${features
      .map((f) => `- ${f.name}: ${f.description}`)
      .join('\n')}\n\n## Installation\n1. Extract the ZIP.\n2. Open the Figma desktop app.\n3. Go to Plugins → Development → Import plugin from manifest…\n4. Select figma-plugin/manifest.json.\n\n## Configuration\nOpen the plugin → Settings. Set Base URL and API Key.\n\n## Running Endpoints\nChoose an endpoint, set params/body, and click Run. The response is shown below.\n\n## Apply to Selection\nFor translation-like responses, click Apply to Selection to write text into selected text nodes.\n\n## Docs\nFigma Plugin Docs: https://www.figma.com/plugin-docs/intro/\n`;
  }
}
