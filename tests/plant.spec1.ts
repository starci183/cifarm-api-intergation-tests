import { Client, Session } from "@heroiclabs/nakama-js";
import axios from "axios";
import { sleep } from "./harvest.spec1";

describe("Test add buy flow", () => {
  let client: Client;
  let session: Session;
  beforeEach(async () => {
    const { data } = await axios.post(
      "http://localhost:9999/api/v1/authenticator/fake-signature",
      {
        chainKey: "avalanche",
        accountNumber: 1,
      }
    );
    client = new Client("defaultkey", "localhost", "7350", false);
    session = await client.authenticateCustom("", false, "", {
      ...data.data,
      network: "testnet",
    });
  });
  // afterEach(async () => {
  //   await client.deleteAccount(session);
  // });
  test("Test flow ", async () => {
    const { payload } = await client.rpc(session, "buy_seed", {
      key: "carrot",
      quantity: 1,
    });

    const tiles = await client.rpc(session, "list_placed_items", {});
    const inventorySeedKey = (payload as any).inventorySeedKey;
    const placedItemTileKey = (tiles.payload as any).placedItems[0].key;

    await client.rpc(session, "plant_seed", {
      inventorySeedKey,
      placedItemTileKey,
    });
    await client.rpc(session, "test_speed_up", {
      time: 3600,
    });
    await sleep(1100);
    const secondStage = await client.readStorageObjects(session, {
      object_ids: [
        {
          collection: "PlacedItems",
          key: placedItemTileKey,
          user_id: session.user_id,
        },
      ],
    });
    if ((secondStage.objects[0].value as any).seedGrowthInfo.needWater) {
      console.log(
        `need water, we need to water it at stage ${
          (secondStage.objects[0].value as any).seedGrowthInfo.currentStage
        }`
      );
      await client.rpc(session, "water", {
        placedItemTileKey,
      });
    }
    await client.rpc(session, "test_speed_up", {
      time: 3600,
    });
    await sleep(1100);
    const thirdStage = await client.readStorageObjects(session, {
      object_ids: [
        {
          collection: "PlacedItems",
          key: placedItemTileKey,
          user_id: session.user_id,
        },
      ],
    });
    if ((thirdStage.objects[0].value as any).seedGrowthInfo.needWater) {
      console.log(
        `need water, we need to water it at stage ${
          (thirdStage.objects[0].value as any).seedGrowthInfo.currentStage
        }`
      );
      await client.rpc(session, "water", {
        placedItemTileKey,
      });
    }
    await client.rpc(session, "test_speed_up", {
      time: 3600,
    });
    //sleep 1.1s to load next chunk
    await sleep(1100);
    const forthStage = await client.readStorageObjects(session, {
      object_ids: [
        {
          collection: "PlacedItems",
          key: placedItemTileKey,
          user_id: session.user_id,
        },
      ],
    });
    if ((forthStage.objects[0].value as any).seedGrowthInfo.isInfested) {
      console.log(
        `is infested, we need to use thuốc trừ sâu it at stage ${
          (forthStage.objects[0].value as any).seedGrowthInfo.currentStage
        }`
      );
      await client.rpc(session, "use_pestiside", {
        placedItemTileKey,
      });
    }
    if ((forthStage.objects[0].value as any).seedGrowthInfo.isWeedy) {
      console.log(
        `is weedy, we need to use thuốc diệt cỏ it at stage ${
          (forthStage.objects[0].value as any).seedGrowthInfo.currentStage
        }`
      );
      await client.rpc(session, "use_herbicide", {
        placedItemTileKey,
      });
    }
    await client.rpc(session, "test_speed_up", {
      time: 3600,
    });
    //sleep 1.1s to load next chunk
    await sleep(1100);
    const harvest = await client.rpc(session, "harvest_plant", {
      placedItemTileKey,
    });

    const delivery = await client.rpc(session, "deliver_products", {
      inventories: [
        {
          key: (harvest.payload as any).harvestInventoryKey,
          quantity: 5
        }
      ]
    })

    const deliveringProducts = await client.readStorageObjects(session, {
      object_ids: [{
        key: (delivery.payload as any).keys[0],
        collection: "DeliveringProducts",
        user_id: session.user_id,
      }]
    })

    const inventories = await client.readStorageObjects(session, {
      object_ids: [{
        key: (harvest.payload as any).harvestInventoryKey,
        collection: "Inventories",
        user_id: session.user_id,
      }]
    })

    expect((deliveringProducts.objects[0].value as any).quantity).toEqual(5) 
    expect((inventories.objects[0].value as any).quantity).toEqual(15) 
  });
});
