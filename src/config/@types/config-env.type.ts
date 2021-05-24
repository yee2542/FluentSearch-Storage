export enum ConfigEnvEnum {
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  DATABASE_USERNAME = 'DATABASE_USERNAME',
  DATABASE_PASSWORD = 'DATABASE_PASSWORD',
  DATABASE_AUTH_SOURCE = 'DATABASE_AUTH_SOURCE',
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  JWT_EXPIRES = 'JWT_EXPIRES',
  ORIGIN = 'ORIGIN',
  PORT = 'PORT',
  STORAGE_HOSTNAME = 'STORAGE_HOSTNAME',
  MINIO_ACCESS_KEY = 'MINIO_ACCESS_KEY',
  MINIO_SECRET_KEY = 'MINIO_SECRET_KEY',
  MINIO_SERVER_ENDPOINT = 'MINIO_SERVER_ENDPOINT',
  MINIO_SERVER_PORT = 'MINIO_SERVER_PORT',
  MINIO_SERVER_SSL = 'MINIO_SERVER_SSL',
  RABBITMQ_ENDPOINT = 'RABBITMQ_ENDPOINT',
  RABBITMQ_USERNAME = 'RABBITMQ_USERNAME',
  RABBITMQ_PASSWORD = 'RABBITMQ_PASSWORD',
}

export type ConfigEnvType = {
  [key in ConfigEnvEnum]: string;
};
