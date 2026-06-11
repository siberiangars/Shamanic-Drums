// Пре-рендер: из собранного dist/index.html делаем по статическому HTML на каждую
// страницу — со своим <title>, описанием, canonical, og и реальным текстом контента
// внутри #root (его перерисует React при загрузке JS). Нужно для индексации в Яндексе.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const DIST = 'dist'
const ORIGIN = 'https://shamandrums.ru'

const nav = `<nav style="margin-top:42px;font-family:Manrope,system-ui,sans-serif;font-size:15px;line-height:2.2">
<a href="/" style="color:#e8b470;margin-right:18px">Главная</a>
<a href="/drums" style="color:#e8b470;margin-right:18px">Бубны</a>
<a href="/shop" style="color:#e8b470;margin-right:18px">Лавка</a>
<a href="/practices" style="color:#e8b470;margin-right:18px">Обряды и практики</a>
<a href="/master" style="color:#e8b470;margin-right:18px">Мастер</a>
<a href="/contacts" style="color:#e8b470">Контакты</a></nav>`

const pages = [
  {
    route: '/', out: 'index.html',
    title: 'Дух Сибири — шаманские бубны ручной работы | Святовид Татур',
    desc: 'Мастерская «Дух Сибири» Святовида Татура с 2009 года: шаманские бубны ручной работы на заказ, предметы Силы, обряды и практики в Хакасии. Каждый инструмент рождается под человека.',
    h1: 'Мастерская Святовида Татура — шаманские бубны ручной работы',
    body: `<p>Мастерская «Дух Сибири» с 2009 года создаёт шаманские бубны ручной работы и предметы Силы. Мастер Святовид Татур создал более 3500 бубнов. Каждый инструмент собирается под человека — под его задачу, практику и звук.</p>
<p>Обряды и практики проходят в Хакасии, у святой горы Умай на берегу Великого Енисея, на земле древних шаманов. На сайте — каталог бубнов на заказ, лавка предметов силы, обряды и практики, расписание 2026 и контакты.</p>`,
  },
  {
    route: '/drums', out: 'drums.html',
    title: 'Шаманские бубны ручной работы на заказ — Дух Сибири',
    desc: 'Шаманские бубны на заказ от мастера Святовида Татура: гнуто-клееный обод, натуральная шкура, авторская настройка с механизмом регулировки, резная рукоять и символика. Бубен под человека и задачу. Цена от 50 000 ₽.',
    h1: 'Шаманские бубны ручной работы на заказ',
    body: `<p>Каждый бубен собирается под человека: диаметр, обод, мембрана, настройка, рукоять, символика и назначение обсуждаются до изготовления. Обод — гнуто-клееный, мембрана — натуральная выделанная шкура, натяжение регулируется механизмом с ключом. В комплекте — влагостойкий чехол, колотушка и ключ для регулировки.</p>
<p>Образцы работ мастера: Хозяйка, Берегиня, Конь ветра, Орёл, Предок, Дева, Тотем, Медведь, Древо Жизни, Странник. Цена — от 50 000 ₽, зависит от диаметра, материалов, рукояти и символики.</p>`,
  },
  {
    route: '/shop', out: 'shop.html',
    title: 'Лавка — колотушки, зеркала-кузунгу, артыш | Дух Сибири',
    desc: 'Предметы силы мастерской «Дух Сибири»: колотушки для бубна, шаманские зеркала кузунгу, комплекты для гадания «Хуваанок», ритуальные ложки-девятиглазки, артыш для окуривания.',
    h1: 'Предметы силы и атрибуты практики',
    body: `<p>В лавке: колотушки для бубна (резьба, кожа, мех), шаманские зеркала-кузунгу из латуни, комплекты для гадания «Хуваанок» (камни с мест силы Хакасии и Тувы), ритуальные ложки-девятиглазки тос-карак, артыш (сибирский можжевельник) для окуривания и очищения — 900 ₽ за пучок.</p>
<p>Часть предметов в наличии, часть — под заказ. Заказ через ВКонтакте или по телефону.</p>`,
  },
  {
    route: '/practices', out: 'practices.html',
    title: 'Обряды и практики в Хакасии — Дух Сибири',
    desc: 'Обряды годового цикла, личные и родовые обряды, практикум «Рождение бубна», обучение работе с бубном, туры по местам силы Хакасии. Расписание обрядов и практикумов на 2026 год у горы Умай.',
    h1: 'Обряды, практикумы и обучение в Хакасии',
    body: `<p>Святовид Татур проводит обряды годового цикла (солнцестояния, Небесные Врата, белые дороги), личные и родовые обряды, практикум создания бубна «Рождение бубна», обучение работе с бубном и шаманским путешествиям, туры по местам силы Хакасии.</p>
<p>Всё проходит очно в Хакасии — у горы Умай и на Тропе Предков, земле древних шаманов Хакасии и Тувы. Даты — в расписании на 2026 год. Запись через ВКонтакте или по телефону.</p>`,
  },
  {
    route: '/master', out: 'master.html',
    title: 'Мастер Святовид Татур — Дух Сибири',
    desc: 'Святовид Татур — шаман и мастер мастерской «Дух Сибири». С 2009 года создаёт шаманские бубны и предметы Силы, проводит обряды, практики и обучение в Хакасии. Более 3500 созданных бубнов.',
    h1: 'Святовид Татур — мастер «Дух Сибири»',
    body: `<p>Мастерская «Дух Сибири» работает с 2009 года. Святовид создаёт предметы Силы — бубны, зеркала Толи, онгоны, обереги — и проводит обряды, практики и обучение. Более 3500 бубнов, рождённых руками мастера.</p>
<p>Работа не ставится на поток: участие и заказ обсуждаются через личный отклик. Инструмент рождается под человека — ручная работа, натуральные материалы, авторская настройка.</p>`,
  },
  {
    route: '/contacts', out: 'contacts.html',
    title: 'Контакты — Дух Сибири | Святовид Татур',
    desc: 'Связаться с мастерской «Дух Сибири»: ВКонтакте, телефон +7 981 900-32-32. Заказ шаманских бубнов, обрядов и практик в Хакасии.',
    h1: 'Контакты мастерской «Дух Сибири»',
    body: `<p>Самый быстрый путь связаться — позвонить или написать ВКонтакте.</p>
<p>Телефон: +7 981 900-32-32. ВКонтакте: vk.com/shamanic_drums. Telegram-канал мастера: t.me/shaman_tatur. Заказ бубнов, обрядов и практик — в Хакасии.</p>`,
  },
  {
    route: '/privacy', out: 'privacy.html',
    title: 'Политика конфиденциальности — Дух Сибири',
    desc: 'Политика конфиденциальности сайта «Дух Сибири»: как обрабатываются и защищаются персональные данные пользователей.',
    h1: 'Политика конфиденциальности',
    body: `<p>Как мы обрабатываем и защищаем персональные данные пользователей сайта «Дух Сибири» согласно Федеральному закону № 152-ФЗ.</p>`,
  },
  {
    route: '/cookies', out: 'cookies.html',
    title: 'Политика использования cookie — Дух Сибири',
    desc: 'Какие cookie-файлы использует сайт «Дух Сибири» и как ими управлять.',
    h1: 'Политика использования cookie',
    body: `<p>Какие cookie-файлы использует сайт «Дух Сибири» и как ими управлять.</p>`,
  },
].filter((p) => p.out)

