import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('id, name, base_price, total_stock')

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-500">讀取房型資料時發生錯誤：{error.message}</p>
      </main>
    )
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">房型列表</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms?.map((room) => (
          <div
            key={room.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold">{room.name}</h2>
            <p className="text-gray-600">
              NT$ {room.base_price.toLocaleString()} / 晚
            </p>
            <p className="text-sm text-gray-400">
              剩餘房間數：{room.total_stock}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}