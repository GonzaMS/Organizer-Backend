import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseStatusIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') {
      throw new Error('Status ID must be a string');
    }

    value = value.toUpperCase();

    if (!['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].includes(value)) {
      throw new BadRequestException(`Invalid classroom status: ${value}`);
    }

    return value;
  }
}
