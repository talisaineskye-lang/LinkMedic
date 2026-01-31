'use client';

export function VideoDemo() {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden bg-[#020617]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
            Demo
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 tracking-tight text-white">
            See It In Action
          </h2>
          <p className="text-slate-400 mt-4">
            Watch how fast you can find and fix broken links
          </p>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
          <video
            width="100%"
            height="auto"
            controls
            playsInline
            preload="auto"
          >
            <source src="/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
