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
    <main className="min-h-screen bg-stone-950 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-bold">
           A路小琉球民宿 ⧗ A·road B&B
        </Link>

      </nav>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/#rooms" className="text-sm text-amber-400 hover:text-amber-300">
          ← 返回房型介紹
        </Link>

          <RoomGallery images={room.images} roomName={room.name} />
          <AvailabilityCalendar roomId={room.databaseId} />
          <div className="mt-12 grid gap-10 md:grid-cols-[1fr_320px]">
          
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm text-amber-400">{room.people}</p>
            <h1 className="mt-2 text-4xl font-bold">{room.name}</h1>
            <p className="mt-6 leading-8 text-stone-300">{room.description}</p>

            <h2 className="mt-10 text-2xl font-bold">房內設施</h2>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {room.facilities.map((facility) => (
                <div
                  key={facility}
                  className="rounded-lg border border-white/10 bg-stone-900 px-4 py-3 text-sm text-stone-200"
                >
                  ✓ {facility}
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-stone-900 p-6">
            <p className="text-sm text-stone-400">每晚房價起</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">
              NT$ {room.price.toLocaleString()}
            </p>

          </aside>
        </div>
      </section>
    </main>
  )
}