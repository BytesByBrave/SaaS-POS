import { createRxDatabase } from 'rxdb';
import type { RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { productSchema, orderSchema } from './schema';

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
    status: 'pending' | 'completed' | 'synced';
    timestamp: number;
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
    const productCount = await db.products.count().exec();
    if (productCount === 0) {
        await db.products.bulkInsert([
            { id: '1', name: 'Espresso', price: 2.50, category: 'Coffee', color: 'bg-amber-100' },
            { id: '2', name: 'Cappuccino', price: 3.50, category: 'Coffee', color: 'bg-orange-100' },
            { id: '3', name: 'Latte', price: 4.00, category: 'Coffee', color: 'bg-yellow-100' },
            { id: '4', name: 'Green Tea', price: 3.00, category: 'Tea', color: 'bg-green-100' },
            { id: '5', name: 'Croissant', price: 3.25, category: 'Pastries', color: 'bg-amber-50' },
            { id: '6', name: 'Bagel', price: 2.00, category: 'Pastries', color: 'bg-orange-50' },
            { id: '7', name: 'Club Sandwich', price: 8.50, category: 'Sandwiches', color: 'bg-red-50' },
            { id: '8', name: 'Muffin', price: 2.75, category: 'Pastries', color: 'bg-purple-50' },
        ]);
    }

    return db;
};

export const getDatabase = () => {
    if (!dbPromise) {
        dbPromise = createDatabase();
    }
    return dbPromise;
};
