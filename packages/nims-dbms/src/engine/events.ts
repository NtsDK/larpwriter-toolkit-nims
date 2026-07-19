import type { DatabaseEngine } from './DatabaseEngine';
import type { StoryEvent } from '../domain/types';
import { ensureString, ensureNumber, ensureEnum, ensureInRange, ensureEntityExists } from '../utils/precondition';
import { ORIGIN_PROPERTIES } from '../utils/constants';

export class EventsEngine {
  constructor(private engine: DatabaseEngine) {}

  private getStoryOrThrow(storyName: string) {
    ensureString(storyName, 'storyName');
    ensureEntityExists(storyName, Object.keys(this.engine.database.Stories));
    return this.engine.database.Stories[storyName];
  }

  async getStoryEvents({ storyName }: { storyName: string }): Promise<StoryEvent[]> {
    const story = this.getStoryOrThrow(storyName);
    return structuredClone(story.events);
  }

  async createEvent({ storyName, eventName, selectedIndex }: { storyName: string; eventName: string; selectedIndex: number }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureString(eventName, 'eventName');
    ensureNumber(selectedIndex, 'selectedIndex');
    ensureInRange(selectedIndex, 0, story.events.length);

    const event: StoryEvent = {
      name: eventName,
      text: '',
      time: '',
      characters: {},
    };
    story.events.splice(selectedIndex, 0, event);
  }

  async moveEvent({ storyName, index, newIndex }: { storyName: string; index: number; newIndex: number }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureNumber(index, 'index');
    ensureNumber(newIndex, 'newIndex');
    ensureInRange(index, 0, story.events.length - 1);
    ensureInRange(newIndex, 0, story.events.length);

    let adjustedNewIndex = newIndex;
    if (adjustedNewIndex > index) adjustedNewIndex--;

    const [item] = story.events.splice(index, 1);
    story.events.splice(adjustedNewIndex, 0, item);
  }

  async cloneEvent({ storyName, index }: { storyName: string; index: number }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureNumber(index, 'index');
    ensureInRange(index, 0, story.events.length - 1);
    story.events.splice(index, 0, structuredClone(story.events[index]));
  }

  async mergeEvents({ storyName, index }: { storyName: string; index: number }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureNumber(index, 'index');
    ensureInRange(index, 0, story.events.length - 2);

    const event1 = story.events[index];
    const event2 = story.events[index + 1];

    event1.name += `/${event2.name}`;
    event1.text += `\n\n${event2.text}`;

    for (const [charName, adaptation] of Object.entries(event2.characters)) {
      if (event1.characters[charName]) {
        event1.characters[charName].text += `\n\n${adaptation.text}`;
        event1.characters[charName].time += `/${adaptation.time}`;
        event1.characters[charName].ready = false;
      } else {
        event1.characters[charName] = adaptation;
      }
    }

    story.events.splice(index + 1, 1);
  }

  async removeEvent({ storyName, index }: { storyName: string; index: number }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureNumber(index, 'index');
    ensureInRange(index, 0, story.events.length - 1);
    story.events.splice(index, 1);
  }

  async setEventOriginProperty({ storyName, index, property, value }: { storyName: string; index: number; property: string; value: string }): Promise<void> {
    const story = this.getStoryOrThrow(storyName);
    ensureNumber(index, 'index');
    ensureString(property, 'property');
    ensureEnum(property, ORIGIN_PROPERTIES, 'property');
    ensureString(value, 'value');
    ensureInRange(index, 0, story.events.length - 1);

    (story.events[index] as unknown as Record<string, unknown>)[property] = value;
  }
}
