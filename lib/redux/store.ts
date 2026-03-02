import { useMemo } from "react";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import expireReducer from "redux-persist-expire";

import reducers from "./reducers";

let store;

// level 1 state reconciler
const persistConfig = {
  key: "root",
  storage: storage,
  blacklist: ["favorites"],
  transforms: [
    expireReducer("songs", { expireSeconds: 86400 }), // 24 hrs
    expireReducer("tokens", { expireSeconds: 86400, autoExpire: true }), // 24 hrs
    expireReducer("users", { expireSeconds: 1209600, autoExpire: true }), // 14 days
    expireReducer("audioPlayer", { expireSeconds: 86400, autoExpire: true }), // 24 hrs
  ],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const initStore = (initialState) => {
  return createStore(
    // @ts-ignore (issue with persistReducer return type)
    persistedReducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware))
  );
};

export const initializeStore = (preloadedState) => {
  let _store = store ?? initStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState,
    });
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export const useStore = (initialState) => {
  const store = useMemo(() => initializeStore(initialState), [initialState]);
  return store;
};

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
