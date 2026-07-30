import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setMatches(null);

    if (!name.trim() || !phone.trim()) {
      setError('이름과 전화번호를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '조회 중 오류가 발생했습니다.');
        return;
      }

      if (!data.matches || data.matches.length === 0) {
        setError(
          '일치하는 신청 내역을 찾을 수 없습니다. 이름과 전화번호를 확인해 주시거나 현장 접수처에 문의해 주세요.'
        );
        return;
      }

      setMatches(data.matches);
    } catch (err) {
      setError('조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>선택특강 조회 | 리딩지저스 컨퍼런스</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Pretendard:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="wrap">
        <div className="eyebrow">READING JESUS CONFERENCE 2026</div>
        <p className="subtitle">시편, 그리스도를 노래하다</p>
        <h1>선택특강 신청 조회</h1>

        <form className="card" onSubmit={handleSearch}>
          <div className="field">
            <label htmlFor="nameInput">이름</label>
            <input
              id="nameInput"
              type="text"
              placeholder="홍길동"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="phoneInput">전화번호</label>
            <input
              id="phoneInput"
              type="tel"
              placeholder="010-1234-5678"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? '조회 중...' : '내 선택특강 조회'}
          </button>

          {error && <div className="msg error">{error}</div>}

          {matches && (
            <div className="result-block">
              <div className="result-name">
                <b>{name.trim()}</b>님이 신청하신 특강입니다
              </div>
              {matches.map((m, i) => (
                <div className="lecture-card" key={i}>
                  {m.session && <div className="session">{m.session}</div>}
                  <div className="title">{m.lecture}</div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      <style jsx global>{`
        :root {
          --ivory: #faf6ec;
          --ivory-deep: #f1eadb;
          --ink: #1f2a44;
          --ink-soft: #4a5670;
          --wine: #8b3a3a;
          --wine-deep: #6e2c2c;
          --gold: #c9a227;
          --line: #dcd3be;
          --white: #fffdf8;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background: var(--ivory);
          background-image: radial-gradient(
              circle at 15% 8%,
              rgba(201, 162, 39, 0.08),
              transparent 40%
            ),
            radial-gradient(circle at 85% 92%, rgba(139, 58, 58, 0.06), transparent 45%);
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--ink);
          min-height: 100vh;
        }
      `}</style>

      <style jsx>{`
        .wrap {
          max-width: 520px;
          margin: 0 auto;
          padding: 40px 16px 64px;
        }
        .eyebrow {
          text-align: center;
          font-size: 14px;
          letter-spacing: 0.28em;
          color: var(--wine);
          font-weight: 700;
          margin-top: 50px;
          margin-bottom: 20px;
        }
        .subtitle {
          text-align: center;
          font-size: 17px;
          color: var(--ink-soft);
          margin: 0 0 8px;
          font-family: 'Nanum Myeongjo', serif;
        }
        h1 {
          font-family: 'Nanum Myeongjo', serif;
          text-align: center;
          font-size: 34px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 32px;
          line-height: 1.4;
          letter-spacing: -0.01em;
        }
        .card {
          background: var(--white);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 32px 26px;
          box-shadow: 0 1px 2px rgba(31, 42, 68, 0.04), 0 8px 24px rgba(31, 42, 68, 0.06);
        }
        label {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: var(--ink-soft);
          margin: 0 0 8px;
        }
        .field {
          margin-bottom: 18px;
        }
        input[type='text'],
        input[type='tel'] {
          width: 100%;
          padding: 15px 16px;
          border: 1px solid var(--line);
          border-radius: 10px;
          font-size: 18px;
          font-family: inherit;
          background: var(--ivory);
          color: var(--ink);
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        input[type='text']:focus,
        input[type='tel']:focus {
          border-color: var(--gold);
          background: var(--white);
        }
        button.primary {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 10px;
          background: var(--wine);
          color: var(--white);
          font-size: 18px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, transform 0.05s;
          margin-top: 4px;
        }
        button.primary:hover {
          background: var(--wine-deep);
        }
        button.primary:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .msg.error {
          margin-top: 18px;
          font-size: 16px;
          line-height: 1.6;
          text-align: center;
          color: var(--wine);
          font-weight: 500;
        }
        .result-block {
          margin-top: 26px;
        }
        .result-name {
          font-family: 'Nanum Myeongjo', serif;
          font-size: 18px;
          color: var(--ink-soft);
          text-align: center;
          margin-bottom: 16px;
        }
        .result-name b {
          color: var(--ink);
        }
        .lecture-card {
          border: 1px solid var(--line);
          border-left: 4px solid var(--gold);
          border-radius: 10px;
          background: var(--ivory-deep);
          padding: 16px 18px;
          margin-bottom: 12px;
        }
        .lecture-card .session {
          font-size: 14px;
          letter-spacing: 0.06em;
          color: var(--wine);
          font-weight: 700;
          margin-bottom: 6px;
        }
        .lecture-card .title {
          font-family: 'Nanum Myeongjo', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.4;
        }
      `}</style>
    </>
  );
}
