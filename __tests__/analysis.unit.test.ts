import { Percentile, VesselSchedule } from "../src/lib/models";
import { analyzePortsByVesselSchedules } from "../src/lib/analysis/port-analysis";

describe("Module: analysis", () => {
  describe("analyzePortsByVesselSchedules", () => {
    it("analyzes vessel schedules, ignores omitted", () => {
      const schedules: VesselSchedule[] = [
        {
          vessel: {
            imo: "imo2",
            name: "vessel2",
          },
          portCalls: [
            {
              arrival: "2019-01-01T00:00:00+00:00",
              departure: "2019-01-02T00:00:00+00:00",
              createdDate: "2018-10-23T00:00:59.510081+00:00",
              isOmitted: false,
              service: "West Africa Express 1",
              port: { id: "BEANR", name: "Antwerpen" },
              logEntries: [],
            },
          ],
        },
        {
          vessel: {
            imo: "imo1",
            name: "vessel1",
          },
          portCalls: [
            {
              arrival: "2019-01-01T00:00:00+00:00",
              departure: "2019-01-02T00:00:00+00:00",
              createdDate: "2018-10-23T00:00:59.510081+00:00",
              isOmitted: true,
              service: "West Africa Express 1",
              port: { id: "BEANR", name: "Antwerpen" },
              logEntries: [],
            },
            {
              arrival: "2019-01-01T00:00:00+00:00",
              departure: "2019-01-03T00:00:00+00:00",
              createdDate: "2018-10-23T00:00:59.510081+00:00",
              isOmitted: false,
              service: "West Africa Express 1",
              port: { id: "BEANR", name: "Antwerpen" },
              logEntries: [],
            },
            {
              arrival: "2019-01-01T00:00:00+00:00",
              departure: "2019-01-03T00:00:00+00:00",
              createdDate: "2018-10-23T00:00:59.510081+00:00",
              isOmitted: false,
              service: "West Africa Express 1",
              port: { id: "DEHAM", name: "Hamburg" },
              logEntries: [],
            },
          ],
        },
      ];

      const dayInMs = 24 * 60 * 60 * 1000;

      const portAnalyses = analyzePortsByVesselSchedules(schedules);
      expect(portAnalyses).toHaveLength(2);
      expect(portAnalyses[0].port.id).toEqual("BEANR");
      expect(portAnalyses[0].portCalls).toHaveLength(2);
      expect(portAnalyses[0].durationPercentiles).toEqual({
        [Percentile.P05]: dayInMs,
        [Percentile.P20]: dayInMs,
        [Percentile.P50]: dayInMs,
        [Percentile.P75]: dayInMs * 2,
        [Percentile.P90]: dayInMs * 2,
      });
      expect(portAnalyses[1].port.id).toEqual("DEHAM");
      expect(portAnalyses[1].portCalls).toHaveLength(1);
      expect(portAnalyses[1].durationPercentiles).toEqual({
        [Percentile.P05]: dayInMs * 2,
        [Percentile.P20]: dayInMs * 2,
        [Percentile.P50]: dayInMs * 2,
        [Percentile.P75]: dayInMs * 2,
        [Percentile.P90]: dayInMs * 2,
      });
    });

    it("returns empty array if no schedules", () => {
      const schedules: VesselSchedule[] = [];

      const portAnalyses = analyzePortsByVesselSchedules(schedules);
      expect(portAnalyses).toHaveLength(0);
    });

    it("handles invalid input", () => {
      expect(() => analyzePortsByVesselSchedules(null as any)).toThrowError(
        "Invalid schedules"
      );
    });
  });
});
