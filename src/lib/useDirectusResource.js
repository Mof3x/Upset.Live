import { useEffect, useRef, useState } from "react";

export default function useDirectusResource(
  loader,
  initialData,
  normalize,
  resourceKey = "default"
) {
  const loaderRef = useRef(loader);
  const initialDataRef = useRef(initialData);
  const normalizeRef = useRef(normalize);
  const [state, setState] = useState({
    data: initialData,
    status: "loading",
    error: null,
  });

  useEffect(() => {
    loaderRef.current = loader;
    initialDataRef.current = initialData;
    normalizeRef.current = normalize;
  }, [loader, initialData, normalize]);

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: initialDataRef.current, status: "loading", error: null });

    loaderRef.current({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        const records = Array.isArray(result) ? result : result ? [result] : [];
        const data = Array.isArray(result)
          ? records.map(normalizeRef.current)
          : records[0]
            ? normalizeRef.current(records[0])
            : null;
        setState({ data, status: "success", error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ data: initialDataRef.current, status: "error", error });
      });

    return () => controller.abort();
  }, [resourceKey]);

  return state;
}
