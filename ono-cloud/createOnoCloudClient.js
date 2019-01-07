// import DataClient from '../aven-cloud-client/DataClient';
// import { Buffer } from 'buffer';

// const IS_DEV = process.env.NODE_ENV !== 'production';

// const DEV_HOST = {
//   useSSL: false,
//   authority: 'localhost:8840',
// };
// const PROD_HOST = {
//   authority: 'www.onofood.co',
// };

// // const HOST = DEV_HOST;
// const HOST = PROD_HOST;
// // const HOST = IS_DEV ? DEV_HOST : PROD_HOST;

// export const Client = new DataClient({
//   host: HOST,
//   domain: 'onofood.co',
// });

// export const airtableData = Client.get(
//   'airtable',
// ).observeConnectedObjectValue(['files', 'db.json']);
// export const testData = Client.get('airtable').observeConnectedObjectValue([
//   'files',
//   'files',
// ]);

// export const airtableTables = airtableData.map(d => d.baseTables);

// export const recipes = airtableTables.map(t => t['Recipes']);

// const sortByField = (obj, fieldName) => {
//   var sortable = [];
//   for (var row in obj) {
//     sortable.push([row, obj[row]]);
//   }
//   sortable.sort((a, b) => a[1][fieldName] - b[1][fieldName]);
//   return sortable.map(kVal => kVal[1]);
// };

// export const mainMenu = airtableTables.map(t => {
//   const Recipes = t['Recipes'];
//   const MenuItemsUnordered = t['KioskBlendMenu'];
//   const MenuItems = sortByField(MenuItemsUnordered, '_index');
//   const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
//   const ActiveItemsWithRecipe = ActiveMenuItems.map(item => ({
//     ...item,
//     Recipe: Recipes && item.Recipe && Recipes[item.Recipe[0]],
//   }));
//   return ActiveItemsWithRecipe;
// });

// export const getRecipe = recipeId => recipes.map(r => r[recipeId]);

// export const topMenuItem = airtableTables.map(t => {
//   const Recipes = t['Recipes'];
//   console.log('wat', t);
//   const MenuItemsUnordered = t['KioskBlendMenu'];
//   const MenuItems = sortByField(MenuItemsUnordered, '_index');
//   const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
//   const ActiveItemsWithRecipe = ActiveMenuItems.map(item => ({
//     ...item,
//     Recipe: Recipes && item.Recipe && Recipes[item.Recipe[0]],
//   }));
//   return ActiveItemsWithRecipe[0];
// });

// // export const getMenuItem = itemId =>
// //   mainMenu.map(menu => {
// //     debugger;
// //     menu.find(a => a.id === itemId);
// //   });

// export const dispatch = Client.dispatch;

export default function createOnoCloudClient(client) {
  return {
    ...client,
  };
}