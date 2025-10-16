import { Injectable } from '@nestjs/common';
import { HttpAdapter } from '../common/interfaces/http-adapter.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(private readonly axiosAdapter: AxiosAdapter) {}

  async executeSeed() {
    // Delete all records in the database

    // Get all the records from the database

    // const teachers = await this.axiosAdapter.get<TeachersResponse>('');

    // Insert all the new records into the database
    return `This action returns all seed`;
  }
}
