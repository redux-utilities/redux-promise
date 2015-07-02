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

    return isPromise(action.payload)
      ? action.payload.then(
          result => next({ ...action, payload: result, status: 'success' }),
          error => next({ ...action, payload: error, status: 'error' })
        )
      : next(action);
  };
}
