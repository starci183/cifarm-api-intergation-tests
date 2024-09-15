import { Client, Session } from "@heroiclabs/nakama-js";
import axios from "axios";
import { randomInt } from "crypto";

describe("Test haverst flow", () => {
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
  test("Should haverst after", async () => {
 const {payload} = await client.rpc(session, "buy_seed", {
      key: "carrot",
      quantity: 1,
    });

    const tiles = await client.listStorageObjects(
      session,
      "PlacedItems",
      session.user_id,
      6
    );

    await client.rpc(session, "plant_seed", {
      placedItemTileKey: tiles.objects.at(0)?.key,
      inventorySeedKey: (payload as any).key,
    });

    await client.rpc(session, "test_speed_up", {
        time: 3600 * 7
    });
    await sleep(2000)
    const tilesX = await client.readStorageObjects(session, {
        object_ids: [
            {
                collection: "PlacedItems",
                key: tiles.objects.at(0)?.key,
                user_id: session.user_id
            }
        ]
    })
    expect((tilesX.objects[0].value as any).fullyMatured).toEqual(true)

    //haverst
    const resss = await client.rpc(session, "harvest", {
        placedItemTileKey: tilesX.objects[0].key
    });
    const key = (resss.payload as any).harvestInventoryKey
    console.log(key)
    //check tile status
    const tilesAfter = await client.readStorageObjects(session, {
        object_ids: [
            {
                collection: "PlacedItems",
                key: tiles.objects.at(0)?.key,
                user_id: session.user_id
            }
        ]
    })
    expect((tilesAfter.objects[0].value as any).fullyMatured).toEqual(false)
    expect((tilesAfter.objects[0].value as any).isPlanted).toEqual(false)

    //check inventory status
    const invs = await client.readStorageObjects(session, {
        object_ids: [
            {
                collection: "Inventories",
                key: key,
                user_id: session.user_id
            }
        ]
    })
    expect((invs.objects[0].value as any).type).toEqual(3)
    expect((invs.objects[0].value as any).quantity).toEqual(20)
  });
  })

  export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}