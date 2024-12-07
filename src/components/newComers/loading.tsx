export default async function NewCommerLoading() {
  return (
    <div className="w-full h-[300px] rounded flex flex-row gap-3">
      <div className="bg-slate-400 rounded animate-pulse my-4 flex-1" />
      <div className="bg-slate-400 rounded animate-pulse my-4 flex-1" />
      <div className="bg-slate-400 rounded animate-pulse my-4 flex-1 ss:block hidden" />
      <div className="bg-slate-400 rounded animate-pulse my-4 flex-1 hidden sm:block lg:hidden xl:block" />
    </div>
  );
}
