import { productsAPI, settingsAPI } from '../api/services';
import { getProducts } from '../data/products';

export const migrateProductsToBackend = async () => {
  try {
    console.log('Starting products migration...');

    // Получаем товары из localStorage или используем дефолтные
    const savedProducts = localStorage.getItem('products');
    const localProducts = savedProducts ? JSON.parse(savedProducts) : getProducts();

    if (localProducts.length === 0) {
      console.log('No products to migrate');
      return { success: true, count: 0 };
    }

    console.log(`Migrating ${localProducts.length} products to backend...`);

    // Массовое создание товаров
    const result = await productsAPI.bulkCreate(localProducts);
    console.log(`✓ Migrated ${result.created} products`);

    return { success: true, count: result.created };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
};

export const migrateSettingsToBackend = async () => {
  try {
    console.log('Starting settings migration...');

    // Получаем настройки из localStorage
    const localSettings = localStorage.getItem('siteSettings');

    if (!localSettings) {
      console.log('No settings to migrate');
      return { success: true };
    }

    const settings = JSON.parse(localSettings);

    if (Object.keys(settings).length === 0) {
      console.log('No settings to migrate');
      return { success: true };
    }

    console.log('Migrating settings to backend...');

    // Обновление настроек
    await settingsAPI.update(settings);
    console.log('✓ Settings migrated');

    return { success: true };
  } catch (error) {
    console.error('Settings migration failed:', error);
    return { success: false, error: error.message };
  }
};

// Главная функция миграции
export const migrateAllData = async () => {
  console.log('=== Starting Data Migration ===');

  const results = {
    products: await migrateProductsToBackend(),
    settings: await migrateSettingsToBackend()
  };

  console.log('=== Migration Complete ===');
  console.log('Results:', results);

  return results;
};
