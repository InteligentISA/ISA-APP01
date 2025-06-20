
const Preloader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center isa-gradient">
      <div className="text-center">
        <div className="mb-8 animate-float">
          <img 
            src="/lovable-uploads/216ed5fd-182f-42f9-9af9-a8e6b5a633d9.png" 
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
