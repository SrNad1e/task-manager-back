import { Controller, Delete, Param, Post, Put, Get, Body, HttpException, HttpStatus, BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from 'src/tasks/dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    private readonly logger = new Logger(TasksController.name);

    constructor(private tasksService: TasksService) { }

    @Get()
    async findAll(@CurrentUser() user: User) {
        try {
            this.logger.log('Obteniendo todas las tareas');
            const tasks = await this.tasksService.findAll(user?._id?.toString());
            this.logger.debug(`Se encontraron ${tasks.length} tareas`);
            return tasks;
        } catch (error) {
            this.logger.error(`Error al obtener tareas: ${error.message}`, error.stack);
            throw new HttpException(
                'Error al obtener las tareas',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        try {
            this.logger.log(`Buscando tarea con ID: ${id}`);
            const task = await this.tasksService.findOne(id, user?._id?.toString());

            if (!task) {
                this.logger.warn(`Tarea no encontrada con ID: ${id}`);
                throw new HttpException(
                    'Tarea no encontrada',
                    HttpStatus.NOT_FOUND,
                );
            }

            this.logger.debug(`Tarea encontrada: ${task.title}`);
            return task;
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error al obtener tarea: ${error.message}`, error.stack);
            throw new HttpException(
                'Error al obtener la tarea',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post()
    async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
        try {
            this.logger.log(`Creando nueva tarea: ${createTaskDto.title}`);
            // Validar que el DTO no esté vacío
            if (!createTaskDto || Object.keys(createTaskDto).length === 0) {
                throw new BadRequestException('El cuerpo de la solicitud no puede estar vacío');
            }

            const newTask = await this.tasksService.create(createTaskDto, user?._id?.toString());
            this.logger.log(`Tarea creada exitosamente con ID: ${newTask._id}`);
            return newTask;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            if (error.code === 11000) {
                this.logger.warn(`Intento de crear tarea duplicada: ${createTaskDto.title}`);
                // Error de duplicado en MongoDB
                throw new HttpException(
                    'La tarea ya existe',
                    HttpStatus.CONFLICT,
                );
            }
            this.logger.error(`Error al crear tarea: ${error.message}`, error.stack);
            throw new HttpException(
                'Error al crear la tarea',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser() user: User) {
        try {
            this.logger.log(`Eliminando tarea con ID: ${id}`);
            const deletedTask = await this.tasksService.delete(id, user?._id?.toString());

            if (!deletedTask) {
                this.logger.warn(`Intento de eliminar tarea no encontrada: ${id}`);
                throw new HttpException(
                    'Tarea no encontrada',
                    HttpStatus.NOT_FOUND,
                );
            }

            this.logger.log(`Tarea eliminada exitosamente: ${deletedTask.title}`);
            return {
                message: 'Tarea eliminada correctamente',
                data: deletedTask,
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error al eliminar tarea: ${error.message}`, error.stack);
            throw new HttpException(
                'Error al eliminar la tarea',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() user: User) {
        try {
            this.logger.log(`Actualizando tarea con ID: ${id}`);
            // Validar que el DTO no esté vacío
            if (!updateTaskDto || Object.keys(updateTaskDto).length === 0) {
                throw new BadRequestException('El cuerpo de la solicitud no puede estar vacío');
            }

            const updatedTask = await this.tasksService.update(id, updateTaskDto, user?._id?.toString());

            if (!updatedTask) {
                this.logger.warn(`Intento de actualizar tarea no encontrada: ${id}`);
                throw new HttpException(
                    'Tarea no encontrada',
                    HttpStatus.NOT_FOUND,
                );
            }

            this.logger.log(`Tarea actualizada exitosamente: ${updatedTask.title}`);
            return {
                message: 'Tarea actualizada correctamente',
                data: updatedTask,
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof HttpException) {
                throw error;
            }
            if (error.code === 11000) {
                this.logger.warn(`Intento de actualizar a título duplicado: ${updateTaskDto.title}`);
                throw new HttpException(
                    'La tarea ya existe',
                    HttpStatus.CONFLICT,
                );
            }
            this.logger.error(`Error al actualizar tarea: ${error.message}`, error.stack);
            throw new HttpException(
                'Error al actualizar la tarea',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

}
