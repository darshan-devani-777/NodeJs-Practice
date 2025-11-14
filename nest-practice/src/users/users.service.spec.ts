import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('UsersService', () => {
  let service: UsersService;

  const createMockQuery = (result: any) => ({
    setOptions: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  });

  const mockUserInstance = {
    save: jest.fn().mockResolvedValue({}),
    toObject: jest.fn().mockReturnValue({}),
  };

  const mockUserModel = jest
    .fn()
    .mockImplementation(() => mockUserInstance) as any;
  mockUserModel.findOne = jest.fn().mockReturnValue(createMockQuery(null));
  mockUserModel.find = jest.fn().mockReturnValue(createMockQuery([]));
  mockUserModel.findById = jest.fn().mockReturnValue(createMockQuery(null));
  mockUserModel.findByIdAndUpdate = jest
    .fn()
    .mockReturnValue(createMockQuery(null));
  mockUserModel.findByIdAndDelete = jest
    .fn()
    .mockReturnValue(createMockQuery(null));

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  } as unknown as EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
