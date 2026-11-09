# AeroCalc ✈️

A lightweight, responsive **aviation unit converter** built with HTML, CSS, and vanilla JavaScript. A small, cockpit-inspired utility for quick reference and aviation study, with no backend, login, or build step.

## What it does

- **Speed:** knots, km/h, mph, m/s
- **Distance:** nautical miles, kilometers, statute miles, meters
- **Altitude:** feet, meters, kilometers
- **Temperature:** Celsius, Fahrenheit, Kelvin
- **Pressure:** hPa, inHg, kPa, mmHg
- Instant conversion while typing, swap units, copy result, and aviation reference cards
- Responsive dark cockpit interface suitable for phones and desktops

## Why I built it

A small aviation-focused web project to make common unit conversions easier to explore in one place, while practicing DOM events, JavaScript arithmetic, accessible controls, and responsive CSS.

## How it works

All conversions run locally in the browser. Speed, distance, altitude, and pressure use unit factors relative to a common base; temperature uses the appropriate offset-and-scale formulas. No user data is sent to a server.


## Accuracy and limitations

Conversion constants use standard definitions, including 1 nautical mile = exactly 1,852 meters and 1 foot = exactly 0.3048 meters. Results are rounded for display. **For educational and general-reference use only.** Do not rely on this website as the sole source for flight planning or operational decisions.
