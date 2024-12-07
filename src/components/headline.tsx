export default function Headline(props: {
  title: any;
}) {
  return (
    <div className="flex flex-col w-full h-fit text-primary sm:gap-1 sm:text-4xl text-2xl font-bold">
      {props.title}
      <div className="w-full rounded-sm sm:h-2 h-1 bg-gradient-to-r from-primary" />
    </div>
  );
}
