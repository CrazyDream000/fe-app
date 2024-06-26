import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { settings } from "./reducers/settings";
import { network } from "./reducers/network";
import { ui } from "./reducers/ui";
import { txs } from "./reducers/transactions";
import { wallet } from "./reducers/wallet";

const rootReducer = combineReducers({
  settings: settings.reducer,
  network: network.reducer,
  ui: ui.reducer,
  txs: txs.reducer,
  wallet: wallet.reducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
