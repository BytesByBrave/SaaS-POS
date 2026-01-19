import { IsString, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Espresso', description: 'The name of the product' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Delicious dark roast', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 2.50 })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ example: 'SKU123', required: false })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiProperty({ example: '123456789', required: false })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiProperty({ example: 100 })
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ example: 'Coffee' })
    @IsString()
    category: string;

    @ApiProperty({ example: 'http://example.com/image.png', required: false })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiProperty({ example: 'bg-amber-100', required: false })
    @IsOptional()
    @IsString()
    color?: string;
}
