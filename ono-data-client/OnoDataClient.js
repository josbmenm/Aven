import DataClient from '../aven-data-client/DataClient';
import { Buffer } from 'buffer';

const IS_DEV = process.env.NODE_ENV !== 'production';

const DEV_HOST = {
  useSSL: false,
  authority: 'localhost:3000',
};
const PROD_HOST = {
  authority: 'www.onofood.co',
};

// const HOST = DEV_HOST;
const HOST = PROD_HOST;
// const HOST = IS_DEV ? DEV_HOST : PROD_HOST;

export const Client = new DataClient({
  host: HOST,
  domain: 'onofood.co',
});

export const airtableData = Client.getRef(
  'airtable',
).observeConnectedObjectValue(['files', 'db.json']);
export const testData = Client.getRef('airtable').observeConnectedObjectValue([
  'files',
  'files',
]);

export const airtableTables = airtableData.map(d => d.baseTables);
export const kioskMenu = airtableTables.map(t => t['Kiosk Menu']);
export const recipes = airtableTables.map(t => t['Recipes']);

const sortByField = (obj, fieldName) => {
  var sortable = [];
  for (var row in obj) {
    sortable.push([row, obj[row]]);
  }
  sortable.sort((a, b) => a[1][fieldName] - b[1][fieldName]);
  return sortable.map(kVal => kVal[1]);
};

export const mainMenu = airtableTables.map(t => {
  const Recipes = t['Recipes'];
  const MenuItemsUnordered = t['Kiosk Menu'];
  const MenuItems = sortByField(MenuItemsUnordered, '_index');
  const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
  const ActiveItmesWithRecipe = ActiveMenuItems.map(item => ({
    ...item,
    Recipe: Recipes[item.Recipe[0]],
  }));
  return ActiveItmesWithRecipe;
});

export const getRecipe = recipeId => recipes.map(r => r[recipeId]);

export const dispatch = Client.dispatch;
