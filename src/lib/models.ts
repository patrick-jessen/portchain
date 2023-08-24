export enum Percentile {
  P05 = "P05",
  P20 = "P20",
  P50 = "P50",
  P75 = "P75",
  P90 = "P90",
}

export type Port = {
  id: string;
  name: string;
};

export type PortAnalysis = {
  port: Port;
  portCalls: PortCall[];
  durationPercentiles: Record<Percentile, number>;
};

export type PortCall = {
  arrival: string;
  departure: string;
  createdDate: string;
  isOmitted: boolean;
  service: string;
  port: Port;
  logEntries: PortCallLogEntry[];
};

export type PortCallLogEntry = {
  updatedField: string;
  arrival: string | null;
  departure: string | null;
  isOmitted: boolean | null;
  createdDate: string;
};

export type Vessel = {
  imo: string;
  name: string;
};

export type VesselSchedule = {
  vessel: Vessel;
  portCalls: PortCall[];
};
