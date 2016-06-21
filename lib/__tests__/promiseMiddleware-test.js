'use strict';

var _this = this;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _sinon = require('sinon');

function noop() {}
var GIVE_ME_META = 'GIVE_ME_META';
function metaMiddleware() {
  return function (next) {
    return function (action) {
      return action.type === GIVE_ME_META ? next(_extends({}, action, { meta: 'here you go' })) : next(action);
    };
  };
}

describe('promiseMiddleware', function () {
  var baseDispatch = undefined;
  var dispatch = undefined;
  var foobar = undefined;
  var err = undefined;

  beforeEach(function () {
    baseDispatch = _sinon.spy();
    dispatch = function d(action) {
      var methods = { dispatch: d, getState: noop };
      return metaMiddleware()(_2['default'](methods)(baseDispatch))(action);
    };
    foobar = { foo: 'bar' };
    err = new Error();
  });

  it('handles Flux standard actions', function callee$1$0() {
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return regeneratorRuntime.awrap(dispatch({
            type: 'ACTION_TYPE',
            payload: Promise.resolve(foobar)
          }));

        case 2:

          expect(baseDispatch.calledOnce).to.be['true'];
          expect(baseDispatch.firstCall.args[0]).to.deep.equal({
            type: 'ACTION_TYPE',
            payload: foobar
          });

          context$2$0.next = 6;
          return regeneratorRuntime.awrap(dispatch({
            type: 'ACTION_TYPE',
            payload: Promise.reject(err)
          })['catch'](noop));

        case 6:

          expect(baseDispatch.calledTwice).to.be['true'];
          expect(baseDispatch.secondCall.args[0]).to.deep.equal({
            type: 'ACTION_TYPE',
            payload: err,
            error: true
          });

          context$2$0.next = 10;
          return regeneratorRuntime.awrap(expect(dispatch({
            type: 'ACTION_TYPE',
            payload: Promise.reject(err)
          })).to.eventually.be.rejectedWith(err));

        case 10:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  });

  it('handles promises', function callee$1$0() {
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return regeneratorRuntime.awrap(dispatch(Promise.resolve(foobar)));

        case 2:
          expect(baseDispatch.calledOnce).to.be['true'];
          expect(baseDispatch.firstCall.args[0]).to.equal(foobar);

          context$2$0.next = 6;
          return regeneratorRuntime.awrap(expect(dispatch(Promise.reject(err))).to.eventually.be.rejectedWith(err));

        case 6:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  });

  it('ignores non-promises', function callee$1$0() {
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          dispatch(foobar);
          expect(baseDispatch.calledOnce).to.be['true'];
          expect(baseDispatch.firstCall.args[0]).to.equal(foobar);

          dispatch({ type: 'ACTION_TYPE', payload: foobar });
          expect(baseDispatch.calledTwice).to.be['true'];
          expect(baseDispatch.secondCall.args[0]).to.deep.equal({
            type: 'ACTION_TYPE',
            payload: foobar
          });

        case 6:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  });

  it('starts async dispatches from beginning of middleware chain', function callee$1$0() {
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return regeneratorRuntime.awrap(dispatch(Promise.resolve({ type: GIVE_ME_META })));

        case 2:
          dispatch({ type: GIVE_ME_META });
          expect(baseDispatch.args.map(function (args) {
            return args[0].meta;
          })).to.eql(['here you go', 'here you go']);

        case 4:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  });
});