const crumbName = {
  '/drums': 'Бубны', '/shop': 'Лавка', '/practices': 'Обряды и практики',
  '/master': 'Мастер', '/contacts': 'Контакты',
  '/privacy': 'Политика конфиденциальности', '/cookies': 'Политика Cookie',
}

const faqItems = [
  ['Сколько делается бубен?', 'Сроки зависят от диаметра, материалов и текущей загрузки мастерской. Точный срок мастер называет после разговора — обычно от нескольких недель.'],
  ['Из чего делается инструмент?', 'Обод — гнуто-клееный, мембрана — натуральная выделанная шкура. Конкретные материалы мастер подбирает под человека. Натяжение регулируется механизмом с ключом. В комплекте — влагостойкий чехол, колотушка и ключ.'],
  ['Сколько стоит бубен?', 'Стоимость рассчитывается под конкретный инструмент: диаметр, материалы, символику и сложность работы. Цена — от 50 000 ₽.'],
  ['Можно ли заказать из другого города?', 'Да. Обсуждение проходит онлайн — ВКонтакте или по телефону, готовый инструмент отправляется доставкой. Обряды и практикумы проходят очно в Хакасии.'],
  ['Как проходят обряды и практикумы?', 'Очно, на местах силы Хакасии, по датам годового цикла. Формат зависит от запроса, числа участников и готовности к практике.'],
  ['Что будет после заявки?', 'Мастер связывается лично, уточняет запрос, материалы, сроки и стоимость. Работа не ставится на поток — каждый инструмент и обряд обсуждаются индивидуально.'],
]
const faqLd = JSON.stringify({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqItems.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
})

