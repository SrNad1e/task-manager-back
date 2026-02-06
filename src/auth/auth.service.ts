import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const payload = { sub: (user as any)._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    const valid = await this.usersService.validatePassword(dto.password, (user as any).password);
    if (!valid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const payload = { sub: (user as any)._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    // sanitize user (usersService.findByEmail returns full user with password)
    const safeUser = await this.usersService.findById((user as any)._id);
    return { accessToken, user: safeUser };
  }
}
