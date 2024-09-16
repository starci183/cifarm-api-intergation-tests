import { Client, Session } from "@heroiclabs/nakama-js";
import axios from "axios";
import { sleep } from "./harvest.spec1";

describe("Test plant seed flow", () => {
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
  afterEach(async () => {
    await client.deleteAccount(session);
  });
  test("Test flow ", async () => {
    const { payload } = await client.rpc(session, "buy_seed", {
      key: "carrot",
      quantity: 1,
    });

    const tiles = await client.rpc(session, "list_placed_items", {});
    const key = (tiles.payload as any).placedItems[0].key;

    await client.rpc(session, "plant_seed", {
      placedItemTileKey: key,
      inventorySeedKey: (payload as any).inventorySeedKey,
    });
    //50% change to be need water
    await client.rpc(session, "test_speed_up", {
      time: 3600,
    });
    //sleep 1.1s to load next chunk
    await sleep(1100);

    const x = await client.readStorageObjects(session, {
      object_ids: [
        {
          collection: "PlacedItems",
          key,
          user_id: session.user_id,
        },
      ],
    });
    console.log(
      `At stage ${(x.objects[0].value as any).seedGrowthInfo.currentStage}`
    );
    if ((x.objects[0].value as any).seedGrowthInfo.needWater) {
      console.log(
        `need water, we need to water it at stage ${
          (x.objects[0].value as any).seedGrowthInfo.currentStage
        }`
      );
      await client.rpc(session, "water", {
        placedItemTileKey: key,
      });
    }

    await client.rpc(session, "test_speed_up", {
      time: 3600,
    });
    //sleep 1.1s to load next chunk
    await sleep(1100);

    const x1 = await client.readStorageObjects(session, {
      object_ids: [
        {
          collection: "PlacedItems",
          key,
          user_id: session.user_id,
        },
      ],
    });
    console.log(
      `At stage ${(x1.objects[0].value as any).seedGrowthInfo.currentStage}`
    );
    if ((x1.objects[0].value as any).seedGrowthInfo.needWater) {
      console.log(
        `need water, we need to water it at stage ${
          (x1.objects[0].value as any).seedGrowthInfo.currentStage
        }`
      );
      await client.rpc(session, "water", {
        placedItemTileKey: key,
      });
    }

    await client.rpc(session, "test_speed_up", {
      time: 3600,
    });

    await sleep(1100);

    const x2 = await client.readStorageObjects(session, {
      object_ids: [
        {
          collection: "PlacedItems",
          key,
          user_id: session.user_id,
        },
      ],
    });
    console.log(
      `At stage ${(x2.objects[0].value as any).seedGrowthInfo.currentStage}`
    );
    if ((x2.objects[0].value as any).seedGrowthInfo.isInfested) {
      console.log(
        `is infested, we need to use thuốc trừ sâu it at stage ${
          (x2.objects[0].value as any).seedGrowthInfo.currentStage
        }`
      );
      await client.rpc(session, "use_pestiside", {
        placedItemTileKey: key,
      });
    }
    if ((x2.objects[0].value as any).seedGrowthInfo.isWeedy) {
      console.log(
        `is weedy, we need to use thuốc diệt cỏ it at stage ${
          (x2.objects[0].value as any).seedGrowthInfo.currentStage
        }`
      );
      await client.rpc(session, "use_herbicide", {
        placedItemTileKey: key,
      });
    }

    await client.rpc(session, "test_speed_up", {
      time: 3600,
    });

    await sleep(1100);
    //check quantity
    const x3 = await client.readStorageObjects(session, {
        object_ids: [
          {
            collection: "PlacedItems",
            key,
            user_id: session.user_id,
          },
        ],
      });
    expect((x3.objects[0].value as any).seedGrowthInfo.harvestQuantityRemaining).toEqual((x3.objects[0].value as any).seedGrowthInfo.seed.maxHarvestQuantity)
  });
});
