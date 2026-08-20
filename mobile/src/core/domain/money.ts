import { err, ok, type Result } from './result';

function isIntegerAmount(amount: number): boolean {
  return Number.isFinite(amount) && Number.isInteger(amount);
}

export class Money {
  private constructor(readonly amount: number) {}

  static zero(): Money {
    return new Money(0);
  }

  static ofNonNegative(amount: number): Result<Money, 'invalid-amount'> {
    if (!isIntegerAmount(amount) || amount < 0) {
      return err('invalid-amount');
    }
    return ok(new Money(amount));
  }

  static ofPositive(amount: number): Result<Money, 'invalid-amount'> {
    if (!isIntegerAmount(amount) || amount <= 0) {
      return err('invalid-amount');
    }
    return ok(new Money(amount));
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }
}
