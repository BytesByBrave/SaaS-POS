import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<Repository<Product>>;

  const mockProduct: Partial<Product> = {
    id: 'product-uuid-1',
    organizationId: 'org-uuid-1',
    name: 'Test Product',
    price: 10.99,
    stock: 100,
    category: 'Test Category',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const productData = { name: 'New Product', price: 15.99, stock: 50 };
      const organizationId = 'org-uuid-1';

      mockRepository.create.mockReturnValue({ ...productData, organizationId } as Product);
      mockRepository.save.mockResolvedValue({ ...mockProduct, ...productData } as Product);

      const result = await service.create(productData, organizationId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...productData,
        organizationId,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('New Product');
    });

    it('should throw error if save fails', async () => {
      mockRepository.create.mockReturnValue({} as Product);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create({}, 'org-1')).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all products for organization', async () => {
      const products = [mockProduct, { ...mockProduct, id: 'product-uuid-2' }];
      mockRepository.find.mockResolvedValue(products as Product[]);

      const result = await service.findAll('org-uuid-1');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { organizationId: 'org-uuid-1' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no products', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll('org-uuid-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct as Product);

      const result = await service.findOne('product-uuid-1', 'org-uuid-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-uuid-1', organizationId: 'org-uuid-1' },
      });
      expect(result?.id).toBe('product-uuid-1');
    });

    it('should return null when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent', 'org-uuid-1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateData = { name: 'Updated Name' };
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue({ ...mockProduct, ...updateData } as Product);

      const result = await service.update('product-uuid-1', updateData, 'org-uuid-1');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: 'product-uuid-1', organizationId: 'org-uuid-1' },
        updateData,
      );
      expect(result?.name).toBe('Updated Name');
    });

    it('should return null when product to update not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 } as any);
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent', { name: 'test' }, 'org-uuid-1');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove('product-uuid-1', 'org-uuid-1');

      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: 'product-uuid-1',
        organizationId: 'org-uuid-1',
      });
    });
  });

  describe('findLowStock', () => {
    it('should return products with low stock', async () => {
      const lowStockProducts = [{ ...mockProduct, stock: 5 }];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(lowStockProducts),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findLowStock('org-uuid-1', 10);

      expect(result).toHaveLength(1);
      expect(result[0].stock).toBe(5);
    });
  });
});
