
import React, { useState } from 'react';
// Settings keys
const SETTINGS_KEY = 'fbk_settings';

type Settings = {
  showStringNames: boolean;
  fretboardColor: string;
};

function getDefaultSettings(): Settings {
  return {
    showStringNames: true,
    fretboardColor: '#222',
  };
}
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
  // Settings state
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      return { ...getDefaultSettings(), ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch {
      return getDefaultSettings();
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Persist settings
  React.useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);
  // Settings handlers
  function handleToggleStringNames() {
    setSettings((s) => ({ ...s, showStringNames: !s.showStringNames }));
  }
  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSettings((s) => ({ ...s, fretboardColor: e.target.value }));
  }
  // Local storage keys
  const SCORE_KEY = 'fbk_score';
  const YESTERDAY_KEY = 'fbk_yesterday';
  const DATE_KEY = 'fbk_date';
  const HISTORY_KEY = 'fbk_history'; // { 'YYYY-MM-DD': score, ... }

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
  // Score history: { 'YYYY-MM-DD': score, ... }
  const [history, setHistory] = useState<{ [date: string]: number }>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    } catch {
      return {};
    }
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
      // Add yesterday's score to history
      setHistory((prev) => {
        const newHist = { ...prev };
        const yest = storedDate || todayStr();
        newHist[yest] = parseInt(localStorage.getItem(SCORE_KEY) || '0', 10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHist));
        return newHist;
      });
    }
  }, []);

  // Persist score, date, and history on change
  React.useEffect(() => {
    localStorage.setItem(SCORE_KEY, score.toString());
    localStorage.setItem(DATE_KEY, todayStr());
    setHistory((prev) => {
      const newHist = { ...prev, [todayStr()]: score };
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHist));
      return newHist;
    });
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
      setFeedback(`❌ Wrong! The correct answer was: ${quiz.correctNote}`);
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      setQuiz(getRandomQuiz());
      setTimer(5);
    }, 1200);
  }

  // Get last 30 days for chart
  function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  return (
    <div className="App">
      {/* Settings button */}
      <button
        aria-label="Settings"
        onClick={() => setSettingsOpen(true)}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 28,
          zIndex: 10,
        }}
      >
        <span role="img" aria-label="Settings">⚙️</span>
      </button>

      <h1>FretboardKing Trainer</h1>
      <div style={{ marginBottom: 16 }}>
        <span>Score: <b>{score}</b></span>
        <span style={{ marginLeft: 24, color: '#888' }}>Yesterday: {yesterdayScore}</span>
      </div>
      <BarChart history={history} getLast30Days={getLast30Days} />
      <Fretboard
        highlight={{ stringIdx: quiz.stringIdx, fretIdx: quiz.fretIdx }}
        showStringNames={settings.showStringNames}
        fretboardColor={settings.fretboardColor}
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

      {/* Settings Modal */}
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setSettingsOpen(false)}
        >
          <div
            style={{
              background: '#222',
              color: '#fff',
              borderRadius: 12,
              minWidth: 320,
              maxWidth: 400,
              padding: 24,
              boxShadow: '0 4px 32px #0008',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              onClick={() => setSettingsOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 22,
                cursor: 'pointer',
              }}
            >✖️</button>
            <h2 style={{ marginTop: 0 }}>Settings & Stats</h2>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ margin: '12px 0 6px 0', fontSize: 16 }}>Stats</h3>
              <BarChart history={history} getLast30Days={getLast30Days} />
            </div>
            <div>
              <h3 style={{ margin: '12px 0 6px 0', fontSize: 16 }}>Settings</h3>
              <label style={{ display: 'block', marginBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={settings.showStringNames}
                  onChange={handleToggleStringNames}
                  style={{ marginRight: 8 }}
                />
                Show string names on fretboard
              </label>
              <label style={{ display: 'block', marginBottom: 10 }}>
                Fretboard color:
                <input
                  type="color"
                  value={settings.fretboardColor}
                  onChange={handleColorChange}
                  style={{ marginLeft: 8, verticalAlign: 'middle' }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );

// Simple SVG bar chart for last 30 days
function BarChart({ history, getLast30Days }: { history: { [date: string]: number }, getLast30Days: () => string[] }) {
  const days = getLast30Days();
  const values = days.map((d) => history[d] || 0);
  const max = Math.max(1, ...values);
  return (
    <div style={{ width: '80vw', maxWidth: 600, margin: '0 auto 24px auto', height: 100 }}>
      <svg width="100%" height="100" viewBox={`0 0 ${days.length * 16} 100`} style={{ display: 'block' }}>
        {values.map((v, i) => (
          <g key={i}>
            <rect
              x={i * 16 + 2}
              y={100 - (v / max) * 80 - 10}
              width={12}
              height={(v / max) * 80}
              fill="#4caf50"
              rx={3}
            />
            {/* Optionally, show value on hover */}
            <title>{`${days[i]}: ${v}`}</title>
          </g>
        ))}
      </svg>
      <div style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 2 }}>
        Last 30 days
      </div>
    </div>
  );
}
}


function Fretboard({ highlight, showStringNames = true, fretboardColor = '#222' }: {
  highlight?: { stringIdx: number; fretIdx: number };
  showStringNames?: boolean;
  fretboardColor?: string;
}) {
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
                          : fretboardColor,
                      color: fIdx === 0 ? '#fff' : '#aaa',
                      textAlign: 'center',
                      position: 'relative',
                      padding: 0,
                    }}
                  >
                    {fIdx === 0 && showStringNames ? string : ''}
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
