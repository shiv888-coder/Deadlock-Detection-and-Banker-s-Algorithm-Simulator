# Deadlock Detection and Banker's Algorithm Simulator

An interactive Operating System educational web application built for simulating **Banker's Safety Algorithm**, **Resource-Request Verification**, **Multi-Instance Deadlock Detection**, and **Step-by-Step Execution Visualization** entirely in the browser.

## Project Information

- **Project Title:** Deadlock Detection and Banker's Algorithm Simulator
- **Subject:** Operating System (B.Tech Computer Science, 3rd Year Mini-Project)
- **Project Group:** Group 9
- **Project Duration:** 25 Hours

### Group Members

| S.No. | Student Name | Roll Number | Section |
| :---: | :--- | :---: | :---: |
| 1 | VIKASH KUMAR | `27600124044` | A |
| 2 | VIKASH KUMAR | `27600124045` | A |
| 3 | SANIYA PRAVEEN | `27600124046` | A |
| 4 | RUPESH KUMAR KHAIRWAR | `27600124047` | A |
| 5 | SHIVSHANKAR MAL | `27600124048` | A |

---

## Core Modules & Features

1. **Dashboard**: Real-time summary of total processes, resource types, total allocated vs. available units, live Banker's safety status, last simulation result, resource pool utilization bars, and quick actions.
2. **Banker's Algorithm**: Full safety check (`Need = Maximum − Allocation`), dynamic matrix sizing, Work/Finish/Safe Sequence display, and an interactive Resource-Request evaluator.
3. **Deadlock Detection**: Separate multi-instance deadlock detection using Allocation, Current Request, and Available vectors with `Finish[i]` initialization based on whether `Allocation[i] != 0`, plus a live comparison between Unsafe States and Active Deadlocks.
4. **Resource Allocation Manager**: Add/remove processes and resource types, rename laboratory devices, edit total system capacities, validate constraints in real time (blocking negative values, `Allocation > Maximum`, and `Total Allocated > Capacity`), and save custom scenarios to `localStorage`.
5. **Step-by-Step Simulation Visualizer**: Play, Pause, Next Step, Previous Step, Reset, and adjustable playback speed showing Previous Work, selected process, eligibility checks, released resources, updated Work, Finish array progression, and highlighted matrix rows.
6. **Algorithm Explanation**: Plain-English OS concepts covering Operating Systems, Processes, Deadlocks, Four Coffman Conditions, Safe vs. Unsafe States (with SVG state-space diagram), Banker's Algorithm, and Avoidance vs. Detection comparison.
7. **Sample Problems**: Four mathematically verified predefined datasets (Safe System, Unsafe System, Active Deadlock with 4 deadlocked processes, and 4-Resource Lab Allocation) plus saved custom scenarios.
8. **Viva Questions**: 28 categorized Operating System viva questions with search, topic filters, expandable answers, and self-study review tracking.
9. **About Project**: Complete project metadata, student roster, and architecture overview.

---

## Technology Stack

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4** (with Light & Dark mode)
- **React Router DOM**
- **Lucide React**
- 100% browser-based calculations with `localStorage` persistence (no backend or external APIs required)

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Run algorithm unit tests
npx tsx --test src/algorithms/simulator.test.ts

# 4. Run TypeScript type check and production build
npm run lint
npm run build
```

---

## Deploying to Render Static Site

This project is pre-configured for **Render Static Site** hosting via both `render.yaml` and `public/_redirects`.

### Option A: Render Dashboard (Manual Static Site)

1. Push this repository to GitHub or GitLab.
2. Open [Render](https://render.com) and choose **New → Static Site**.
3. Connect your repository and configure:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Under **Redirects / Rewrites**, add a SPA rewrite rule so direct route refreshes work cleanly:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
5. Click **Create Static Site**.

### Option B: Render Blueprint (`render.yaml`)

This repository includes a ready-to-use `render.yaml` file with the build command, `dist` publish directory, and `/* -> /index.html` SPA rewrite rule already configured. Select **New → Blueprint** in Render and point it to this repository.
