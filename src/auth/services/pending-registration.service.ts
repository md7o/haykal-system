import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingRegistration } from 'src/user/entities/pending_registrations.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class PendingRegistrationService {
  constructor(
    @InjectRepository(PendingRegistration)
    private repo: Repository<PendingRegistration>,
  ) {}

  async createPendingRegistration(input: {
    email: string;
    username: string;
    password: string;
    code: string;
    expiresAt: Date;
  }) {
    const pending = this.repo.create(input);
    return this.repo.save(pending);
  }

  async findValidCode(email: string, code: string) {
    return this.repo.findOne({
      where: {
        email,
        code,
        expiresAt: MoreThan(new Date()), // not expired
      },
    });
  }

  async deletePending(id: number) {
    await this.repo.delete(id);
  }
}
