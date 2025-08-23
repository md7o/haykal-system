import { Injectable } from '@nestjs/common';
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
    const user = this.usersReposetory.create(createUserDto);
    return this.usersReposetory.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersReposetory.find();
  }

  async findOneById(id: string): Promise<User | null> {
    return await this.usersReposetory.findOne({ where: { id } });
  }

  // update(id: number) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
