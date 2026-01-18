/**
 * 랜덤 닉네임 생성기
 * 형용사 + 동물 조합으로 자연스러운 닉네임 생성
 */

const adjectives = [
  '행복한',
  '용감한',
  '똑똑한',
  '친절한',
  '활발한',
  '차분한',
  '신나는',
  '따뜻한',
  '멋진',
  '귀여운',
  '강한',
  '빠른',
  '우아한',
  '밝은',
  '자유로운',
  '평화로운',
  '열정적인',
  '섬세한',
  '대담한',
  '온화한',
];

const animals = [
  '사자',
  '호랑이',
  '독수리',
  '늑대',
  '곰',
  '여우',
  '표범',
  '앵무새',
  '고래',
  '돌고래',
  '승리',
  '불꽃',
  '바람',
  '파도',
  '산',
  '하늘',
  '별',
  '해',
  '달',
  '구름',
];

/**
 * 랜덤 닉네임 생성
 * @returns 형용사 + 동물 조합 닉네임 (예: "행복한 사자")
 */
export function generateRandomNickname(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return `${randomAdjective} ${randomAnimal}`;
}
