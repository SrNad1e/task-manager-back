import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/task.schema';
import { Model } from 'mongoose';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) { }

    async findAll() {
        this.logger.log('Obteniendo todas las tareas');
        const tasks = await this.taskModel.find().exec();
        this.logger.debug(`Se encontraron ${tasks.length} tareas`);
        return tasks;
    }

    async create(createTask: CreateTaskDto) {
        // Verificar duplicado por título (schema tiene unique: true)
        if (createTask.title) {
            const existing = await this.taskModel.findOne({ title: createTask.title }).exec();
            if (existing) {
                this.logger.warn(`Intento de crear tarea duplicada: ${createTask.title}`);
                throw new ConflictException('La tarea ya existe');
            }
        }

        const newTask = new this.taskModel(createTask);
        const saved = await newTask.save();
        this.logger.log(`Tarea creada con ID: ${saved._id}`);
        return saved;
    }

    async findOne(id: string) {
        if (!this.isValidMongoId(id)) {
            this.logger.warn(`ID de tarea inválido en findOne: ${id}`);
            throw new BadRequestException('ID de tarea inválido');
        }

        const task = await this.taskModel.findById(id).exec();
        if (!task) {
            this.logger.warn(`Tarea no encontrada con ID: ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        this.logger.debug(`Tarea encontrada: ${task.title}`);
        return task;
    }

    async delete(id: string) {
        if (!this.isValidMongoId(id)) {
            this.logger.warn(`ID de tarea inválido en delete: ${id}`);
            throw new BadRequestException('ID de tarea inválido');
        }

        const deleted = await this.taskModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            this.logger.warn(`Intento de eliminar tarea no encontrada: ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        this.logger.log(`Tarea eliminada: ${deleted._id}`);
        return deleted;
    }

    async update(id: string, updateTask: UpdateTaskDto) {
        if (!this.isValidMongoId(id)) {
            this.logger.warn(`ID de tarea inválido en update: ${id}`);
            throw new BadRequestException('ID de tarea inválido');
        }

        // Si se actualiza el título, verificar duplicado
        if (updateTask.title) {
            const existing = await this.taskModel.findOne({ title: updateTask.title, _id: { $ne: id } }).exec();
            if (existing) {
                this.logger.warn(`Intento de actualizar a título duplicado: ${updateTask.title}`);
                throw new ConflictException('La tarea ya existe');
            }
        }

        const updated = await this.taskModel.findByIdAndUpdate(id, updateTask, { new: true }).exec();
        if (!updated) {
            this.logger.warn(`Intento de actualizar tarea no encontrada: ${id}`);
            throw new NotFoundException('Tarea no encontrada');
        }

        this.logger.log(`Tarea actualizada: ${updated._id}`);
        return updated;
    }

    // Utilidad para validar ObjectId
    private isValidMongoId(id: string): boolean {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }

}

