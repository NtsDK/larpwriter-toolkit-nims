import { iocContainer } from "./container";
import { GameMetaStore } from "./GameMetaStore";
import { IOC_IDS } from "./Symbols";

export function getGameMetaStore(): GameMetaStore {
  return iocContainer.get<GameMetaStore>(IOC_IDS.GameMetaStore);
}
