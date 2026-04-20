import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: { color: localStorage.getItem("themeColor") || "GREEN" },
  reducers: {
    setThemeColor: (state, action) => {
      state.color = action.payload;
      localStorage.setItem("themeColor", action.payload);
    },
  },
});

export const { setThemeColor } = themeSlice.actions;
export default themeSlice.reducer;
