"use client";
import "rc-time-picker/assets/index.css";
import * as React from "react";
import TimePicker, { TimePickerProps } from "rc-time-picker";

export type ITimePickerProps = TimePickerProps;

function TimePickerInternal({ className = "", ...props }: ITimePickerProps) {
  return <TimePicker showSecond={false} className={className} {...props} />;
}
TimePickerInternal.displayName = "TimePickerInternal";

export { TimePickerInternal };
