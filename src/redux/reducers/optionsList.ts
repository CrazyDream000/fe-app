import { createSlice } from "@reduxjs/toolkit";
import { RawOption } from "../../types/options";
import { isNonEmptyArray } from "../../utils/utils";

export enum FetchState {
  NotStarted = "not-started",
  Done = "done",
  Failed = "failed",
  Fetching = "fetching",
}

export const optionsList = createSlice({
  name: "optionsList",
  initialState: {
    rawOptionsList: [] as RawOption[],
    state: FetchState.NotStarted,
    balanceState: FetchState.NotStarted,
  },
  reducers: {
    setOptions: (state, action) => {
      const arr: RawOption[] = action.payload;
      isNonEmptyArray(arr) && (state.rawOptionsList = arr);
      return state;
    },
    setFetchState: (state, action) => {
      state.state = action.payload;
    },
    setBalanceFetchState: (state, action) => {
      state.balanceState = action.payload;
    },
  },
});

export const { setOptions, setFetchState, setBalanceFetchState } =
  optionsList.actions;
