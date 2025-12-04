import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { SolicitudesAmistadService } from '../services/solicitudesAmistad.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('friend-request')
@ApiTags('Solicitudes de amistad')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class SolicitudesController {
  constructor(
    private readonly solicitudesAmistadService: SolicitudesAmistadService,
  ) {}

  @Post('request/:userRecibeId')
  @ApiOperation({ summary: 'Enviar una solicitud de amistad a un usuario' })
  @ApiParam({ name: 'userRecibeId', type: String, required: true })
  @ApiResponse({ status: 201, description: 'Solicitud enviada correctamente' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  async sendFriendRequest(
    @Param('userRecibeId') userRecibeId: string,
    @Request() req: any,
  ) {
    return this.solicitudesAmistadService.sendFriendRequest(
      req.user._id,
      userRecibeId,
    );
  }

  @Get('between/:otherUserId')
  @ApiOperation({
    summary:
      'Obtener si existe una solicitud de amistad entre el usuario actual y otro usuario',
  })
  @ApiParam({ name: 'otherUserId', type: String, required: true })
  @ApiResponse({
    status: 200,
    description: 'Solicitud encontrada o null si no existe',
  })
  async getRequestBetween(
    @Request() req: any,
    @Param('otherUserId') otherUserId: string,
  ) {
    return this.solicitudesAmistadService.findBetweenUsers(
      req.user._id,
      otherUserId,
    );
  }

  @Get('user')
  @ApiOperation({
    summary: 'Obtener todas las solicitudes enviadas por el usuario actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de solicitudes enviadas',
  })
  async getUserRequests(@Request() req: any) {
    return this.solicitudesAmistadService.findUserRequests(req.user._id);
  }

  @Get('user/received')
  @ApiOperation({
    summary: 'Obtener todas las solicitudes recibidas por el usuario actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de solicitudes recibidas',
  })
  async getReceivedRequests(@Request() req: any) {
    return this.solicitudesAmistadService.findAllReceiveRequest(req.user._id);
  }

  @Get('user/accepted')
  @ApiOperation({
    summary: 'Obtener todas las solicitudes de amistad aceptadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de relaciones aceptadas',
  })
  async getAcceptedRequests(@Request() req: any) {
    return this.solicitudesAmistadService.findAcceptedFriendships(req.user._id);
  }

  @Patch('update/:requestId')
  @ApiOperation({
    summary: 'Actualizar aceptar el estado de una solicitud',
  })
  @ApiParam({ name: 'requestId', type: String, required: true })
  @ApiBody({
    description: 'Body necesario para actualizar el estado',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud actualizada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async updateRequestStatus(
    @Param('requestId') requestId: string,
    @Request() req: any,
  ) {
    return this.solicitudesAmistadService.acceptRequest(
      requestId,
      req.user._id,
    );
  }

  @Delete(':requestId')
  @ApiOperation({
    summary: 'Eliminar una solicitud de amistad',
  })
  @ApiParam({ name: 'requestId', type: String, required: true })
  @ApiResponse({
    status: 200,
    description: 'Solicitud eliminada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  async deleteRequest(
    @Param('requestId') requestId: string,
    @Request() req: any,
  ) {
    return this.solicitudesAmistadService.deleteRequest(
      requestId,
      req.user._id,
    );
  }
}
