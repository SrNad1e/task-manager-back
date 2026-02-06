import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/task.schema';
import { Model } from 'mongoose';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from 'src/tasks/dto/update-task.dto';
import { isValidMongoId } from 'src/common/utils/mongo.util';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) { }

    async findAll(userId?: string) {
        this.logger.log('Obteniendo todas las tareas');
        const filter = userId ? { user: userId } : {};
        const tasks = await this.taskModel.find(filter).exec();
        this.logger.debug(`Se encontraron ${tasks.length} tareas`);
        return tasks;
    }

    async create(createTask: CreateTaskDto, userId?: string) {
        // Verificar duplicado por título (schema tiene indice compuesto user+title)
        if (createTask.title) {
            const filter: any = { title: createTask.title };
            if (userId) filter.user = userId;
            const existing = await this.taskModel.findOne(filter).exec();
            if (existing) {
                this.logger.warn(`Intento de crear tarea duplicada: ${createTask.title}`);
                throw new ConflictException('La tarea ya existe');
            }
        }

        // Adjuntar el owner si viene
        const payload: any = { ...createTask };
        if (userId) payload.user = userId;

        const newTask = new this.taskModel(payload);
        const saved = await newTask.save();
        this.logger.log(`Tarea creada con ID: ${saved._id}`);
        return saved;
    }

    async findOne(id: string, userId?: string) {
        if (!isValidMongoId(id)) {
            this.logger.warn(`ID de tarea inválido en findOne: ${id}`);
            throw new BadRequestException('ID de tarea inválido');
        }
        const task = await this.taskModel.findById(id).exec();
        if (!task) {
            this.logger.warn(`Tarea no encontrada con ID: ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        // Si se pasó userId, validar que la tarea pertenezca al usuario
        if (userId && task.user && task.user.toString() !== userId) {
            this.logger.warn(`Acceso no autorizado a tarea ${id} por usuario ${userId}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        this.logger.debug(`Tarea encontrada: ${task.title}`);
        return task;
    }

    async delete(id: string, userId?: string) {
        if (!isValidMongoId(id)) {
            this.logger.warn(`ID de tarea inválido en delete: ${id}`);
            throw new BadRequestException('ID de tarea inválido');
        }
        const task = await this.taskModel.findById(id).exec();
        if (!task) {
            this.logger.warn(`Intento de eliminar tarea no encontrada: ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        if (userId && task.user && task.user.toString() !== userId) {
            this.logger.warn(`Usuario ${userId} no autorizado para eliminar tarea ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        const deleted = await this.taskModel.findByIdAndDelete(id).exec();
        if (deleted)
            this.logger.log(`Tarea eliminada: ${deleted._id}`);
        return deleted;
    }

    async update(id: string, updateTask: UpdateTaskDto, userId?: string) {
        if (!isValidMongoId(id)) {
            this.logger.warn(`ID de tarea inválido en update: ${id}`);
            throw new BadRequestException('ID de tarea inválido');
        }

        // Si se actualiza el título, verificar duplicado
        if (updateTask.title) {
            const filter: any = { title: updateTask.title, _id: { $ne: id } };
            if (userId) filter.user = userId;
            const existing = await this.taskModel.findOne(filter).exec();
            if (existing) {
                this.logger.warn(`Intento de actualizar a título duplicado: ${updateTask.title}`);
                throw new ConflictException('La tarea ya existe');
            }
        }

        const task = await this.taskModel.findById(id).exec();
        if (!task) {
            this.logger.warn(`Intento de actualizar tarea no encontrada: ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        if (userId && task.user && task.user.toString() !== userId) {
            this.logger.warn(`Usuario ${userId} no autorizado para actualizar tarea ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        const updated = await this.taskModel.findByIdAndUpdate(id, updateTask, { new: true }).exec();
        if (!updated) {
            this.logger.warn(`Intento de actualizar tarea no encontrada despues de update: ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        this.logger.log(`Tarea actualizada: ${updated._id}`);
        return updated;
    }

}

