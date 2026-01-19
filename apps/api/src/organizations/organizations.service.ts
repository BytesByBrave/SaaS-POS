import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationsRepository: Repository<Organization>,
    ) { }

    async create(orgData: any): Promise<Organization> {
        const organization = this.organizationsRepository.create(orgData as Partial<Organization>);
        return this.organizationsRepository.save(organization);
    }

    async findAll(): Promise<Organization[]> {
        return this.organizationsRepository.find();
    }

    async findOne(id: string): Promise<Organization | null> {
        return this.organizationsRepository.findOne({ where: { id } });
    }

    async findBySlug(slug: string): Promise<Organization | null> {
        return this.organizationsRepository.findOne({ where: { slug } });
    }
}
