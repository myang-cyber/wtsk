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
        <meta name="viewport" content="width=device-width,
