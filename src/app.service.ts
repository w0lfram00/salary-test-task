import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { Worker, WorkType } from './generated/prisma/client.js';
import { CreateWorkerDto } from './dto/create-worker.dto.js';
import { EditWorkerDto } from './dto/edit-worker.dto.js';
import {
  EMPLOYEE_BASE_SALARY,
  MANAGER_BASE_SALARY,
  MS_IN_YEAR,
  SALES_BASE_SALARY,
} from './constants/index.js';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getWorkerById(id: string): Promise<Worker | null> {
    return this.prisma.worker.findUnique({ where: { id } });
  }

  async getWorkers(): Promise<Worker[]> {
    return this.prisma.worker.findMany();
  }

  async addWorker({ name, type, startDate }: CreateWorkerDto): Promise<Worker> {
    return this.prisma.worker.create({ data: { name, type, startDate } });
  }

  async editWorker(
    id: string,
    { name, type, startDate, managerId }: EditWorkerDto,
  ): Promise<Worker> {
    return this.prisma.worker.update({
      where: { id },
      data: { name, type, startDate, managerId },
    });
  }

  async editManyWorkers(
    ids: string[],
    { type, startDate, managerId }: { type?: WorkType; startDate?: Date; managerId?: string },
  ): Promise<number> {
    const response = await this.prisma.worker.updateMany({
      where: { id: { in: ids } },
      data: { type, startDate, managerId },
    });

    return response.count;
  }

  async deleteWorker(id: string): Promise<void> {
    this.prisma.worker.delete({ where: { id } });
  }

  async deleteAllWorkers(): Promise<void> {
    await this.prisma.worker.updateMany({
      data: { managerId: null },
    });
    await this.prisma.worker.deleteMany({});
  }

  async getSubs(id: string): Promise<Worker[] | undefined> {
    return (await this.prisma.worker.findUnique({ where: { id }, include: { subordinates: true } }))
      ?.subordinates;
  }

  async flipManager(sub: Worker, managerId: string) {
    if (sub?.managerId == managerId) return this.editWorker(sub.id, { managerId: null });
    else return this.editWorker(sub.id, { managerId });
  }

  async getSalary(id: string): Promise<number> {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    if (!worker) return 0;
    const yearsInCompany = Math.floor((Date.now() - worker.startDate.getTime()) / MS_IN_YEAR);

    if (worker.type === 'EMPLOYEE')
      return EMPLOYEE_BASE_SALARY * (1 + Math.min(yearsInCompany * 0.03, 0.3));

    if (worker.type === 'MANAGER') {
      const subs = await this.prisma.worker.findMany({ where: { managerId: worker.id } });
      return (
        MANAGER_BASE_SALARY * (1 + Math.min(yearsInCompany * 0.05, 0.4)) +
        (await subs.reduce(
          async (acc, sub) => (await acc) + (await this.getSalary(sub.id)),
          Promise.resolve(0),
        )) *
          0.005
      );
    }

    if (worker.type === 'SALES') {
      const subs = await this.prisma.worker.findMany({
        where: { managerId: worker.id },
        include: { subordinates: true },
      });

      let totalSalary = 0;
      let i = 0;

      // The loop will dynamically continue as long as 'i' is less than the growing subs.length
      while (i < subs.length) {
        const sub = subs[i];

        const subsubs = await this.prisma.worker.findMany({
          where: { managerId: sub.id },
          include: { subordinates: true },
        });

        subs.push(...subsubs);
        totalSalary += await this.getSalary(sub.id);
        i++;
      }

      return SALES_BASE_SALARY * (1 + Math.min(yearsInCompany * 0.01, 0.35)) + totalSalary * 0.003;
    }
    return 0;
  }
}
