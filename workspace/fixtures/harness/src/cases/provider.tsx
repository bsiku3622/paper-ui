import { useState, type CSSProperties } from "react";

import { Button, PaperProvider } from "@studio-baeks/paper-ui";

export const ProviderCase = () => {
  const params = new URLSearchParams(window.location.search);
  const sheet = params.get("sheet");
  const custom = params.get("custom");
  const [ready, setReady] = useState(sheet === null);
  return (
    <>
      <style>{params.get("css") ?? ""}</style>
      {sheet ? <link rel="stylesheet" href={sheet} onLoad={() => setReady(true)} onError={() => setReady(true)} /> : null}
      <div data-testid="inline" style={custom ? ({ [custom]: "1px" } as CSSProperties) : undefined} />
      {ready ? <PaperProvider storageKey={null}><Button data-testid="mounted">Mounted</Button></PaperProvider> : null}
    </>
  );
};
