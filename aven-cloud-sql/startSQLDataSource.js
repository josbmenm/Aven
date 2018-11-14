import Knex from "knex";
import DomainModel from "./DomainModel";
import ObjectModel from "./ObjectModel";
import RefModel from "./RefModel";

export default async function startSQLDataSource({
  client,
  connection,
  domain
}) {
  const knex = Knex({
    client,
    connection,
    useNullAsDefault: true
  });

  const models = {
    Domain: DomainModel.bindKnex(knex),
    Ref: RefModel.bindKnex(knex),
    Object: ObjectModel.bindKnex(knex)
  };

  const f = await models.Domain.query();
  console.log("made it here at least!", f.length);

  function close() {}

  return {
    close
  };
}
