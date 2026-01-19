import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ default: 'retail' })
    type: 'retail' | 'restaurant' | 'service';

    @Column({ type: 'jsonb', nullable: true })
    settings: any;

    @Column({ type: 'jsonb', default: { retail: true, restaurant: false, service: false, inventory: true, tables: false } })
    features: {
        retail: boolean;
        restaurant: boolean;
        service: boolean;
        inventory: boolean;
        tables: boolean;
        appointments: boolean;
    };

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
