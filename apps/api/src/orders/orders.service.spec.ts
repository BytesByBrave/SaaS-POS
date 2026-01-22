import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Repository } from 'typeorm';

describe('OrdersService', () => {
    let service: OrdersService;
    let orderRepository: jest.Mocked<Repository<Order>>;
    let orderItemRepository: jest.Mocked<Repository<OrderItem>>;

    const mockOrder = {
        id: 'order-uuid-1',
        organizationId: 'org-uuid-1',
        total: 25.99,
        status: 'completed',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockOrderRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockOrderItemRepository = {
        create: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: mockOrderRepository,
                },
                {
                    provide: getRepositoryToken(OrderItem),
                    useValue: mockOrderItemRepository,
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        orderRepository = module.get(getRepositoryToken(Order));
        orderItemRepository = module.get(getRepositoryToken(OrderItem));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create an order with items', async () => {
            const orderData = {
                total: 25.99,
                items: [
                    { productName: 'Product 1', quantity: 2, price: 10.00 },
                    { productName: 'Product 2', quantity: 1, price: 5.99 },
                ],
            };

            mockOrderRepository.create.mockReturnValue({ ...mockOrder, ...orderData } as any);
            mockOrderRepository.save.mockResolvedValue({ ...mockOrder, ...orderData } as any);

            const result = await service.create(orderData, 'org-uuid-1');

            expect(mockOrderRepository.create).toHaveBeenCalled();
            expect(result.total).toBe(25.99);
        });
    });

    describe('findAll', () => {
        it('should return all orders for organization', async () => {
            const orders = [mockOrder, { ...mockOrder, id: 'order-uuid-2' }];
            mockOrderRepository.find.mockResolvedValue(orders as any);

            const result = await service.findAll('org-uuid-1');

            expect(mockOrderRepository.find).toHaveBeenCalledWith({
                where: { organizationId: 'org-uuid-1' },
                relations: ['items'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toHaveLength(2);
        });
    });

    describe('findOne', () => {
        it('should return an order by id', async () => {
            mockOrderRepository.findOne.mockResolvedValue(mockOrder as any);

            const result = await service.findOne('order-uuid-1', 'org-uuid-1');

            expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'order-uuid-1', organizationId: 'org-uuid-1' },
                relations: ['items'],
            });
            expect(result?.id).toBe('order-uuid-1');
        });

        it('should return null when order not found', async () => {
            mockOrderRepository.findOne.mockResolvedValue(null);

            const result = await service.findOne('non-existent', 'org-uuid-1');

            expect(result).toBeNull();
        });
    });

    describe('getSalesPerHour', () => {
        it('should return sales aggregated by hour', async () => {
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([
                    { hour: '10', total: '150.00', count: '5' },
                    { hour: '11', total: '200.00', count: '8' },
                ]),
            };
            mockOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            const result = await service.getSalesPerHour('org-uuid-1', 7);

            expect(result).toHaveLength(2);
            expect(mockOrderRepository.createQueryBuilder).toHaveBeenCalledWith('order');
        });
    });

    describe('getTopItems', () => {
        it('should return top selling items', async () => {
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([
                    { productName: 'Product 1', totalSold: '50', totalRevenue: '500.00' },
                    { productName: 'Product 2', totalSold: '30', totalRevenue: '300.00' },
                ]),
            };
            mockOrderItemRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            const result = await service.getTopItems('org-uuid-1', 10);

            expect(result).toHaveLength(2);
        });
    });
});
