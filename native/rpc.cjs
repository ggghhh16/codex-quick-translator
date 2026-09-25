'use strict';
const {error:localError} = require('./messages.cjs');
const { EventEmitter } = require('node:events');
const { spawn } = require('node:child_process');
const { createInterface } = require('node:readline');

class Rpc extends EventEmitter {
  constructor(executable, cwd) {
    super();
    this.pending = new Map(); this.nextId = 1; this.closed = false;
    const args = ['app-server', '--listen', 'stdio://', '-c', 'default_permissions="translator"',
      '-c', 'permissions.translator.filesystem={ ":minimal" = "read" }',
      '-c', 'permissions.translator.network.enabled=false',
      ...['hooks', 'apps', 'plugins', 'shell_tool', 'unified_exec', 'memories', 'multi_agent', 'code_mode'].flatMap(f => ['-c', `features.${f}=false`])];
    this.child = spawn(executable, args, { cwd, windowsHide: true, shell: false, stdio: ['pipe','pipe','pipe'] });
    this.child.on('error', e => this.fail(localError('errorCodexStart',[e.message])));
    this.child.on('exit', () => this.fail(localError('errorCodexClosed')));
    this.child.stdin.on('error', e => this.fail(e));
    this.child.stderr.on('data', () => {});
    this.lines = createInterface({ input: this.child.stdout });
    this.lines.on('line', line => {
      let msg; try { msg = JSON.parse(line); } catch { return; }
      if (msg.id !== undefined && msg.method) {
        this.send({ id: msg.id, error: { code: -32601, message: 'Translator does not allow tools or approvals.' } });
      } else if (msg.id !== undefined) {
        const p = this.pending.get(msg.id); if (!p) return;
        this.pending.delete(msg.id); clearTimeout(p.timer);
        msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
      } else if (msg.method) this.emit('notification', msg.method, msg.params || {});
    });
  }
  send(msg) { if (!this.closed) this.child.stdin.write(JSON.stringify(msg) + '\n'); }
  request(method, params = {}, timeout = 45000) {
    if (this.closed) return Promise.reject(localError('errorCodexClosed'));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(localError('errorCodexTimeout',[method])); }, timeout);
      this.pending.set(id, { resolve, reject, timer }); this.send({ id, method, params });
    });
  }
  async initialize() {
    await this.request('initialize', { clientInfo: { name: 'quick_translator', title: 'Quick Translate', version: require('../package.json').version }, capabilities: { experimentalApi: true } });
    this.send({ method: 'initialized', params: {} });
  }
  fail(error) {
    if (this.closed) return; this.closed = true;
    for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(error); }
    this.pending.clear(); this.emit('closed', error);
  }
  dispose() { this.fail(localError('errorCodexClosed')); this.lines.close(); this.child.kill(); }
}
module.exports = { Rpc };
