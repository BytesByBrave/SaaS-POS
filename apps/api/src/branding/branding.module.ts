import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandingService } from './branding.service';
import { BrandingController } from './branding.controller';
import { OrganizationBranding } from './entities/organization-branding.entity';
import { ReceiptTemplate } from './entities/receipt-template.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OrganizationBranding, ReceiptTemplate])],
    providers: [BrandingService],
    controllers: [BrandingController],
    exports: [BrandingService],
})
export class BrandingModule { }
