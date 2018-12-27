import { Model } from 'objection';

export default function getDocModel(models) {
  class Doc extends Model {
    static tableName = 'docs';

    static get idColumn() {
      return ['name', 'domainName'];
    }

    static get relationMappings() {
      return {
        block: {
          relation: Model.HasOneRelation,
          modelClass: models.Block,
          join: {
            from: 'docs.currentBlock',
            to: 'blocks.id',
          },
        },
        domain: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Domain,
          join: {
            from: 'docs.domainName',
            to: 'domains.name',
          },
        },
      };
    }
  }
  return Doc;
}
