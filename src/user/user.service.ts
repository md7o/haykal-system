import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersReposetory: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Basic email validation, keep simple per unit test expectation
    const email = createUserDto.email?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Invalid email');
    }
    const user = this.usersReposetory.create(createUserDto);
    return this.usersReposetory.save(user);
  }

  async save(user: User): Promise<User> {
    return await this.usersReposetory.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersReposetory.find();
  }

  async findOneById(id: string): Promise<User | null> {
    return await this.usersReposetory.findOne({ where: { id } });
  }
  async findByEmail(email: string): Promise<User | null> {
    return await this.usersReposetory.findOne({ where: { email } });
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<User | null> {
    return await this.usersReposetory.findOne({
      where: [{ username }, { email }],
    });
  }

  async update(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    return this.usersReposetory.save(user);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersReposetory.remove(user);
    return user;
  }
}
