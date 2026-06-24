import type { ReactNode } from "react";
import {
  NumberField as RACNumberField, type NumberFieldProps as RACNumberFieldProps,
  Slider as RACSlider, type SliderProps as RACSliderProps,
  Label, Group, Input, Button as RACButton, Text, FieldError,
  SliderTrack, SliderThumb, SliderOutput,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./numeric.css";

export interface NumberFieldProps extends Omit<RACNumberFieldProps, "className"> {
  label?: ReactNode; description?: ReactNode; errorMessage?: ReactNode; placeholder?: string; className?: string;
}
export function NumberField({ label, description, errorMessage, placeholder, className, ...props }: NumberFieldProps) {
  return (
    <RACNumberField {...props} className={cx("prn-field prn-numberfield", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <Group className="prn-numberfield-group">
        <RACButton slot="decrement" className="prn-numberfield-step">−</RACButton>
        <Input className="prn-input prn-numberfield-input" placeholder={placeholder} />
        <RACButton slot="increment" className="prn-numberfield-step">+</RACButton>
      </Group>
      {description && <Text slot="description" className="prn-field-desc">{description}</Text>}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
    </RACNumberField>
  );
}

export interface SliderProps extends Omit<RACSliderProps, "className"> {
  label?: ReactNode; showValue?: boolean; className?: string;
}
export function Slider({ label, showValue = true, className, ...props }: SliderProps) {
  return (
    <RACSlider {...props} className={cx("prn-slider", className)}>
      <div className="prn-slider-header">
        {label && <Label className="prn-field-label">{label}</Label>}
        {showValue && <SliderOutput className="prn-slider-output" />}
      </div>
      <SliderTrack className="prn-slider-track">
        {({ state }) => (
          <>
            <div className="prn-slider-fill" style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
            <SliderThumb className="prn-slider-thumb" />
          </>
        )}
      </SliderTrack>
    </RACSlider>
  );
}
