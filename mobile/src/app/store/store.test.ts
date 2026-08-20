import { createAppDependencies } from '../di/create-app-dependencies';
import { createAppStore } from './store';

describe('createAppStore', () => {
  it('accepts a no-op dispatch and exposes a serializable state object', () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);

    store.dispatch({ type: 'noop' });
    const actualX = store.getState();
    const expectedX = JSON.parse(JSON.stringify(actualX));

    expect(actualX).toEqual(expect.any(Object));
    expect(actualX).toEqual(expectedX);
  });
});
