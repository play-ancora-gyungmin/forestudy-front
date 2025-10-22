import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import styles from './TimerCard.module.css';
import Toast from '../../../../components/Toast/Toast';
import { savePoint } from '../../../../api/PointService/PointService';

const TimerCard = ({ setPoints }) => {
  const { studyId } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [fixedTime, setFixedTime] = useState(null);
  const [inputTimeStr, setInputTimeStr] = useState('25:00');
  const point = 100;

  const [showPauseToast, setShowPauseToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const formatTime = (sec) => {
    const m = String(Math.floor(Math.abs(sec) / 60)).padStart(2, '0');
    const s = String(Math.abs(sec) % 60).padStart(2, '0');
    return sec >= 0 ? `${m}:${s}` : `-${m}:${s}`;
  };

  useEffect(() => {
    if (showPauseToast) {
      const timer = setTimeout(() => setShowPauseToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showPauseToast]);

  const handleReset = useCallback(() => {
    const [m, s] = inputTimeStr.split(':').map(Number);
    setTime(!isNaN(m) && !isNaN(s) ? m * 60 + s : 25 * 60);
    setRunning(false);
    setPaused(false);
    setStarted(false);
    setFixedTime(null);
  }, [inputTimeStr]);

  useEffect(() => {
    let timer;
    if (running) timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const handleStart = () => {
    if (!running) {
      if (!started) {
        setFixedTime(time);
        setStarted(true);
      }
      setRunning(true);
      setPaused(false);
    }
  };

  const handlePause = () => {
    setRunning(false);
    setPaused(true);
    setShowPauseToast(true);
  };

  const handleTimeChange = (e) => {
    if (running) return;
    const [m, s] = e.target.innerText.split(':').map(Number);
    if (!isNaN(m) && !isNaN(s)) setTime(m * 60 + s);
    setInputTimeStr(e.target.innerText);
  };

  const handleStop = async () => {
    if (!running) return;
    setRunning(false);
    setStarted(false);
    console.log('Stop 클릭', { studyId, point });
    try {
      const data = await savePoint(studyId, point);
      console.log('포인트 저장 성공', { data });

      setPoints((prev) => prev + point);

      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        handleReset();
      }, 2500);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('포인트 저장 실패:', err);
    }
  };

  return (
    <div className={styles.timerCard}>
      <h3>오늘의 집중</h3>
      {(started || running || paused) && fixedTime != null && (
        <div className={`${styles.pointBadge} ${styles.timerBadge}`}>
          ⏰{formatTime(fixedTime)}
        </div>
      )}

      <p
        className={`${styles.time} ${running ? styles.running : ''} ${paused ? styles.paused : ''} ${time < 0 ? styles.negative : ''}`}
        contentEditable={!running}
        suppressContentEditableWarning={true}
        onBlur={handleTimeChange}
      >
        {formatTime(time)}
      </p>

      {time < 0 ? (
        <div className={styles.buttonGroup}>
          <button className={styles.stop} onClick={handleStop}>
            ◎ Stop!
          </button>
        </div>
      ) : !started ? (
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.start} ${running || paused ? styles.running : ''}`}
            onClick={handleStart}
          >
            ▶ Start!
          </button>
        </div>
      ) : running ? (
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.roundBtn} ${styles.pause}`}
            onClick={handlePause}
          >
            <span className={styles.pauseLine}></span>
            <span className={styles.pauseLine}></span>
          </button>
          <button
            className={`${styles.start} ${styles.running}`}
            onClick={handleStart}
          >
            ▶ Start!
          </button>
          <button
            className={`${styles.roundBtn} ${styles.reset}`}
            onClick={handleReset}
          >
            ↺
          </button>
        </div>
      ) : (
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.roundBtn} ${styles.pause}`}
            onClick={handlePause}
          >
            <span className={styles.pauseLine}></span>
            <span className={styles.pauseLine}></span>
          </button>
          <button
            className={`${styles.start} ${styles.running} ${styles.paused}`}
            onClick={handleStart}
          >
            ▶ Start!
          </button>
          <button
            className={`${styles.roundBtn} ${styles.reset}`}
            onClick={handleReset}
          >
            ↺
          </button>
        </div>
      )}

      {showPauseToast && (
        <Toast
          message="🚨 집중이 중단되었습니다."
          type="error"
          onClose={() => setShowPauseToast(false)}
        />
      )}
      {showSuccessToast && (
        <Toast
          message={`🎉${point}포인트를 획득했습니다!`}
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
};

export default TimerCard;
