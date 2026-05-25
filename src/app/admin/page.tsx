import { PrismaClient } from "@prisma/client";
import React from "react";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <main className="min-h-screen p-8 md:p-16 lg:px-24 bg-[#e8f0f8]">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-navy tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-navy/70 font-medium">Manage your automated affiliate products and track performance.</p>
      </header>

      <div className="rounded-3xl p-8 bg-[#e8f0f8] shadow-neu-flat">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-navy">Processed Products</h2>
          <div className="text-sm font-semibold text-navy/60 bg-[#e8f0f8] px-4 py-2 rounded-xl shadow-neu-pressed">
            Total: {products.length}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-navy/50 font-medium">
            No products processed yet. Check your n8n workflow.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-sky/20">
                  <th className="py-4 px-4 font-bold text-navy">Product Title</th>
                  <th className="py-4 px-4 font-bold text-navy">Price</th>
                  <th className="py-4 px-4 font-bold text-navy">AI Score</th>
                  <th className="py-4 px-4 font-bold text-navy">Clicks</th>
                  <th className="py-4 px-4 font-bold text-navy text-right">Added</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-sky/10 hover:bg-sky/5 transition-colors">
                    <td className="py-4 px-4 font-medium text-navy max-w-xs truncate" title={product.title}>
                      <a href={product.link} target="_blank" rel="noopener noreferrer" className="hover:text-sky transition-colors">
                        {product.title}
                      </a>
                    </td>
                    <td className="py-4 px-4 text-gold font-semibold">${product.price.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-neu-pressed ${
                        product.aiScore >= 8 ? 'text-green-600' : product.aiScore >= 6 ? 'text-gold' : 'text-red-500'
                      }`}>
                        {product.aiScore}/10
                      </span>
                    </td>
                    <td className="py-4 px-4 text-navy/80 font-medium">{product.clicks}</td>
                    <td className="py-4 px-4 text-right text-sm text-navy/60">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
