import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) { }

    async create(userData: any, organizationId: string): Promise<User> {
        const { password, ...rest } = userData;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = this.usersRepository.create({
            ...rest,
            passwordHash,
            organizationId,
        } as Partial<User>);
        return this.usersRepository.save(user);
    }

    async findAll(organizationId: string): Promise<User[]> {
        return this.usersRepository.find({ where: { organizationId } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }
}
