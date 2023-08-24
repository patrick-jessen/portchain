import { Vessel, VesselSchedule } from "../src/lib/models";

import portchain, {
  axiosClient,
  PortchainErrorMessage,
} from "../src/lib/clients/portchain";
import { AxiosError } from "axios";

describe("Module: portchain", () => {
  describe("listVessels", () => {
    it("should return a list of vessels", async () => {
      const vessels: Vessel[] = [
        { imo: "IMO123", name: "Vessel 1" },
        { imo: "IMO456", name: "Vessel 2" },
      ];

      const axiosMock = jest
        .spyOn(axiosClient, "get")
        .mockResolvedValue({ data: vessels });

      const results = await portchain.listVessels();

      expect(axiosMock).toHaveBeenCalledWith("/vessels");
      expect(results).toEqual(vessels);
    });

    it("should throw an error if the request fails", async () => {
      jest.spyOn(axiosClient, "get").mockRejectedValue(new AxiosError("fail"));

      await expect(portchain.listVessels()).rejects.toThrow(
        PortchainErrorMessage.LIST_VESSELS_ERROR
      );
    });
  });

  describe("getVesselSchedule", () => {
    it("should return a vessel schedule", async () => {
      const vesselIMO = "IMO123";
      const schedule: VesselSchedule = {
        vessel: { imo: vesselIMO, name: "Vessel 1" },
        portCalls: [
          {
            arrival: "2019-01-12T03:42:00+00:00",
            departure: "2019-01-12T20:48:00+00:00",
            createdDate: "2018-10-23T00:00:59.510081+00:00",
            isOmitted: false,
            service: "West Africa Express 1",
            port: { id: "BEANR", name: "Antwerpen" },
            logEntries: [
              {
                updatedField: "departure",
                arrival: null,
                departure: "2019-01-08T17:00:00+00:00",
                isOmitted: null,
                createdDate: "2018-10-23T00:00:59.510081+00:00",
              },
            ],
          },
        ],
      };

      const axiosMock = jest
        .spyOn(axiosClient, "get")
        .mockResolvedValue({ data: schedule });

      const results = await portchain.getVesselSchedule(vesselIMO);

      expect(axiosMock).toHaveBeenCalledWith(`/schedule/${vesselIMO}`);
      expect(results).toEqual(schedule);
    });

    it("should throw an error if the request fails", async () => {
      jest.spyOn(axiosClient, "get").mockRejectedValue(new AxiosError("fail"));

      await expect(portchain.getVesselSchedule("IMO123")).rejects.toThrow(
        PortchainErrorMessage.GET_VESSEL_SCHEDULE_ERROR
      );
    });
  });
});
