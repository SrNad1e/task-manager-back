import { Controller, Get, Put, Body, UseGuards, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UnauthorizedException } from '@nestjs/common';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    private readonly logger = new Logger(UsersController.name);
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@CurrentUser() user: User) {
        if (!user || !user._id) {
            throw new UnauthorizedException('Usuario no válido');
        }
        this.logger.log(`Obteniendo perfil de usuario: ${user._id}`);
        return this.usersService.findById(user._id.toString());
    }

    @Put('me')
    async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
        if (!user || !user._id) {
            throw new UnauthorizedException('Usuario no válido');
        }
        this.logger.log(`Actualizando perfil de usuario: ${user._id}`);
        const updated = await this.usersService.update(user._id.toString(), dto);
        return {
            message: 'Perfil actualizado correctamente',
            data: updated,
        };
    }
}
