import { Loader } from "@mantine/core";

export default function Loading() {
  return (
    <div className="flex-1 grid justify-center items-center bg-slate-200 w-full animate-pulse rounded-xl">
      <Loader color="blue" type="bars" size={48} />
    </div>
  );
}
