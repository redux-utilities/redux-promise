import promiseMiddleware from '../';
import { spy } from 'sinon';

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
    baseDispatch = spy();
    dispatch = function d(action) {
      const methods = { dispatch: d, getState: noop };
      return metaMiddleware()(promiseMiddleware(methods)(baseDispatch))(action);
    };
    foobar = { foo: 'bar' };
    err = new Error();
  });

  it('handles Flux standard actions', async () => {
    const meta = { 'do': 'wop' };

    await dispatch({
      type: 'ACTION_TYPE',
      payload: Promise.resolve(foobar),
      meta
    });

    expect(baseDispatch.calledTwice).to.be.true;
    const action1 = baseDispatch.firstCall.args[0];
    expect(action1.type).to.equal('ACTION_TYPE');
    expect(action1.payload).to.be.undefined;
    expect(action1.meta).to.eql(meta);
    expect(action1.sequence.type).to.equal('start');
    const action2 = baseDispatch.secondCall.args[0];
    expect(action2.type).to.equal('ACTION_TYPE');
    expect(action2.payload).to.eql(foobar);
    expect(action2.meta).to.eql(meta);
    expect(action2.sequence.type).to.equal('next');
    expect(action1.sequence.id).to.equal(action2.sequence.id);

    await dispatch({
      type: 'ACTION_TYPE',
      payload: Promise.reject(err),
      meta
    }).catch(noop);

    expect(baseDispatch.callCount).to.equal(4);
    const action3 = baseDispatch.args[2][0];
    expect(action3.type).to.equal('ACTION_TYPE');
    expect(action3.payload).to.be.undefined;
    expect(action3.meta).to.eql(meta);
    expect(action3.sequence.type).to.equal('start');
    const action4 = baseDispatch.args[3][0];
    expect(action4.type).to.equal('ACTION_TYPE');
    expect(action4.payload).to.eql(err);
    expect(action4.error).to.be.true;
    expect(action4.meta).to.eql(meta);
    expect(action4.sequence.type).to.equal('next');
    expect(action3.sequence.id).to.equal(action4.sequence.id);
  });

  it('handles promises', async () => {
    await dispatch(Promise.resolve(foobar));
    expect(baseDispatch.calledOnce).to.be.true;
    expect(baseDispatch.firstCall.args[0]).to.equal(foobar);

    await expect(dispatch(Promise.reject(err))).to.eventually.be.rejectedWith(err);
  });

  it('ignores non-promises', async () => {
    dispatch(foobar);
    expect(baseDispatch.calledOnce).to.be.true;
    expect(baseDispatch.firstCall.args[0]).to.equal(foobar);

    dispatch({ type: 'ACTION_TYPE', payload: foobar });
    expect(baseDispatch.calledTwice).to.be.true;
    expect(baseDispatch.secondCall.args[0]).to.deep.equal({
      type: 'ACTION_TYPE',
      payload: foobar
    });
  });

  it('starts async dispatches from beginning of middleware chain', async () => {
    await dispatch(Promise.resolve({ type: GIVE_ME_META }));
    dispatch({ type: GIVE_ME_META });
    expect(baseDispatch.args.map(args => args[0].meta)).to.eql([
      'here you go',
      'here you go'
    ]);
  });
});
