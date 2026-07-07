import { action, makeObservable, observable, toJS } from "mobx";
import { GameMeta } from "../domain";

export class GameMetaStore {
  saveTime!: string;
  name!: string;
  description!: string;
  date!: string;
  preGameDate!: string;

  constructor(
  ) {
    makeObservable(this, {
      saveTime: observable,
      name: observable,
      description: observable,
      date: observable,
      preGameDate: observable,
      set: action,
    });
  }

  set(gameMeta: GameMeta) {
    const { date, description, name, preGameDate, saveTime } = gameMeta;
    this.date = date;
    this.description = description;
    this.name = name;
    this.preGameDate = preGameDate;
    this.saveTime = saveTime;
  }

  get(): GameMeta {
    return toJS({
      date: this.date,
      description: this.description,
      name: this.name,
      preGameDate: this.preGameDate,
      saveTime: this.saveTime,
    })
  }

  setSaveTime(saveTime: string) {
    this.saveTime = saveTime;
  }
  setName(name: string) {
    this.name = name;
  }
  setDescription(description: string) {
    this.description = description;
  }
  setDate(date: string) {
    this.date = date;
  }
  setPreGameDate(preGameDate: string) {
    this.preGameDate = preGameDate;
  }
}
