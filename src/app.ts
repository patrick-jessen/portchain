import "dotenv/config";
import express from "express";
import "express-async-errors";

import portchain from "./lib/clients/portchain";
import { analyzePortsByVesselSchedules } from "./lib/analysis/port-analysis";

const app = express();
const fontendRoot = "./frontend/dist";

// Api routes
app.get("/api/analysis", async (req, res) => {
  const vessels = await portchain.listVessels();
  const schedules = await Promise.all(
    vessels.map((vessel) => portchain.getVesselSchedule(vessel.imo))
  );

  const portAnalyses = analyzePortsByVesselSchedules(schedules);
  res.json(portAnalyses);
});

// Single page app
app.use(express.static(fontendRoot));
app.get<string>("*", async (req, res) => {
  res.sendFile("index.html", { root: fontendRoot });
});

export default app;
