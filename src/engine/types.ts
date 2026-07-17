export type EngineRequest = {
  source: File | Blob | string;
  maxDimension: number;
};

export type EngineResponse =
  | {
      type: "stop";
      k: number;
      kEffectiveMax: number;
      index: number;
      total: number;
      blob: Blob;
    }
  | {
      type: "done";
      kEffectiveMax: number;
      width: number;
      height: number;
    }
  | {
      type: "error";
      message: string;
    };
