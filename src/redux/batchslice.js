import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Base } from "../api.js";

export let fetchbatches = createAsyncThunk("batches/fetchbatches", async ({ userroleid }, thunkApi) => {

    try {
        let res = await axios.post(`${Base}/batches/batch`,
            { user_role_id: userroleid },
            { withCredentials: true }   
        )


        let ans = await res.data
        console.log("fetchbatches functions", ans)
        return ans

    } catch (e) {

        return thunkApi.rejectWithValue(e.message)

    }
}, {
    // is role ka data pehle se store mein hai to dobara fetch mat karo
    // dobara chahiye ho to: dispatch(fetchbatches({ userroleid: 1622, force: true }))
    condition: ({ userroleid, force }, { getState }) => {
        if (force) return true
        return !getState().Batches.batches[userroleid]
    }
})

let initialState = {
    loading: false,
    batches: {},      // { 1622: [...], 1169: [...] }  har user_role_id ka apna array
    err: "",
}

let Batchesslice = createSlice({
    name: "Batches",
    initialState,
    reducers: {},

    extraReducers: (builder) => {

        builder
            .addCase(fetchbatches.pending, (state, action) => {
                state.loading = true
                state.err = ""
            })
            .addCase(fetchbatches.fulfilled, (state, action) => {
                state.loading = false
                // jis id ke liye call hui, usi key mein array save
                state.batches[action.meta.arg.userroleid] = action.payload.result
            })
            .addCase(fetchbatches.rejected, (state, action) => {
                state.loading = false
                state.err = action.payload
            })
    }
})

export default Batchesslice.reducer;