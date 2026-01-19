import type { Database } from '../db/database';

export class SyncService {
    private db: Database;
    private syncInterval: any = null;
    private isOnline = navigator.onLine;

    constructor(db: Database) {
        this.db = db;

        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('Online: Resuming Sync');
            this.sync();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('Offline: Pausing Sync');
        });

        // Start auto-sync loop
        this.startSyncLoop();
    }

    private startSyncLoop() {
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.sync();
            }
        }, 10000); // Check every 10 seconds
    }

    public async sync() {
        if (!this.isOnline) return;

        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) return;

        const user = JSON.parse(userStr);
        const organizationId = user.organizationId;

        console.log('Syncing data...');

        // 1. Push pending orders to backend
        const pendingOrders = await this.db.orders.find({
            selector: {
                status: 'pending'
            }
        }).exec();

        for (const order of pendingOrders) {
            try {
                const response = await fetch('http://localhost:3000/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-Tenant-ID': organizationId
                    },
                    body: JSON.stringify(order.toJSON())
                });

                if (response.ok) {
                    await order.patch({ status: 'synced' });
                    console.log(`Synced Order: ${order.id}`);
                }
            } catch (error) {
                console.error('Failed to sync order:', order.id, error);
            }
        }
    }

    public cleanup() {
        if (this.syncInterval) clearInterval(this.syncInterval);
    }
}
