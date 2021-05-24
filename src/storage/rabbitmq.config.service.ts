import { Injectable } from '@nestjs/common';
import {
  ClientProvider,
  ClientsModuleOptionsFactory,
  Transport,
} from '@nestjs/microservices';
import { ADMISSION_QUEUE } from 'fluentsearch-types';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RabbitMqConfigService implements ClientsModuleOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createClientOptions(): ClientProvider | Promise<ClientProvider> {
    const config = this.configService.get().rabbitmq;
    return {
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${config.username}:${config.password}@${config.endpoint}:5672`,
        ],
        queue: ADMISSION_QUEUE,
        noAck: false,
        queueOptions: {
          durable: false,
        },
      },
    };
  }
}
