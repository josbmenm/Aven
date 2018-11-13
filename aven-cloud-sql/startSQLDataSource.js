import Knex from "knex";

export default function startSQLDataSource({ config, domain }) {
  const knex = Knex(config);
}
