async function Loading() {
  return (
    <div className="grid xl:grid-cols-6 lg:grid-cols-4 sm:grid-cols-3 ss:grid-cols-2 h-[300px] md:px-16 gap-3 py-4">
      <div className="bg-slate-400 rounded-lg animate-pulse" />
      <div className="bg-slate-400 rounded-lg animate-pulse ss:block hidden" />
      <div className="bg-slate-400 rounded-lg animate-pulse sm:block hidden" />
      <div className="bg-slate-400 rounded-lg animate-pulse lg:block hidden" />
      <div className="bg-slate-400 rounded-lg animate-pulse xl:block hidden" />
      <div className="bg-slate-400 rounded-lg animate-pulse xl:block hidden" />
    </div>
  );
}

export { Loading };
