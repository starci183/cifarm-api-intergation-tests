// import { Client, Session } from "@heroiclabs/nakama-js";
// import axios from "axios";
// import { randomInt } from "crypto";

// describe("Test plant seed flow", () => {
//   let client: Client;
//   let session: Session;
//   beforeEach(async () => {
//     const { data } = await axios.post(
//       "http://localhost:9999/api/v1/authenticator/fake-signature",
//       {
//         chainKey: "avalanche",
//         accountNumber: randomInt(1),
//       }
//     );
//     client = new Client("defaultkey", "localhost", "7350", false);
//     session = await client.authenticateCustom("", false, "", {
//       ...data.data,
//       network: "testnet",
//     });
//   });
//   afterEach(async () => {
//     await client.deleteAccount(session);
//   });
//   test("Should buy seed successfully", async () => {
//     // //first, you buy 1 seed carrot from shop
//     // await client.rpc(session, "buy_seed", {
//     //   key: "carrot",
//     //   quantity: 1,
//     // });
//     // //then, you buy 1 seed carrot from shop
//     // await client.rpc(session, "buy_seed", {
//     //   key: "carrot",
//     //   quantity: 1,
//     // });
//     // //then, you buy 2 seed potato from shop
//     // await client.rpc(session, "buy_seed", {
//     //   key: "potato",
//     //   quantity: 2,
//     // });
//     // //thus, you have 2 carrot and potato
//     // const inventories = await client.listStorageObjects(
//     //   session,
//     //   "Inventories",
//     //   session.user_id,
//     //   5
//     // );
//     // expect(inventories.objects.length).toEqual(2);
//     // //check your balance
//     // const account = await client.getAccount(session);
//     // const golds = JSON.parse(account.wallet ?? "").golds;
//     // expect(golds).toEqual(200);
//   });
//   test("Should plant successfully after buy 1 carrot seed", async () => {
//     // const {payload} = await client.rpc(session, "buy_seed", {
//     //   key: "carrot",
//     //   quantity: 1,
//     // });

//     // const tiles = await client.listStorageObjects(
//     //   session,
//     //   "PlacedItems",
//     //   session.user_id,
//     //   6
//     // );
//     // await client.rpc(session, "plant_seed", {
//     //   placedItemTileKey: tiles.objects.at(0)?.key,
//     //   inventorySeedKey: (payload as any).key,
//     // });
//     // const inventories = await client.listStorageObjects(
//     //   session,
//     //   "Inventories",
//     //   session.user_id,
//     //   1
//     // );
//     // expect(inventories.objects.length).toEqual(0)
//     // const newLists = await client.readStorageObjects(
//     //   session,
//     //   {
//     //     object_ids: [
//     //       {
//     //         collection: "PlacedItems",
//     //         key: tiles.objects.at(0)?.key,
//     //         user_id: session.user_id,
//     //       }
//     //     ]
//     //   }
//     // );
//     // expect((newLists.objects[0].value as any).isPlanted).toEqual(true)
//   });
//   test("Should plant successfully after buy 2 carrot seed", async () => {
//     const {payload} = await client.rpc(session, "buy_seed", {
//       key: "carrot",
//       quantity: 2,
//     });

//     const tiles = await client.listStorageObjects(
//       session,
//       "PlacedItems",
//       session.user_id,
//       6
//     );

//     await client.rpc(session, "plant_seed", {
//       placedItemTileKey: tiles.objects.at(0)?.key,
//       inventorySeedKey: (payload as any).key,
//     });
//     const inventories = await client.listStorageObjects(
//       session,
//       "Inventories",
//       session.user_id,
//       1
//     );
//     for (const inventory of inventories.objects) {
//       (inventory.value as any).Key = inventory.key
//     }
//     expect(inventories.objects.length).toEqual(1)
//     console.log(inventories.objects[0].value)
//     expect((inventories.objects[0].value as any).quantity).toEqual(1)
//     const newLists = await client.readStorageObjects(
//       session,
//       {
//         object_ids: [
//           {
//             collection: "PlacedItems",
//             key: tiles.objects.at(0)?.key,
//             user_id: session.user_id,
//           }
//         ]
//       }
//     );
//     expect((newLists.objects[0].value as any).isPlanted).toEqual(true)
//   });
//   })
