"use client";

import {
  PartialVarsResolver,
  Timeline,
  TimelineFactory,
  TimelineItem,
} from "@mantine/core";
import { timeline } from "../../drizzle/schema";
import { convertDate, convertTimelineType } from "@/utils";

type props = {
  data: (typeof timeline.$inferSelect)[];
};

const varsResolver: PartialVarsResolver<TimelineFactory> = (theme, props) => {
  return {
    root: {
      "--tl-color": "#1f4056",
    },
  };
};

function TimelineComp({ data }: props) {
  return (
    <Timeline
      classNames={{
        itemBullet: "pl-4",
        root: "pl-10",
        itemContent: "flex flex-col",
        itemBody: "pl-2",
      }}
      vars={varsResolver}
      active={data.length}
      className="w-full p-4 shadow-inner bg-slate-100 rounded md:text-xl"
      bulletSize={32}
    >
      {data.map((timeline) => (
        <TimelineItem key={timeline.id}>
          <b>{convertDate(timeline)}</b>
          {timeline.type != "OTHER" && (
            <u>{convertTimelineType(timeline.type as string)}</u>
          )}
          {timeline.value && <span>{timeline.value}</span>}
        </TimelineItem>
      ))}
    </Timeline>
  );
}

export { TimelineComp };
