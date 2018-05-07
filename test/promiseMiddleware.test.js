import promiseMiddleware from '../src';

function noop() {}

const GIVE_ME_META = 'GIVE_ME_META';

function metaMiddleware() {
  return next => action =>
    action.type === GIVE_ME_META
      ? next({ ...action, meta: 'here you go' })
      : next(action);
}

describe('promiseMiddleware', () => {
  let baseDispatch;
  let dispatch;
  let foobar;
  let err;

  beforeEach(() => {
    baseDispatch = jest.fn();
    dispatch = function dispatch(action) {
      const methods = { dispatch, getState: noop };
      return metaMiddleware()(promiseMiddleware(methods)(baseDispatch))(action);
    };
    foobar = { foo: 'bar' };
    err = new Error();
  });

  it('handles Flux standard actions', async () => {
    await dispatch({
      type: 'ACTION_TYPE',
      payload: Promise.resolve(foobar)
    });

    expect(baseDispatch).toHaveBeenCalledTimes(1);
    expect(baseDispatch.mock.calls[0][0]).toEqual({
      type: 'ACTION_TYPE',
      payload: foobar
    });

    await dispatch({
      type: 'ACTION_TYPE',
      payload: Promise.reject(err)
    }).catch(noop);

    expect(baseDispatch).toHaveBeenCalledTimes(2);
    expect(baseDispatch.mock.calls[1][0]).toEqual({
      type: 'ACTION_TYPE',
      payload: err,
      error: true
    });

    await expect(
      dispatch({
        type: 'ACTION_TYPE',
        payload: Promise.reject(err).catch(noop)
      })
    ).rejects;
  });

  it('handles promises', async () => {
    await dispatch(Promise.resolve(foobar));

    expect(baseDispatch).toHaveBeenCalledTimes(1);
    expect(baseDispatch.mock.calls[0][0]).toEqual(foobar);

    return dispatch(Promise.reject(err)).catch(error =>
      expect(error).toBe(err)
    );
  });

  it('ignores non-promises', () => {
    dispatch(foobar);

    expect(baseDispatch).toHaveBeenCalledTimes(1);
    expect(baseDispatch.mock.calls[0][0]).toEqual(foobar);

    dispatch({ type: 'ACTION_TYPE', payload: foobar });

    expect(baseDispatch).toHaveBeenCalledTimes(2);
    expect(baseDispatch.mock.calls[1][0]).toEqual({
      type: 'ACTION_TYPE',
      payload: foobar
    });
  });

  it('starts async dispatches from beginning of middleware chain', async () => {
    await dispatch(Promise.resolve({ type: GIVE_ME_META }));
    dispatch({ type: GIVE_ME_META });

    expect(baseDispatch.mock.calls.map(args => args[0].meta)).toEqual([
      'here you go',
      'here you go'
    ]);
  });
});
