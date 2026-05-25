export default function UGCVideoSection() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-navy mb-4">See It In Action</h2>
        <p className="text-navy/70 max-w-2xl mx-auto">
          Real reviews from our community. Watch how these products perform in everyday situations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-3xl p-4 bg-[#e8f0f8] shadow-neu-flat">
            <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-neu-pressed bg-[#d1dce5] flex items-center justify-center group cursor-pointer">
              {/* Play Button Placeholder */}
              <div className="w-16 h-16 rounded-full bg-[#e8f0f8] shadow-neu-flat flex items-center justify-center transition-all duration-300 group-hover:shadow-neu-pressed">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-gold border-b-8 border-b-transparent ml-1"></div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="bg-[#e8f0f8]/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-navy shadow-neu-flat">
                  Video {item} Placeholder
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
