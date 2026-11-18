---
"@conuti-das/prince-ui": patch
---

Sidebar: zugeklappte Gruppen (`collapsible`/`defaultCollapsed`) blenden ihre Einträge jetzt wirklich aus –
`display: flex` hob das `hidden`-Attribut auf. Der Gruppentitel verweist mit `aria-controls` auf seine Einträge,
der Chevron ist ein Icon statt des Zeichens „›“ (wirkte in kleiner Schrift wie ein Punkt).
