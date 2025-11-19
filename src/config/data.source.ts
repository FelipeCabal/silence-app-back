import { ConfigModule, ConfigService } from '@nestjs/config';

ConfigModule.forRoot();
const configService = new ConfigService();
//comente para evitar eerror con la database
/* export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: configService.get('DATABASE_URL', null),
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/../**//*.entity{.ts,.js}'], //falta **
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: true,
    migrationsRun: true,
    logging: false,
} */

//export const mongooseConfigUri: string = "mongodb+srv://felipecabal_db_user:mayo2004@cluster0.b2xtlkq.mongodb.net/";
export const mongooseConfigUri: string = process.env.MONGO_URL;
