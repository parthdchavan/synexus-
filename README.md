# Synexus — Embedded System Security Workbench

Synexus is a desktop-first engineering tool for embedded-system security research, hardware glitching, timing analysis, and BLE security experiments (nRF52840, ESP32, FPGA timing, fault injection).

Designed with the density and precision of instruments like Wireshark, Grafana, Datadog, and Linear.

---

## 🛠️ Tech Stack

- **Runtime & Bundler:** Vite + React 19 + TypeScript (strict mode)
- **Styling & Theming:** Tailwind CSS v4, semantic CSS custom properties (System / Light / Dark modes)
- **Typography:** IBM Plex Sans (UI, headings, KPIs) + IBM Plex Mono (timestamps, baud rates, event IDs, hardware registers)
- **Components & Primitives:** Radix UI primitives (`@radix-ui/react-*`), Lucide Icons (`lucide-react`)
- **State & Data Ingest:** TanStack Query, Zustand, Zod runtime schema validation
- **Visualization:** Recharts with responsive SVG sparklines and ingest rate area charts

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+)
- npm / pnpm

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/<your-username>/synexus.git
cd synexus/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
```

---

## 📐 Architecture

- `src/api/`: Decoupled `DataSource` adapter pattern (`MockDataSource` and backend-ready `ApiDataSource`).
- `src/features/`: Modular views:
  - **Overview:** Active experiment monitoring, 4-metric KPI strip with sparklines, real-time ingest rate chart, 5-device hardware matrix, and recent security telemetry.
  - **Live Monitor:** High-throughput streaming event buffer with filter-by-type, filter-by-source, regex search, and inspector.
  - **Devices & Harness:** Serial connection manager with auto-baud and hardware status.
  - **Experiments:** Experiment lifecycle and parameter sweep configurations.
  - **Evidence Captures:** Captured payload inspector and hex dump viewer.
- `src/types/`: Strict TypeScript definitions and Zod schemas for all BLE, target response, and system telemetry events.

---

## 📄 License
MIT
