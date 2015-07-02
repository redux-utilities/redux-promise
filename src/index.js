import { isFSA } from 'flux-standard-action';

function isPromise(val) {
  return val && typeof val.then === 'function';
}

export default function promiseMiddleware(next) {
  return action => {
    if (!isFSA(action)) {
      return isPromise(action)
        ? action.then(next)
        : next(action);
    }

    return isPromise(action.body)
      ? action.body.then(
          result => next({ ...action, body: result, status: 'success' }),
          error => next({ ...action, body: error, status: 'error' })
        )
      : next(action);
  };
}
