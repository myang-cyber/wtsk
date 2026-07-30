// Notion 데이터베이스에서 이름 + 전화번호로 신청한 선택특강을 조회하는 API
//
// Notion 데이터베이스에는 아래 4개의 컬럼(속성)이 있어야 합니다:
//   - 이름       (속성 타입: 제목 / Title)
//   - 전화번호    (속성 타입: 텍스트 / Text)
//   - 교시       (속성 타입: 텍스트 또는 선택 / Text or Select) - 선택 사항
//   - 선택특강    (속성 타입: 텍스트 또는 선택 / Text or Select)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: '이름과 전화번호를 입력해 주세요.' });
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return res.status(500).json({
      error: '서버에 Notion 연동 정보가 설정되지 않았습니다. 관리자에게 문의해 주세요.',
    });
  }

  const trimmedName = String(name).trim();
  const normalizedInputPhone = String(phone).replace(/\D/g, '');

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: '이름',
            title: { equals: trimmedName },
          },
          page_size: 50,
        }),
      }
    );

    if (!notionRes.ok) {
      const errText = await notionRes.text();
      console.error('Notion API error:', notionRes.status, errText);
      return res.status(502).json({
        error: 'Notion 조회 중 오류가 발생했습니다. 데이터베이스 연결 상태를 확인해 주세요.',
      });
    }

    const data = await notionRes.json();

    const extractText = (prop) => {
      if (!prop) return '';
      if (prop.title) return prop.title.map((t) => t.plain_text).join('');
      if (prop.rich_text) return prop.rich_text.map((t) => t.plain_text).join('');
      if (prop.select) return prop.select.name || '';
      if (prop.phone_number) return prop.phone_number || '';
      return '';
    };

    const matches = (data.results || [])
      .map((page) => {
        const props = page.properties || {};
        return {
          name: extractText(props['이름']),
          phone: extractText(props['전화번호']),
          session: extractText(props['교시']),
          lecture: extractText(props['선택특강']),
        };
      })
      .filter(
        (row) =>
          row.phone.replace(/\D/g, '') === normalizedInputPhone && row.lecture
      );

    return res.status(200).json({ matches });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
  }
}
