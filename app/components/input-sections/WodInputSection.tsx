'use client';

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Movement } from '@/app/lib/types/workout.types';

// 한글 초성 추출 함수
function getChosung(str: string): string {
  const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  let result = "";
  for(let i=0; i<str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if(code > -1 && code < 11172) result += cho[Math.floor(code/588)];
    else result += str.charAt(i);
  }
  return result;
}

export function WodInputSection() {
  const { wodList, addWod, removeWod } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [allMovements, setAllMovements] = useState<Movement[]>([]);
  const [frequentMovements, setFrequentMovements] = useState<Movement[]>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  // 마스터 데이터와 자주 나오는 운동 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movementsRes, frequentRes] = await Promise.all([
          fetch('/api/v1/movements'),
          fetch('/api/v1/movements/frequent')
        ]);

        const movementsData = await movementsRes.json();
        const frequentData = await frequentRes.json();

        setAllMovements(movementsData.data?.movements || []);
        setFrequentMovements(frequentData.data?.movements || []);
      } catch (error) {
        console.error('Failed to fetch movements:', error);
      }
    };

    fetchData();
  }, []);

  const filteredMovements = useMemo(() => {
    if (!searchInput.trim()) {
      return [];
    }

    const searchChosung = getChosung(searchInput);

    return allMovements.filter(movement => {
      const nameMatch = movement.name.includes(searchInput);
      const chosungMatch = getChosung(movement.name).includes(searchChosung);
      return nameMatch || chosungMatch;
    });
  }, [searchInput, allMovements]);

  const handleAddMovement = (movement: Movement) => {
    addWod(movement);
    setSearchInput('');
    setIsAutocompleteOpen(false);
  };

  const handleAddFrequent = (movement: Movement) => {
    addWod(movement);
  };

  return (
    <div className="mb-8">
      {/* 검색 입력 */}
      <div className="relative mb-6 z-30">
        <div className="flex flex-nowrap items-stretch gap-2">
          <input
            type="text"
            placeholder="운동 검색 (초성: ㅅㄴㅊ)"
            value={searchInput}
            onChange={(e) => {
              const nextValue = e.target.value;
              setSearchInput(nextValue);
              setIsAutocompleteOpen(Boolean(nextValue.trim()));
            }}
            onFocus={() => searchInput.trim() && setIsAutocompleteOpen(true)}
            autoComplete="off"
            className="
              flex-grow min-w-0
              bg-white border border-gray-200 rounded-xl
              px-4 py-4
              text-sm font-bold text-slate-700
              placeholder-gray-300
              focus:outline-none focus:border-blue-500
              focus:ring-2 focus:ring-blue-100
              transition
            "
          />

          <button
            onClick={() => {
              if (searchInput.trim()) {
                const found = allMovements.find(
                  (m) => m.name === searchInput
                );
                if (found) {
                  handleAddMovement(found);
                }
              }
            }}
            className="
              shrink-0
              bg-slate-800 text-white
              px-3 sm:px-5
              py-4
              rounded-xl
              text-sm font-bold
              hover:bg-slate-700
              transition shadow-md
              whitespace-nowrap
            "
          >
            추가
          </button>
        </div>

        {/* 자동완성 리스트 */}
        {isAutocompleteOpen && filteredMovements.length > 0 && (
          <div className="
            absolute top-full left-0 right-0
            bg-white border border-gray-200
            rounded-b-2xl shadow-lg
            z-50 max-h-56 overflow-y-auto
          ">
            {filteredMovements.map((movement) => (
              <div
                key={movement.id}
                onClick={() => handleAddMovement(movement)}
                className="
                  px-4 py-3
                  border-b border-gray-100
                  cursor-pointer
                  hover:bg-gray-50
                  text-sm text-slate-700
                "
              >
                {movement.name}
              </div>
            ))}
          </div>
        )}
      </div>


      {/* 자주 나오는 운동 */}
      {frequentMovements.length > 0 && (
        <div className="bg-slate-100 rounded-2xl p-4 mb-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-400 mb-3 flex items-center uppercase tracking-wide">
            <i className="fa-solid fa-bolt text-yellow-500 mr-1.5"></i> 자주 나오는 WOD
          </p>
          <div className="grid grid-cols-3 gap-2">
            {frequentMovements.map(movement => (
              <button
                key={movement.id}
                onClick={() => handleAddFrequent(movement)}
                className="bg-white text-slate-600 text-xs font-bold py-2.5 px-1 rounded-lg shadow-sm border border-slate-200 hover:border-slate-400 active:bg-slate-200 transition"
              >
                {movement.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 운동 목록 */}
      {wodList.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-bold text-blue-500 mb-2 ml-1">오늘 한 운동 목록</p>
          <div className="flex flex-col w-full gap-2">
            {wodList.map(movement => (
              <div
                key={movement.id}
                className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm"
              >
                <span className="text-blue-900 font-bold text-sm truncate mr-2">{movement.name}</span>
                <button
                  onClick={() => removeWod(movement.id)}
                  className="text-gray-400 hover:text-red-500 transition p-1 flex-shrink-0"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
