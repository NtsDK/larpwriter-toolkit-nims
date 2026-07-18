import type { DatabaseEngine } from './DatabaseEngine';

export class StatisticsEngine {
  constructor(private engine: DatabaseEngine) {}

  async getStatistics(): Promise<Record<string, unknown>> {
    const db = this.engine.database;
    const statistics: Record<string, unknown> = {};

    statistics.storyNumber = Object.keys(db.Stories).length;
    statistics.characterNumber = Object.keys(db.Characters).length;
    statistics.groupNumber = Object.keys(db.Groups).length;
    statistics.playerNumber = Object.keys(db.Players).length;

    statistics.eventsNumber = Object.values(db.Stories)
      .reduce((sum, story) => sum + story.events.length, 0);

    statistics.userNumber = 1;
    if (db.ManagementInfo?.UsersInfo) {
      statistics.userNumber = Object.keys(db.ManagementInfo.UsersInfo).length;
    }

    const textCharactersCount = this.countTextCharacters();
    statistics.textCharactersCount = textCharactersCount;
    statistics.textCharacterNumber = Object.values(textCharactersCount).reduce((a, b) => a + b, 0);

    statistics.bindingStats = this.countBindingStats();

    const [firstEvent, lastEvent] = this.getFirstLastEventTime();
    statistics.firstEvent = firstEvent;
    statistics.lastEvent = lastEvent;

    statistics.generalCompleteness = this.getGeneralCompleteness();
    statistics.storyCompleteness = this.getStoryCompleteness();

    return statistics;
  }

  private countTextCharacters(): Record<string, number> {
    const db = this.engine.database;
    const counts: Record<string, number> = {
      writerStories: 0,
      eventOrigins: 0,
      eventAdaptations: 0,
    };

    for (const story of Object.values(db.Stories)) {
      counts.writerStories += story.story.length;
      for (const event of story.events) {
        counts.eventOrigins += event.text.length;
        for (const adaptation of Object.values(event.characters)) {
          counts.eventAdaptations += adaptation.text.length;
        }
      }
    }
    return counts;
  }

  private countBindingStats(): { bound: number; total: number } {
    const db = this.engine.database;
    const total = Object.keys(db.Characters).length;
    const bound = Object.keys(db.ProfileBindings).length;
    return { bound, total };
  }

  private getFirstLastEventTime(): [string, string] {
    const db = this.engine.database;
    const times: string[] = [];
    for (const story of Object.values(db.Stories)) {
      for (const event of story.events) {
        if (event.time) times.push(event.time);
      }
    }
    if (times.length === 0) return ['', ''];
    times.sort();
    return [times[0], times[times.length - 1]];
  }

  private getGeneralCompleteness(): { totalAdaptations: number; finishedAdaptations: number; percentage: number } {
    const db = this.engine.database;
    let total = 0;
    let finished = 0;

    for (const story of Object.values(db.Stories)) {
      for (const event of story.events) {
        for (const adaptation of Object.values(event.characters)) {
          total++;
          if (adaptation.ready) finished++;
        }
      }
    }

    return {
      totalAdaptations: total,
      finishedAdaptations: finished,
      percentage: total > 0 ? finished / total : 0,
    };
  }

  private getStoryCompleteness(): Array<{ storyName: string; total: number; finished: number; percentage: number }> {
    const db = this.engine.database;
    return Object.entries(db.Stories).map(([storyName, story]) => {
      let total = 0;
      let finished = 0;
      for (const event of story.events) {
        for (const adaptation of Object.values(event.characters)) {
          total++;
          if (adaptation.ready) finished++;
        }
      }
      return { storyName, total, finished, percentage: total > 0 ? finished / total : 0 };
    });
  }
}
