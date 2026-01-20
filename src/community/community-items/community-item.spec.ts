import { CommunityItemsService } from './community-items.service';
import { CreateCommunityItemsDto } from './dto/create-community-items.dto';
import { CommunityItemType } from '../../common/enums/community-item-type';
import { MembershipType } from '../../common/enums/membership-type';

describe('CommunityItemsService', () => {
  let service: CommunityItemsService;

  const mockRepository = {
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(async (item) => ({ id: 'generated-id', ...item })),
    createQueryBuilder: jest.fn(),
  };

  const mockLikeRepository = {
    find: jest.fn(),
  } as any;

  const mockMembershipService = {
    findAllByUser: jest.fn().mockResolvedValue([{ id: 'membership-1', role: MembershipType.Owner }]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // construct directly to avoid Nest DI in unit tests
    service = new CommunityItemsService(mockRepository as any, mockLikeRepository as any, mockMembershipService as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a POST item preserving postImage and empty metadata', async () => {
    const dto: Partial<CreateCommunityItemsDto> & any = {
      title: 'A post',
      content: 'post content',
      metadata: {},
      type: CommunityItemType.POST,
      postImage: 'https://img.example/post.jpg',
    };

    const created = await service.createCommunityItem('user-1', dto as CreateCommunityItemsDto);

    expect(mockMembershipService.findAllByUser).toHaveBeenCalledWith('user-1');
    expect(mockRepository.create).toHaveBeenCalledWith({ ...dto, membershipId: 'membership-1' });
    expect(created.type).toBe(CommunityItemType.POST);
    expect(created.postImage).toBe('https://img.example/post.jpg');
    expect(created.metadata).toEqual({});
  });

  it('creates an EVENT item preserving event metadata and no postImage', async () => {
    const eventDate = new Date('2026-02-14T10:00:00Z');
    const dto: Partial<CreateCommunityItemsDto> & any = {
      title: 'An event',
      content: 'event content',
      metadata: { eventDate: eventDate.toISOString(), eventLocation: 'Conference Hall' },
      type: CommunityItemType.EVENT,
    };

    const created = await service.createCommunityItem('user-2', dto as CreateCommunityItemsDto);

    expect(mockMembershipService.findAllByUser).toHaveBeenCalledWith('user-2');
    expect(mockRepository.create).toHaveBeenCalledWith({ ...dto, membershipId: 'membership-1' });
    expect(created.type).toBe(CommunityItemType.EVENT);
    expect(created.postImage).toBeUndefined();
    expect(created.metadata.eventDate).toBe(eventDate.toISOString());
    expect(created.metadata.eventLocation).toBe('Conference Hall');
  });

  it('filters community items by type', async () => {
    const post1 = { id: 'item-1', type: CommunityItemType.POST, membershipId: 'membership-1', createdAt: new Date() };
    const event1 = { id: 'item-2', type: CommunityItemType.EVENT, membershipId: 'membership-1', createdAt: new Date() };
    const post2 = { id: 'item-3', type: CommunityItemType.POST, membershipId: 'membership-1', createdAt: new Date() };

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([post1, post2]),
    };

    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockLikeRepository.find.mockResolvedValue([]);

    const result = await service.findAllCommunityItems('user-1', CommunityItemType.POST);

    expect(mockQueryBuilder.where).toHaveBeenCalled();
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('communityItem.type = :type', {
      type: CommunityItemType.POST,
    });
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe(CommunityItemType.POST);
    expect(result[1].type).toBe(CommunityItemType.POST);
  });

  it('returns all types when no type filter provided', async () => {
    const allItems = [
      { id: 'item-1', type: CommunityItemType.POST, membershipId: 'membership-1', createdAt: new Date() },
      { id: 'item-2', type: CommunityItemType.EVENT, membershipId: 'membership-1', createdAt: new Date() },
      { id: 'item-3', type: CommunityItemType.RESOURCE, membershipId: 'membership-1', createdAt: new Date() },
    ];

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(allItems),
    };

    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockLikeRepository.find.mockResolvedValue([]);

    const result = await service.findAllCommunityItems('user-1');

    expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    expect(result).toHaveLength(3);
  });

  it('filters items by membership and type', async () => {
    const items = [
      { id: 'item-1', type: CommunityItemType.EVENT, membershipId: 'membership-1', createdAt: new Date() },
      { id: 'item-2', type: CommunityItemType.EVENT, membershipId: 'membership-1', createdAt: new Date() },
    ];

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(items),
    };

    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockLikeRepository.find.mockResolvedValue([]);

    const result = await service.findByMembershipId('membership-1', CommunityItemType.EVENT);

    expect(mockQueryBuilder.where).toHaveBeenCalledWith('communityItem.membershipId = :membershipId', {
      membershipId: 'membership-1',
    });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('communityItem.type = :type', {
      type: CommunityItemType.EVENT,
    });
    expect(result).toHaveLength(2);
  });
});
