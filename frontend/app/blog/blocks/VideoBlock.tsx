interface VideoBlockProps {
  id_video?: string;
  text?: string;
}

export default function VideoBlock({ id_video, text }: VideoBlockProps) {
  if (!id_video) {
    return null;
  }

  // Sanitize: accept only YouTube-safe characters to prevent XSS via ACF injection
  const safeVideoId = id_video.replace(/[^a-zA-Z0-9_-]/g, "");

  if (!safeVideoId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${safeVideoId}`;

  return (
    <article className="video-block">
      <div className="relative w-full h-[10.1875rem] md:h-[20.8125rem] lg:h-[21.6875rem] rounded-lg overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          title="Video do conteudo"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {text && <p className="mt-4 text-xs md:text-sm text-low-dark-blue">{text}</p>}
    </article>
  );
}
