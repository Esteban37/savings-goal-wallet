import type { Money } from './money';

export class Progress {
  private constructor(
    readonly percent: number,
    readonly isCompleted: boolean,
  ) {}

  static from(deposited: Money, target: Money): Progress {
    if (deposited.amount >= target.amount) {
      return new Progress(100, true);
    }
    const percent = Math.min(
      100,
      Math.floor((deposited.amount * 100) / target.amount),
    );
    return new Progress(percent, false);
  }
}
