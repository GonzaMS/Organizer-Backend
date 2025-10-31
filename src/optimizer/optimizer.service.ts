import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OptimizerService {
  async generateSchedule(payload: any) {
    const url = process.env.OPTIMIZER_URL || 'http://optimizer:8000/optimize';
    const { data } = await axios.post(url, payload, { timeout: 180000 });
    return data;
  }
}
