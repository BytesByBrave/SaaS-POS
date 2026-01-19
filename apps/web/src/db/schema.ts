export const productSchema = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string'
        },
        price: {
            type: 'number',
            minimum: 0
        },
        category: {
            type: 'string'
        },
        color: {
            type: 'string' // Tailwind class for UI
        }
    },
    required: ['id', 'name', 'price', 'category']
}

export const orderSchema = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    productId: { type: 'string' },
                    name: { type: 'string' },
                    price: { type: 'number' },
                    quantity: { type: 'number' }
                }
            }
        },
        total: {
            type: 'number'
        },
        status: {
            type: 'string',
            enum: ['pending', 'completed', 'synced']
        },
        timestamp: {
            type: 'number' // Unix timestamp
        }
    },
    required: ['id', 'items', 'total', 'status', 'timestamp']
}
