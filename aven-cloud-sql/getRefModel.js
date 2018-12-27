import { Model } from 'objection';

export default function getRefModel(models) {
  class Ref extends Model {
    static tableName = 'refs';

    static get idColumn() {
      return ['name', 'domainName'];
    }

    static get relationMappings() {
      return {
        block: {
          relation: Model.HasOneRelation,
          modelClass: models.Block,
          join: {
            from: 'refs.currentBlock',
            to: 'blocks.id',
          },
        },
        domain: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Domain,
          join: {
            from: 'refs.domainName',
            to: 'domains.name',
          },
        },
      };
    }
  }
  return Ref;
}
