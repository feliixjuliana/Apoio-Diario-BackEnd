import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import path from 'path/win32';

@Injectable()
export class FilesService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    const bucket = this.configService.get('AWS_S3_BUCKET');
    const region = this.configService.get('AWS_REGION');
    if (!bucket || !region) {
      throw new InternalServerErrorException(
        'Configuração do bucket inválida.',
      );
    }
    const ext = path.extname(file.originalname).toLowerCase();
    const key = `galeria/${randomUUID()}${ext}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype
        }),
      );
      return { key };      
    } catch (error) {
      console.error('Erro ao enviar imagem para S3:', error);
      throw new InternalServerErrorException('Erro ao enviar imagem.');
    }
  }

  async urlImage(key: string): Promise<string> {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 86400 });
  }
}
