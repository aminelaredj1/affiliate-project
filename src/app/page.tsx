import AffiliateProductCard from "@/components/AffiliateProductCard";
import UGCVideoSection from "@/components/UGCVideoSection";

export default function Home() {
  const products = [
    {
      title: "Premium Wireless Headphones",
      description: "Experience crystal clear audio with active noise cancellation. Perfect for commutes and deep focus sessions.",
      imageUrl: "",
      affiliateUrl: "https://example.com/product1",
      price: "$299.99"
    },
    {
      title: "Ergonomic Office Chair",
      description: "Designed for 8+ hours of comfort. Features adjustable lumbar support and breathable mesh.",
      imageUrl: "",
      affiliateUrl: "https://example.com/product2",
      price: "$199.50"
    },
    {
      title: "Smart Home Hub",
      description: "Control all your devices from one sleek interface. Compatible with all major smart home ecosystems.",
      imageUrl: "",
      affiliateUrl: "https://example.com/product3",
      price: "$129.00"
    },
    {
      title: "Mechanical Keyboard",
      description: "Tactile switches and customizable RGB lighting. Built for typists and gamers alike.",
      imageUrl: "",
      affiliateUrl: "https://example.com/product4",
      price: "$149.99"
    },
    {
      title: "4K Action Camera",
      description: "Capture your adventures in stunning detail. Waterproof up to 10m without a case.",
      imageUrl: "",
      affiliateUrl: "https://example.com/product5",
      price: "$349.00"
    },
    {
      title: "Portable Power Bank",
      description: "20,000mAh capacity with fast charging capabilities. Never run out of battery on the go.",
      imageUrl: "",
      affiliateUrl: "https://example.com/product6",
      price: "$49.99"
    }
  ];

  return (
    <main className="min-h-screen p-8 md:p-16 lg:px-24">
      {/* Header */}
      <header className="mb-16 text-center">
        <div className="inline-block p-6 rounded-[2rem] bg-[#e8f0f8] shadow-neu-flat mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy tracking-tight">
            Ammazka <span className="text-gold">Finds</span>
          </h1>
        </div>
        <p className="text-xl text-navy/80 max-w-2xl mx-auto font-medium">
          Curated tech and lifestyle products tested by our community.
        </p>
      </header>

      {/* Product Grid Section */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-navy">Top Reviews</h2>
          <div className="h-1 flex-grow ml-8 bg-[#e8f0f8] shadow-neu-pressed rounded-full hidden md:block"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product, index) => (
            <AffiliateProductCard key={index} {...product} />
          ))}
        </div>
      </section>

      {/* UGC Videos */}
      <UGCVideoSection />

      {/* Footer */}
      <footer className="mt-24 pt-8 border-t border-sky/20 text-center text-navy/60">
        <p>© {new Date().getFullYear()} Ammazka Affiliate Hub. All rights reserved.</p>
      </footer>
    </main>
  );
}
