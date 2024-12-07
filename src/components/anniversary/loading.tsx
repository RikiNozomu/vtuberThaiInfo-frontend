import { Loader } from "@mantine/core";

async function Loading() {
  return (
    <div className="flex w-full bg-primary/10 rounded-xl p-4 justify-center">
      <Loader color="blue" type="bars" size={48} />
    </div>
  );
}

export { Loading };
