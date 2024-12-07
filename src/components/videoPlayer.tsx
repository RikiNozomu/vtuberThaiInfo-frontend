"use client";

import { useEffect, useState } from "react";
import ReactPlayer, { ReactPlayerProps } from "react-player";

function VideoPlayer(props: ReactPlayerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient ? <ReactPlayer {...props} /> : <></>;
}

export { VideoPlayer };
