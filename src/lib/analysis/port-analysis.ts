import percentile from "percentile";
import { Percentile, PortAnalysis, VesselSchedule } from "../models";

export function analyzePortsByVesselSchedules(
  schedules: VesselSchedule[]
): PortAnalysis[] {
  if (!Array.isArray(schedules)) {
    throw new TypeError("Invalid schedules");
  }

  // Extract port info from schedules
  const portAnalyses: Record<string, PortAnalysis> = {};
  for (const schedule of schedules) {
    for (const portCall of schedule.portCalls) {
      if (portCall.isOmitted) {
        continue;
      }

      const portId = portCall.port.id;

      if (!portAnalyses[portId]) {
        portAnalyses[portId] = {
          port: portCall.port,
          portCalls: [],
          durationPercentiles: {
            [Percentile.P05]: 0,
            [Percentile.P20]: 0,
            [Percentile.P50]: 0,
            [Percentile.P75]: 0,
            [Percentile.P90]: 0,
          },
        };
      }

      portAnalyses[portId].portCalls.push(portCall);
    }
  }

  // Sort by number of port calls (ascending)
  const portAnalysesArray = Object.values(portAnalyses);
  portAnalysesArray.sort((a, b) => {
    const aNumPortCalls = a.portCalls.length;
    const bNumPortCalls = b.portCalls.length;
    return bNumPortCalls - aNumPortCalls;
  });

  // Calculate percentiles of port call durations
  for (const analysis of portAnalysesArray) {
    const durations = analysis.portCalls.map(
      (portCall) =>
        new Date(portCall.departure).getTime() -
        new Date(portCall.arrival).getTime()
    );

    const percentiles = percentile([5, 20, 50, 75, 90], durations) as number[];

    analysis.durationPercentiles = {
      [Percentile.P05]: percentiles[0],
      [Percentile.P20]: percentiles[1],
      [Percentile.P50]: percentiles[2],
      [Percentile.P75]: percentiles[3],
      [Percentile.P90]: percentiles[4],
    };
  }

  return portAnalysesArray;
}
