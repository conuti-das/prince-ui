import { useMemo, type FormEvent, type ReactNode } from "react";
import {
  NumberField as RACNumberField, type NumberFieldProps as RACNumberFieldProps,
  Slider as RACSlider, type SliderProps as RACSliderProps,
  Label, Group, Input, Button as RACButton, Text, FieldError,
  SliderTrack, SliderThumb, SliderOutput, useLocale,
} from "react-aria-components";
import { cx } from "../utils";
import { useFieldSize, type FieldSize } from "./size";
import "./forms.css";
import "./numeric.css";

export interface NumberFieldProps extends Omit<RACNumberFieldProps, "className"> {
  label?: ReactNode; description?: ReactNode; errorMessage?: ReactNode; placeholder?: string;
  /** Größe: s (kompakt) | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize; className?: string;
  /** Wert gilt schon beim Tippen: `onChange` bei jeder gültigen Eingabe, nicht erst beim Verlassen des Feldes (wer die Zahl zuletzt tippt und gleich sendet,
   *  sendet den getippten Wert). Gelesen nach dem Gebietsschema (Tausender- und Dezimalzeichen); Grenzen und Rundung gelten wie bisher beim Verlassen.
   *  Ein geleertes Feld meldet `NaN` (wie React Aria beim Verlassen) – so bleibt ein optionales Zahlfeld leer, auch wenn gleich gesendet wird. */
  commitOnInput?: boolean;
}

/** Zahl aus einer Eingabe nach dem Gebietsschema; null, solange die Eingabe (noch) keine Zahl ist („“, „-“, „1,“ zählt als 1). */
export function parseLocaleNumber(text: string, locale: string): number | null {
  const teile = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const gruppe = teile.find((x) => x.type === "group")?.value ?? "";
  const dezimal = teile.find((x) => x.type === "decimal")?.value ?? ".";
  let t = text.trim().replace(/[\s\u00a0\u202f]/g, "").replace(/\u2212/g, "-");
  if (gruppe.trim()) t = t.split(gruppe).join("");
  t = t.replace(dezimal, ".");
  if (t === "" || t === "-" || t === "." || t === "-.") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function NumberField({ label, description, errorMessage, placeholder, size, className, commitOnInput, ...props }: NumberFieldProps) {
  const resolvedSize = useFieldSize(size);
  const { locale } = useLocale();
  const { onChange, minValue, maxValue } = props;
  const beimTippen = useMemo(() => (commitOnInput && onChange ? (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim() === "") { onChange(NaN); return; }
    const n = parseLocaleNumber(e.currentTarget.value, locale);
    if (n !== null && (minValue === undefined || n >= minValue) && (maxValue === undefined || n <= maxValue)) onChange(n);
  } : undefined), [commitOnInput, onChange, locale, minValue, maxValue]);
  return (
    <RACNumberField {...props} data-size={resolvedSize} className={cx("prn-field prn-numberfield", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <Group className="prn-numberfield-group">
        <RACButton slot="decrement" className="prn-numberfield-step">−</RACButton>
        <Input className="prn-input prn-numberfield-input" placeholder={placeholder} onInput={beimTippen} />
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
