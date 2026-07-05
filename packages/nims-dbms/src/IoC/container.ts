import { Container } from "inversify";


import { IOC_IDS } from "./Symbols";
import { GameMetaStore } from "./GameMetaStore";

export const iocContainer = new Container();

export function initIoCContainer() {
  iocContainer.bind(IOC_IDS.GameMetaStore).to(GameMetaStore).inSingletonScope();
}
