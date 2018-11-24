import { Model } from 'objection';

export default function getDomainModel() {
  class Domain extends Model {
    static tableName = 'domains';

    static get idColumn() {
      return ['name'];
    }
  }

  return Domain;
}
