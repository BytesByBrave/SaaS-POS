import { AppDataSource } from './data-source';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Product } from '../products/entities/product.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established.');

    // 1. Create Organization
    const orgRepository = AppDataSource.getRepository(Organization);
    let organization = await orgRepository.findOne({
      where: { slug: 'default-coffee' } as any,
    });

    if (!organization) {
      console.log('Creating default organization...');
      const newOrgData = {
        name: 'Default Coffee Shop',
        slug: 'default-coffee',
        type: 'restaurant',
        features: {
          retail: true,
          restaurant: true,
          service: false,
          inventory: true,
          tables: true,
          appointments: false,
        },
      };
      const newOrg = orgRepository.create(newOrgData as any);
      organization = await orgRepository.save(newOrg as any);
      if (organization) {
        console.log('Organization created:', (organization as any).id);
      }
    } else {
      console.log('Organization already exists.');
    }

    if (!organization) {
      throw new Error('Failed to create or find organization');
    }

    // 2. Create Admin User
    const userRepository = AppDataSource.getRepository(User);
    const adminEmail = 'admin@example.com';
    const admin = await userRepository.findOne({
      where: { email: adminEmail } as any,
    });

    if (!admin) {
      console.log('Creating admin user...');
      const passwordHash = await bcrypt.hash('password123', 10);
      const userData = {
        name: 'Admin User',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        organizationId: (organization as any).id,
        isActive: true,
      };
      const newUser = userRepository.create(userData as any);
      await userRepository.save(newUser as any);
      console.log('Admin user created:', adminEmail);
    } else {
      console.log('Admin user already exists.');
    }

    // 3. Create Sample Products
    const productRepository = AppDataSource.getRepository(Product);
    const productCount = await productRepository.count({
      where: { organizationId: organization.id } as any,
    });

    if (productCount === 0) {
      console.log('Seeding sample products...');
      const products = [
        {
          name: 'Espresso',
          price: 2.5,
          category: 'Coffee',
          stock: 100,
          organizationId: organization.id,
          image:
            'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400&h=400&fit=crop',
        },
        {
          name: 'Cappuccino',
          price: 3.5,
          category: 'Coffee',
          stock: 100,
          organizationId: organization.id,
          image:
            'https://images.unsplash.com/photo-1534706936160-d5ee67737049?w=400&h=400&fit=crop',
        },
        {
          name: 'Latte',
          price: 4.0,
          category: 'Coffee',
          stock: 100,
          organizationId: organization.id,
          image:
            'https://images.unsplash.com/photo-1536939459926-301728217827?w=400&h=400&fit=crop',
        },
        {
          name: 'Green Tea',
          price: 3.0,
          category: 'Tea',
          stock: 100,
          organizationId: organization.id,
          image:
            'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=400&fit=crop',
        },
        {
          name: 'Croissant',
          price: 3.25,
          category: 'Pastries',
          stock: 100,
          organizationId: organization.id,
          image:
            'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        },
        {
          name: 'Club Sandwich',
          price: 8.5,
          category: 'Sandwiches',
          stock: 100,
          organizationId: organization.id,
          image:
            'https://images.unsplash.com/photo-1567234665766-cd1247ab4443?w=400&h=400&fit=crop',
        },
      ];

      for (const p of products) {
        const product = productRepository.create(p as any);
        await productRepository.save(product);
      }
      console.log('Sample products seeded.');
    } else {
      console.log('Products already exist.');
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seed();
