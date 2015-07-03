redux-promise
=============

[![build status](https://img.shields.io/travis/acdlite/redux-promise/master.svg?style=flat-square)](https://travis-ci.org/acdlite/redux-promise)
[![npm version](https://img.shields.io/npm/v/redux-promise.svg?style=flat-square)](https://www.npmjs.com/package/redux-promise)

[FSA](https://github.com/acdlite/flux-standard-action)-compliant promise [middleware](https://github.com/gaearon/redux/blob/master/docs/middleware.md) for Redux.

```js
npm install --save redux-promise
```

## Usage

```js
import promiseMiddleware from 'redux-promise';
```

The default export is a middleware function. If it receives a promise, it will dispatch the resolved value of the promise. It will not dispatch anything if the promise rejects.

If it receives an Flux Standard Action whose `payload` is a promise, it will either

- dispatch a copy of the action with the resolved value of the promise, and set `status` to `success`.
- dispatch a copy of the action with the rejected value of the promise, and set `status` to `error`.

The middleware returns a promise to the caller so that it can wait for the operation to finish before continuing. This is especially useful for server-side rendering. If you find that a promise is not being returned, ensure that all middleware before it in the chain is also returning its `next()` call to the caller.

## Example: Async action creators

Because it supports FSA actions, you can use redux-promise in combination with [redux-actions](https://github.com/acdlite/redux-actions) to enable the use of async action creators, like in Flummox:

```js
createAction('FETCH_THING', async id => {
  const res = await api.fetchThing(id);
  return res.body;
});
```

Unlike Flummox, it will not perform a dispatch at the beginning of the operation, only at the end. Use Redux's built-in [`thunkMiddleware`](https://github.com/gaearon/redux/blob/master/src/middleware/thunk.js) in combination with `redux-promise` to perform optimistic updates.


## Example: Creating actions
