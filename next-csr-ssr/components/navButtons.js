const NavButtons = () => (
  <nav className="flex flex-col lg:flex-row gap-6 p-2 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 mb-16 max-w-2xl mx-auto">
    {/* CSR Button */}
    <a 
      href="/product-csr" 
      className="group relative bg-gradient-to-br from-orange-400/90 via-orange-500/80 to-red-500/90 
                 hover:from-orange-400 hover:to-orange-600 text-white font-black text-lg px-10 py-6 
                 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 
                 bg-opacity-90 backdrop-blur-lg border border-white/30 hover:border-white/50
                 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent 
                 before:rounded-2xl before:blur before:transition-all before:duration-500 
                 before:group-hover:scale-105 after:absolute after:inset-0 after:rounded-2xl 
                 after:bg-black/10 after:backdrop-blur-sm after:transition-all after:duration-500"
    >
      <span className="relative z-10 flex items-center gap-3">
        🏎️ 
        <span>CSR Product</span>
        <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium group-hover:bg-white/30 transition-all">
          Client-Side
        </span>
      </span>
    </a>

    {/* SSR Button */}
    <a 
      href="/product-ssr"
      className="group relative bg-gradient-to-br from-emerald-400/90 via-emerald-500/80 to-teal-500/90 
                 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-lg px-10 py-6 
                 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 
                 bg-opacity-90 backdrop-blur-lg border border-white/30 hover:border-white/50
                 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent 
                 before:rounded-2xl before:blur before:transition-all before:duration-500 
                 before:group-hover:scale-105 after:absolute after:inset-0 after:rounded-2xl 
                 after:bg-black/10 after:backdrop-blur-sm after:transition-all after:duration-500"
    >
      <span className="relative z-10 flex items-center gap-3">
        ⚡ 
        <span>SSR Product</span>
        <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium group-hover:bg-white/30 transition-all">
          Server-Side
        </span>
      </span>
    </a>
  </nav>
);

export default NavButtons;
