const LAB: Record<string, string> = {
  marktlokationsId: "Marktlokations-ID",
  messlokationsId: "Messlokations-ID",
  boTyp: "BO-Typ",
  versionStruktur: "Versionsstruktur",
  eMailAdresse: "E-Mail-Adresse",
  netzbetreiberCodeNr: "Netzbetreiber-Codenr.",
  grundversorgerCodeNr: "Grundversorger-Codenr.",
  rollencodenummer: "Rollencodenummer",
  rollencodetyp: "Rollencodetyp",
  pruefidentifikator: "Prüfidentifikator",
  zugehoerigeMesslokationen: "Zugehörige Messlokationen",
  messtechnischeEinordnung: "Messtechnische Einordnung",
  partneradresse: "Partneradresse",
  lokationsadresse: "Lokationsadresse",
  marktrollen: "Marktrollen",
  zaehlwerke: "Zählwerke",
  verbrauchsmenge: "Verbrauchsmenge",
  geschaeftspartnerrolle: "Geschäftspartnerrolle",
  messstellenbetreiberEigenschaft: "MSB-Eigenschaft",
  transaktionsReferenznummer: "Transaktions-Referenznr.",
  datenaustauschreferenz: "Datenaustauschreferenz",
  ediTyp: "EDI-Typ",
  ediVersion: "EDI-Version",
  ediEmpfangsDatum: "EDI-Empfangsdatum",
  marktpartnerRolle: "Marktpartner-Rolle",
  contrlReferenz: "CONTRL-Referenz",
  transaktionsgrund: "Transaktionsgrund",
  vorgangsnummer: "Vorgangsnummer",
  dokumentennummer: "Dokumentennummer",
  nachrichtendatum: "Nachrichtendatum",
  nachrichtenreferenznummer: "Nachrichtenreferenznummer",
};

export function humanize(key: string): string {
  const known = LAB[key];
  if (known) return known;
  // ALL_CAPS group/enum keys -> Title Case ("ENERGIELIEFERVERTRAG" -> "Energieliefervertrag")
  if (/^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(key)) {
    return key
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");
  }
  const s = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
