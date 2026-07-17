import { useEffect, useRef, useState } from "react";
import SvdWorker from "./svd.worker?worker";
import type { EngineRequest, EngineResponse } from "./types";

export type SvdStop = { k: number; src: string };

export type SvdStackState =
  | { status: "idle" }
  | { status: "processing"; loaded: number; total: number }
  | {
      status: "done";
      stops: SvdStop[];
      kEffectiveMax: number;
      width: number;
      height: number;
    }
  | { status: "error"; message: string };

export function useSvdStack(
  source: File | string | null,
  options: { maxDimension?: number } = {},
): SvdStackState {
  const { maxDimension = 520 } = options;
  const [state, setState] = useState<SvdStackState>({ status: "idle" });
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];

    if (!source) {
      setState({ status: "idle" });
      return;
    }

    const worker = new SvdWorker();
    const stops: SvdStop[] = [];

    setState({ status: "processing", loaded: 0, total: 0 });

    worker.onmessage = (event: MessageEvent<EngineResponse>) => {
      const message = event.data;

      switch (message.type) {
        case "stop": {
          const url = URL.createObjectURL(message.blob);
          objectUrlsRef.current.push(url);
          stops.push({ k: message.k, src: url });
          setState({
            status: "processing",
            loaded: message.index + 1,
            total: message.total,
          });
          break;
        }
        case "done": {
          setState({
            status: "done",
            stops: [...stops],
            kEffectiveMax: message.kEffectiveMax,
            width: message.width,
            height: message.height,
          });
          break;
        }
        case "error": {
          setState({ status: "error", message: message.message });
          break;
        }
      }
    };

    worker.onerror = (event) => {
      setState({ status: "error", message: event.message });
    };

    const request: EngineRequest = { source, maxDimension };
    worker.postMessage(request);

    return () => {
      worker.terminate();
    };
  }, [source, maxDimension]);

  useEffect(() => {
    const urls = objectUrlsRef.current;

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  return state;
}
