import { db } from './db';

export async function initializeDatabase() {
  // Crear tabla para servicios de IA
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ai_services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description_es TEXT NOT NULL,
      description_en TEXT NOT NULL,
      price TEXT NOT NULL,
      price_details TEXT NOT NULL,
      type TEXT NOT NULL,
      rating REAL NOT NULL,
      has_free BOOLEAN NOT NULL,
      has_api BOOLEAN NOT NULL,
      commercial_use BOOLEAN NOT NULL,
      custom_models BOOLEAN NOT NULL,
      is_new BOOLEAN NOT NULL,
      release_year INTEGER NOT NULL
    )
  `);

  // Crear tabla para categorías
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  // Crear tabla para la relación muchos a muchos entre servicios y categorías
  await db.execute(`
    CREATE TABLE IF NOT EXISTS service_categories (
      service_id TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (service_id, category_id),
      FOREIGN KEY (service_id) REFERENCES ai_services(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Crear tabla para características (features)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      feature_es TEXT NOT NULL,
      feature_en TEXT NOT NULL,
      FOREIGN KEY (service_id) REFERENCES ai_services(id)
    )
  `);
}