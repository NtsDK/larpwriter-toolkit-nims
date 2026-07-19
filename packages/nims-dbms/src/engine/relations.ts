import type { DatabaseEngine } from './DatabaseEngine';
import type { Relation } from '../domain/types';
import { ensureString, ensureEntityExists } from '../utils/precondition';

function sortPair(a: string, b: string): [string, string] {
  return a.localeCompare(b) <= 0 ? [a, b] : [b, a];
}

function pairKey(a: string, b: string): string {
  return JSON.stringify(sortPair(a, b));
}

export class RelationsEngine {
  constructor(private engine: DatabaseEngine) {
    this.engine.ee.on('renameProfile', (...args: any[]) => this.onRenameProfile(args[0]));
    this.engine.ee.on('removeProfile', (...args: any[]) => this.onRemoveProfile(args[0]));
  }

  private ensureCharacterExists(name: string): void {
    ensureString(name, 'character');
    ensureEntityExists(name, Object.keys(this.engine.database.Characters));
  }

  private findRelation(fromCharacter: string, toCharacter: string): Relation | undefined {
    return this.engine.database.Relations.find(
      rel => rel[fromCharacter] !== undefined && rel[toCharacter] !== undefined
    );
  }

  private findRelationIndex(fromCharacter: string, toCharacter: string): number {
    return this.engine.database.Relations.findIndex(
      rel => rel[fromCharacter] !== undefined && rel[toCharacter] !== undefined
    );
  }

  private ensureRelationExists(fromCharacter: string, toCharacter: string): Relation {
    const rel = this.findRelation(fromCharacter, toCharacter);
    if (!rel) {
      throw new Error(`Relation between "${fromCharacter}" and "${toCharacter}" not found`);
    }
    return rel;
  }

  async getRelations(): Promise<Relation[]> {
    return structuredClone(this.engine.database.Relations);
  }

  /** Classic NIMS: relations of a character + who they meet in shared story events. */
  async getRelationsSummary({ characterName }: { characterName: string }): Promise<{
    relations: Relation[];
    knownCharacters: Record<string, Record<string, boolean>>;
  }> {
    this.ensureCharacterExists(characterName);
    const db = this.engine.database;

    const relations = db.Relations
      .filter((rel) => rel[characterName] !== undefined)
      .map((rel) => structuredClone(rel))
      .sort((a, b) => {
        const otherA = a.starter === characterName ? a.ender : a.starter;
        const otherB = b.starter === characterName ? b.ender : b.starter;
        return otherA.localeCompare(otherB);
      });

    const knownCharacters: Record<string, Record<string, boolean>> = {};
    for (const [storyName, story] of Object.entries(db.Stories)) {
      if (!story.characters[characterName]) continue;
      for (const event of story.events) {
        if (!event.characters[characterName]) continue;
        for (const other of Object.keys(event.characters)) {
          if (other === characterName) continue;
          if (!knownCharacters[other]) knownCharacters[other] = {};
          knownCharacters[other][storyName] = true;
        }
      }
    }

    return { relations, knownCharacters };
  }

  async getCharacterRelation({ fromCharacter, toCharacter }: { fromCharacter: string; toCharacter: string }): Promise<Relation> {
    this.ensureCharacterExists(fromCharacter);
    this.ensureCharacterExists(toCharacter);
    const rel = this.ensureRelationExists(fromCharacter, toCharacter);
    return structuredClone(rel);
  }

  async createCharacterRelation({ fromCharacter, toCharacter }: { fromCharacter: string; toCharacter: string }): Promise<void> {
    this.ensureCharacterExists(fromCharacter);
    this.ensureCharacterExists(toCharacter);

    const existing = this.findRelation(fromCharacter, toCharacter);
    if (existing) {
      throw new Error(`Relation between "${fromCharacter}" and "${toCharacter}" already exists`);
    }

    const rel: Relation = {
      origin: '',
      starterTextReady: false,
      enderTextReady: false,
      essence: [],
      starter: fromCharacter,
      ender: toCharacter,
      [fromCharacter]: '',
      [toCharacter]: '',
    };
    this.engine.database.Relations.push(rel);
  }

  async removeCharacterRelation({ fromCharacter, toCharacter }: { fromCharacter: string; toCharacter: string }): Promise<void> {
    this.ensureCharacterExists(fromCharacter);
    this.ensureCharacterExists(toCharacter);

    const index = this.findRelationIndex(fromCharacter, toCharacter);
    if (index === -1) {
      throw new Error(`Relation between "${fromCharacter}" and "${toCharacter}" not found`);
    }
    this.engine.database.Relations.splice(index, 1);
  }

  async getCharacterRelationText({ fromCharacter, toCharacter, character }: {
    fromCharacter: string; toCharacter: string; character: string;
  }): Promise<string> {
    this.ensureCharacterExists(fromCharacter);
    this.ensureCharacterExists(toCharacter);
    ensureString(character, 'character');
    const rel = this.ensureRelationExists(fromCharacter, toCharacter);
    return (rel[character] as string) || '';
  }

  async setCharacterRelationText({ fromCharacter, toCharacter, character, text }: {
    fromCharacter: string; toCharacter: string; character: string; text: string;
  }): Promise<void> {
    this.ensureCharacterExists(fromCharacter);
    this.ensureCharacterExists(toCharacter);
    ensureString(character, 'character');
    ensureString(text, 'text');

    if (character !== fromCharacter && character !== toCharacter) {
      throw new Error(`Character "${character}" is not part of this relation`);
    }

    const rel = this.ensureRelationExists(fromCharacter, toCharacter);
    rel[character] = text.trim();
  }

  async setRelationOrigin({ fromCharacter, toCharacter, text }: {
    fromCharacter: string; toCharacter: string; text: string;
  }): Promise<void> {
    this.ensureCharacterExists(fromCharacter);
    this.ensureCharacterExists(toCharacter);
    ensureString(text, 'text');
    const rel = this.ensureRelationExists(fromCharacter, toCharacter);
    rel.origin = text;
  }

  async setRelationEssence({ fromCharacter, toCharacter, essence }: {
    fromCharacter: string; toCharacter: string; essence: string[];
  }): Promise<void> {
    this.ensureCharacterExists(fromCharacter);
    this.ensureCharacterExists(toCharacter);
    const rel = this.ensureRelationExists(fromCharacter, toCharacter);
    rel.essence = essence as any;
  }

  async setRelationReadyStatus({ fromCharacter, toCharacter, character, ready }: {
    fromCharacter: string; toCharacter: string; character: string; ready: boolean;
  }): Promise<void> {
    this.ensureCharacterExists(fromCharacter);
    this.ensureCharacterExists(toCharacter);
    const rel = this.ensureRelationExists(fromCharacter, toCharacter);
    if (character === rel.starter) {
      rel.starterTextReady = ready;
    } else if (character === rel.ender) {
      rel.enderTextReady = ready;
    }
  }

  private onRenameProfile(args: any[]): void {
    const { type, fromName, toName } = args[0] as { type: string; fromName: string; toName: string };
    if (type === 'player') return;

    for (const rel of this.engine.database.Relations) {
      if (rel[fromName] !== undefined) {
        rel[toName] = rel[fromName];
        delete rel[fromName];
        if (rel.starter === fromName) rel.starter = toName;
        if (rel.ender === fromName) rel.ender = toName;
      }
    }
  }

  private onRemoveProfile(args: unknown[]): void {
    const { type, characterName } = args[0] as { type: string; characterName: string };
    if (type === 'player') return;

    this.engine.database.Relations = this.engine.database.Relations.filter(
      rel => rel[characterName] === undefined
    );
  }
}
