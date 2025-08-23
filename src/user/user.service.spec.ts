import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  const mockUserRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOneById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    // ✅ Changed to match method name
    it('should create and return a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'test@email.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock both create and save methods
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should reject email without @ symbol', async () => {
      const invalidDto: CreateUserDto = {
        username: 'newuser',
        email: 'invalid-email.com', // ❌ Missing @
        password: 'password123',
      };

      // The service should throw before calling repository
      mockUserRepository.create.mockImplementation();
      mockUserRepository.save.mockImplementation();

      await expect(service.create(invalidDto)).rejects.toThrow();

      // Verify repository methods were NOT called
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
