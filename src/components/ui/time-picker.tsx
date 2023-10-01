"use client";
import * as React from "react";
import {
  MobileTimePicker,
  MobileTimePickerProps,
} from "@mui/x-date-pickers/MobileTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { cn } from "../../lib/utils/ui.utils";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useTheme } from "next-themes";

export type ITimePickerProps<T> = MobileTimePickerProps<T>;

const lightTheme = createTheme({
  palette: {
    mode: "light",
    // ... other light theme settings
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    // ... other dark theme settings
  },
});

function TimePickerInternal<T>({
  className = "",
  ...props
}: ITimePickerProps<T>) {
  const { theme = "light" } = useTheme();
  return (
    <ThemeProvider theme={theme == "light" ? lightTheme : darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MobileTimePicker
          className={cn(className)}
          slotProps={{ textField: { size: "small" } }}
          views={["hours", "minutes"]}
          {...props}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
TimePickerInternal.displayName = "TimePickerInternal";

export { TimePickerInternal };
