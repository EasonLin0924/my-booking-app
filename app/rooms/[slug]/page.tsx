import Link from 'next/link'
import { notFound } from 'next/navigation'
import { rooms } from '@/data/rooms'
import RoomGallery from '@/components/RoomGallery'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const room = rooms.find((item) => item.slug === slug)

  if (!room) notFound()

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-bold text-stone-900 dark:text-stone-100">
          A路小琉球民宿 ⧗ A·road B&B
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <Link href="/#rooms" className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline">
          ← 返回房型介紹
        </Link>

        {/* 頂部圖片藝廊 */}
        <div className="mt-4">
          <RoomGallery images={room.images} roomName={room.name} />
        </div>

        {/* 下方雙欄佈局：左側房型介紹 / 右側即時試算日曆 */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px] items-start">
          
          {/* 左欄：房型介紹與設施 */}
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{room.people}</p>
              <h1 className="mt-1 text-3xl font-bold text-stone-900 dark:text-stone-100 md:text-4xl">{room.name}</h1>
              <p className="mt-4 leading-8 text-stone-600 dark:text-stone-300">{room.description}</p>
            </div>

            <div className="border-t border-stone-200 dark:border-stone-800 pt-8">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">房內設施</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {room.facilities.map((facility) => (
                  <div
                    key={facility}
                    className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3 text-sm text-stone-700 dark:text-stone-200 shadow-sm dark:shadow-none"
                  >
                    ✓ {facility}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右欄：即時試算與訂房日曆 */}
          <aside className="lg:sticky lg:top-8">
            <AvailabilityCalendar roomId={room.databaseId} />
          </aside>

        </div>
      </section>
    </main>
  )
}