import React from 'react';

const SpinningCoin = ({ size = 165, speed = '4s' }) => {
  return (
    <div style={{ display: 'inline-block', textAlign: 'center' }}>
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          margin: '0 auto',
          perspective: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          className="yogis-spinning-coin-wrapper"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            animation: `yogisCoinSpinLeftToRight ${speed} linear infinite`,
            willChange: 'transform'
          }}
        >
          {/* Front Face */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(2px)',
              filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.12))'
            }}
          >
            <img 
              src="/yogis_farms_coin_smooth_360_spin.svg" 
              alt="Yogi's Points Coin" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = 'true';
                  e.currentTarget.src = "/assets/imgs/theme/yogis-coin.png";
                }
              }}
            />
          </div>

          {/* Back Face - so as it spins, both sides show the coin crisp & readable */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(2px)',
              filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.12))'
            }}
          >
            <img 
              src="/yogis_farms_coin_smooth_360_spin.svg" 
              alt="Yogi's Points Coin" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = 'true';
                  e.currentTarget.src = "/assets/imgs/theme/yogis-coin.png";
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Synchronized ground shadow */}
      <div 
        className="yogis-spinning-coin-shadow"
        style={{
          width: `${size * 0.72}px`,
          height: '10px',
          background: 'radial-gradient(ellipse at center, rgba(150, 96, 35, 0.35) 0%, rgba(150, 96, 35, 0) 70%)',
          borderRadius: '50%',
          margin: '6px auto 0 auto',
          animation: `yogisCoinShadowPulse ${speed} linear infinite`
        }}
      />

      <style>{`
        @keyframes yogisCoinSpinLeftToRight {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        @keyframes yogisCoinShadowPulse {
          0% {
            transform: scaleX(1);
            opacity: 0.8;
          }
          25% {
            transform: scaleX(0.35);
            opacity: 0.35;
          }
          50% {
            transform: scaleX(1);
            opacity: 0.8;
          }
          75% {
            transform: scaleX(0.35);
            opacity: 0.35;
          }
          100% {
            transform: scaleX(1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default SpinningCoin;
