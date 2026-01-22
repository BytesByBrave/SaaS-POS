import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OrganizationsService } from '../organizations/organizations.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let organizationsService: jest.Mocked<OrganizationsService>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed_password',
    role: 'staff' as const,
    organizationId: 'org-uuid-1',
    isActive: true,
  };

  const mockOrganization = {
    id: 'org-uuid-1',
    name: 'Test Org',
    slug: 'test-org',
    features: { retail: true, restaurant: false, service: false, inventory: true, tables: false },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    organizationsService = module.get(OrganizationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      organizationsService.findOne.mockResolvedValue(mockOrganization as any);
      jwtService.sign.mockReturnValue('jwt_token_here');

      const user = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'staff',
        organizationId: 'org-uuid-1',
      };

      const result = await service.login(user);

      expect(organizationsService.findOne).toHaveBeenCalledWith('org-uuid-1');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        organizationId: user.organizationId,
        role: user.role,
        features: mockOrganization.features,
      });
      expect(result.access_token).toBe('jwt_token_here');
      expect(result.user.id).toBe('user-uuid-1');
    });

    it('should return empty features if organization not found', async () => {
      organizationsService.findOne.mockResolvedValue(null);
      jwtService.sign.mockReturnValue('jwt_token_here');

      const user = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'staff',
        organizationId: 'org-uuid-1',
      };

      const result = await service.login(user);

      expect(result.user.features).toEqual({});
    });
  });
});
