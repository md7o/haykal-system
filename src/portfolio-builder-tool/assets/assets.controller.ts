import { Controller, Post, UseInterceptors, UploadedFile, Get, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Asset } from './entities/asset.entity';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('api/assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.', type: Asset })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.userId;
    return this.assetsService.create(userId, file);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded assets' })
  @ApiResponse({ status: 200, description: 'Return all assets.', type: [Asset] })
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.assetsService.findAll(userId);
  }
}
