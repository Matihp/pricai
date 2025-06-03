// Configuración de reintentos
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000; // 1 segundo

// Función de espera
export const wait = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Función para reintentar peticiones
export async function fetchWithRetry<T>(
  queryString: string, 
  fetchFn: () => Promise<T>, 
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry attempt ${MAX_RETRIES - retries + 1} for query: ${queryString}`);
      await wait(RETRY_DELAY);
      return fetchWithRetry(queryString, fetchFn, retries - 1);
    }
    throw error;
  }
}