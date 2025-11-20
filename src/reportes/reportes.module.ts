import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportesService } from './services/reportes.service';
import { ReportesController } from './controllers/reportes.controller';

import {
  Comunidades,
  ComunidadesSchema,
} from 'src/chats/schemas/community.schema';
import { userModelSchema, UserSchema } from 'src/users/entities/users.schema';
import { UsersModule } from 'src/users/users.module';
import { Reporte, ReporteSchema } from './schema/reportes.schema';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      { name: Reporte.name, schema: ReporteSchema },
      { name: Comunidades.name, schema: ComunidadesSchema },
      {
        name: UserSchema.name,
        schema: userModelSchema,
      },
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
