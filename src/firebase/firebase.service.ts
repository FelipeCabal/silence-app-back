import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { File as MulterFile } from 'multer';

@Injectable()
export class FirebaseService implements OnModuleInit {

    private storage: admin.storage.Storage;
    private bucket: any;
    onModuleInit() {
        // Inicializar Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });

        this.storage = admin.storage();
        this.bucket = this.storage.bucket();
    }
    async uploadImage(
        file: MulterFile,
        folder: string = 'images',
    ): Promise<{ url: string; fileName: string }> {
        // Validar que sea una imagen
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('El archivo debe ser una imagen');
        }

        const fileName = `${folder}/${Date.now()}_${file.originalname}`;
        const fileUpload = this.bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
            resumable: false,
        });

        return new Promise((resolve, reject) => {
            stream.on('error', (error) => {
                reject(new BadRequestException(`Error al subir imagen: ${error.message}`));
            });

            stream.on('finish', async () => {
                try {
                    // Hacer el archivo público
                    await fileUpload.makePublic();

                    // Obtener la URL pública
                    const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;

                    resolve({
                        url: publicUrl,
                        fileName: fileName,
                    });
                } catch (error) {
                    reject(new BadRequestException('Error al generar URL pública'));
                }
            });

            stream.end(file.buffer);
        });
    }

    async deleteImage(fileName: string): Promise<{ message: string }> {
        try {
            await this.bucket.file(fileName).delete();
            return { message: 'Imagen eliminada correctamente' };
        } catch (error) {
            throw new BadRequestException(`Error al eliminar imagen: ${error.message}`);
        }
    }

    async getImageUrl(fileName: string): Promise<string> {
        try {
            const file = this.bucket.file(fileName);
            const [exists] = await file.exists();

            if (!exists) {
                throw new BadRequestException('La imagen no existe');
            }

            return `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
        } catch (error) {
            throw new BadRequestException(`Error al obtener URL: ${error.message}`);
        }
    }

    async listImages(folder: string = 'images'): Promise<string[]> {
        try {
            const [files] = await this.bucket.getFiles({ prefix: folder });
            return files.map(file => file.name);
        } catch (error) {
            throw new BadRequestException(`Error al listar imágenes: ${error.message}`);
        }
    }
}