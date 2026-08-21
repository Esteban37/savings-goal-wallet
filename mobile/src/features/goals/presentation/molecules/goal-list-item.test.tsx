import { fireEvent, render } from '@testing-library/react-native';
import { GoalListItem } from './goal-list-item';

describe('GoalListItem', () => {
  const inputRow = {
    id: 'goal-vacaciones',
    name: 'Vacaciones',
    targetAmount: 100000,
    depositedAmount: 25000,
    progressPercent: 25,
    isCompleted: false,
  };

  it('fires long-press without firing press', () => {
    const mockPress = jest.fn();
    const mockLongPress = jest.fn();
    const { getByText } = render(
      <GoalListItem
        {...inputRow}
        onPress={mockPress}
        onLongPress={mockLongPress}
      />,
    );

    fireEvent(getByText('Vacaciones'), 'longPress');

    expect(mockLongPress).toHaveBeenCalledTimes(1);
    expect(mockPress).not.toHaveBeenCalled();
  });
});
