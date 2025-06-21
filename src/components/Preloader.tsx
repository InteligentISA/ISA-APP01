
const Preloader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center isa-gradient">
      <div className="text-center">
        <div className="mb-8 animate-float">
          <img 
            src="/lovable-uploads/c01498a5-d048-4876-b256-a7fdc6f331ba.png" 
            alt="ISA Logo" 
            className="w-48 h-48 mx-auto animate-pulse-glow"
          />
        </div>
        <div className="space-y-2">
          <div className="w-64 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full isa-gold-bg rounded-full animate-pulse"></div>
          </div>
          <p className="text-white/80 text-sm">Loading your shopping experience...</p>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
