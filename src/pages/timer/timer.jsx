import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import TimerCard from './components/TimerCard/TimerCard';
import TimerBox from './components/TimerBox/TimerBox';
import TimerTop from './components/TimerTop/TimerTop';

export default function TimerPage() {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const { studyId } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchPoints() {
      try {
        const res = await fetch(`${API_URL}/study/${studyId}`);
        const data = await res.json();
        setPoints(data.totalPoints || 0);
      } catch (err) {
        console.error('포인트 불러오기 실패', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
  }, [studyId, API_URL]);

  if (loading) return <p>Loading...</p>;

  return (
    <div
      className="timer-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '5rem',
      }}
    >
      <TimerBox>
        <TimerTop studyId={studyId} points={points} />
        <TimerCard setPoints={setPoints} />
      </TimerBox>
    </div>
  );
}
