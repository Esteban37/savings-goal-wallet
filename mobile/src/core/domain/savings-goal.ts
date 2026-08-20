import { Money } from './money';
import { Progress } from './progress';
import { err, ok, type Result } from './result';

export class SavingsGoal {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly target: Money,
    readonly deposited: Money,
  ) {}

  static create(input: {
    id: string;
    name: string;
    target: Money;
    deposited?: Money;
  }): Result<SavingsGoal, 'invalid-goal'> {
    if (input.id.length === 0 || input.name.length === 0) {
      return err('invalid-goal');
    }
    return ok(
      new SavingsGoal(
        input.id,
        input.name,
        input.target,
        input.deposited ?? Money.zero(),
      ),
    );
  }

  progress(): Progress {
    return Progress.from(this.deposited, this.target);
  }

  applyDeposit(deposit: Money): Result<SavingsGoal, 'invalid-amount'> {
    if (deposit.amount <= 0) {
      return err('invalid-amount');
    }
    return ok(
      new SavingsGoal(
        this.id,
        this.name,
        this.target,
        this.deposited.add(deposit),
      ),
    );
  }
}
