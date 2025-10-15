import myPlugLogo from '@/assets/myplug-logo.png';

const Preloader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(246, 132, 4)' }}>
      <div className="text-center">
        <div className="animate-pulse-blur">
          <img 
            src={myPlugLogo}
            alt="MyPlug Logo" 
            className="w-48 h-48 mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
