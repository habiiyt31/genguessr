'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';

type Tab = 'play' | 'daily' | 'stats' | 'admin';

export default function Home() {
  const w = useWallet();
  const c = useContract();
  const [tab, setTab] = useState<Tab>('play');

  // Play state
  const [clues, setClues] = useState<any>(null);
  const [guess, setGuess] = useState('');
  const [guessResult, setGuessResult] = useState<string | null>(null);
  const [hasWonRound, setHasWonRound] = useState(false);

  // Daily state
  const [daily, setDaily] = useState<any>(null);
  const [dailyGuess, setDailyGuess] = useState('');
  const [dailyResult, setDailyResult] = useState<string | null>(null);
  const [hasWonDaily, setHasWonDaily] = useState(false);

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Admin
  const [adminUrl, setAdminUrl] = useState('');
  const [adminDiff, setAdminDiff] = useState('easy');
  const [dailyUrl, setDailyUrl] = useState('');
  const [adminMsg, setAdminMsg] = useState('');
  const [err, setErr] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setErr('');
    setGuessResult(null);
    setDailyResult(null);
    if (tab === 'play') c.getClues().then(setClues).catch((e: any) => { console.error(e); setClues({ error: true }); });
    if (tab === 'daily') c.getDailyClues().then(setDaily).catch(() => setDaily({ error: true }));
    if (tab === 'stats') c.getStats().then(setStats).catch(() => setStats(null));
  }, [tab]);

  // ── PLAY: Submit Guess ──
  const handleGuess = async () => {
    if (!w.address || !guess.trim() || hasWonRound) return;
    setErr(''); setGuessResult(null);
    try {
      await c.submitGuess(guess, w.address);
      const res = await c.getLastResult();
      if (res) {
        setGuessResult('🎉 Correct! You nailed it!');
        setHasWonRound(true);
      } else {
        setGuessResult('❌ Wrong! Try again.');
      }
    } catch (e: any) {
      const msg = e.message || 'Error';
      if (msg.includes('already guessed')) {
        setHasWonRound(true);
        setGuessResult('⚠️ You already guessed this round!');
      } else {
        setErr(msg);
      }
    }
  };

  // ── DAILY: Submit Guess ──
  const handleDailyGuess = async () => {
    if (!w.address || !dailyGuess.trim() || hasWonDaily) return;
    setErr(''); setDailyResult(null);
    try {
      await c.submitDailyGuess(dailyGuess, w.address);
      setDailyResult('🎯 Daily guess submitted! Check back tomorrow for a new challenge.');
      setHasWonDaily(true);
      setDailyGuess('');
    } catch (e: any) {
      const msg = e.message || 'Error';
      if (msg.includes('already guessed')) {
        setHasWonDaily(true);
        setDailyResult("⚠️ You already guessed today's challenge!");
      } else {
        setErr(msg);
      }
    }
  };

  // Reset round state when a new round is generated
  const resetRoundState = () => {
    setHasWonRound(false);
    setGuessResult(null);
    setGuess('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: '2px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">GenGuessr</h1>
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>Think. Guess. Win. On-Chain</p>
          </div>
        </div>
        {w.isConnected ? (
          <div className="flex items-center gap-2">
            <span className="badge badge-green font-mono text-xs">{w.short}</span>
          </div>
        ) : (
          <button onClick={w.connect} className="btn-primary text-sm" disabled={w.connecting}>
            {w.connecting ? 'Connecting...' : ' Connect Wallet'}
          </button>
        )}
      </header>

      {/* ── Tabs ── */}
      <nav className="px-4 sm:px-6 flex gap-1 overflow-x-auto" style={{ borderBottom: '2px solid var(--border)' }}>
        {(['play', 'daily', 'stats', 'admin'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`}>
            {t === 'play' && '🎮 Play'}
            {t === 'daily' && '📅 Daily'}
            {t === 'stats' && '📊 Stats'}
            {t === 'admin' && '⚙️ Admin'}
          </button>
        ))}
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">

        {/* Wallet guard */}
        {!w.isConnected && (
          <div className="text-center py-16 animate-slideUp">
            <h2 className="text-2xl font-bold mb-2">Welcome to GenGuessr!</h2>
            <h3 className="text-2xl font-bold mb-2">Guess the object from AI clues. Powered by GenLayer.</h3>
            
            <p style={{ color: 'var(--muted)' }} className="mb-6">Connect your wallet to start guessing</p>
            <button onClick={w.connect} className="btn-primary text-lg">Connect Wallet</button>
          </div>
        )}

        {/* ── PLAY ── */}
        {w.isConnected && tab === 'play' && (
          <div className="space-y-5 animate-slideUp">
            <div>
              <h2 className="text-2xl font-bold">🎮 Guess the Object</h2>
              <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">AI analyzed an image and created clues. Can you guess what it is?</p>
            </div>

            {clues && !clues.error ? (
              <>
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>💡 CLUES</span>
                    {clues.difficulty && <span className="badge badge-yellow">{clues.difficulty}</span>}
                    {hasWonRound && <span className="badge badge-green">✅ Completed</span>}
                  </div>
                  <div className="space-y-3">
                    {clues.clue1 && <div className="clue-badge"><span style={{ color: 'var(--accent2)' }} className="font-bold">1</span><span>{clues.clue1}</span></div>}
                    {clues.clue2 && <div className="clue-badge"><span style={{ color: 'var(--accent3)' }} className="font-bold">2</span><span>{clues.clue2}</span></div>}
                    {clues.clue3 && <div className="clue-badge"><span style={{ color: 'var(--yellow)' }} className="font-bold">3</span><span>{clues.clue3}</span></div>}
                  </div>
                </div>

                {/* ── GAME OVER: Won Round ── */}
                {hasWonRound ? (
                  <div className="card text-center py-8" style={{ borderColor: 'var(--accent)', background: 'rgba(94,255,158,0.08)' }}>
                    <div className="text-5xl mb-3">🏆</div>
                    <p className="text-xl font-bold mb-2" style={{ color: 'var(--accent)' }}>Round Complete!</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {guessResult?.includes('Correct')
                        ? 'Great job! You guessed correctly. Wait for a new round!'
                        : 'You already submitted your guess for this round.'}
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                      <button onClick={() => setTab('stats')} className="btn-primary text-sm">📊 View Stats</button>
                      <button onClick={() => setTab('daily')} className="btn-pink text-sm">📅 Try Daily</button>
                    </div>
                  </div>
                ) : (
                  /* ── Active: Show input ── */
                  <div className="flex gap-3">
                    <input
                      value={guess}
                      onChange={e => setGuess(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGuess()}
                      placeholder="Type your guess..."
                      className="input-field flex-1"
                      disabled={c.loading}
                    />
                    <button onClick={handleGuess} disabled={c.loading || !guess.trim()} className="btn-primary whitespace-nowrap">
                      {c.loading ? '⏳' : 'Guess!'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="card text-center py-8">
                <div className="text-4xl mb-3">🎲</div>
                <p style={{ color: 'var(--muted)' }}>No active round. Go to Admin tab to create one!</p>
              </div>
            )}

            {c.status && !hasWonRound && (
              <div className="card" style={{ borderColor: 'var(--accent)', background: 'rgba(94,255,158,0.05)' }}>
                <p className="text-sm font-mono" style={{ color: 'var(--accent)' }}>
                  <span className="animate-pulse mr-2">●</span>{c.status}
                </p>
              </div>
            )}

            {guessResult && !hasWonRound && (
              <div className="card text-center" style={{ borderColor: guessResult.includes('Correct') ? 'var(--accent)' : 'var(--danger)' }}>
                <p className="text-lg font-bold">{guessResult}</p>
              </div>
            )}

            {err && <div className="card" style={{ borderColor: 'var(--danger)' }}><p className="text-sm" style={{ color: 'var(--danger)' }}>{err}</p></div>}
          </div>
        )}

        {/* ── DAILY ── */}
        {w.isConnected && tab === 'daily' && (
          <div className="space-y-5 animate-slideUp">
            <div>
              <h2 className="text-2xl font-bold">📅 Daily Challenge</h2>
              <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">Everyone gets the same image today!</p>
            </div>

            {daily && !daily.error ? (
              <>
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold" style={{ color: 'var(--accent2)' }}>📅 {daily.date || today}</span>
                    <div className="flex gap-2">
                      <span className="badge badge-blue">{daily.participants || 0} players</span>
                      <span className="badge badge-green">{daily.winners || 0} correct</span>
                      {hasWonDaily && <span className="badge badge-yellow">✅ Done</span>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {daily.clue1 && <div className="clue-badge"><span style={{ color: 'var(--accent2)' }} className="font-bold">1</span><span>{daily.clue1}</span></div>}
                    {daily.clue2 && <div className="clue-badge"><span style={{ color: 'var(--accent3)' }} className="font-bold">2</span><span>{daily.clue2}</span></div>}
                    {daily.clue3 && <div className="clue-badge"><span style={{ color: 'var(--yellow)' }} className="font-bold">3</span><span>{daily.clue3}</span></div>}
                  </div>
                </div>

                {/* ── GAME OVER: Daily Done ── */}
                {hasWonDaily ? (
                  <div className="card text-center py-8" style={{ borderColor: 'var(--accent2)', background: 'rgba(255,107,222,0.08)' }}>
                    <div className="text-5xl mb-3">🌟</div>
                    <p className="text-xl font-bold mb-2" style={{ color: 'var(--accent2)' }}>Daily Challenge Done!</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {dailyResult || 'You already submitted your daily guess. Come back tomorrow!'}
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                      <button onClick={() => setTab('stats')} className="btn-primary text-sm">📊 View Stats</button>
                      <button onClick={() => setTab('play')} className="btn-primary text-sm">🎮 Play Round</button>
                    </div>
                  </div>
                ) : (
                  /* ── Active: Show input ── */
                  <div className="flex gap-3">
                    <input
                      value={dailyGuess}
                      onChange={e => setDailyGuess(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleDailyGuess()}
                      placeholder="Your daily guess..."
                      className="input-field flex-1"
                      disabled={c.loading}
                    />
                    <button onClick={handleDailyGuess} disabled={c.loading || !dailyGuess.trim()} className="btn-pink whitespace-nowrap">
                      {c.loading ? '⏳' : 'Guess!'}
                    </button>
                  </div>
                )}

                {c.status && !hasWonDaily && (
                  <div className="card" style={{ borderColor: 'var(--accent2)', background: 'rgba(255,107,222,0.05)' }}>
                    <p className="text-sm font-mono" style={{ color: 'var(--accent2)' }}>
                      <span className="animate-pulse mr-2">●</span>{c.status}
                    </p>
                  </div>
                )}

                {dailyResult && !hasWonDaily && (
                  <div className="card text-center" style={{ borderColor: 'var(--accent2)' }}>
                    <p className="text-lg font-bold">{dailyResult}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="card text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <p style={{ color: 'var(--muted)' }}>No daily challenge yet. Check back later!</p>
              </div>
            )}
          </div>
        )}

        {/* ── STATS ── */}
        {w.isConnected && tab === 'stats' && (
          <div className="space-y-5 animate-slideUp">
            <div>
              <h2 className="text-2xl font-bold">📊 Your Stats</h2>
              <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>{w.short}</p>
            </div>

            {stats && !stats.error ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: '⭐', label: 'Level', value: stats.level, color: 'var(--accent)' },
                    { icon: '✨', label: 'XP', value: stats.xp, color: 'var(--yellow)' },
                    { icon: '🎮', label: 'Games', value: stats.games_played, color: 'var(--accent3)' },
                    { icon: '🎯', label: 'Accuracy', value: `${stats.accuracy}%`, color: 'var(--accent2)' },
                  ].map(s => (
                    <div key={s.label} className="stat-box">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {stats.unlocks && stats.unlocks.length > 0 && (
                  <div className="card">
                    <p className="text-sm font-bold mb-2" style={{ color: 'var(--accent3)' }}>🔓 Unlocks</p>
                    <div className="flex gap-2 flex-wrap">
                      {stats.unlocks.map((u: string) => (
                        <span key={u} className="badge badge-blue">{u.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card">
                  <p className="text-sm font-bold mb-3" style={{ color: 'var(--yellow)' }}>🏆 Level Progress</p>
                  <div className="w-full rounded-full h-4" style={{ background: 'var(--bg)', border: '2px solid var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      background: `linear-gradient(90deg, var(--accent), var(--accent2))`,
                      width: `${Math.min(100, (stats.xp / 1000) * 100)}%`
                    }} />
                  </div>
                  <p className="text-xs mt-2 font-mono" style={{ color: 'var(--muted)' }}>{stats.xp} / 1000 XP</p>
                </div>
              </>
            ) : (
              <div className="card text-center py-8">
                <div className="text-4xl mb-3">📊</div>
                <p style={{ color: 'var(--muted)' }}>Play some rounds to see your stats!</p>
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN ── */}
        {w.isConnected && tab === 'admin' && (
          <div className="space-y-5 animate-slideUp">
            <div>
              <h2 className="text-2xl font-bold">⚙️ Admin Panel</h2>
              <p style={{ color: 'var(--muted)' }} className="text-sm mt-1">Generate AI rounds and daily challenges</p>
            </div>

            <div className="card">
              <p className="text-sm font-bold mb-4" style={{ color: 'var(--accent)' }}>🎮 Generate AI Round</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono block mb-1" style={{ color: 'var(--muted)' }}>Image URL</label>
                  <input value={adminUrl} onChange={e => setAdminUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-mono block mb-1" style={{ color: 'var(--muted)' }}>Difficulty</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map(d => (
                      <button key={d} onClick={() => setAdminDiff(d)} className={`badge ${adminDiff === d ? 'badge-green' : ''}`} style={adminDiff !== d ? { background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--muted)' } : {}}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                {adminUrl && (
                  <div className="rounded-xl overflow-hidden" style={{ border: '2px solid var(--border)' }}>
                    <img src={adminUrl} alt="Preview" className="w-full h-32 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
                <button onClick={async () => {
                  if (!w.address || !adminUrl.trim()) return;
                  setErr(''); setAdminMsg('');
                  try {
                    await c.generateRound(adminUrl, adminDiff, w.address);
                    setAdminMsg('🎉 AI generated the round! Clues are ready.');
                    setAdminUrl('');
                    resetRoundState();
                  } catch (e: any) { setErr(e.message || 'Error'); }
                }} disabled={c.loading || !adminUrl.trim()} className="btn-primary w-full">
                  {c.loading ? '⏳ AI Generating...' : '🤖 Generate Round (AI)'}
                </button>
              </div>
            </div>

            <div className="card">
              <p className="text-sm font-bold mb-4" style={{ color: 'var(--accent2)' }}>📅 Create Daily Challenge</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono block mb-1" style={{ color: 'var(--muted)' }}>Image URL for {today}</label>
                  <input value={dailyUrl} onChange={e => setDailyUrl(e.target.value)} placeholder="https://example.com/daily.jpg" className="input-field" />
                </div>
                <button onClick={async () => {
                  if (!w.address || !dailyUrl.trim()) return;
                  setErr(''); setAdminMsg('');
                  try {
                    await c.createDaily(today, dailyUrl, w.address);
                    setAdminMsg('📅 Daily challenge created!');
                    setDailyUrl('');
                    setHasWonDaily(false);
                    setDailyResult(null);
                    setDailyGuess('');
                  } catch (e: any) { setErr(e.message || 'Error'); }
                }} disabled={c.loading || !dailyUrl.trim()} className="btn-pink w-full">
                  {c.loading ? '⏳ Creating...' : '📅 Create Daily (AI)'}
                </button>
              </div>
            </div>

            {c.status && (
              <div className="card" style={{ borderColor: 'var(--accent)', background: 'rgba(94,255,158,0.05)' }}>
                <p className="text-sm font-mono" style={{ color: 'var(--accent)' }}>
                  <span className="animate-pulse mr-2">●</span>{c.status}
                </p>
              </div>
            )}
            {adminMsg && <div className="card" style={{ borderColor: 'var(--accent)' }}><p className="font-bold" style={{ color: 'var(--accent)' }}>{adminMsg}</p></div>}
            {err && <div className="card" style={{ borderColor: 'var(--danger)' }}><p className="text-sm" style={{ color: 'var(--danger)' }}>{err}</p></div>}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="px-4 sm:px-6 py-4 flex items-center justify-between text-xs" style={{ borderTop: '2px solid var(--border)', color: 'var(--muted)' }}>
        <span className="font-mono">habiiyt31 the cat</span>
        <span>Powered by <span style={{ color: 'var(--accent)' }}>GenLayer</span></span>
      </footer>
    </div>
  );
}