const ogImage = {
  '/': 'ritual-set', '/drums': 'drum-hozyaika', '/shop': 'shop-huvaanok',
  '/practices': 'trail-predkov', '/master': 'master-shaman', '/contacts': 'khak-lake',
  '/privacy': 'ritual-set', '/cookies': 'ritual-set',
}

const productLd = JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Product',
  name: 'Шаманский бубен ручной работы на заказ',
  description: 'Бубен под человека: гнуто-клееный обод, натуральная выделанная шкура, авторская настройка с механизмом регулировки, резная рукоять и символика.',
  image: ORIGIN + '/generated/real/drum-hozyaika.webp',
  brand: { '@type': 'Brand', name: 'Дух Сибири' },
  category: 'Шаманские бубны',
  offers: {
    '@type': 'AggregateOffer', priceCurrency: 'RUB',
    lowPrice: '50000', highPrice: '90000', offerCount: '14',
    availability: 'https://schema.org/MadeToOrder',
    seller: { '@type': 'Organization', name: 'Дух Сибири' },
  },
})

const shell = readFileSync(join(DIST, 'index.html'), 'utf8')

const esc = (s) => s.replace(/"/g, '&quot;')

for (const p of pages) {
  const url = ORIGIN + p.route
  let html = shell
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${p.title}</title>`)
  html = html.replace(/(<meta name="description" content=")[\s\S]*?("\s*\/>)/, `$1${esc(p.desc)}$2`)
  html = html.replace(/(<link rel="canonical" href=")[\s\S]*?(" \/>)/, `$1${url}$2`)
  html = html.replace(/(<meta property="og:url" content=")[\s\S]*?(")/, `$1${url}$2`)
  html = html.replace(/(<meta property="og:title" content=")[\s\S]*?(")/, `$1${esc(p.title)}$2`)
  html = html.replace(/(<meta property="og:description" content=")[\s\S]*?(")/, `$1${esc(p.desc)}$2`)
  const ogImg = `${ORIGIN}/generated/real/${ogImage[p.route] || 'ritual-set'}.webp`
  html = html.replace(/(<meta property="og:image" content=")[\s\S]*?(")/, `$1${ogImg}$2`)

  const seo = `<div class="seo-prerender" style="max-width:780px;margin:0 auto;padding:140px 24px 80px;color:#f8efe1;font-family:Spectral,Georgia,serif">
<h1 style="font-size:clamp(30px,5vw,46px);font-weight:400;line-height:1.1;margin:0 0 22px">${p.h1}</h1>
<div style="font-family:Manrope,system-ui,sans-serif;font-size:17px;line-height:1.65;color:rgba(248,239,225,.78)">${p.body}</div>
${nav}
</div>`
  html = html.replace('<div id="root"></div>', `<div id="root">${seo}</div>`)

  // Расширенная Schema.org разметка по странице
  const ld = []
  if (p.route !== '/') {
    ld.push(JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: ORIGIN + '/' },
        { '@type': 'ListItem', position: 2, name: crumbName[p.route] || p.h1, item: url },
      ],
    }))
  }
  if (p.route === '/drums') ld.push(faqLd, productLd)
  if (ld.length) {
    const tags = ld.map((j) => `<script type="application/ld+json">${j}</script>`).join('\n    ')
    html = html.replace('</head>', `    ${tags}\n  </head>`)
  }

  const outPath = join(DIST, p.out)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, html)
  console.log('prerendered', p.out, '->', url)
}

// sitemap.xml со всеми реальными URL
const sitemapUrls = ['/', '/drums', '/shop', '/practices', '/master', '/contacts']
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u, i) => `  <url>
    <loc>${ORIGIN}${u}</loc>
    <changefreq>weekly</changefreq>
    <priority>${i === 0 ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), sitemap)
console.log('sitemap.xml written with', sitemapUrls.length, 'urls')
