'use client'

export default function WeeklyBriefingTemplate() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1>📅 주간 브리핑 템플릿 (Newturn 개인용)</h1>
      <blockquote>
        매주 일요일 저녁 ~ 월요일 아침에 작성합니다. 시장 전체 → 산업 인사이트 → 관심종목 점검 → 신규 아이디어 → 다음 주 액션 순서로 간결하게 정리하세요. (총 30~60분)
      </blockquote>

      <hr />

      <h2>1️⃣ 이번 주 시장 리뷰 (10분)</h2>
      <ul>
        <li><strong>주요 지수</strong>: S&amp;P500 ▾/▲ %, 나스닥 ▾/▲ %, KOSPI ▾/▲ %</li>
        <li><strong>금리 &amp; 거시지표</strong>: (예: 미 10년 금리, CPI, PCE, 연준/한은 발언)</li>
        <li><strong>환율 &amp; 원자재</strong>: USD/KRW, 유가, 반도체 D램/낸드 가격 등 관심 항목</li>
        <li><strong>핵심 뉴스</strong>: 이번 주 시장을 흔든 이벤트 2-3개 (기업 실적, 정책 발표, 지정학 등)
          <ul>
            <li>뉴스 1: 요약 (나에게 의미)</li>
            <li>뉴스 2: 요약 (나에게 의미)</li>
          </ul>
        </li>
      </ul>
      <blockquote>
        <strong>메모</strong>: 이번 주 시장 분위기는? (★★★★★ 중 몇 점) → 나의 리스크 스탠스 조정 기록
      </blockquote>

      <hr />

      <h2>2️⃣ 테크/AI/반도체 인사이트 (15분)</h2>
      <ul>
        <li><strong>산업별 관찰 포인트</strong>
          <ul>
            <li>AI 인프라/클라우드: (예: NVIDIA, AWS, Azure CAPEX, AI 서버 수요 변화)</li>
            <li>반도체 제조/장비: (예: 파운드리 가동률, ASML 수주, TSMC/NXPI/AMAT 동향)</li>
            <li>소비 전자/로봇/자율주행 등 기타 포커스 산업</li>
          </ul>
        </li>
        <li><strong>데이터 &amp; 행동 관찰</strong>
          <ul>
            <li>회사/업계 내부 관점에서 본 현장 느낌</li>
            <li>AI/반도체 엔지니어로서 체감하는 제품 출시, 고객 요구 변화</li>
            <li>유튜브/뉴스/리포트 핵심 요약 (3개 이하)</li>
          </ul>
        </li>
      </ul>
      <blockquote>
        <strong>메모</strong>: 이번 주 산업 스냅샷, 내가 믿는 중장기 Thesis에 변화가 있는가?
      </blockquote>

      <hr />

      <h2>3️⃣ 관심종목 점검 (10분)</h2>
      <table>
        <thead>
          <tr>
            <th>종목</th>
            <th>현재가</th>
            <th>메이트 평균 괴리</th>
            <th>내 포지션</th>
            <th>메모</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>NVDA</td>
            <td>$XXX</td>
            <td>저평가/균형/과열</td>
            <td>없음/보유(%)</td>
            <td>____</td>
          </tr>
          <tr>
            <td>MSFT</td>
            <td>...</td>
            <td>...</td>
            <td>...</td>
            <td>...</td>
          </tr>
        </tbody>
      </table>
      <ul>
        <li>관심종목 개별 노트 예시
          <ul>
            <li><strong>NVDA</strong>: “AI 투자 사이클 유지, 그러나 밸류 stretched. 확신도 4→3 조정”</li>
            <li><strong>MSFT</strong>: ...</li>
          </ul>
        </li>
      </ul>
      <blockquote>
        <strong>체크</strong>: 관심종목 총 5개를 넘지 않는지 확인하고, 신규 추가/삭제 여부를 결정한다.
      </blockquote>

      <hr />

      <h2>4️⃣ 신규 아이디어 &amp; 밸류 기록 (15분)</h2>
      <p>밸류에이션 저널을 대체하는 섹션입니다. 종목별 간단 기록이면 충분합니다.</p>
      <table>
        <thead>
          <tr>
            <th>종목</th>
            <th>현재가</th>
            <th>내 적정가</th>
            <th>기대 수익률</th>
            <th>핵심 Thesis (한 줄)</th>
            <th>확신도 (1-5)</th>
            <th>재검토</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>예: ASML</td>
            <td>$XXX</td>
            <td>$YYY</td>
            <td>+18%</td>
            <td>“하이-NA 수요 지속”</td>
            <td>4</td>
            <td>12/15</td>
          </tr>
          <tr>
            <td>예: AVGO</td>
            <td>$XXX</td>
            <td>-</td>
            <td>-</td>
            <td>“관심 대상, 가설 없음”</td>
            <td>2</td>
            <td>12/01</td>
          </tr>
        </tbody>
      </table>
      <ul>
        <li>간단 메모 예시
          <ul>
            <li><strong>ASML</strong>: EUV/하이-NA backlog, 고객 CAPEX 확대 확인. 리스크: 중국 수출 제한.</li>
            <li><strong>AVGO</strong>: 데이터센터 ASIC 수요 관찰 중. 추가 리서치 필요.</li>
          </ul>
        </li>
      </ul>
      <blockquote>
        <strong>규칙</strong>: 한 주에 1-2개 아이디어만 기록. 너무 많으면 실행 불가.
      </blockquote>

      <hr />

      <h2>5️⃣ 다음 주 액션 플랜 (5분)</h2>
      <ul>
        <li><strong>관심종목</strong>: (예: NVDA – 가격 450 이하 시 분할 매수 검토)</li>
        <li><strong>리서치</strong>: (예: ASML 10-Q 읽기, AVGO 파트너십 기사 조사)</li>
        <li><strong>콘텐츠 큐레이션</strong>: (예: 반도체 산업 분석 영상 3개 선정)</li>
        <li><strong>기타</strong>: (예: 주식 비중 조절, 현금 비중 목표 등)</li>
      </ul>
      <blockquote>
        <strong>이번 주 총 소요 시간</strong>: ___분 ＝ 꾸준함을 기록하세요.
      </blockquote>

      <hr />

      <h3>✍️ 팁</h3>
      <ul>
        <li>브리핑은 나만 보는 용도이니 솔직하게 작성합니다.</li>
        <li>주간 브리핑 문서는 Learn 탭, 관심종목, 큐레이션과 연결되는 대시보드의 기초가 됩니다.</li>
        <li>작성 후 월요일 아침에 다시 읽고 이번 주 행동을 확정하세요.</li>
        <li>브리핑에서 나온 “신규 아이디어”는 다음 주에 관심종목으로 이동하거나 폐기 여부를 결정합니다.</li>
      </ul>
    </div>
  )
}


