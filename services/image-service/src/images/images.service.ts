import { Injectable } from '@nestjs/common';

@Injectable()
export class ImagesService {
  health() {
    return { status: 'ok', service: 'image-service' };
  }
}
