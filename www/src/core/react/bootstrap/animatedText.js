import React from 'react';
import { useSpring, animated, config } from 'react-spring';

const AnimatedText = ({ value, type,onClicks }) => {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.molasses,
  });

  const slideIn = useSpring({
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0%)' },
    config: config.default,
  });

  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration: 1500 },
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('fr-FR').format(val);
  };
  const onclick = () =>
  {
    onClicks()
  }
  return (
    <animated.div style={fadeIn}>
      <animated.h5 style={slideIn} className="card-text" onClick={onclick}>
        {type === 'currency' ? number.interpolate((val) => formatCurrency(val)) : formatNumber(value)}
      </animated.h5>
    </animated.div>
  );
};

export default AnimatedText;
