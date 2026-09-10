import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import process from 'node:process';

const command = process.argv[2] || 'dev';
const workspaceDirectories = ['backend', 'frontend', 'tattoo-web'];
const workspaces = workspaceDirectories
  .filter((directory) => existsSync(new URL(`../${directory}/package.json`, import.meta.url)))
  .filter((directory) => {
    const packageJson = JSON.parse(
      readFileSync(new URL(`../${directory}/package.json`, import.meta.url), 'utf8')
    );
    return Boolean(packageJson.scripts?.[command]);
  });

if (workspaces.length === 0) {
  console.error(`No workspace provides an npm script named "${command}".`);
  process.exit(1);
}

const children = workspaces.map((workspace) =>
  spawn('npm', ['run', command, '--workspace', workspace], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })
);

const stopChildren = (signal) => {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
};

process.on('SIGINT', () => stopChildren('SIGINT'));
process.on('SIGTERM', () => stopChildren('SIGTERM'));

const exitCodes = await Promise.all(
  children.map(
    (child) =>
      new Promise((resolve) => {
        child.on('exit', (code, signal) => resolve(signal ? 1 : (code ?? 1)));
        child.on('error', () => resolve(1));
      })
  )
);

process.exitCode = exitCodes.some((code) => code !== 0) ? 1 : 0;
