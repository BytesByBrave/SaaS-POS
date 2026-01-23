import { createRxDatabase, addRxPlugin } from 'rxdb';
import type { RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { productSchema, orderSchema } from './schema';

// Add plugins
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);

// Types
export type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    color?: string;
    image?: string;
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
            migrationStrategies: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                1: (oldDoc: any) => oldDoc
            }
        },
        orders: {
            schema: orderSchema,
        },
    });

    // Seed data if empty (for development)
    const initialProducts = [
        { id: '1', name: 'Espresso', price: 2.50, category: 'Coffee', color: 'bg-amber-100', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop' },
        { id: '2', name: 'Cappuccino', price: 3.50, category: 'Coffee', color: 'bg-orange-100', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop' },
        { id: '3', name: 'Latte', price: 4.00, category: 'Coffee', color: 'bg-yellow-100', image: 'https://images.unsplash.com/photo-1536939459926-301728217827?w=400&h=400&fit=crop' },
        { id: '4', name: 'Americano', price: 3.00, category: 'Coffee', color: 'bg-stone-100', image: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=400&h=400&fit=crop' },
        { id: '5', name: 'Macchiato', price: 3.25, category: 'Coffee', color: 'bg-zinc-100', image: 'https://images.unsplash.com/photo-1485808191679-5f6333c1fe5b?w=400&h=400&fit=crop' },
        { id: '6', name: 'Flat White', price: 4.00, category: 'Coffee', color: 'bg-orange-50', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop' },
        { id: '7', name: 'Green Tea', price: 3.00, category: 'Tea', color: 'bg-green-100', image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=400&fit=crop' },
        { id: '8', name: 'Earl Grey', price: 3.25, category: 'Tea', color: 'bg-slate-100', image: 'https://images.unsplash.com/photo-1594631252845-29fc4586c55c?w=400&h=400&fit=crop' },
        { id: '9', name: 'Chamomile', price: 3.00, category: 'Tea', color: 'bg-yellow-50', image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=400&fit=crop' },
        { id: '10', name: 'Jasmine Green', price: 3.50, category: 'Tea', color: 'bg-emerald-50', image: 'https://images.unsplash.com/photo-1563911302283-d2bc1d0bd49b?w=400&h=400&fit=crop' },
        { id: '11', name: 'Croissant', price: 3.25, category: 'Pastries', color: 'bg-amber-50', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop' },
        { id: '12', name: 'Bagel', price: 2.00, category: 'Pastries', color: 'bg-orange-50', image: 'https://images.unsplash.com/photo-1585476108014-2c356976939b?w=400&h=400&fit=crop' },
        { id: '13', name: 'Muffin', price: 2.75, category: 'Pastries', color: 'bg-purple-50', image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400&h=400&fit=crop' },
        { id: '14', name: 'Pain au Chocolat', price: 3.75, category: 'Pastries', color: 'bg-stone-50', image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&h=400&fit=crop' },
        { id: '15', name: 'Blueberry Scone', price: 3.50, category: 'Pastries', color: 'bg-blue-50', image: 'https://images.unsplash.com/photo-1582239611624-a744473e6edc?w=400&h=400&fit=crop' },
        { id: '16', name: 'Cinnamon Roll', price: 4.00, category: 'Pastries', color: 'bg-orange-100', image: 'https://images.unsplash.com/photo-1509351025504-49a0a3a0322b?w=400&h=400&fit=crop' },
        { id: '17', name: 'Club Sandwich', price: 8.50, category: 'Sandwiches', color: 'bg-red-50', image: 'https://images.unsplash.com/photo-1567234665766-cd1247ab4443?w=400&h=400&fit=crop' },
        { id: '18', name: 'Turkey & Swiss', price: 9.00, category: 'Sandwiches', color: 'bg-red-100', image: 'https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=400&h=400&fit=crop' },
        { id: '19', name: 'Caprese Panini', price: 8.50, category: 'Sandwiches', color: 'bg-green-50', image: 'https://images.unsplash.com/photo-1521404063673-810a99677336?w=400&h=400&fit=crop' },
        { id: '20', name: 'Chicken Avocado', price: 9.50, category: 'Sandwiches', color: 'bg-emerald-100', image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&h=400&fit=crop' },
        { id: '21', name: 'Veggie Hummus', price: 8.00, category: 'Sandwiches', color: 'bg-lime-50', image: 'https://images.unsplash.com/photo-1623245452818-059960533081?w=400&h=400&fit=crop' },
        { id: '22', name: 'Orange Juice', price: 4.50, category: 'Juices', color: 'bg-orange-200', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=400&fit=crop' },
        { id: '23', name: 'Apple Juice', price: 4.00, category: 'Juices', color: 'bg-yellow-200', image: 'https://images.unsplash.com/photo-1576673414150-da386273f60b?w=400&h=400&fit=crop' },
        { id: '24', name: 'Mango Smoothie', price: 5.50, category: 'Juices', color: 'bg-orange-300', image: 'https://images.unsplash.com/photo-1526424382096-74a93e105682?w=400&h=400&fit=crop' },
        { id: '25', name: 'Lemonade', price: 3.50, category: 'Juices', color: 'bg-yellow-100', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop' },
        { id: '26', name: 'Cheesecake', price: 6.50, category: 'Desserts', color: 'bg-stone-100', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215306ad?w=400&h=400&fit=crop' },
        { id: '27', name: 'Brownie', price: 4.00, category: 'Desserts', color: 'bg-stone-800', image: 'https://images.unsplash.com/photo-1461023058943-07fc21c99059?w=400&h=400&fit=crop' },
        { id: '28', name: 'Tiramisu', price: 7.00, category: 'Desserts', color: 'bg-amber-900', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop' },
        { id: '29', name: 'Fruit Tart', price: 5.50, category: 'Desserts', color: 'bg-pink-100', image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=400&fit=crop' },
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
