import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';
import { AuthGuard } from '../../common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from '@prisma/client';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} - Davomat yuborish`
  })
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @Post()
  async submit(@Body() payload: SubmitAttendanceDto, @Request() req: any) {
    return this.attendanceService.submitJournal(payload, req.user.id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} - Berilgan sanadagi davomat`
  })
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @Get('group/:groupId/date/:date')
  async getByDate(@Param('groupId') groupId: string, @Param('date') date: string) {
    return this.attendanceService.getAttendanceByDate(+groupId, date);
  }
}
