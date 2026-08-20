const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL de teste não foi definida. Configure o banco local apoio_diario_test antes de executar o E2E.',
  );
}

const parsedDatabaseUrl = new URL(databaseUrl);
const isLocalHost = ['127.0.0.1', 'localhost'].includes(
  parsedDatabaseUrl.hostname,
);
const isLocalPort = parsedDatabaseUrl.port === '5433';
const isTestDatabase = parsedDatabaseUrl.pathname === '/apoio_diario_test';

if (!isLocalHost || !isLocalPort || !isTestDatabase) {
  throw new Error(
    'Execução bloqueada: o teste E2E exige DATABASE_URL apontando para apoio_diario_test em 127.0.0.1:5433.',
  );
}
