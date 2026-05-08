import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/30 min-w-[60px]">
        <span className="text-xl font-black">{timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}</span>
        <span className="text-[10px] uppercase font-bold opacity-80">{interval === 'days' ? 'Ngày' : interval === 'hours' ? 'Giờ' : interval === 'minutes' ? 'Phút' : 'Giây'}</span>
      </div>
    );
  });

  return (
    <div className="flex gap-2">
      {timerComponents.length > 0 ? timerComponents : <span className="font-bold">Hết hạn!</span>}
    </div>
  );
};

export default CountdownTimer;