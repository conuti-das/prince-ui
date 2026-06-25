import type { ReactNode } from "react";
import { Button, DialogTrigger, Dialog } from "react-aria-components";
import { Popover } from "@conuti-das/prince-ui";
import type { Bo4eSchema } from "../schema/load-schema";
import { resolveField } from "../schema/load-schema";
import { SchemaPopoverBody } from "./SchemaPopover";

export interface SchemaFieldProps {
  schema: Bo4eSchema;
  boTyp: string;
  fieldKey: string;
  value: unknown;
  children: ReactNode;
}

export function SchemaField({ schema, boTyp, fieldKey, value, children }: SchemaFieldProps) {
  const doc = resolveField(schema, boTyp, fieldKey);
  return (
    <DialogTrigger>
      <Button className="prn-bo-field">{children}</Button>
      <Popover>
        <Dialog className="prn-bo-pop">
          <SchemaPopoverBody fieldKey={fieldKey} doc={doc} value={value} />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
