import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
        region: process.env.AWS_REGION!,
        credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    const bucket = this.configService.get('AWS_S3_BUCKET');
    const region = this.configService.get('AWS_REGION');
    const key = `galeria/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', 
      }),
    );

    return {
      url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    };
  }
}