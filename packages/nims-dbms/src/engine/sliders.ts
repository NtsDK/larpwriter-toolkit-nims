import type { DatabaseEngine } from './DatabaseEngine';
import type { SliderItem } from '../domain/types';
import { ensureString } from '../utils/precondition';

export class SlidersEngine {
  constructor(private engine: DatabaseEngine) {}

  private model(): SliderItem[] {
    return this.engine.database.Sliders;
  }

  async getSliderData(): Promise<SliderItem[]> {
    return structuredClone(this.model());
  }

  async createSlider({ name, top, bottom }: { name: string; top: string; bottom: string }): Promise<void> {
    ensureString(name, 'name');
    ensureString(top, 'top');
    ensureString(bottom, 'bottom');
    this.model().push({ name: name.trim(), top: top.trim(), bottom: bottom.trim(), value: 0 });
  }

  async updateSliderNaming({ index, name, top, bottom }: {
    index: number; name: string; top: string; bottom: string;
  }): Promise<void> {
    this.ensureIndex(index);
    ensureString(name, 'name');
    ensureString(top, 'top');
    ensureString(bottom, 'bottom');
    const item = this.model()[index];
    item.name = name.trim();
    item.top = top.trim();
    item.bottom = bottom.trim();
  }

  async updateSliderValue({ index, value }: { index: number; value: number }): Promise<void> {
    this.ensureIndex(index);
    const n = Number(value);
    if (!Number.isFinite(n) || n < -10 || n > 10) {
      throw new Error('Slider value must be between -10 and 10');
    }
    this.model()[index].value = n;
  }

  async moveSlider({ index, pos }: { index: number; pos: number }): Promise<void> {
    const model = this.model();
    this.ensureIndex(index);
    if (!Number.isInteger(pos) || pos < 0 || pos > model.length) {
      throw new Error(`Invalid slider position: ${pos}`);
    }
    let insertAt = pos;
    if (insertAt > index) insertAt -= 1;
    const [item] = model.splice(index, 1);
    model.splice(insertAt, 0, item);
  }

  async removeSlider({ index }: { index: number }): Promise<void> {
    this.ensureIndex(index);
    this.model().splice(index, 1);
  }

  private ensureIndex(index: number): void {
    const model = this.model();
    if (!Number.isInteger(index) || index < 0 || index >= model.length) {
      throw new Error(`Slider index out of range: ${index}`);
    }
  }
}
