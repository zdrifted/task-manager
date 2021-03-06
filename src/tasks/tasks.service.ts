import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';

// The service handles business logic

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository,
    ) { }

    async getTasks(
        filterDto: GetTasksFilterDto,
        user: User,
    ): Promise<Task[]> {
        return this.taskRepository.getTasks(filterDto, user);
    }

    async getTaskById(id: number, user: User): Promise<Task> {
        // we provide where clauses to find a task only if it belongs to the user who sent the request AND if the task id provided is also found
        const found = await this.taskRepository.findOne({ where: { id, userId: user.id } });

        if (!found) {
            // this exception will be handled by NestJS behind the scene
            throw new NotFoundException();
        }

        return found;
    }

    async deleteTask(id: number): Promise<void> {
        const result = await this.taskRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException();
        }
    }

    async updateTaskStatus(id: number, user: User, status: TaskStatus): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await task.save();
        return task;
    }

    async createTask(createTaskDto: CreateTaskDto,
        user: User,
    ): Promise<Task> {
        return this.taskRepository.createTask(createTaskDto, user);
    }
}
