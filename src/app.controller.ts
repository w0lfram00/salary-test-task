import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service.js';
import { CreateWorkerDto } from './dto/create-worker.dto.js';
import { EditWorkerDto } from './dto/edit-worker.dto.js';
import { FlipSubordinateDto } from './dto/flipSubordinate.dto.js';
import createHttpError from 'http-errors';

@Controller('workers')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWorkers() {
    return this.appService.getWorkers();
  }

  @Get(':id')
  getWorkerById(@Param('id') id: string) {
    return this.appService.getWorkerById(id);
  }

  @Post()
  addWorker(@Body() createDto: CreateWorkerDto) {
    return this.appService.addWorker(createDto);
  }

  @Patch('/:id/info')
  editWorkerInfo(@Param('id') id: string, @Body() editDto: EditWorkerDto) {
    return this.appService.editWorker(id, editDto);
  }

  @Delete()
  clearWorkerDb() {
    return this.appService.deleteAllWorkers();
  }

  @Get(':id/subs')
  getSubs(@Param('id') id: string) {
    return this.appService.getSubs(id);
  }

  @Patch(':managerId/subordinates')
  async addRemoveSubordinate(
    @Param('managerId') managerId: string,
    @Body() { id: subId }: FlipSubordinateDto,
  ) {
    const [sub, manager] = await Promise.all([
      this.appService.getWorkerById(subId),
      this.appService.getWorkerById(managerId),
    ]);
    if (!manager) throw createHttpError(404, 'Worker not found');
    if (manager.type === 'EMPLOYEE')
      throw createHttpError(400, 'Employee can not have subordinates');
    if (!sub) throw createHttpError(404, 'Worker not found');
    return this.appService.flipManager(sub, managerId);
  }

  @Patch(':subId/manager')
  async addRemoveManager(
    @Param('subId') subId: string,
    @Body() { id: managerId }: FlipSubordinateDto,
  ) {
    const [sub, manager] = await Promise.all([
      this.appService.getWorkerById(subId),
      this.appService.getWorkerById(managerId),
    ]);
    if (!manager) throw createHttpError(404, 'Worker not found');
    if (manager.type === 'EMPLOYEE')
      throw createHttpError(400, 'Employee can not have subordinates');
    if (!sub) throw createHttpError(404, 'Worker not found');
    return this.appService.flipManager(sub, managerId);
  }

  @Get(':id/salary')
  getSalary(@Param('id') id: string) {
    return this.appService.getSalary(id);
  }

  @Get('salariesSum')
  async getSalariesSum() {
    const workers = await this.getWorkers();
    return workers.reduce(
      async (acc, worker) => (await acc) + (await this.getSalary(worker.id)),
      Promise.resolve(0),
    );
  }
}
