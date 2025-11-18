import {
    Controller,
    Post,
    Delete,
    Get,
    UseInterceptors,
    UploadedFile,
    Body,
    Query,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from './firebase.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('firebase')
@ApiTags('firebase')
export class FirebaseController {
    constructor(private readonly firebaseService: FirebaseService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('image'))
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
                ],
            }),
        )
        image: any,
        @Body('folder') folder?: string,
    ) {
        const result = await this.firebaseService.uploadImage(
            image,
            folder || 'images',
        );
        return {
            success: true,
            data: result,
        };
    }

    @Delete('delete')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async deleteImage(@Body('fileName') fileName: string) {
        if (!fileName) {
            return {
                success: false,
                message: 'El nombre del archivo es requerido',
            };
        }

        const result = await this.firebaseService.deleteImage(fileName);
        return {
            success: true,
            data: result,
        };
    }

    @Get('url')
    async getImageUrl(@Query('fileName') fileName: string) {
        if (!fileName) {
            return {
                success: false,
                message: 'El nombre del archivo es requerido',
            };
        }

        const url = await this.firebaseService.getImageUrl(fileName);
        return {
            success: true,
            data: { url },
        };
    }

    @Get('list')
    async listImages(@Query('folder') folder?: string) {
        const images = await this.firebaseService.listImages(folder || 'images');
        return {
            success: true,
            data: images,
        };
    }
}