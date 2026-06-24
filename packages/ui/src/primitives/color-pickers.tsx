import type { ReactNode } from "react";
import {
  ColorArea as RACColorArea,
  type ColorAreaProps as RACColorAreaProps,
  ColorSlider as RACColorSlider,
  type ColorSliderProps as RACColorSliderProps,
  ColorWheel as RACColorWheel,
  type ColorWheelProps as RACColorWheelProps,
  ColorWheelTrack,
  ColorPicker as RACColorPicker,
  type ColorPickerProps as RACColorPickerProps,
  ColorThumb,
  ColorSwatch,
  SliderTrack,
  SliderOutput,
  Button as RACButton,
  Label,
  Popover,
  Dialog,
  DialogTrigger,
} from "react-aria-components";
import { cx } from "../utils";
import { ColorField } from "./color";
import "./forms.css";
import "./overlays.css";
import "./color-pickers.css";

/* ---------------- ColorArea ---------------- */

export interface ColorAreaProps extends Omit<RACColorAreaProps, "className" | "children"> {
  className?: string;
}

export function ColorArea({ className, ...props }: ColorAreaProps) {
  return (
    <RACColorArea {...props} className={cx("prn-colorarea", className)}>
      <ColorThumb className="prn-color-thumb" />
    </RACColorArea>
  );
}

/* ---------------- ColorSlider ---------------- */

export interface ColorSliderProps extends Omit<RACColorSliderProps, "className"> {
  /** Beschriftung über dem Slider. */
  label?: ReactNode;
  /** Aktuellen Kanalwert rechts neben dem Label anzeigen. */
  showValue?: boolean;
  className?: string;
}

export function ColorSlider({ label, showValue = true, className, ...props }: ColorSliderProps) {
  return (
    <RACColorSlider {...props} className={cx("prn-colorslider", className)}>
      {(label || showValue) && (
        <div className="prn-colorslider-head">
          {label && <Label className="prn-field-label">{label}</Label>}
          {showValue && <SliderOutput className="prn-colorslider-output" />}
        </div>
      )}
      <SliderTrack className="prn-colorslider-track">
        <ColorThumb className="prn-color-thumb" />
      </SliderTrack>
    </RACColorSlider>
  );
}

/* ---------------- ColorWheel ---------------- */

export interface ColorWheelProps
  extends Omit<RACColorWheelProps, "className" | "children" | "outerRadius" | "innerRadius"> {
  /** Außenradius des Rings (Default 100). */
  outerRadius?: number;
  /** Innenradius des Rings (Default 74). */
  innerRadius?: number;
  className?: string;
}

export function ColorWheel({ className, outerRadius = 100, innerRadius = 74, ...props }: ColorWheelProps) {
  return (
    <RACColorWheel
      {...props}
      outerRadius={outerRadius}
      innerRadius={innerRadius}
      className={cx("prn-colorwheel", className)}
    >
      <ColorWheelTrack className="prn-colorwheel-track" />
      <ColorThumb className="prn-color-thumb" />
    </RACColorWheel>
  );
}

/* ---------------- ColorPicker ---------------- */

export interface ColorPickerProps extends Omit<RACColorPickerProps, "children"> {
  /** Beschriftung neben dem Farb-Swatch im Trigger. */
  label?: ReactNode;
  /** Eigene Inhalte des Popovers. Standard: ColorArea + Hue-Slider + ColorField. */
  children?: ReactNode;
  className?: string;
}

export function ColorPicker({ label = "Farbe", children, className, ...props }: ColorPickerProps) {
  return (
    <RACColorPicker {...props}>
      <DialogTrigger>
        <RACButton className={cx("prn-colorpicker-trigger", className)}>
          <ColorSwatch className="prn-colorpicker-swatch" />
          {label && <span className="prn-colorpicker-label">{label}</span>}
          <span className="prn-select-chevron" aria-hidden>⌄</span>
        </RACButton>
        <Popover className="prn-popover prn-colorpicker-popover" placement="bottom start">
          <Dialog className="prn-colorpicker-dialog" aria-label="Farbe wählen">
            {children ?? (
              <>
                <ColorArea
                  colorSpace="hsb"
                  xChannel="saturation"
                  yChannel="brightness"
                  className="prn-colorpicker-area"
                />
                <ColorSlider colorSpace="hsb" channel="hue" />
                <ColorField label="Hex" />
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    </RACColorPicker>
  );
}
