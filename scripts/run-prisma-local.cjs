const { spawnSync } = require('node:child_process');
const { existsSync, readFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const projectRoot = resolve(__dirname, '..');
const allowedHosts = new Set(['127.0.0.1', 'localhost']);
const allowedDatabases = new Set(['apoio_diario_local', 'apoio_diario_test']);

function readDatabaseUrlFromEnvFile() {
  const envPath = join(projectRoot, '.env');

  if (!existsSync(envPath)) {
    return undefined;
  }

  let databaseUrl;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);

    if (!match) {
      continue;
    }

    databaseUrl = match[1].trim();

    const isQuoted =
      (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) ||
      (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"));

    if (isQuoted) {
      databaseUrl = databaseUrl.slice(1, -1);
    }
  }

  return databaseUrl;
}

function stop(message) {
  console.error(`Execução bloqueada: ${message}`);
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL || readDatabaseUrlFromEnvFile();

if (!databaseUrl) {
  stop('DATABASE_URL não foi definida no terminal nem no arquivo .env.');
}

let parsedDatabaseUrl;

try {
  parsedDatabaseUrl = new URL(databaseUrl);
} catch {
  stop('DATABASE_URL possui formato inválido.');
}

const databaseName = decodeURIComponent(
  parsedDatabaseUrl.pathname.replace(/^\//, ''),
);

if (!['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol)) {
  stop('somente conexões PostgreSQL são permitidas.');
}

if (!allowedHosts.has(parsedDatabaseUrl.hostname)) {
  stop('o host deve ser 127.0.0.1 ou localhost.');
}

if (parsedDatabaseUrl.port !== '5433') {
  stop('a porta deve ser 5433.');
}

if (!allowedDatabases.has(databaseName)) {
  stop('o banco deve ser apoio_diario_local ou apoio_diario_test.');
}

const prismaArguments = process.argv.slice(2);

if (prismaArguments.length === 0) {
  stop('informe um comando Prisma após --.');
}

if (prismaArguments[0] === 'migrate' && prismaArguments[1] === 'reset') {
  stop('migrate reset não é permitido pelo comando local protegido.');
}

const prismaCli = join(
  projectRoot,
  'node_modules',
  'prisma',
  'build',
  'index.js',
);

if (!existsSync(prismaCli)) {
  stop('Prisma CLI não encontrado. Execute npm ci primeiro.');
}

console.log(
  `Prisma local autorizado: ${parsedDatabaseUrl.hostname}:${parsedDatabaseUrl.port}/${databaseName}`,
);

const result = spawnSync(process.execPath, [prismaCli, ...prismaArguments], {
  cwd: projectRoot,
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
