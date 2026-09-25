# DIY Furniture

Configurator for simple DIY furniture. Enter dimensions to get a material list, panel layout, hardware, and assembly instructions.
Shows approximate prices for materials from jumbo.ch

Two furniture types:

- **Sideboard** – shelves, sideboards or cupboards with optional doors.
- **Reduit** – shelving for a small storage room: straight, L- or U-shaped, freestanding modules or built in (battens, wall rails, shelf brackets, uprights with pin holes, or a post frame), with optional niches for a vacuum cleaner and warnings for door clearance, passage width and shelf sag.

You can use it here: https://m-hertig.github.io/diy-furniture/

## Local development

No build step. Serve the folder and open it in a browser:

```sh
python3 -m http.server 8000
# http://localhost:8000/
```

Files:

- `index.html` – form, rendering, 3D preview
- `preise.js` – prices, thicknesses and panel sizes (data only, updated by `tools/jumbo-preise.mjs --schreiben`)
- `shared.js` – material catalogs, panel packing, joint hardware
- `sideboard.js` – sideboard calculation
- `reduit.js` – reduit calculation (layout, support systems, prices)

Notes for continuing work (open prices, ideas): `docs/WEITERARBEIT.md`.

Tests (Node 18+, no dependencies):

```sh
node --test
```
