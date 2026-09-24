import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);

    await appController.clearWorkerDb();
  });

  describe('Worker Lifecycle & Roles', () => {
    it('should create an employee by default with no manager', async () => {
      const worker = await appController.addWorker({ name: 'Test' });

      expect(worker).toMatchObject({ type: 'EMPLOYEE', managerId: null });
    });

    it('should allow modifying an employee into a manager', async () => {
      const worker = await appController.addWorker({ name: 'Test' });

      const updatedWorker = await appController.editWorkerInfo(worker.id, {
        type: 'MANAGER',
        startDate: new Date('2016-09-01'),
      });

      expect(updatedWorker).toMatchObject({
        type: 'MANAGER',
        name: 'Test',
      });
    });
  });

  describe('Subordinate Management', () => {
    it('should dynamically link and unlink subordinates', async () => {
      const manager = await appController.addWorker({ name: 'Manager', type: 'MANAGER' });
      const sub = await appController.addWorker({ name: 'Subordinate' });

      // Add subordinate
      await appController.addRemoveSubordinate(manager.id, { id: sub.id });
      let subs = await appController.getSubs(manager.id);
      expect(subs?.length).toBe(1);

      // Remove subordinate
      await appController.addRemoveSubordinate(manager.id, { id: sub.id });
      subs = await appController.getSubs(manager.id);
      expect(subs?.length).toBe(0);
    });
  });

  describe('Salary Calculations', () => {
    it('should calculate correct salary for an employee based on tenure', async () => {
      // 6 years of experience
      const sub = await appController.addWorker({
        name: '6-Year Employee',
        startDate: new Date('2020-09-20'),
      });

      // expected salary: 1000 * 0.03 * 6 = 1180
      const salary = await appController.getSalary(sub.id);
      expect(salary).toBe(1180);
    });

    it('should calculate manager salary with experience and multiple level-1 subordinates', async () => {
      const manager = await appController.addWorker({
        name: 'Manager',
        type: 'MANAGER',
        startDate: new Date('2016-09-01'),
      });

      // Add 4 surviving employees (each with 1180 salary based on 2020 start date)
      for (let i = 0; i < 4; i++) {
        const sub = await appController.addWorker({
          name: `Emp${i}`,
          startDate: new Date('2020-09-20'),
        });
        await appController.addRemoveSubordinate(manager.id, { id: sub.id });
      }

      // 10 year maxed out manager (40%) with 4 emps (1180 salary each)
      // 2000 * 1.4 + 1180 * 4 * 0.005 = 2823.6
      const managerSalary = await appController.getSalary(manager.id);
      expect(managerSalary).toBe(2823.6);
    });

    it('should calculate complex recursive sales salary covering multiple tiers of subordinates', async () => {
      // Top Level Sales
      const topSales = await appController.addWorker({ name: 'Top Sales', type: 'SALES' });

      // Branch 1: Manager with 4 employees (pre-calculated total salary footprint)
      const manager = await appController.addWorker({
        name: 'Branch Manager',
        type: 'MANAGER',
        startDate: new Date('2016-09-01'),
      });
      for (let i = 0; i < 4; i++) {
        const sub = await appController.addWorker({
          name: `ManagerSub${i}`,
          startDate: new Date('2020-09-20'),
        });
        await appController.addRemoveSubordinate(manager.id, { id: sub.id });
      }
      await appController.addRemoveSubordinate(topSales.id, { id: manager.id });

      // Branch 2: Sub-Sales worker with 5 standard employees (1000 salary each)
      const subSales = await appController.addWorker({ name: 'Sub Sales', type: 'SALES' });
      for (let i = 0; i < 5; i++) {
        const sub = await appController.addWorker({ name: `SalesSub${i}` });
        await appController.addRemoveSubordinate(subSales.id, { id: sub.id });
      }
      await appController.addRemoveSubordinate(topSales.id, { id: subSales.id });

      // Total sub tree salary footprint = 15558.6
      // Final top sales salary = 3000 + 15558.6 * 0.003 = 3046.6758
      const topSalesSalary = await appController.getSalary(topSales.id);
      expect(topSalesSalary).toBe(3046.6758);

      //Sum of salaries of all workers created this test
      expect(await appController.getSalariesSum()).toBe(18605.2758);
    });
  });
});
