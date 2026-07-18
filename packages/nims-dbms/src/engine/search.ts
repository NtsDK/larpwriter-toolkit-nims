import type { DatabaseEngine } from './DatabaseEngine';
import { ensureString, ensureBoolean, ensureArray } from '../utils/precondition';

export interface SearchResult {
  name: string;
  type: string;
  text: string;
}

export interface TextSearchResult {
  textType: string;
  result: SearchResult[];
}

const AVAILABLE_TEXT_TYPES = [
  'writerStory', 'eventOrigins', 'eventAdaptations',
  'characterProfiles', 'playerProfiles', 'relations', 'groups',
] as const;

export class SearchEngine {
  constructor(private engine: DatabaseEngine) {}

  async getTexts({ searchStr, textTypes, caseSensitive }: {
    searchStr: string; textTypes: string[]; caseSensitive: boolean;
  }): Promise<TextSearchResult[]> {
    ensureString(searchStr, 'searchStr');
    ensureArray(textTypes, 'textTypes');
    ensureBoolean(caseSensitive, 'caseSensitive');

    const test = caseSensitive
      ? (text: string) => text.includes(searchStr)
      : (text: string) => text.toLowerCase().includes(searchStr.toLowerCase());

    return textTypes.map(textType => ({
      textType,
      result: this.searchByType(textType, test),
    }));
  }

  private searchByType(textType: string, test: (text: string) => boolean): SearchResult[] {
    const db = this.engine.database;

    switch (textType) {
      case 'writerStory':
        return Object.values(db.Stories)
          .filter(story => test(story.story))
          .map(story => ({ name: story.name, type: 'text', text: story.story }));

      case 'eventOrigins':
        return Object.values(db.Stories).flatMap(story =>
          story.events
            .filter(event => test(event.text))
            .map(event => ({ name: `${story.name}/${event.name}`, type: 'text', text: event.text }))
        );

      case 'eventAdaptations':
        return Object.values(db.Stories).flatMap(story =>
          story.events.flatMap(event =>
            Object.entries(event.characters)
              .filter(([, adaptation]) => test(adaptation.text))
              .map(([charName, adaptation]) => ({
                name: `${story.name}/${event.name}/${charName}`,
                type: 'text',
                text: adaptation.text,
              }))
          )
        );

      case 'characterProfiles':
        return this.searchProfiles('Characters', 'CharacterProfileStructure', test);

      case 'playerProfiles':
        return this.searchProfiles('Players', 'PlayerProfileStructure', test);

      case 'relations':
        return this.searchRelations(test);

      case 'groups':
        return this.searchGroups(test);

      default:
        return [];
    }
  }

  private searchProfiles(profilesKey: 'Characters' | 'Players', structureKey: 'CharacterProfileStructure' | 'PlayerProfileStructure', test: (text: string) => boolean): SearchResult[] {
    const db = this.engine.database;
    const structure = db[structureKey];
    const textItems = structure.filter(item => item.type === 'string' || item.type === 'text');

    return Object.values(db[profilesKey]).flatMap(profile =>
      textItems
        .filter(item => {
          const val = profile[item.name];
          return typeof val === 'string' && test(val);
        })
        .map(item => ({
          name: `${profile.name}/${item.name}`,
          type: item.type,
          text: String(profile[item.name]),
        }))
    );
  }

  private searchRelations(test: (text: string) => boolean): SearchResult[] {
    const db = this.engine.database;
    const results: SearchResult[] = [];

    for (const rel of db.Relations) {
      const { starter, ender } = rel;
      const starterText = (rel[starter] as string) || '';
      const enderText = (rel[ender] as string) || '';
      const originText = rel.origin || '';

      if (test(starterText)) {
        results.push({ name: `${starter}/${ender}`, type: 'text', text: starterText });
      }
      if (test(originText)) {
        results.push({ name: `${starter} ? ${ender}`, type: 'text', text: originText });
      }
      if (test(enderText)) {
        results.push({ name: `${ender}/${starter}`, type: 'text', text: enderText });
      }
    }
    return results;
  }

  private searchGroups(test: (text: string) => boolean): SearchResult[] {
    const db = this.engine.database;
    const results: SearchResult[] = [];

    for (const group of Object.values(db.Groups)) {
      if (test(group.masterDescription)) {
        results.push({ name: `${group.name}/writer`, type: 'text', text: group.masterDescription });
      }
      if (test(group.characterDescription)) {
        results.push({ name: `${group.name}/character`, type: 'text', text: group.characterDescription });
      }
    }
    return results;
  }
}
