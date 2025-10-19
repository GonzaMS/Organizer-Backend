import axios, { AxiosInstance } from 'axios';
import { HttpAdapter } from '../interfaces/http-adapter.interface';
import { Logger } from '@nestjs/common';

export class AxiosAdapter implements HttpAdapter {
  private axios: AxiosInstance = axios;
  private logger = new Logger('Axios adapter');

  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await this.axios.get<T>(url);

      return data;
    } catch (error) {
      this.logger.log(error);
      throw new Error(error.message);
    }
  }
}
