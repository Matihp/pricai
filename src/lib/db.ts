import { createClient } from '@libsql/client';
import { performance } from 'perf_hooks';

// Crear un cliente singleton para reutilizar la conexión
let dbClient: ReturnType<typeof createClient> | null = null;

export function getDbClient() {
  if (!dbClient) {
    const startTime = performance.now();
    console.log('Creando nueva conexión a la base de datos...');
    
    dbClient = createClient({
      url: import.meta.env.TURSO_DATABASE_URL,
      authToken: import.meta.env.TURSO_AUTH_TOKEN,
    });
    
    console.log(`Conexión a la base de datos creada en ${performance.now() - startTime}ms`);
  }
  return dbClient;
}

export const db = getDbClient();