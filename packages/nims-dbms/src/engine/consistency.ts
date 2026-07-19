import type { DatabaseEngine } from './DatabaseEngine';

export interface ConsistencyResult {
  errors: string[];
  details: Record<string, string[]>;
}

export class ConsistencyEngine {
  constructor(private engine: DatabaseEngine) {}

  async getConsistencyCheckResult(): Promise<ConsistencyResult> {
    const db = this.engine.database;
    const errors: string[] = [];

    this.checkProfileConsistency(errors, 'Characters', 'CharacterProfileStructure');
    this.checkProfileConsistency(errors, 'Players', 'PlayerProfileStructure');
    this.checkStoryCharactersConsistency(errors);
    this.checkEventsCharactersConsistency(errors);
    this.checkBindingsConsistency(errors);
    this.checkRelationsConsistency(errors);

    return { errors, details: {} };
  }

  private checkProfileConsistency(errors: string[], profilesKey: 'Characters' | 'Players', structureKey: 'CharacterProfileStructure' | 'PlayerProfileStructure'): void {
    const db = this.engine.database;
    const structure = db[structureKey];
    const profiles = db[profilesKey];
    const fieldNames = structure.map(s => s.name);

    for (const [name, profile] of Object.entries(profiles)) {
      for (const fieldName of fieldNames) {
        if (profile[fieldName] === undefined) {
          errors.push(`Profile "${name}" is missing field "${fieldName}"`);
        }
      }
    }
  }

  private checkStoryCharactersConsistency(errors: string[]): void {
    const db = this.engine.database;
    const charNames = Object.keys(db.Characters);

    for (const [storyName, story] of Object.entries(db.Stories)) {
      for (const charName of Object.keys(story.characters)) {
        if (!charNames.includes(charName)) {
          errors.push(`Story "${storyName}" references non-existent character "${charName}"`);
        }
      }
    }
  }

  private checkEventsCharactersConsistency(errors: string[]): void {
    const db = this.engine.database;

    for (const [storyName, story] of Object.entries(db.Stories)) {
      const storyChars = Object.keys(story.characters);
      for (const event of story.events) {
        for (const charName of Object.keys(event.characters)) {
          if (!storyChars.includes(charName)) {
            errors.push(`Event "${event.name}" in story "${storyName}" references character "${charName}" not in story`);
          }
        }
      }
    }
  }

  private checkBindingsConsistency(errors: string[]): void {
    const db = this.engine.database;
    const charNames = Object.keys(db.Characters);
    const playerNames = Object.keys(db.Players);

    // ProfileBindings: characterName → playerName
    for (const [char, player] of Object.entries(db.ProfileBindings)) {
      if (!charNames.includes(char)) {
        errors.push(`Binding references non-existent character "${char}"`);
      }
      if (!playerNames.includes(player)) {
        errors.push(`Binding references non-existent player "${player}"`);
      }
    }
  }

  private checkRelationsConsistency(errors: string[]): void {
    const db = this.engine.database;
    const charNames = Object.keys(db.Characters);

    for (const rel of db.Relations) {
      if (!charNames.includes(rel.starter)) {
        errors.push(`Relation references non-existent character "${rel.starter}"`);
      }
      if (!charNames.includes(rel.ender)) {
        errors.push(`Relation references non-existent character "${rel.ender}"`);
      }
    }
  }
}
