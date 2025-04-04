// import { createClient } from '@libsql/client';
// import { aiServices } from '../data/ai-data';
// import * as dotenv from 'dotenv';

// dotenv.config({ path: process.cwd() + '/.env' });

// // Verificar que las variables de entorno estén disponibles
// const dbUrl = process.env.TURSO_DATABASE_URL;
// const authToken = process.env.TURSO_AUTH_TOKEN;

// if (!dbUrl || !authToken) {
//   console.error('Error: Variables de entorno TURSO_DATABASE_URL o TURSO_AUTH_TOKEN no encontradas');
//   console.error('URL actual:', dbUrl);
//   process.exit(1);
// }

// // Crear cliente de base de datos para el script de migración
// const db = createClient({
//   url: dbUrl,
//   authToken: authToken
// });

// // Función para inicializar la base de datos
// async function initializeDatabase() {
//   // Crear tabla para servicios de IA
//   await db.execute(`
//     CREATE TABLE IF NOT EXISTS ai_services (
//       id TEXT PRIMARY KEY,
//       name TEXT NOT NULL,
//       description_es TEXT NOT NULL,
//       description_en TEXT NOT NULL,
//       price TEXT NOT NULL,
//       price_details TEXT NOT NULL,
//       type TEXT NOT NULL,
//       rating REAL NOT NULL,
//       has_free BOOLEAN NOT NULL,
//       has_api BOOLEAN NOT NULL,
//       commercial_use BOOLEAN NOT NULL,
//       custom_models BOOLEAN NOT NULL,
//       is_new BOOLEAN NOT NULL,
//       release_year INTEGER NOT NULL
//     )
//   `);

//   // Crear tabla para categorías
//   await db.execute(`
//     CREATE TABLE IF NOT EXISTS categories (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL UNIQUE
//     )
//   `);

//   // Crear tabla para la relación muchos a muchos entre servicios y categorías
//   await db.execute(`
//     CREATE TABLE IF NOT EXISTS service_categories (
//       service_id TEXT NOT NULL,
//       category_id INTEGER NOT NULL,
//       PRIMARY KEY (service_id, category_id),
//       FOREIGN KEY (service_id) REFERENCES ai_services(id),
//       FOREIGN KEY (category_id) REFERENCES categories(id)
//     )
//   `);

//   // Crear tabla para características (features)
//   await db.execute(`
//     CREATE TABLE IF NOT EXISTS features (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       service_id TEXT NOT NULL,
//       feature_es TEXT NOT NULL,
//       feature_en TEXT NOT NULL,
//       FOREIGN KEY (service_id) REFERENCES ai_services(id)
//     )
//   `);
// }

// export async function migrateData() {
//   // Inicializar la estructura de la base de datos
//   await initializeDatabase();

//   // Verificar si ya hay datos en la base de datos
//   const existingServices = await db.execute('SELECT COUNT(*) as count FROM ai_services');
//   if ((existingServices.rows[0]?.count as number) > 0) {
//     console.log('La base de datos ya contiene servicios. Omitiendo migración.');
//     return;
//   }

//   // Insertar categorías únicas
//   const allCategories = [...new Set(aiServices.flatMap((service: { categories: string[] }) => service.categories))];
//   for (const category of allCategories) {
//     await db.execute({
//       sql: 'INSERT INTO categories (name) VALUES (?)',
//       args: [category]
//     });
//   }

//   // Obtener todas las categorías con sus IDs
//   const categoriesResult = await db.execute('SELECT id, name FROM categories');
//   const categoriesMap = new Map();
//   categoriesResult.rows.forEach(row => {
//     categoriesMap.set(row.name, row.id);
//   });

//   // Insertar servicios y sus relaciones
//   for (const service of aiServices) {
//     // Insertar servicio
//     await db.execute({
//       sql: `
//         INSERT INTO ai_services (
//           id, name, description_es, description_en, price, price_details, 
//           type, rating, has_free, has_api, commercial_use, custom_models, is_new, release_year
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `,
//       args: [
//         service.id,
//         service.name,
//         service.description.es,
//         service.description.en,
//         service.price,
//         service.priceDetails,
//         service.type,
//         service.rating,
//         service.hasFree ? 1 : 0,
//         service.hasAPI ? 1 : 0,
//         service.commercialUse ? 1 : 0,
//         service.customModels ? 1 : 0,
//         service.isNew ? 1 : 0,
//         service.releaseYear
//       ]
//     });

//     // Insertar relaciones de categorías
//     for (const category of service.categories) {
//       const categoryId = categoriesMap.get(category);
//       await db.execute({
//         sql: 'INSERT INTO service_categories (service_id, category_id) VALUES (?, ?)',
//         args: [service.id, categoryId]
//       });
//     }

//     // Insertar características (features)
//     for (const featureEs of service.features.es) {
//       const featureIndex = service.features.es.indexOf(featureEs);
//       const featureEn = service.features.en[featureIndex];
      
//       await db.execute({
//         sql: 'INSERT INTO features (service_id, feature_es, feature_en) VALUES (?, ?, ?)',
//         args: [service.id, featureEs, featureEn]
//       });
//     }
//   }

//   console.log('Migración completada con éxito.');
// }