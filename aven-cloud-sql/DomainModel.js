import { Model } from "objection";

export default class Domain extends Model {
  static tableName = "domains";

  static get idColumn() {
    return ["name"];
  }
}
