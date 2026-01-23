import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('organization_branding')
export class OrganizationBranding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', unique: true })
  organizationId: string;

  // Basic Branding
  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ nullable: true })
  tagline: string;

  // Color Scheme
  @Column({ default: '#4F46E5' })
  primaryColor: string;

  @Column({ default: '#10B981' })
  secondaryColor: string;

  @Column({ default: '#1F2937' })
  accentColor: string;

  @Column({ default: '#F3F4F6' })
  backgroundColor: string;

  @Column({ default: '#111827' })
  textColor: string;

  @Column({ default: '#DC2626' })
  errorColor: string;

  @Column({ default: '#059669' })
  successColor: string;

  // Typography
  @Column({ default: 'Inter' })
  fontFamily: string;

  @Column({
    default:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  })
  fontUrl: string;

  // Theme Mode
  @Column({ default: 'light' })
  defaultTheme: 'light' | 'dark' | 'system';

  // Custom CSS
  @Column({ type: 'text', nullable: true })
  customCss: string;

  // Contact Information (for receipts)
  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  // Social Media
  @Column({ type: 'jsonb', nullable: true })
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };

  // Receipt Footer
  @Column({ type: 'text', nullable: true })
  receiptFooter: string;

  // Additional Settings
  @Column({ type: 'jsonb', default: {} })
  settings: {
    showLogo?: boolean;
    showAddress?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showSocialLinks?: boolean;
    dateFormat?: string;
    timeFormat?: string;
    currencyPosition?: 'before' | 'after';
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
