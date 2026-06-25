import { Icon } from "@conuti-das/prince-ui";

export interface ContactPerson {
  anrede?: string;
  name1?: string;
  name2?: string;
  name3?: string;
  eMailAdresse?: string;
  kontaktweg?: string[];
  geschaeftspartnerrolle?: string[];
}

export function ContactLine({ person }: { person: ContactPerson }) {
  const name = [person.anrede, person.name1, person.name2, person.name3].filter(Boolean).join(" ");
  const init = `${person.name1?.[0] ?? ""}${person.name2?.[0] ?? ""}`.toUpperCase();
  const kw = person.kontaktweg ?? [];
  const sub = [(person.geschaeftspartnerrolle ?? []).join(", "), person.eMailAdresse].filter(Boolean).join(" · ");
  return (
    <div className="prn-bo-contact">
      <div className="av">{init}</div>
      <div>
        <div className="cn">{name}</div>
        {sub ? <div className="csub">{sub}</div> : null}
      </div>
      <div className="cways">
        <a
          className="cway"
          data-off={!kw.includes("E_MAIL")}
          href={person.eMailAdresse ? `mailto:${person.eMailAdresse}` : undefined}
          aria-label="E-Mail"
        >
          <Icon name="mail" />
        </a>
        <span className="cway" data-off={!kw.includes("TELEFONAT")} aria-label="Telefon">
          <Icon name="phone" />
        </span>
      </div>
    </div>
  );
}
