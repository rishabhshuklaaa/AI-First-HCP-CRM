import { createSlice } from '@reduxjs/toolkit';

const interactionSlice = createSlice({
  name: 'interactions',
  initialState: { list: [] },
  reducers: {
    setInteractions: (state, action) => { state.list = action.payload; },
  },
});

export const { setInteractions } = interactionSlice.actions;
export default interactionSlice.reducer;