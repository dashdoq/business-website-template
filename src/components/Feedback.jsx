const Feedback = ({ content, name, title, img }) => (
  <figure className="flex flex-col justify-between border-t-2 border-carbon pt-6">
    <blockquote className="text-lg">&ldquo;{content}&rdquo;</blockquote>
    <figcaption className="mt-8 flex items-center gap-4">
      <img src={img} alt="" width="52" height="52" className="h-[52px] w-[52px] rounded-full" />
      <div className="text-base leading-snug">
        <p className="font-semibold">{name}</p>
        <p>{title}</p>
      </div>
    </figcaption>
  </figure>
);

export default Feedback;
