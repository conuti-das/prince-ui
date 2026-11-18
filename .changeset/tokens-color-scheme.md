---
"@conuti-das/prince-ui-tokens": patch
---

`color-scheme` nur noch unter `:root:not([data-theme])` und den prince-Themes statt am nackten `:root`.
Anwendungen mit eigenem `data-theme` (z. B. neben einem anderen Design-System) behalten ihr `color-scheme`;
ohne `data-theme` bleibt der Fallback Dunkel wie bisher.
