import axios from "axios";
import { Vessel, VesselSchedule } from "../../models";

export enum PortchainErrorMessage {
  LIST_VESSELS_ERROR = "LIST_VESSELS_ERROR",
  GET_VESSEL_SCHEDULE_ERROR = "GET_VESSEL_SCHEDULE_ERROR",
}

export class PortchainError extends Error {
  public cause: any;

  public constructor(message: PortchainErrorMessage, cause?: any) {
    super(message);
    this.name = "PortchainError";
    this.cause = cause;
  }
}

// Exported for use in unit tests
export const axiosClient = axios.create({
  baseURL: process.env.PORTCHAIN_API_URL,
  timeout: 5000,
});

async function listVessels(): Promise<Vessel[]> {
  try {
    const response = await axiosClient.get("/vessels");
    return response.data;
  } catch (error) {
    throw new PortchainError(PortchainErrorMessage.LIST_VESSELS_ERROR, error);
  }
}

async function getVesselSchedule(vesselImo: string): Promise<VesselSchedule> {
  try {
    const response = await axiosClient.get(`/schedule/${vesselImo}`);
    return response.data;
  } catch (error) {
    throw new PortchainError(
      PortchainErrorMessage.GET_VESSEL_SCHEDULE_ERROR,
      error
    );
  }
}

const portchain = {
  listVessels,
  getVesselSchedule,
};

export default portchain;
