import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabBar, Tab, TabPanel } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Tabs auf Basis von react-aria-components `Tabs`. Die Tab-Leiste wird als `TabBar` (TabList) mit `Tab`-Elementen aufgebaut, die Inhalte als `TabPanel`; Tastatur-Navigation und ARIA-Verknüpfung stammen aus React Aria.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Tabs>
      <TabBar>
        <Tab id="data">Transaktionsdaten</Tab>
        <Tab id="steps">Verarbeitungsschritte</Tab>
        <Tab id="logs">Logs</Tab>
      </TabBar>
      <TabPanel id="data">Stammdaten der Transaktion …</TabPanel>
      <TabPanel id="steps">Verarbeitungsschritte …</TabPanel>
      <TabPanel id="logs">System-Logs …</TabPanel>
    </Tabs>
  ),
};
