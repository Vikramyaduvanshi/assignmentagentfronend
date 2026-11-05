import { configureStore } from "@reduxjs/toolkit";
import batchesslice from "./batchslice"



export let store = configureStore({
    reducer: {
        Batches: batchesslice,
    }
})