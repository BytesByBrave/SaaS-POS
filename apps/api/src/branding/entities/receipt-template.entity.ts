import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('receipt_templates')
export class ReceiptTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column()
  name: string;

  @Column({ default: 'thermal' })
  type: 'thermal' | 'a4' | 'letter' | 'label';

  @Column({ default: true })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  // Template Content (HTML/Handlebars template)
  @Column({ type: 'text' })
  headerTemplate: string;

  @Column({ type: 'text' })
  bodyTemplate: string;

  @Column({ type: 'text' })
  footerTemplate: string;

  // Styling
  @Column({ type: 'text', nullable: true })
  customCss: string;

  // Paper Settings
  @Column({ default: 80 })
  paperWidth: number; // mm

  @Column({ nullable: true })
  paperHeight: number; // null for continuous

  @Column({ default: 5 })
  marginTop: number;

  @Column({ default: 5 })
  marginBottom: number;

  @Column({ default: 5 })
  marginLeft: number;

  @Column({ default: 5 })
  marginRight: number;

  // Display Options
  @Column({ type: 'jsonb', default: {} })
  options: {
    showLogo?: boolean;
    showBusinessName?: boolean;
    showAddress?: boolean;
    showPhone?: boolean;
    showOrderNumber?: boolean;
    showDate?: boolean;
    showTime?: boolean;
    showCashier?: boolean;
    showItemSku?: boolean;
    showItemNotes?: boolean;
    showTax?: boolean;
    showSubtotal?: boolean;
    showDiscount?: boolean;
    showPaymentMethod?: boolean;
    showBarcode?: boolean;
    showQrCode?: boolean;
    barcodeType?: 'code128' | 'qr';
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
