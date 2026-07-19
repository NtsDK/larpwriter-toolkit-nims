import type { DatabaseEngine } from './DatabaseEngine';
import type { GearEdge, GearNode, GearsData } from '../domain/types';

export class GearsEngine {
  constructor(private engine: DatabaseEngine) {}

  private gears(): GearsData {
    return this.engine.database.Gears;
  }

  async getAllGearsData(): Promise<GearsData> {
    return structuredClone(this.gears());
  }

  async setGearsData({ data }: { data: { nodes: GearNode[]; edges: GearEdge[] } }): Promise<void> {
    const g = this.gears();
    g.nodes = Array.isArray(data?.nodes) ? data.nodes : [];
    g.edges = Array.isArray(data?.edges) ? data.edges : [];
  }

  async setGearsPhysicsEnabled({ enabled }: { enabled: boolean }): Promise<void> {
    this.gears().settings.physicsEnabled = !!enabled;
  }

  async setGearsShowNotesEnabled({ enabled }: { enabled: boolean }): Promise<void> {
    this.gears().settings.showNotes = !!enabled;
  }
}
