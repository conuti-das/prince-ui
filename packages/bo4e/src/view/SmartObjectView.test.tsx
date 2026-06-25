import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { loadBo4eSchema } from "../schema/load-schema";
import { SmartObjectView } from "./SmartObjectView";
import cdoc from "../__fixtures__/cdoc-example.json";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";
import type { Bo4eObject, CDoc } from "../types";

const schema = loadBo4eSchema({ fields, enums, bos });
const malo = (cdoc as CDoc).content.OUTBOUND!.stammdaten.MARKTLOKATION![0] as Bo4eObject;

describe("SmartObjectView (Marktlokation)", () => {
  it("renders identity + marktrollen and expands to full detail", async () => {
    render(<SmartObjectView schema={schema} obj={malo} now={new Date("2026-06-25T12:00:00Z")} />);
    expect(screen.getByText(/MaLo 10037104444/)).toBeInTheDocument();
    expect(screen.getByText(/Marktrollen ·/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Alle Details/ }));
    expect(screen.getByText(/Bilanzierungsgebiet/i)).toBeInTheDocument();
  });
});
