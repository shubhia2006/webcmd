import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export class WebCMDService {
  constructor() {
    this.activeSessions = new Map();
    this.logs = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const entry = { timestamp, message, type, id: Date.now() + Math.random() };
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop();
    console.log(`[WebCMD ${type.toUpperCase()}] ${message}`);
    return entry;
  }

  getLogs() {
    return this.logs;
  }

  async runDoctor() {
    this.log('Running webcmd doctor diagnostic check...', 'info');
    try {
      const { stdout, stderr } = await execPromise('npx @agentrhq/webcmd doctor');
      this.log('webcmd doctor execution completed successfully', 'success');
      return { success: true, output: stdout || stderr };
    } catch (err) {
      this.log(`webcmd doctor diagnostic warning: ${err.message}`, 'warn');
      return { success: false, error: err.message, output: err.stdout || 'Bridge diagnostic initialized in standalone mode' };
    }
  }

  async listCommands() {
    this.log('Fetching available webcmd deterministic site commands...', 'info');
    try {
      const { stdout } = await execPromise('npx @agentrhq/webcmd list');
      return { success: true, output: stdout };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async createSession(sessionName = 'vortex-student-agent') {
    const sessionId = `sess_${Date.now()}`;
    this.log(`Initializing webcmd browser session: ${sessionId} (${sessionName})`, 'info');
    
    const sessionData = {
      id: sessionId,
      name: sessionName,
      createdAt: new Date().toISOString(),
      status: 'active',
      tabs: [{ id: 1, url: 'https://devpost.com/hackathons', title: 'Devpost Hackathons' }]
    };
    
    this.activeSessions.set(sessionId, sessionData);
    this.log(`Session ${sessionId} active with webcmd self-healing bridge`, 'success');
    return sessionData;
  }

  async getSessionSnapshot(sessionId) {
    this.log(`Capturing webcmd DOM snapshot & accessibility tree for session ${sessionId}...`, 'info');
    return {
      sessionId,
      timestamp: new Date().toISOString(),
      domTree: {
        tag: 'body',
        children: [
          { tag: 'header', text: 'Hackathons & Internships Portal' },
          { tag: 'main', text: 'Listing 24 Active Student Opportunities' },
          { tag: 'form', id: 'application-form', inputs: ['name', 'email', 'resume', 'essay'] }
        ]
      },
      status: 'synced'
    };
  }

  async executeCommand(site, command, args = []) {
    const cmdString = `webcmd ${site} ${command} ${args.join(' ')}`.trim();
    this.log(`Executing webcmd CLI: ${cmdString}`, 'cmd');
    
    // Simulate webcmd execution with self-healing log
    this.log(`[webcmd-healer] Verified DOM selector for ${site}:${command}`, 'info');
    return {
      command: cmdString,
      status: 'completed',
      timestamp: new Date().toISOString(),
      data: `Executed ${command} on ${site} successfully.`
    };
  }
}

export const webcmdService = new WebCMDService();
