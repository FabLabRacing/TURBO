# TURBO Enclosure — Raspberry Pi Zero 2 W + TURBO HAT

This directory contains the **3D-printable enclosure design** used for the TURBO project.

The enclosure is designed specifically for:

- **Raspberry Pi Zero 2 W**
- **TURBO HAT** (USB gadget / power / run-lock hardware)

It is intended to turn TURBO into a **small, durable, appliance-style device** suitable for use near CNC equipment.

---

## What’s Included

- `.3mf` enclosure file
  - Preserves correct units, orientation, and part relationships
  - Compatible with Bambu Studio, PrusaSlicer, Fusion 360, and other modern slicers

---

## Hardware Compatibility

**Supported:**
- Raspberry Pi Zero 2 W
- TURBO HAT (current revision)

**Not supported:**
- Raspberry Pi Zero (original)
- Raspberry Pi 3 / 4
- Alternate or stacked HATs

The enclosure is intentionally **not universal**. It matches the supported hardware for mainline TURBO.

---

## Printing Recommendations

These are guidelines, not hard requirements.

- **Material:** PLA or PETG
  - PLA is sufficient for indoor shop use
  - PETG recommended for higher temperatures or rough environments
- **Layer height:** 0.20 mm
- **Wall count:** 3–4 perimeters
- **Infill:** 15–25% (gyroid or cubic)
- **Supports:** Not required (designed to print support-free)

---

## Orientation

- Import the `.3mf` file as-is
- No scaling should be required

If your slicer prompts about unit conversion, **do not rescale**.

---

## Assembly Notes

- Install the Pi Zero 2 W and TURBO HAT before closing the enclosure
- Ensure the USB data cable exits cleanly without strain
- Use short USB cables where possible to reduce leverage on the connector

No adhesives are required.

---

## Customization

You are encouraged to:

- Remix the enclosure
- Add mounting tabs or magnets
- Modify cable exits or ventilation

This design is provided as a **starting point**, not a locked-down product.

---

## License

The enclosure design is released under the **MIT License**, the same as the TURBO software.

You may use, modify, and distribute it freely, including for commercial use.

---

## Disclaimer

This enclosure is provided **as-is**.

Always verify fit and clearance before connecting TURBO to production equipment.

