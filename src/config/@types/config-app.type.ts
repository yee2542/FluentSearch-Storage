export type ConfigAppProviderType = {
  database: {
    connection: string;
    username: string;
    password: string;
    authSource: string;
  };
  jwt: {
    secretKey: string;
    expires: number;
  };
  node_env: 'production' | 'development';
  origin: RegExp;
  port: number;
  storage_hostname: string;
};
