
import React, { useState } from 'react';
import './App.css';


const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; // Standard tuning, low E at bottom
const FRETS = 12;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteName(openNote: string, fret: number) {
  const openIdx = NOTE_NAMES.indexOf(openNote);
  return NOTE_NAMES[(openIdx + fret) % 12];
}


function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function getRandomQuiz() {
  // Pick a random string and fret (not open string)
  const stringIdx = getRandomInt(STRINGS.length);
  const fretIdx = 1 + getRandomInt(FRETS); // 1..12
  const correctNote = getNoteName(STRINGS[stringIdx], fretIdx);
  // Pick 2 random incorrect notes
  let options = [correctNote];
  while (options.length < 3) {
    const n = NOTE_NAMES[getRandomInt(12)];
    if (!options.includes(n)) options.push(n);
  }
  // Shuffle options
  options = options.sort(() => Math.random() - 0.5);
  return { stringIdx, fretIdx, correctNote, options };
}


function App() {
  // Local storage keys
  const SCORE_KEY = 'fbk_score';
  const YESTERDAY_KEY = 'fbk_yesterday';
  const DATE_KEY = 'fbk_date';

  // Get today's date as YYYY-MM-DD
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // State
  const [score, setScore] = useState(() => {
    const storedDate = localStorage.getItem(DATE_KEY);
    const storedScore = localStorage.getItem(SCORE_KEY);
    if (storedDate === todayStr() && storedScore) {
      return parseInt(storedScore, 10);
    }
    return 0;
  });
  const [yesterdayScore, setYesterdayScore] = useState(() => {
    const storedDate = localStorage.getItem(DATE_KEY);
    const storedYesterday = localStorage.getItem(YESTERDAY_KEY);
    if (storedDate === todayStr() && storedYesterday) {
      return parseInt(storedYesterday, 10);
    }
    return 0;
  });
  const [quiz, setQuiz] = useState(getRandomQuiz());
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(5);

  // On mount, check if date changed and reset scores if needed
  React.useEffect(() => {
    const storedDate = localStorage.getItem(DATE_KEY);
    if (storedDate !== todayStr()) {
      // Move yesterday's score
      localStorage.setItem(YESTERDAY_KEY, localStorage.getItem(SCORE_KEY) || '0');
      localStorage.setItem(SCORE_KEY, '0');
      localStorage.setItem(DATE_KEY, todayStr());
      setYesterdayScore(parseInt(localStorage.getItem(SCORE_KEY) || '0', 10));
      setScore(0);
    }
  }, []);

  // Persist score and date on change
  React.useEffect(() => {
    localStorage.setItem(SCORE_KEY, score.toString());
    localStorage.setItem(DATE_KEY, todayStr());
  }, [score]);

  // Timer effect
  React.useEffect(() => {
    if (selected !== null) return;
    if (timer === 0) {
      setFeedback('⏰ Time up!');
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
        setQuiz(getRandomQuiz());
        setTimer(5);
      }, 1200);
      return;
    }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, selected]);

  function handleSelect(option: string) {
    if (selected !== null) return;
    setSelected(option);
    if (option === quiz.correctNote) {
      setScore((s) => s + 1);
      setFeedback('✅ Correct!');
    } else {
      setFeedback('❌ Wrong!');
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      setQuiz(getRandomQuiz());
      setTimer(5);
    }, 1200);
  }

  return (
    <div className="App">
      <h1>FretboardKing Trainer</h1>
      <div style={{ marginBottom: 16 }}>
        <span>Score: <b>{score}</b></span>
        <span style={{ marginLeft: 24, color: '#888' }}>Yesterday: {yesterdayScore}</span>
      </div>
      <Fretboard
        highlight={{ stringIdx: quiz.stringIdx, fretIdx: quiz.fretIdx }}
      />
      <div style={{ margin: '24px 0' }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>
          Which note is this? <b>({timer})</b>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          {quiz.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
              style={{
                padding: '12px 24px',
                fontSize: 18,
                background: selected === opt
                  ? (opt === quiz.correctNote ? '#4caf50' : '#e53935')
                  : '#222',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: selected === null ? 'pointer' : 'default',
                opacity: selected !== null && selected !== opt ? 0.7 : 1,
                transition: 'background 0.2s',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        {feedback && (
          <div style={{ marginTop: 12, fontSize: 20 }}>{feedback}</div>
        )}
      </div>
    </div>
  );
}


function Fretboard({ highlight }: { highlight?: { stringIdx: number; fretIdx: number } }) {
  // For each marked fret, render a dot only once, centered vertically
  const markerFrets = [3, 5, 7, 9, 12];
  return (
    <div style={{ position: 'relative', width: '80vw', maxWidth: '1200px', margin: '0 auto' }}>
      <table
        className="fretboard"
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          tableLayout: 'fixed',
        }}
      >
        <tbody>
          {STRINGS.map((string, sIdx) => (
            <tr key={sIdx}>
              {[...Array(FRETS + 1)].map((_, fIdx) => {
                const isHighlight =
                  highlight && sIdx === highlight.stringIdx && fIdx === highlight.fretIdx;
                return (
                  <td
                    key={fIdx}
                    style={{
                      border: '1px solid #555',
                      width: fIdx === 0 ? 40 : 'auto',
                      height: 40,
                      background: fIdx === 0
                        ? '#333'
                        : isHighlight
                          ? '#1976d2'
                          : '#222',
                      color: fIdx === 0 ? '#fff' : '#aaa',
                      textAlign: 'center',
                      position: 'relative',
                      padding: 0,
                    }}
                  >
                    {fIdx === 0 ? string : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Render marker dots absolutely over the table, one per marked fret */}
      {markerFrets.map((fret) => (
        <span
          key={fret}
          style={{
            position: 'absolute',
            left: `calc(${((fret) / (FRETS + 1)) * 100}% + 40px / 2)`, // 40px for string label col
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 0 2px #000',
            opacity: 0.85,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}

export default App;
