import { createRxDatabase, addRxPlugin } from 'rxdb';
import type { RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { productSchema, orderSchema } from './schema';

// Add plugins
addRxPlugin(RxDBQueryBuilderPlugin);

// Types
export type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    color?: string;
};

export type OrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
};

export type Order = {
    id: string;
    items: OrderItem[];
    total: number;
    status: 'draft' | 'pending' | 'completed' | 'synced';
    timestamp: number;
    paymentMethod?: string;
};

export type DatabaseCollections = {
    products: RxCollection<Product>;
    orders: RxCollection<Order>;
};

export type Database = RxDatabase<DatabaseCollections>;

let dbPromise: Promise<Database> | null = null;

const createDatabase = async (): Promise<Database> => {
    const db = await createRxDatabase<DatabaseCollections>({
        name: 'saaspositiondb',
        storage: getRxStorageDexie(),
    });

    await db.addCollections({
        products: {
            schema: productSchema,
        },
        orders: {
            schema: orderSchema,
        },
    });

    // Seed data if empty (for development)
    const initialProducts = [
        { id: '1', name: 'Espresso', price: 2.50, category: 'Coffee', color: 'bg-amber-100' },
        { id: '2', name: 'Cappuccino', price: 3.50, category: 'Coffee', color: 'bg-orange-100' },
        { id: '3', name: 'Latte', price: 4.00, category: 'Coffee', color: 'bg-yellow-100' },
        { id: '4', name: 'Americano', price: 3.00, category: 'Coffee', color: 'bg-stone-100' },
        { id: '5', name: 'Macchiato', price: 3.25, category: 'Coffee', color: 'bg-zinc-100' },
        { id: '6', name: 'Flat White', price: 4.00, category: 'Coffee', color: 'bg-orange-50' },
        { id: '7', name: 'Green Tea', price: 3.00, category: 'Tea', color: 'bg-green-100' },
        { id: '8', name: 'Earl Grey', price: 3.25, category: 'Tea', color: 'bg-slate-100' },
        { id: '9', name: 'Chamomile', price: 3.00, category: 'Tea', color: 'bg-yellow-50' },
        { id: '10', name: 'Jasmine Green', price: 3.50, category: 'Tea', color: 'bg-emerald-50' },
        { id: '11', name: 'Croissant', price: 3.25, category: 'Pastries', color: 'bg-amber-50' },
        { id: '12', name: 'Bagel', price: 2.00, category: 'Pastries', color: 'bg-orange-50' },
        { id: '13', name: 'Muffin', price: 2.75, category: 'Pastries', color: 'bg-purple-50' },
        { id: '14', name: 'Pain au Chocolat', price: 3.75, category: 'Pastries', color: 'bg-stone-50' },
        { id: '15', name: 'Blueberry Scone', price: 3.50, category: 'Pastries', color: 'bg-blue-50' },
        { id: '16', name: 'Cinnamon Roll', price: 4.00, category: 'Pastries', color: 'bg-orange-100' },
        { id: '17', name: 'Club Sandwich', price: 8.50, category: 'Sandwiches', color: 'bg-red-50' },
        { id: '18', name: 'Turkey & Swiss', price: 9.00, category: 'Sandwiches', color: 'bg-red-100' },
        { id: '19', name: 'Caprese Panini', price: 8.50, category: 'Sandwiches', color: 'bg-green-50' },
        { id: '20', name: 'Chicken Avocado', price: 9.50, category: 'Sandwiches', color: 'bg-emerald-100' },
        { id: '21', name: 'Veggie Hummus', price: 8.00, category: 'Sandwiches', color: 'bg-lime-50' },
        { id: '22', name: 'Orange Juice', price: 4.50, category: 'Juices', color: 'bg-orange-200' },
        { id: '23', name: 'Apple Juice', price: 4.00, category: 'Juices', color: 'bg-yellow-200' },
        { id: '24', name: 'Mango Smoothie', price: 5.50, category: 'Juices', color: 'bg-orange-300' },
        { id: '25', name: 'Lemonade', price: 3.50, category: 'Juices', color: 'bg-yellow-100' },
        { id: '26', name: 'Cheesecake', price: 6.50, category: 'Desserts', color: 'bg-stone-100' },
        { id: '27', name: 'Brownie', price: 4.00, category: 'Desserts', color: 'bg-stone-800' },
        { id: '28', name: 'Tiramisu', price: 7.00, category: 'Desserts', color: 'bg-amber-900' },
        { id: '29', name: 'Fruit Tart', price: 5.50, category: 'Desserts', color: 'bg-pink-100' },
    ];

    const currentCount = await db.products.count().exec();
    if (currentCount < initialProducts.length) {
        for (const product of initialProducts) {
            await db.products.upsert(product);
        }
    }

    return db;
};

export const getDatabase = () => {
    if (!dbPromise) {
        dbPromise = createDatabase();
    }
    return dbPromise;
};
