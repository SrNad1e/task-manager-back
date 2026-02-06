import { IsOptional, IsString, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsString({ message: 'El título debe ser texto' })
    @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El título no puede exceder 100 caracteres' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser texto' })
    @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
    description?: string;

    @IsOptional()
    @IsBoolean({ message: 'El estado debe ser true o false' })
    completed?: boolean;
}