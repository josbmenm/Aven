import startSQLDataSource from '../startSQLDataSource';
// import Knex from "knex";

// beforeEach(async () => {
//   const knex = Knex({
//     client: "sqlite3",
//     connection: {
//       filename: "./testdb.sqlite"
//     }
//   });
//   console.log("running migration!");
//   await knex.migrate.latest({
//     directory: "../migrations"
//   });
//   console.log("ran migration!");
// });

const startTestDataSource = options =>
  startSQLDataSource({
    config: {
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {
        filename: './test.sqlite',
      },
    },
    ...options,
  });

describe('basic data source setup', () => {
  test.skip('throws when starting without a domain', () => {
    expect(() => {
      startTestDataSource({});
    }).toThrow();
  });
  // test("gets status reports ready", async () => {
  //   const ds = startTestDataSource({ domain: "test" });
  //   const status = await ds.dispatch({
  //     type: "GetStatus"
  //   });
  //   expect(status.ready);
  // });
});

// describe("object storage", () => {
//   test("object put fails with invalid domain", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     await expect(
//       ds.dispatch({
//         type: "PutObject",
//         domain: "test2",
//         value: { foo: "bar" }
//       })
//     ).rejects.toThrow();
//   });

//   test("puts objects without error", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     const putResult = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "bar" }
//     });
//     expect(typeof putResult.id).toEqual("string");
//   });
//   test("puts and gets object", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     const putResult = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "bar" }
//     });
//     const obj = await ds.dispatch({
//       type: "GetObject",
//       domain: "test",
//       id: putResult.id
//     });
//     expect(obj.object.foo).toEqual("bar");
//   });
//   test("puts and gets null object", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     const putResult = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: null
//     });
//     const obj = await ds.dispatch({
//       type: "GetObject",
//       domain: "test",
//       id: putResult.id
//     });
//     expect(obj.object).toEqual(null);
//   });
// });

// describe("ref storage", () => {
//   test("puts ref fails when an object is missing", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     await expect(
//       ds.dispatch({ type: "PutRef", domain: "test", objectId: "foo" })
//     ).rejects.toThrow();
//   });
//   test("puts ref works", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     const obj = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "bar" }
//     });
//     await ds.dispatch({
//       type: "PutRef",
//       domain: "test",
//       name: "foo",
//       id: obj.id
//     });
//     const ref = await ds.dispatch({
//       type: "GetRef",
//       domain: "test",
//       name: "foo"
//     });
//     expect(ref.id).toEqual(obj.id);
//   });
// });

// describe("observing refs", () => {
//   test("puts ref fails when an object is missing", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     await expect(
//       ds.dispatch({ type: "PutRef", domain: "test", objectId: "foo" })
//     ).rejects.toThrow();
//   });
//   test("observe ref works", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     const obj1 = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "bar" }
//     });
//     const obj2 = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "baz" }
//     });
//     await ds.dispatch({
//       type: "PutRef",
//       domain: "test",
//       name: "foo",
//       id: obj1.id
//     });
//     const obs = await ds.observeRef("test", "foo");
//     let lastObserved = undefined;
//     obs.subscribe({
//       next: newVal => {
//         lastObserved = newVal;
//       }
//     });
//     await ds.dispatch({
//       type: "PutRef",
//       domain: "test",
//       name: "foo",
//       id: obj2.id
//     });
//     expect(lastObserved.id).toEqual(obj2.id);
//   });
//   test("observe cleanup works", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     const obj1 = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "bar" }
//     });
//     const obj2 = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "baz" }
//     });
//     await ds.dispatch({
//       type: "PutRef",
//       domain: "test",
//       name: "foo",
//       id: obj1.id
//     });
//     const obs = await ds.observeRef("test", "foo");
//     let lastObserved = undefined;
//     const subs = obs.subscribe({
//       next: newVal => {
//         lastObserved = newVal;
//       }
//     });
//     expect(lastObserved.id).toEqual(obj1.id);
//     subs.unsubscribe();
//     await ds.dispatch({
//       type: "PutRef",
//       domain: "test",
//       name: "foo",
//       id: obj2.id
//     });
//     expect(lastObserved.id).toEqual(obj1.id);
//   });

//   test("observe same ref multiple times", async () => {
//     const ds = startTestDataSource({ domain: "test" });
//     const obj1 = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "bar" }
//     });
//     const obj2 = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: "baz" }
//     });
//     const obj3 = await ds.dispatch({
//       type: "PutObject",
//       domain: "test",
//       value: { foo: 42 }
//     });
//     await ds.dispatch({
//       type: "PutRef",
//       domain: "test",
//       name: "foo",
//       id: obj1.id
//     });
//     const obs1 = await ds.observeRef("test", "foo");
//     const obs2 = await ds.observeRef("test", "foo");
//     let lastObserved1 = undefined;
//     let lastObserved2 = undefined;
//     const subs1 = obs1.subscribe({
//       next: newVal => {
//         lastObserved1 = newVal;
//       }
//     });
//     const subs2 = obs2.subscribe({
//       next: newVal => {
//         lastObserved2 = newVal;
//       }
//     });
//     expect(lastObserved1.id).toEqual(obj1.id);
//     expect(lastObserved2.id).toEqual(obj1.id);

//     await ds.dispatch({
//       type: "PutRef",
//       domain: "test",
//       name: "foo",
//       id: obj2.id
//     });
//     expect(lastObserved1.id).toEqual(obj2.id);
//     expect(lastObserved2.id).toEqual(obj2.id);

//     subs1.unsubscribe();
//     await ds.dispatch({
//       type: "PutRef",
//       domain: "test",
//       name: "foo",
//       id: obj3.id
//     });
//     expect(lastObserved1.id).toEqual(obj2.id);
//     expect(lastObserved2.id).toEqual(obj3.id);
//   });
// });
