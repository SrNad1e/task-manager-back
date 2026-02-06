import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Crear un nuevo usuario con contraseña hasheada
   * @param dto - Registro con email y password
   * @returns Usuario creado (sin contraseña)
   */
  async create(dto: RegisterDto): Promise<User> {
    const { email, password } = dto;
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(`Intento de crear usuario con email duplicado: ${email}`);
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
    });

    const createdUser = await newUser.save();
    this.logger.log(`Usuario creado: ${email}`);

    return this.sanitizeUser(createdUser);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel.findOne({ email: dto.email }).exec();
      if (existing) {
        this.logger.warn(`Intento de actualizar usuario a email duplicado: ${dto.email}`);
        throw new ConflictException('El email ya está registrado');
      }
    }

    const updatePayload: any = {};
    if (dto.email) updatePayload.email = dto.email;
    if (dto.password) updatePayload.password = await bcrypt.hash(dto.password, 10);

    const updated = await this.userModel.findByIdAndUpdate(id, updatePayload, { new: true }).exec();
    return this.sanitizeUser(updated);
  }

  /**
   * Buscar usuario por email (para login)
   * @param email - Email a buscar
   * @returns Usuario completo (incluyendo contraseña para comparar)
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    
    if (!user) {
      this.logger.warn(`Usuario no encontrado: ${email}`);
      throw new NotFoundException('Email o contraseña incorrectos');
    }

    return user;
  }

  /**
   * Buscar usuario por ID
   * @param id - ID del usuario
   * @returns Usuario sin contraseña
   */
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Validar que la contraseña coincida con el hash
   * @param plainPassword - Contraseña en texto plano
   * @param hashedPassword - Hash almacenado en BD
   * @returns true si coinciden
   */
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Eliminar campos sensibles del usuario
   * @param user - Usuario completo
   * @returns Usuario sin datos sensibles
   */
  private sanitizeUser(user: any): User {
    const sanitized = user.toObject?.() || user;
    delete sanitized.password;
    delete sanitized.refreshToken;
    return sanitized;
  }
}
