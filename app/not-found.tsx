import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* 404 아이콘 */}
        <div className="text-6xl mb-6">🔍</div>

        {/* 제목 */}
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>

        {/* 설명 */}
        <p className="text-lg text-muted-foreground mb-2">페이지를 찾을 수 없습니다</p>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/">홈으로</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-border hover:bg-muted"
          >
            <Link href="/login">로그인</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
