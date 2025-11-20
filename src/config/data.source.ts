import { ConfigModule, ConfigService } from '@nestjs/config';
/* import { TypeOrmModuleOptions } from "@nestjs/typeorm"; */

ConfigModule.forRoot();
const configService = new ConfigService();

/* export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: configService.get('DATABASE_URL', null),
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/../**/ /*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: true,
    migrationsRun: true,
    logging: false,
} */

export const mongooseConfigUri: string =
  'mongodb+srv://felipecabal_db_user:mayo2004@cluster0.b2xtlkq.mongodb.net/'; //|| process.env.MONGO_URL  ;

/* export const mongooseConfigUri: string = process.env.MONGO_URL;
>>>>>>> 749e58e142ebb4e07ef809b9cf031be53a79e438 */
