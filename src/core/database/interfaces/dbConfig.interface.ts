export interface IDatabaseConfigSqlite {
  dialect: string;
  storage: string;
}

export interface IDatabaseConfigAttributes {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number | string;
  dialect?: string;
  urlDatabase?: string;
}

export interface IDatabaseConfig {
  development: IDatabaseConfigAttributes;
  sqlite: IDatabaseConfigSqlite;
}
