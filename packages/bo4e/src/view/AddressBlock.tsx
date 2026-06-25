import { Icon } from "prince-ui";

export interface Adresse {
  strasse?: string;
  hausnummer?: string;
  postleitzahl?: string;
  ort?: string;
  ortsteil?: string;
  landescode?: string;
}

export function AddressBlock({ adresse }: { adresse: Adresse }) {
  const a = adresse;
  const line1 = [a.strasse, a.hausnummer].filter(Boolean).join(" ");
  const line2 = [a.postleitzahl, a.ort].filter(Boolean).join(" ") + (a.ortsteil ? ` · ${a.ortsteil}` : "");
  return (
    <div className="prn-bo-addr">
      <Icon name="pin" />
      <div>
        {line1 ? <div>{line1}</div> : null}
        <div className="l2">{line2}</div>
        {a.landescode ? <div className="l3">{a.landescode}</div> : null}
      </div>
    </div>
  );
}
