import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle' // 匯入切換按鈕

const features = [
  { icon: '📶', title: '高速 Wi‑Fi', text: '全館免費無線網路' },
  { icon: '👨‍👩‍👧‍👦', title: '親子友善', text: '全家大小安心入住' },
  { icon: '🍳', title: '在地早餐', text: '每日新鮮準備' },
  { icon: '🐶', title: '寵物友善', text: '歡迎毛孩一起旅行' },
  { icon: '🏠', title: '分區包棟', text: '彈性的分區包棟選項' },
]

const rooms = [
  { slug: 'view-double', name: '景觀雙人房', price: 2400, people: '2 人入住', image: '/images/rooms/view-double.jpg' },
  { slug: 'warm-quad', name: '溫馨四人房', price: 4800, people: '4 人入住', image: '/images/rooms/family-quad2.jpg' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 你原本的 Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">


        <div className="hidden gap-6 text-sm text-stone-600 dark:text-stone-300 md:flex">
          <a href="#rooms" className="hover:text-amber-600 dark:hover:text-amber-400">房型介紹</a>
          <a href="#features" className="hover:text-amber-600 dark:hover:text-amber-400">設施服務</a>
          <a href="#contact" className="hover:text-amber-600 dark:hover:text-amber-400">聯絡我們</a>
          <a href="#map" className="hover:text-amber-600 dark:hover:text-amber-400">交通位址</a>
          <a href="#activity" className="hover:text-amber-600 dark:hover:text-amber-400">套裝行程</a>
          <a href="#notice" className="hover:text-amber-600 dark:hover:text-amber-400">注意事項</a>
        </div>


      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-16 text-center md:pt-28">
        <p className="mb-4 text-sm tracking-[0.3em] font-semibold text-amber-600 dark:text-amber-400">
          A路小琉球民宿 ⧗ A·road B&B
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-stone-900 dark:text-stone-100 md:text-5xl">
          🌴 最溫馨的旅程從A路開始！
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-stone-600 dark:text-stone-300">
          舒適房型、貼心服務與剛剛好的慢步調，為每一趟旅行準備一個安心的落腳處。
        </p>
      </section>

      <section id="rooms" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">房型介紹</p>
            <h2 className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">選一間喜歡的房間</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {rooms.map((room) => (
            <article key={room.name} className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm dark:shadow-none transition">
              <Link href={`/rooms/${room.slug}`} className="block relative h-64 overflow-hidden cursor-pointer">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="p-5">
                <p className="text-sm text-stone-500 dark:text-stone-400">{room.people}</p>
                <h3 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">{room.name}</h3>
                <p className="mt-3 font-bold text-amber-600 dark:text-amber-400">
                  NT$ {room.price.toLocaleString()} <span className="text-sm font-normal text-stone-500 dark:text-stone-400">/ 晚起</span>
                </p>
                <Link
                  href={`/rooms/${room.slug}`}
                  className="mt-5 block text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                >
                  查看房型詳細介紹 →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="bg-stone-200/50 dark:bg-stone-900/60 py-20 border-y border-stone-200 dark:border-stone-800/80 transition-colors">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">設施服務</p>
            <h2 className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">旅行需要的，我們都想到了</h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-4 font-bold text-stone-900 dark:text-stone-100">{feature.title}</h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="map" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">LOCATION</p>
          <h2 className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">交通位址</h2>
          <p className="mt-3 text-stone-600 dark:text-stone-400">
            屏東縣琉球鄉民權路 7-5 號
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm dark:shadow-none transition">
          <iframe
            title="A路小琉球民宿地圖"
            src="https://www.google.com/maps?q=屏東縣琉球鄉民權路7-5號&output=embed"
            width="100%"
            height="450"
            className="border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-5 text-center">
          <a
            href="https://www.google.com/maps/search/?api=1&query=屏東縣琉球鄉民權路7-5號"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            在 Google 地圖中開啟導航 →
          </a>
        </div>
      </section>

      <section id="activity" className="bg-stone-200/50 dark:bg-stone-900/60 py-20 border-y border-stone-200 dark:border-stone-800/80 transition-colors">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">ACTIVITIES</p>
            <h2 className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">套裝行程</h2>
            <p className="mx-auto mt-3 max-w-2xl text-stone-600 dark:text-stone-400">
              除了住宿，也為您安排豐富的小琉球海島體驗。實際活動時間與內容，請於訂房時洽詢確認。
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">🔥 BBQ</p>
              <p className="mt-2 font-bold text-amber-600 dark:text-amber-400">NT$ 400 / 人</p>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">🤿 體驗潛水</p>
              <p className="mt-2 font-bold text-amber-600 dark:text-amber-400">NT$ 2,500 / 人</p>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">🐠 浮潛</p>
              <p className="mt-2 font-bold text-amber-600 dark:text-amber-400">NT$ 400 / 人</p>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">🛶 獨木舟</p>
              <p className="mt-2 font-bold text-amber-600 dark:text-amber-400">NT$ 600 / 人</p>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">🌙 潮間帶／夜間導覽</p>
              <p className="mt-2 font-bold text-amber-600 dark:text-amber-400">NT$ 150 / 人</p>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">🏄 SUP 立式划槳</p>
              <p className="mt-2 font-bold text-amber-600 dark:text-amber-400">NT$ 1,200／1 人 1 板</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">NT$ 950／2 人 1 板</p>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">🌊 水上衝浪板</p>
              <p className="mt-2 font-bold text-amber-600 dark:text-amber-400">NT$ 600／1 人 1 板</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">NT$ 800／2 人 1 板</p>
            </div>
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm dark:shadow-none transition">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">🚢 探索拉美半潛艇</p>
              <p className="mt-2 font-bold text-amber-600 dark:text-amber-400">全票 NT$ 350 / 人</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                半票 NT$ 250 / 人；幼兒 NT$ 60 / 人
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="notice" className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 transition-colors">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">NOTICE</p>
          <h2 className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">注意事項</h2>

          <div className="mt-6 border-l-2 border-amber-500 pl-5 text-stone-700 dark:text-stone-300">
            <h3 className="font-bold text-stone-900 dark:text-stone-100">娛樂設施使用時間</h3>
            <p className="mt-2 leading-7">
              唱歌部分僅提供至晚上 10:00；娛樂室及麻將桌則不限使用時間。
            </p>
          </div>
        </div>
      </section>

      <footer id="contact" className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-stone-800 transition-colors">
        A路民宿 · 服務時間 09:00–21:00 · 📞 訂房/詢問專線：0937608738 📱 官方聯繫：LINE ID:aroad2020
      </footer>
    </main>
  )
}