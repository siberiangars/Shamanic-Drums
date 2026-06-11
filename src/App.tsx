import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Bolt,
  ChevronLeft,
  ChevronRight,
  Gem,
  Hammer,
  Headphones,
  Infinity as InfinityIcon,
  MapPin,
  MessageCircle,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  ZoomIn,
} from 'lucide-react'
import './index.css'

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void
  }
}

const METRIKA_ID = 109739306

// Цель в Яндекс.Метрике (создать в Метрике с тем же идентификатором: lead, vk, phone, order)
function goal(name: string) {
  window.ym?.(METRIKA_ID, 'reachGoal', name)
}

const apiBase = import.meta.env.VITE_API_URL ?? ''

type PageKey = 'home' | 'drums' | 'shop' | 'practices' | 'master' | 'contacts' | 'privacy' | 'cookies'

type LeadForm = {
  serviceType: string
  name: string
  contact: string
  city: string
  format: string
  preferredDate: string
  diameter: string
  membrane: string
  rim: string
  tuning: string
  purpose: string
  message: string
}

const pageTitles: Record<PageKey, string> = {
  home: 'Главная',
  drums: 'Бубны',
  shop: 'Лавка',
  practices: 'Обряды и практики',
  master: 'Мастер',
  contacts: 'Контакты',
  privacy: 'Политика конфиденциальности',
  cookies: 'Политика Cookie',
}

const navItems: Array<{ key: PageKey; label: string }> = [
  { key: 'home', label: 'Главная' },
  { key: 'drums', label: 'Бубны' },
  { key: 'shop', label: 'Лавка' },
  { key: 'practices', label: 'Практики' },
  { key: 'master', label: 'Мастер' },
  { key: 'contacts', label: 'Контакты' },
]

const initialForm: LeadForm = {
  serviceType: 'Бубен на заказ',
  name: '',
  contact: '',
  city: '',
  format: 'Лично',
  preferredDate: '',
  diameter: '55–60 см',
  membrane: 'натуральная шкура',
  rim: 'гнуто-клееный обод',
  tuning: 'механизм регулировки натяжки',
  purpose: 'Личная практика',
  message: '',
}

const resources = [
  { label: 'ВКонтакте', href: 'https://vk.com/shamanic_drums' },
  { label: 'Telegram', href: 'https://t.me/shaman_tatur' },
  { label: 'Instagram', href: 'https://www.instagram.com/shamanic_drum/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@%D0%A1%D0%B2%D1%8F%D1%82%D0%BE%D0%B2%D0%B8%D0%B4%D0%A2%D0%B0%D1%82%D1%83%D1%80' },
  { label: 'Livemaster', href: 'https://www.livemaster.ru/sayanshaman' },
]

const masterPhone = '+7 981 900-32-32'
const masterPhoneHref = 'tel:+79819003232'
const vkContact = 'https://vk.com/shamanic_drums'

// TODO: уточнить точные числа у мастера. «125 медведь» в архиве → инструмент №125, поэтому 100+ defensible.
const stats = [
  { value: '2009', label: 'Основана мастерская «Дух Сибири»' },
  { value: '17 лет', label: 'Пути в живой традиции' },
  { value: '3500+', label: 'Бубнов рождено мастером' },
  { value: 'Хакасия', label: 'Земля обрядов и практик' },
]

const knownClients = ['Свами Даши', 'Светлана Бутусова', 'Николай Качуров']

const schedule2026 = [
  { date: '15–19 июня', title: 'Рождение бубна. Хакасия', text: 'Пятидневный практикум создания бубна в юрте у горы Умай: обряд силы предков, очищение через стихии, рождение инструмента и работа с ним.', seats: 'Осталось 3 места' },
  { date: '19–21 июня', title: 'Летнее солнцестояние', text: 'Обряды очищения, создание оберегов и белые дороги в период сильного солнца и открытого пространства.', seats: 'Осталось 5 мест' },
  { date: '14–18 июля', title: 'Рождение бубна. Хакасия', text: 'Летний практикум для тех, кто чувствует готовность пройти путь создания личного инструмента.', seats: 'Идёт запись' },
  { date: '2–8 августа', title: 'Тур по местам силы Хакасии', text: 'Выезды к древним местам, обряды, обучение, работа со стихиями и пространством земли.', seats: 'Осталось 4 места' },
  { date: '17–21 сентября', title: 'Закрытие Небесных Врат', text: 'Ключевой обряд года: благодарность, подведение итогов и подготовка к зимнему периоду.', seats: 'Идёт запись' },
  { date: '10–14 октября', title: 'Рождение бубна и работа с ним', text: 'Углубленный практикум на местах силы Хакасии: создание инструмента и обучение работе с ним в живом пространстве.', seats: 'Идёт запись' },
  { date: '19–21 декабря', title: 'Зимнее солнцестояние', text: 'Переход через самую тёмную точку года: очищение, укрепление и настройка на новый цикл.', seats: 'Идёт запись' },
]

const principles = [
  { title: 'Не поток', text: 'Мастер не ставит работу на поток: участие и заказ обсуждаются через личный отклик.' },
  { title: 'Ответственность', text: 'Бубен — инструмент ответственности, регулярной практики и бережной связи с родом, природой и внутренней тишиной.' },
  { title: 'Выбор по пути', text: 'Создать или купить бубен — выбор по этапу пути: иногда нужен готовый проводник, иногда важен сам процесс рождения инструмента своими руками.' },
  { title: 'Живой опыт', text: 'Обряды и практикумы проходят в Хакасии — на земле, где традиция передаётся как живой опыт, а не теория.' },
]

// Реальные отзывы из VK-темы «Отзывы о приобретённых изделиях» (vk.com/topic-54794738_30020260).
// Цитаты сокращены дословными фрагментами, имена сохранены как в источнике.
const reviewsUrl = 'https://vk.com/topic-54794738_30020260'
const testimonials = [
  { name: 'Майя Касс', tag: 'Бубен на заказ · ВКонтакте', text: 'Звучание и вибрации оказались неописуемо мощными, огромная целительская сила идёт через бубен. Первый раз слышу такое звучание у бубна.' },
  { name: 'Николай Качуров', tag: 'Бубен на заказ · ВКонтакте', text: 'Сочный и раскатистый звук, насыщенные обертоны. Всё качественно и на своём месте. Ты истинный Мастер. Благодарен тебе за Друга.' },
  { name: 'Светлана', tag: 'Бубен в подарок', text: 'Качество работы — на высшем уровне, сроки выдержаны. Человек, получивший бубен в подарок, просто счастлив. Святовид, вы просто волшебник!' },
  { name: 'Александр Ермак', tag: 'Обзор бубна · ВКонтакте', text: 'Обалдеть. Реально звук сильно отличается. Энергия медведя.' },
  { name: 'Olhos Verdes', tag: 'Дух Севера · ВКонтакте', text: 'Вещь сделана на совесть, и это чувствуется в каждой детали. Вещи получаются живыми, резонирующими — это очень много стоит в наши дни.' },
  { name: 'Владислав Фёдоров', tag: 'Бубен из рук мастера', text: 'Получил бубен прямо из рук мастера. Инструмент живой, отозвался сразу — словами не передать. Красивый бархатистый бас, резная рукоять.' },
  { name: 'Елена Ворон', tag: 'Шаманский бубен', text: 'Благодарю за бубен! Он шикарен — и внешне, и звук.' },
  { name: 'Людмила Дундукова', tag: 'Бубен на заказ · ВКонтакте', text: 'Качество замечательное, звук глубокий. Два раза работали в лесу — результаты превзошли все ожидания. Друзья уже заказали такой же.' },
  { name: 'Альбина Мороз', tag: 'Бубен Верхнего Мира · ВКонтакте', text: 'Сказала мастеру: «сделай тот, что придёт, я тебе верю». Он волшебный — сам пришёл, родился в руках Мастера.' },
  { name: 'Яна', tag: 'Амулет Туур', text: 'Отличная работа! Всё понравилось, рекомендую мастера.' },
  { name: 'Андрей', tag: 'Перкуссия', text: 'Супер! Очень качественные вещи, с душой. Мастер — настоящая находка.' },
  { name: 'Lisa Veda', tag: 'Артыш', text: 'Благодарю мастера за чудесный артыш! Запах волшебный, всё доехало в целости. Удачной практики и творчества!' },
  { name: 'Василий', tag: 'Шаманский амулет', text: 'Мастер немногословен, но работу сделал замечательно. Спасибо!' },
]

const photos = {
  hero: '/generated/real/hero-field.webp',
  ritual: '/generated/real/ritual-set.webp',
  clamps: '/generated/real/clamps-workshop.webp',
  carving: '/generated/real/carved-panel.webp',
  master: '/generated/real/master-with-drum.webp',
  rim: '/generated/real/wood-rim.webp',
  bear: '/generated/real/bear-drum.webp',
  finished: '/generated/real/finished-drum.webp',
  beater: '/generated/real/beater.webp',
  wood: '/generated/real/wood-carving.webp',
  flame: '/generated/real/hero-flame.webp',
  gold: '/generated/real/drum-gold.webp',
  khakassia: '/generated/real/khakassia.webp',
  handle: '/generated/real/drum-handle.webp',
  drumFront: '/generated/real/drum-front.webp',
  drumsRoom: '/generated/real/drums-room.webp',
  stand4: '/generated/real/drum-stand-4.webp',
  goddess: '/generated/real/drum-goddess.webp',
  warm1: '/generated/real/drum-warm-1.webp',
  warm2: '/generated/real/drum-warm-2.webp',
  standWarm: '/generated/real/drum-stand-warm.webp',
  khakForest: '/generated/real/khak-forest.webp',
  khakPines: '/generated/real/khak-pines.webp',
  khakLake: '/generated/real/khak-lake.webp',
  khakRibbons: '/generated/real/khak-ribbons.webp',
  masterLake: '/generated/real/master-lake.webp',
  umaiPano: '/generated/real/umai-pano.webp',
  umaiSun: '/generated/real/umai-sun.webp',
  umaiValley: '/generated/real/umai-valley.webp',
  umaiMist: '/generated/real/umai-mist.webp',
  masterShaman: '/generated/real/master-shaman.webp',
  hall: '/generated/real/hall.webp',
  seminarGroup: '/generated/real/seminar-group.webp',
  hotelExt: '/generated/real/hotel-ext.webp',
  hotelInt: '/generated/real/hotel-int.webp',
  hotelProject: '/generated/real/hotel-project.webp',
  fireRite: '/generated/real/fire-rite.webp',
  processMolds: '/generated/real/process-molds.webp',
  processBench: '/generated/real/process-bench.webp',
  procRims: '/generated/real/proc-rims.webp',
  procTools: '/generated/real/proc-tools.webp',
  procSmudge: '/generated/real/proc-smudge.webp',
  procCat: '/generated/real/proc-cat.webp',
  procWindow: '/generated/real/proc-window.webp',
  procStack: '/generated/real/proc-stack.webp',
  yurt: '/generated/real/yurt.webp',
  hozyaika: '/generated/real/drum-hozyaika.webp',
  shopKolotushka: '/generated/real/shop-kolotushka.webp',
  shopZerkala: '/generated/real/shop-zerkala.webp',
  shopHuvaanok: '/generated/real/shop-huvaanok.webp',
  shopLozhka: '/generated/real/shop-lozhka.webp',
  shopArtysh: '/generated/real/shop-artysh.webp',
  trailPredkov: '/generated/real/trail-predkov.webp',
  logoMark: '/generated/real/logo-mark.webp',
  logoEmblem: '/generated/real/logo-emblem-v3.webp',
}

// TODO: цены — ПЛЕЙСХОЛДЕРЫ. Заменить на реальные «от …» по согласованию с мастером.
const catalog = [
  { image: '/generated/real/drum-hozyaika.webp', name: 'Хозяйка', size: '50 см', spec: 'Резная расписная рукоять, механизм регулировки натяжения', price: 'от 75 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-bereginya.webp', name: 'Берегиня', size: '50 см', spec: 'Резная фигурная рукоять, механизм регулировки натяжения', price: 'от 80 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-windhorse.webp', name: 'Конь ветра', size: '50 см', spec: 'Гнуто-клееный обод, Древо Жизни, резная рукоять', price: 'от 65 000 ₽', status: 'Свободен' },
  { image: '/generated/real/drum-eagle.webp', name: 'Орёл', size: '45 см', spec: 'Резная рукоять-птица, тёплый бас', price: 'от 60 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-deva.webp', name: 'Дева', size: '45 см', spec: 'Резная фигурная рукоять, Древо Жизни', price: 'от 75 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-totem.webp', name: 'Тотем', size: '50 см', spec: 'Резная звериная рукоять, обод с бусинами', price: 'от 70 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/bear-drum.webp', name: 'Медведь', size: '50 см', spec: 'Тотемная резная рукоять', price: 'от 70 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-warm-1.webp', name: 'Древо Жизни', size: '45 см', spec: 'Механизм регулировки натяжки, классический голос', price: 'от 55 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-stand-warm.webp', name: 'Странник', size: '40 см', spec: 'Резная рукоять, подвесы и символика', price: 'от 50 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-tulpar.webp', name: 'Тулпар', size: '60 см', spec: 'Яйцевидная форма, резная рукоять-конь, осиново-берёзовый обод, механизм натяжки', price: 'от 90 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-volk.webp', name: 'Волк', size: '60 см', spec: 'Овальная форма, резная рукоять-волк, Древо Жизни, обод с бусинами', price: 'от 85 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-guran.webp', name: 'Гуран', size: '63 см', spec: 'Шкура гурана, берёзовый обод, Древо Жизни, резной орнамент по ободу', price: 'от 90 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/finished-drum.webp', name: 'Лада', size: '50 см', spec: 'Резная рукоять-берегиня, Древо Жизни', price: 'от 75 000 ₽', status: 'Под заказ' },
  { image: '/generated/real/drum-front.webp', name: 'Сова', size: '45 см', spec: 'Резная рукоять-сова, Древо Жизни', price: 'от 65 000 ₽', status: 'Свободен' },
]

const drumVoices = [
  { id: '456239710', poster: '/generated/real/video-bear-review.webp', title: 'Бубен из шкуры медведя', note: 'Глубокий тёплый бас — слышно энергию зверя' },
  { id: '456239698', poster: '/generated/real/video-bear-80.webp', title: 'Большой бубен 80 см', note: 'Низкий объёмный звук большого диаметра' },
  { id: '456239413', poster: '/generated/real/video-drum-play.webp', title: 'Игра на бубне', note: 'Слышно тон, бас и отклик мембраны вблизи' },
  { id: '456239474', poster: '/generated/real/video-drum-mountain.webp', title: 'Бубен под открытым небом', note: 'Чистое звучание на месте силы в горах' },
]

const birthSteps = [
  { n: '01', title: 'Дерево', text: 'Всё начинается с дерева. Заготовка сушится и отбирается под будущий обод — основу голоса инструмента.', image: photos.procStack },
  { n: '02', title: 'Обод', text: 'Гнуто-клееный обод собирается на станках, с раздвижным механизмом и премиальной фурнитурой. Это сердце настройки, которой нет у сувенирных бубнов.', image: photos.clamps },
  { n: '03', title: 'Мембрана', text: 'Натуральная выделанная шкура становится мембраной. Её посадка и натяжение задают тембр — от тёплого баса до звонкого верха.', image: photos.gold },
  { n: '04', title: 'Сборка и настройка', text: 'Обод и мембрана соединяются, тон выставляется механизмом под ключ. Звук подстраивается под человека, а не человек под бубен.', image: photos.procCat },
  { n: '05', title: 'Рукоять и символика', text: 'Резная рукоять, Древо Жизни, тотемное животное, подвесы и знаки — всё рождается под задачу и род будущего владельца.', image: photos.carving },
  { n: '06', title: 'Обряд и первый голос', text: 'При рождении инструмент проходит обряд и окуривание. Мастер даёт наставления — и бубен впервые подаёт голос.', image: photos.procSmudge },
]

const photoEssay = [
  { image: photos.processBench, label: 'Ручная работа', title: 'Каждый бубен собирается вручную' },
  { image: photos.procRims, label: 'Натуральные материалы', title: 'Гнуто-клееный обод и натуральная шкура' },
  { image: photos.procTools, label: 'Технология десятилетий', title: 'Отточена годами практики' },
  { image: photos.procCat, label: 'Высокая надёжность', title: 'Раздвижной обод, механизм натяжки' },
  { image: photos.procSmudge, label: 'Обряд при рождении', title: 'Каждый инструмент проходит обряд' },
  { image: photos.procWindow, label: 'Своя мастерская', title: 'Под святой горой Умай, на Енисее' },
]

const faq = [
  { q: 'Сколько делается бубен?', a: 'Сроки зависят от диаметра, материалов и текущей загрузки мастерской. Точный срок мастер называет после разговора и согласования инструмента — обычно от нескольких недель.' },
  { q: 'Из чего делается инструмент?', a: 'Обод — гнуто-клееный, мембрана — натуральная выделанная шкура. Конкретные материалы (порода дерева и вид шкуры) мастер подбирает под человека и задачу — они могут отличаться. Натяжение регулируется механизмом с ключом, обод раздвижной на надёжной фурнитуре. В комплекте идут влагостойкий чехол, колотушка и ключ для регулировки. Диаметр, рукоять, символика и подвесы подбираются индивидуально.' },
  { q: 'Сколько стоит бубен?', a: 'Стоимость рассчитывается под конкретный инструмент: диаметр, материалы, символику и сложность работы. Оставьте заявку — мастер назовёт вилку под ваш запрос.' },
  { q: 'Можно ли заказать из другого города?', a: 'Да. Обсуждение проходит онлайн — ВКонтакте или по телефону, готовый инструмент отправляется доставкой. Обряды и практикумы проходят очно в Хакасии.' },
  { q: 'Как проходят обряды и практикумы?', a: 'Очно, на местах силы Хакасии, по датам годового цикла. Формат зависит от запроса, числа участников и готовности к практике — детали мастер уточняет лично.' },
  { q: 'Что будет после заявки?', a: 'Мастер связывается лично, уточняет запрос, материалы, сроки и стоимость. Работа не ставится на поток — каждый инструмент и обряд обсуждаются индивидуально.' },
]

const drumOptions = ['Личный бубен', 'Бубен для практик', 'Подарочный инструмент', 'Предмет Силы', 'Ремонт или настройка']
const practiceOptions = ['Практика с бубном', 'Практикум рождения бубна', 'Тур по местам силы Хакасии', 'Небесные Врата', 'Обучение работе с инструментом']

const directions = [
  { title: 'Обряды годового цикла', text: 'Солнцестояния, открытие и закрытие Небесных Врат, белые дороги — по точкам силы года, на местах силы Хакасии.' },
  { title: 'Личные и родовые обряды', text: 'Очищение пространства, родовые запросы, переходные периоды. Формат зависит от запроса, состояния и готовности к практике.' },
  { title: 'Рождение бубна', text: 'Пятидневный практикум: свой инструмент рождается через обряд — от заготовки дерева до настройки и первого голоса.' },
  { title: 'Работа с бубном', text: 'Обучение шаманским путешествиям в Верхний, Средний и Нижний миры, камлание, техники защиты, центрирования и заземления.' },
  { title: 'Туры по местам силы', text: 'Выезды к древним местам Хакасии: обряды, обучение и работа со стихиями и пространством земли.' },
  { title: 'Личная консультация', text: 'Шаманский разбор запроса и диагностика: поиск опоры, работа с родом, страхами и направлением пути.' },
]

const shopItems = [
  { image: photos.shopKolotushka, name: 'Колотушки для бубна', spec: 'Резная колотушка из дерева, обтянутая кожей и мехом. Подбирается под бубен, руку и звук.', price: 'Под заказ', status: 'Под заказ' },
  { image: photos.shopZerkala, name: 'Шаманские зеркала (кузунгу)', spec: 'Литые латунные зеркала-кузунгу для защиты и работы с пространством. От 8 см, изготовление под заказ.', price: 'Под заказ', status: 'Под заказ' },
  { image: photos.shopHuvaanok, name: 'Комплект для гадания «Хуваанок»', spec: 'Камни, собранные на местах силы Хакасии и Тувы, поле для расклада, мешочек под камни и сумка.', price: 'Цена в ВК', status: 'В наличии' },
  { image: photos.shopLozhka, name: 'Ложка-девятиглазка (тос-карак)', spec: 'Ритуальная ложка-кропило с девятью глазами — для подношений духам девяти Небес. Литьё, ручная работа.', price: 'Под заказ', status: 'Под заказ' },
  { image: photos.shopArtysh, name: 'Артыш (сибирский можжевельник)', spec: 'Сушёный артыш для окуривания и очищения пространства, человека и инструмента. Свежий сбор.', price: '900 ₽ / пучок', status: 'В наличии' },
]

const legalUpdated = '7 июня 2026 г.'

type LegalSection = { h: string; p?: string[]; list?: string[] }

const privacySections: LegalSection[] = [
  { h: '1. Оператор персональных данных', p: ['Мастерская «Дух Сибири» — ИП Пушкин Юрий Михайлович.', 'Телефон: +7 981 900-32-32', 'ВКонтакте: vk.com/shamanic_drums', 'Telegram: @shaman_tatur'] },
  { h: '2. Какие данные мы собираем', list: ['Имя и контактные данные, указанные в формах обратной связи (телефон, ссылка ВКонтакте или другой мессенджер).', 'Данные о посещении: IP-адрес, тип браузера, дату и время визита.', 'Cookie-файлы (см. Политику Cookie).'] },
  { h: '3. Цели обработки персональных данных', list: ['Обработка заявок и обратная связь с пользователем.', 'Предоставление услуг и изготовление инструментов.', 'Улучшение работы и удобства сайта.', 'Выполнение требований законодательства РФ.'] },
  { h: '4. Правовые основания обработки', p: ['Обработка осуществляется на основании согласия субъекта персональных данных и исполнения договора (ст. 6 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»).'] },
  { h: '5. Порядок и сроки хранения', p: ['Персональные данные хранятся столько времени, сколько требуют цели их обработки, после чего уничтожаются.'] },
  { h: '6. Передача данных третьим лицам', p: ['Оператор не передаёт персональные данные третьим лицам, за исключением сервисов хостинга и обработки заявок, необходимых для работы сайта, в объёме, требуемом для оказания услуги.'] },
  { h: '7. Права пользователя', list: ['Получать информацию об обработке своих персональных данных.', 'Требовать уточнения, блокировки или уничтожения данных.', 'Отозвать согласие на обработку данных.', 'Обжаловать действия оператора в Роскомнадзор.'] },
  { h: '8. Меры защиты данных', p: ['Оператор принимает необходимые организационные и технические меры для защиты персональных данных от неправомерного доступа, изменения, распространения или уничтожения.'] },
  { h: '9. Изменение Политики', p: ['Оператор вправе вносить изменения в настоящую Политику. Новая редакция вступает в силу с момента её размещения на сайте.'] },
]

const cookieSections: LegalSection[] = [
  { h: '1. Что такое cookie', p: ['Cookie — небольшие текстовые файлы, которые сохраняются в вашем браузере при посещении сайта и помогают ему работать корректно.'] },
  { h: '2. Какие cookie мы используем', list: ['Технические — необходимы для работы сайта и сохранения базовых настроек.', 'Аналитические — помогают понять, как используется сайт, и улучшать его (в обезличенном виде).'] },
  { h: '3. Управление cookie', p: ['Вы можете отключить или удалить cookie в настройках своего браузера. При этом часть функций сайта может работать некорректно.'] },
  { h: '4. Согласие на использование', p: ['Продолжая пользоваться сайтом, вы соглашаетесь с использованием cookie в соответствии с настоящей Политикой и Политикой конфиденциальности.'] },
]

function App() {
  const [activePage, setActivePage] = useState<PageKey>(() => getPageFromPath())
  const [form, setForm] = useState<LeadForm>(initialForm)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onPop = () => setActivePage(getPageFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    document.title = activePage === 'home'
      ? 'Дух Сибири — шаманские бубны ручной работы | Святовид Татур'
      : `${pageTitles[activePage]} — Дух Сибири | Святовид Татур`
  }, [activePage])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // При смене страницы — наверх (сразу и после кадра, чтобы перебить scroll-anchoring)
  useEffect(() => {
    window.scrollTo(0, 0)
    const id = requestAnimationFrame(() => window.scrollTo(0, 0))
    return () => cancelAnimationFrame(id)
  }, [activePage])

  // Яндекс.Метрика: учёт переходов между страницами (первую загрузку считает init в index.html)
  const firstHit = useRef(true)
  useEffect(() => {
    if (firstHit.current) {
      firstHit.current = false
      return
    }
    window.ym?.(METRIKA_ID, 'hit', window.location.href)
  }, [activePage])

  useEffect(() => {
    const defaults: Partial<Record<PageKey, Pick<LeadForm, 'serviceType' | 'purpose' | 'format'>>> = {
      drums: { serviceType: 'Бубен на заказ', purpose: 'Личный бубен', format: 'Доставка' },
      practices: { serviceType: 'Обряд или практика', purpose: 'Обряд или практика', format: 'Лично' },
    }
    const next = defaults[activePage]
    if (!next) return
    setForm((current) => ({ ...current, ...next }))
  }, [activePage])


  function navigate(page: PageKey) {
    const path = pagePaths[page]
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
    setActivePage(page)
    setMenuOpen(false)
  }

  function selectService(page: PageKey, serviceType: string, purpose: string) {
    goal('order')
    setForm((current) => ({ ...current, serviceType, purpose, format: page === 'drums' ? 'Доставка' : 'Лично' }))
    navigate(page)
    window.setTimeout(() => document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' }), 160)
  }

  function updateField(field: keyof LeadForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    try {
      const response = await fetch(`${apiBase}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error('lead request failed')
      setStatus('sent')
      goal('lead')
      setForm(initialForm)
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="site-shell">
      <motion.div className="read-progress" style={{ scaleX: progress, width: '100%' }} aria-hidden="true" />

      <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
        <button className="brand" onClick={() => navigate('home')} aria-label="Дух Сибири — на главную">
          <span className="brand-mark"><img className="logo-emblem" src={photos.logoEmblem} alt="Дух Сибири" /></span>
          <span>Дух&nbsp;Сибири</span>
        </button>
        <nav aria-label="Основная навигация">
          {navItems.map((item) => (
            <button className={activePage === item.key ? 'nav-active' : ''} onClick={() => navigate(item.key)} key={item.key}>
              {item.label}
            </button>
          ))}
        </nav>
        <a className="topbar-action" href={vkContact} target="_blank" rel="noreferrer" onClick={() => goal('vk')}>
          <MessageCircle size={17} />
          ВКонтакте
        </a>
        <button className="burger" onClick={() => setMenuOpen(true)} aria-label="Открыть меню">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <button className="burger" style={{ position: 'absolute', top: 24, right: 'var(--gutter)' }} onClick={() => setMenuOpen(false)} aria-label="Закрыть меню">
              <X size={20} />
            </button>
            <nav>
              {navItems.map((item, i) => (
                <motion.button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                >
                  {item.label}
                  <span>0{i + 1}</span>
                </motion.button>
              ))}
            </nav>
            <div className="mobile-menu-foot">
              <a className="button button-primary" href={vkContact} target="_blank" rel="noreferrer">
                Написать в ВК <Send size={17} />
              </a>
              <a className="button button-ghost" href={masterPhoneHref}>Позвонить · {masterPhone}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div key={activePage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      {activePage === 'home' && (
        <>
          <Hero onOrder={() => navigate('drums')} onCeremonies={() => navigate('practices')} />
          <WorksCarousel onOrder={() => navigate('drums')} />
          <MasterBand onContact={() => navigate('master')} />
          <Testimonials />
          <PlaceOfPower onPractices={() => navigate('practices')} />
          <BaseSection onPractices={() => navigate('practices')} />
        </>
      )}

      {activePage === 'drums' && (
        <>
          <ServicePage kicker="Бубны на заказ" title="Инструмент собирается под человека, а не под витрину" text="Диаметр, кожа, обод, настройка, рукоять, символика и назначение обсуждаются до изготовления." options={drumOptions} image={photos.hozyaika} hideOptions onSelect={(o) => selectService('drums', 'Бубен на заказ', o)} />
          <DrumsCatalog onOrder={(name) => selectService('drums', 'Бубен на заказ', `Бубен «${name}»`)} />
          <DrumVoice />
          <DrumBirth />
          <TuningTech />
          <FaqSection />
        </>
      )}
      {activePage === 'shop' && <ShopPage />}
      {activePage === 'practices' && (
        <>
          <ServicePage kicker="Обряды и практики" title="Обряды, практикумы и обучение в живом пространстве Хакасии" text="Обряды годового цикла, личные и родовые практики, создание бубна, обучение работе с инструментом и туры по местам силы — всё очно, на земле под святой горой Умай." options={practiceOptions} image={photos.fireRite} hideOptions onSelect={(o) => selectService('practices', 'Обряд или практика', o)} />
          <Directions />
          <AncestorTrail />
          <PlacesBand />
          <SeminarBand />
          <ScheduleSection />
          <TelegramBand />
        </>
      )}
      {activePage === 'master' && <MasterPage />}
      {activePage === 'contacts' && <ContactsPage />}
      {activePage === 'privacy' && <LegalPage title="Политика конфиденциальности" intro="Как мы обрабатываем и защищаем персональные данные пользователей сайта «Дух Сибири»." sections={privacySections} />}
      {activePage === 'cookies' && <LegalPage title="Политика использования cookie" intro="Какие cookie-файлы использует сайт и как ими управлять." sections={cookieSections} />}
      </motion.div>

      {activePage !== 'privacy' && activePage !== 'cookies' && (
        <RequestSection form={form} status={status} onChange={updateField} onSubmit={submitLead} />
      )}
      <Footer onOrder={() => navigate('drums')} onNav={navigate} />

      <div className="mobile-cta">
        <a className="button button-ghost" href={masterPhoneHref} onClick={() => goal('phone')}>Позвонить</a>
        <a className="button button-primary" href={vkContact} target="_blank" rel="noreferrer" onClick={() => goal('vk')}>ВКонтакте <Send size={16} /></a>
      </div>
    </main>
  )
}

function Hero({ onOrder, onCeremonies }: { onOrder: () => void; onCeremonies: () => void }) {
  const { scrollYProgress } = useScroll()
  const photoY = useTransform(scrollYProgress, [0, 0.4], ['0%', '14%'])
  const photoScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.08])
  const words = ['Мастерская', 'Святовида', 'Татура']

  return (
    <section className="hero" id="top">
      <motion.div className="hero-photo" style={{ y: photoY, scale: photoScale }} aria-hidden="true" />
      <div className="hero-copy">
        <motion.span className="kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          Дух Сибири · Мастерская с 2009 года
        </motion.span>
        <h1 aria-label="Мастерская Святовида Татура">
          {words.map((w, i) => (
            <span className="hero-word" key={w}>
              <motion.span
                style={{ display: 'inline-block' }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.span className="hero-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
          Шаманские бубны ручной работы и предметы Силы. Каждый инструмент рождается под человека — под его задачу, практику и звук.
        </motion.span>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62, duration: 0.7 }}>
          <button className="button button-primary" onClick={onOrder}>Заказать бубен <ArrowRight size={18} /></button>
          <button className="button button-ghost" onClick={onCeremonies}>Обряды и практики</button>
        </motion.div>
      </div>
    </section>
  )
}

function MasterBand({ onContact }: { onContact: () => void }) {
  return (
    <section className="section on-dark">
      <div className="section-inner master">
        <motion.div
          className="master-portrait"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="badge"><MapPin size={14} /> Хакасия · Санкт-Петербург</span>
        </motion.div>
        <div>
          <span className="kicker">Мастер</span>
          <h2>Святовид Татур</h2>
          <blockquote>«Я не мистик и не эзотерик. Я шаман — человек, опирающийся на собственный опыт и познающий всё в первоисточнике».</blockquote>
          <p className="bio">Создаёт предметы Силы — бубны, зеркала Толи, обереги — и проводит обряды и практики. Работа не ставится на поток: каждый инструмент рождается через руки и личный разговор.</p>
          <div className="stat-grid">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <strong><CountUp value={s.value} /></strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="button button-ghost" onClick={onContact}>О мастере <ArrowRight size={17} /></button>
            <span style={{ fontSize: 13, color: 'var(--cream-soft)' }}>Среди тех, для кого создавались инструменты: {knownClients.join(', ')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function PrinciplesBand() {
  return (
    <section className="section on-light">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Как мастер работает</span>
          <h2>Принципы, а не поток</h2>
          <p className="lead">Почему заказ и участие обсуждаются лично, а инструмент рождается под человека.</p>
        </div>
        <div className="principles-grid">
          {principles.map((p, i) => (
            <motion.div
              className="principle-card"
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            >
              <span className="pn">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const match = /^(\d+)(.*)$/.exec(value.trim())
  const hasNum = !!match
  const target = match ? parseInt(match[1], 10) : 0
  const suffix = match ? match[2] : ''
  const [shown, setShown] = useState(0)
  const done = useRef(false)
  useEffect(() => {
    if (!hasNum) return
    const node = ref.current
    if (!node) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !done.current) {
          done.current = true
          const dur = 1500
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur)
            const eased = 1 - Math.pow(1 - p, 3)
            setShown(Math.round(target * eased))
            if (p < 1) requestAnimationFrame(tick)
            else setShown(target)
          }
          requestAnimationFrame(tick)
        }
      }
    }, { threshold: 0.5 })
    io.observe(node)
    return () => io.disconnect()
  }, [hasNum, target])
  if (!hasNum) return <>{value}</>
  return <span ref={ref}>{shown}{suffix}</span>
}

function TmCard({ t }: { t: { name: string; tag: string; text: string } }) {
  return (
    <figure className="tm-card">
      <span className="stars">{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={14} fill="currentColor" />)}</span>
      <blockquote>{t.text}</blockquote>
      <figcaption>
        <span className="tm-ava">{t.name[0]}</span>
        <span className="tm-who"><strong>{t.name}</strong><span>{t.tag}</span></span>
      </figcaption>
    </figure>
  )
}

function Testimonials() {
  const mid = Math.ceil(testimonials.length / 2)
  const rowA = testimonials.slice(0, mid)
  const rowB = testimonials.slice(mid)
  return (
    <section className="section on-light">
      <div className="section-inner">
        <div className="section-intro tm-head" style={{ maxWidth: 'none' }}>
          <div style={{ maxWidth: 760 }}>
            <span className="kicker">Голоса владельцев</span>
            <h2>Бубны, которые стали живыми</h2>
            <p className="lead">Настоящие отзывы людей, получивших инструменты мастера. О звуке, энергии и о том, как бубен откликнулся и зазвучал в руках.</p>
          </div>
          <a className="tm-alllink" href={reviewsUrl} target="_blank" rel="noreferrer">
            Все отзывы в VK <ArrowUpRight size={17} />
          </a>
        </div>
      </div>

      <div className="tm-marquee">
        <div className="tm-track">
          {[...rowA, ...rowA].map((t, i) => <TmCard key={`a${i}`} t={t} />)}
        </div>
        <div className="tm-track tm-track--rev">
          {[...rowB, ...rowB].map((t, i) => <TmCard key={`b${i}`} t={t} />)}
        </div>
      </div>
    </section>
  )
}

function DrumBirth() {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLLIElement | null)[]>([])
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 })
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <section className="section on-dark">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Рождение бубна</span>
          <h2>Как инструмент приходит в мир</h2>
          <p className="lead">От дерева до первого голоса — каждый бубен проходит весь путь вручную. А на пятидневном практикуме этот путь можно пройти вместе с мастером и родить свой инструмент.</p>
        </div>
        <div className="birth">
          <div className="birth-media">
            {birthSteps.map((s, i) => (
              <img key={s.title} src={s.image} alt={s.title} className={i === active ? 'on' : ''} loading="lazy" />
            ))}
            <span className="birth-badge">{birthSteps[active].n} · {birthSteps[active].title}</span>
          </div>
          <ol className="birth-steps">
            {birthSteps.map((s, i) => (
              <li
                key={s.n}
                data-i={i}
                ref={(el) => { refs.current[i] = el }}
                className={i === active ? 'on' : ''}
              >
                <span className="birth-n">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function DrumVoice() {
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})
  return (
    <section className="section on-dark">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Голос бубна · Звучание</span>
          <h2>Услышьте, как звучит живой инструмент</h2>
          <p className="lead">Бубен делается ради звука — а его не передать фотографией. Эти обзоры сняты на наших инструментах: включите со звуком и услышьте, как поёт бубен, созданный настоящим шаманом и мастером по дереву.</p>
          <p className="voice-headphones"><Headphones size={18} /> Слушайте обязательно в наушниках — глубокий бас бубна не передают динамики телефона и ноутбука.</p>
        </div>
        <div className="voice-grid">
          {drumVoices.map((v, i) => (
            <motion.div
              className="voice-card"
              key={v.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="voice-media">
                {loaded[v.id] ? (
                  <iframe
                    src={`https://vk.com/video_ext.php?oid=234943098&id=${v.id}&hash=99ed9a4edc4f824ff1&autoplay=1`}
                    title={v.title}
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    className="voice-facade"
                    style={{ backgroundImage: `url(${v.poster})` }}
                    onClick={() => { setLoaded((s) => ({ ...s, [v.id]: true })); goal('video') }}
                    aria-label={`Смотреть обзор: ${v.title}`}
                  >
                    <span className="voice-play"><Play size={26} fill="currentColor" /></span>
                  </button>
                )}
              </div>
              <div className="voice-body">
                <strong>{v.title}</strong>
                <span>{v.note}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="voice-hint">Больше обзоров и живого звука — в нашей <a href={vkContact} target="_blank" rel="noreferrer" onClick={() => goal('vk')}>группе ВКонтакте</a>.</p>
      </div>
    </section>
  )
}

function TuningTech() {
  const points = [
    { icon: Bolt, title: 'Настройка, которой нет ни у кого', text: 'Раздвижной обод на немецкой фурнитуре премиум-класса: тон выставляется болтами под шестигранник и держится годами. Звук подстраивается под вас — а не вы под капризы натянутой кожи.' },
    { icon: Hammer, title: 'Десятилетия доводки в каждом узле', text: 'Конструкцию мастер шлифовал больше пятнадцати лет. Каждое соединение проверено практикой — чтобы инструмент сохранял полный шаманский голос и служил веками.' },
    { icon: Gem, title: 'Станки, а не верстак в гараже', text: 'За идеальным ободом и чистотой звука стоит оборудование на десятки миллионов рублей. Руки мастера — там, где нужна душа; точная механика — там, где решает.' },
    { icon: InfinityIcon, title: 'Поэтому это не сувенир', text: 'Цена — за инструмент на всю жизнь: ремонтопригодный, с рабочим звуком и материалами, которые не подведут ни на первой практике, ни через двадцать лет.' },
  ]
  return (
    <section className="section on-dark">
      <div className="section-inner tuning">
        <motion.div
          className="tuning-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <img src={photos.handle} alt="Раздвижной обод и резная рукоять бубна" loading="lazy" />
          <span className="tag">Авторская технология настройки</span>
        </motion.div>
        <div>
          <span className="kicker">Почему такая цена</span>
          <h2 className="display" style={{ fontSize: 'clamp(34px, 4.4vw, 64px)', lineHeight: 1, marginTop: 18 }}>Бубен, который приобретается на всю жизнь</h2>
          <p className="lead" style={{ color: 'var(--cream-soft)', marginTop: 18 }}>За тёплой традицией — точная инженерия. Вот что отличает инструмент мастерской от сувенирного бубна и почему он стоит своих денег.</p>
          <div className="tuning-points">
            {points.map((p) => {
              const Icon = p.icon
              return (
                <motion.div
                  className="tuning-point"
                  key={p.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="tp-icon"><Icon size={20} /></span>
                  <div>
                    <h4>{p.title}</h4>
                    <p>{p.text}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function WorksCarousel({ onOrder }: { onOrder: () => void }) {
  // чередуем круглые и яйцевидные бубны: круглый · яйцевидный · круглый · яйцевидный
  const works = ['Хозяйка', 'Конь ветра', 'Древо Жизни', 'Медведь'].map((n) => catalog.find((w) => w.name === n)!)
  return (
    <section className="section on-dark">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Готовые работы</span>
          <h2>Каждый бубен — отдельная история</h2>
          <p className="lead">Резьба, рукояти, символика и голос инструмента — каждый бубен собирается под человека.</p>
        </div>
        <div className="works-grid">
          {works.map((w, i) => (
            <motion.article
              className="work-card"
              key={`${w.image}-${i}`}
              onClick={onOrder}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOrder() } }}
              aria-label={`${w.name} — открыть каталог бубнов`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
            >
              <div className="work-media"><img src={w.image} alt={w.name} loading="lazy" /></div>
              <div className="work-body">
                <strong>{w.name}</strong>
                <span>{w.size} · {w.spec.split(',')[0]}</span>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="works-cta-row">
          <button className="button button-primary" onClick={onOrder}>Заказать свой бубен <ArrowRight size={18} /></button>
        </div>
      </div>
    </section>
  )
}

function PlaceOfPower({ onPractices }: { onPractices: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const width = useTransform(scrollYProgress, [0, 0.6], ['64%', '100%'])
  const height = useTransform(scrollYProgress, [0, 0.6], ['62vh', '100vh'])
  const radius = useTransform(scrollYProgress, [0, 0.6], [26, 0])
  const imgScale = useTransform(scrollYProgress, [0, 0.6], [1.18, 1])

  const Copy = (
    <div className="pop-copy">
      <span className="kicker">Место силы · Хакасия</span>
      <h2>Мастерская под святой горой Умай, на берегу Енисея</h2>
      <p>В долине Великого Енисея, на земле древних шаманов, рождаются инструменты и проходят обряды — сюда каждое лето приезжают со всего света.</p>
      <button className="button button-primary" onClick={onPractices}>Практики и обряды <ArrowRight size={17} /></button>
    </div>
  )

  if (reduce) {
    return (
      <section className="pop pop--static">
        <div className="pop-frame pop-frame--static">
          <img src={photos.umaiPano} alt="Долина Великого Енисея у подножья горы Умай" loading="lazy" />
          <div className="pop-veil" />
          {Copy}
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="pop">
      <div className="pop-sticky">
        <motion.div className="pop-frame" style={{ width, height, borderRadius: radius }}>
          <motion.img src={photos.umaiPano} alt="Долина Великого Енисея у подножья горы Умай" style={{ scale: imgScale }} loading="lazy" />
          <div className="pop-veil" />
        </motion.div>
        <motion.div
          className="pop-copy-wrap"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30% 0px -30% 0px' }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {Copy}
        </motion.div>
      </div>
    </section>
  )
}

function BaseSection({ onPractices }: { onPractices: () => void }) {
  const baseStats = [
    { v: '3500+', l: 'Бубнов создано мастером с 2009 года' },
    { v: 'Ручная работа', l: 'Натуральные материалы и авторская настройка' },
    { v: 'Под человека', l: 'Каждый инструмент — под задачу и звук' },
    { v: 'Хакасия', l: 'Земля древних шаманов, едут со всего света' },
  ]
  const tiles = [
    { image: photos.yurt, caption: 'Юрта — сердце пространства' },
    { image: photos.hotelProject, caption: 'Гостевой дом — строится (проект)' },
    { image: photos.hall, caption: 'Зал для практик и обрядов' },
  ]
  return (
    <section className="section on-dark">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Пространство мастерской</span>
          <h2>Юрта, зал для практик и гостевой дом</h2>
          <p className="lead">Мастерскую и юрту Святовид построил своими руками, сейчас возводит гостевой дом для участников ретритов — на земле, к которой каждое лето приезжают люди со всего света.</p>
        </div>
        <div className="base-grid">
          {tiles.map((t) => (
            <figure className="base-tile" key={t.caption}>
              <img src={t.image} alt={t.caption} loading="lazy" />
              <figcaption>{t.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="stat-grid">
          {baseStats.map((s) => (<div className="stat" key={s.l}><strong><CountUp value={s.v} /></strong><span>{s.l}</span></div>))}
        </div>
        <div style={{ marginTop: 30 }}>
          <button className="button button-ghost" onClick={onPractices}>Практики и семинары <ArrowRight size={17} /></button>
        </div>
      </div>
    </section>
  )
}

type DrumItem = { image: string; name: string; size: string; spec: string; price: string; status: string }

function Lightbox({ items, index, onClose, onNav, onOrder }: {
  items: DrumItem[]
  index: number
  onClose: () => void
  onNav: (d: number) => void
  onOrder: (name: string) => void
}) {
  const d = items[index]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNav(1)
      else if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose, onNav])
  return (
    <motion.div className="lb-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <button className="lb-close" onClick={onClose} aria-label="Закрыть"><X size={22} /></button>
      <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); onNav(-1) }} aria-label="Предыдущий"><ChevronLeft size={26} /></button>
      <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); onNav(1) }} aria-label="Следующий"><ChevronRight size={26} /></button>
      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={d.image}
            src={d.image}
            alt={d.name}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </AnimatePresence>
        <div className="lb-info">
          <div className="lb-info-text">
            <strong>{d.name}</strong>
            <span>{d.size} · {d.spec}</span>
          </div>
          <div className="lb-info-actions">
            <span className={`catalog-status${d.status === 'Свободен' ? ' free' : ''}`}>{d.status}</span>
            <span className="lb-price">{d.price}</span>
            <button className="button button-primary" onClick={() => onOrder(d.name)}>Заказать <ArrowRight size={16} /></button>
          </div>
        </div>
        <span className="lb-count">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
      </div>
    </motion.div>
  )
}

function DrumsCatalog({ onOrder }: { onOrder: (name: string) => void }) {
  const [lb, setLb] = useState<number | null>(null)
  const openAt = (i: number) => setLb(i)
  const nav = (delta: number) => setLb((v) => (v === null ? v : (v + delta + catalog.length) % catalog.length))
  return (
    <section className="section on-dark">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Каталог</span>
          <h2>Последние работы мастера</h2>
          <p className="lead">Образцы исполненных бубнов с характеристиками. Нажмите на фото, чтобы рассмотреть ближе. Каждый инструмент собирается под человека — цена зависит от диаметра, материалов и символики.</p>
        </div>
        <div className="catalog-grid">
          {catalog.map((d, i) => (
            <motion.article
              className="catalog-card"
              key={d.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
            >
              <div
                className="catalog-media"
                role="button"
                tabIndex={0}
                aria-label={`Рассмотреть бубен «${d.name}»`}
                onClick={() => openAt(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i) } }}
              >
                <img src={d.image} alt={d.name} loading="lazy" />
                <span className={`catalog-status${d.status === 'Свободен' ? ' free' : ''}`}>{d.status}</span>
                <span className="catalog-zoom"><ZoomIn size={18} /></span>
              </div>
              <div className="catalog-body">
                <div className="catalog-head">
                  <h3>{d.name}</h3>
                  <span className="catalog-size">{d.size}</span>
                </div>
                <p>{d.spec}</p>
                <div className="catalog-foot">
                  <span className="catalog-price">{d.price}</span>
                  <button className="button button-primary catalog-btn" onClick={() => onOrder(d.name)}>Заказать <ArrowRight size={16} /></button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="catalog-note">Цена указана «от» и уточняется под конкретный инструмент — зависит от диаметра, кожи, обода, рукояти и символики.</p>
      </div>
      <AnimatePresence>
        {lb !== null && (
          <Lightbox
            items={catalog}
            index={lb}
            onClose={() => setLb(null)}
            onNav={nav}
            onOrder={(name) => { setLb(null); onOrder(name) }}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function TelegramBand() {
  return (
    <section className="section on-dark">
      <div className="section-inner tg-band">
        <span className="kicker">Telegram-канал мастера</span>
        <h2>Глубже — в Telegram</h2>
        <p>В канале Святовид рассказывает подробнее — об обрядах, бубнах, Тропе Предков и местах силы. Подпишитесь, если хотите постоянно быть в курсе событий: даты практик и обрядов, новые работы и истории из мастерской.</p>
        <a className="button button-primary tg-btn" href="https://t.me/shaman_tatur" target="_blank" rel="noreferrer">Подписаться на канал <Send size={17} /></a>
      </div>
    </section>
  )
}

function AncestorTrail() {
  return (
    <section className="section on-dark">
      <div className="section-inner trail-grid">
        <motion.div
          className="trail-media"
          initial={{ opacity: 0, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <img src={photos.trailPredkov} alt="Обряд у каменного обоо с лентами на Тропе Предков в Хакасии" loading="lazy" />
          <span className="trail-tag">Тропа Предков · Тогыз-Аз</span>
        </motion.div>
        <div className="trail-copy">
          <span className="kicker">Земля древних шаманов</span>
          <h2>Тропа Предков — место, где Небо касается Земли</h2>
          <p>Мастерская и обряды стоят на земле, где тысячи лет жили и молились древние шаманы Хакасии и Тувы. Рядом — Тропа Предков, она же Тогыз-Аз, «Девять ртов»: девять гротов, скалы, открытые как уста, и камень, что хранит рисунки тысячелетней давности.</p>
          <p>Перед обрядами Святовид ведёт людей по Тропе — в горы, к местам силы. Это не прогулка, а настройка: тропа снимает шум и спешку, и в круг человек входит уже другим. Здесь же проходят практики.</p>
          <p>Мастер работает в этом месте много лет — связь с ним выстроена не на словах, а на времени и служении. Духи этой земли его знают.</p>
        </div>
      </div>
    </section>
  )
}

function Directions() {
  return (
    <section className="section on-light">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Что проводит мастер</span>
          <h2>Обряды, практикумы и обучение</h2>
          <p className="lead">Всё проходит очно в Хакасии — у горы Умай и на местах силы. Работа не ставится на поток: формат, состав и даты обсуждаются лично.</p>
        </div>
        <div className="dir-grid">
          {directions.map((d, i) => (
            <motion.div
              className="dir-card"
              key={d.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
            >
              <span className="dir-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlacesBand() {
  const tiles = [
    { image: photos.umaiSun, caption: 'Долина у горы Умай' },
    { image: photos.khakRibbons, caption: 'Чалама на месте силы' },
    { image: photos.khakPines, caption: 'Сосны Хакасии' },
  ]
  return (
    <section className="section on-light">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Места силы</span>
          <h2>Обряды проходят на живой земле</h2>
          <p className="lead">Гора Умай, берег Великого Енисея, древние места Хакасии — пространство, где традиция передаётся как опыт, а не теория.</p>
        </div>
        <div className="base-grid">
          {tiles.map((t) => (
            <figure className="base-tile" key={t.caption}>
              <img src={t.image} alt={t.caption} loading="lazy" />
              <figcaption>{t.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function SeminarBand() {
  const tiles = [
    { image: photos.seminarGroup, caption: 'Практика с бубном' },
    { image: photos.hall, caption: 'Зал для практик' },
    { image: photos.fireRite, caption: 'Обряды на местах силы' },
  ]
  return (
    <section className="section on-dark">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Пространство практик</span>
          <h2>Живая база у горы Умай в Хакасии</h2>
          <p className="lead">Больше десяти лет сюда приезжают сильные духом люди со всего света — на обряды, практикумы, туры и создание бубна. Мастерскую, юрту и гостевой дом мастер построил своими руками на берегу Великого Енисея. Даты — в расписании 2026 ниже.</p>
        </div>
        <div className="base-grid">
          {tiles.map((t) => (
            <figure className="base-tile" key={t.caption}>
              <img src={t.image} alt={t.caption} loading="lazy" />
              <figcaption>{t.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServicePage({ image, kicker, onSelect, options, text, title, hideOptions }: {
  image: string; kicker: string; onSelect: (o: string) => void; options: string[]; text: string; title: string; hideOptions?: boolean
}) {
  const style = { '--page-photo': `url(${image})` } as CSSProperties
  return (
    <section className="page-hero" style={style}>
      <div className="page-symbol"><img className="logo-emblem" src={photos.logoEmblem} alt="Дух Сибири" /></div>
      <div className="section-intro">
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
        <p className="lead" style={{ color: 'var(--cream-soft)' }}>{text}</p>
      </div>
      {!hideOptions && (
        <div className="service-list">
          {options.map((option, index) => (
            <motion.button className="service-row" onClick={() => onSelect(option)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} key={option}>
              <span className="idx">0{index + 1}</span>
              <strong>{option}</strong>
              <ArrowUpRight size={20} />
            </motion.button>
          ))}
        </div>
      )}
    </section>
  )
}

function PhotoEssay() {
  return (
    <section className="section on-dark">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Почему наш инструмент</span>
          <h2>Сделано на совесть</h2>
          <p className="lead">Ручная работа, натуральные материалы и технология, отточенная десятилетиями. Реальные кадры из мастерской, а не постановочная картинка.</p>
        </div>
        <div className="gallery">
          {photoEssay.map((item, i) => (
            <motion.figure
              className={`gallery-item${i === 0 ? ' feature' : ''}`}
              key={item.image}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.06 }}
            >
              <img src={item.image} alt={item.title} loading="lazy" />
              <figcaption>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function ScheduleSection() {
  return (
    <section className="section on-light">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Расписание 2026</span>
          <h2>Обряды и практикумы — по точкам силы года</h2>
          <p className="lead">Все события проходят в Хакасии. Места ограничены: мастер берёт столько людей, сколько позволяет держать пространство.</p>
        </div>
        <div className="timeline">
          {schedule2026.map((event) => (
            <motion.div
              className="tl-item"
              key={`${event.date}-${event.title}`}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
            >
              <span className="tl-date">{event.date}</span>
              <div className="tl-body">
                <h3>{event.title}</h3>
                <p>{event.text}</p>
              </div>
              <div className="tl-actions">
                <span className="tl-seats">{event.seats}</span>
                <a className="tl-book" href={vkContact} target="_blank" rel="noreferrer" onClick={() => goal('order')}>Записаться <ArrowRight size={15} /></a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="section on-light">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Вопросы</span>
          <h2>Коротко о главном</h2>
        </div>
        <div className="faq-list">
          {faq.map((item, i) => {
            const isOpen = open === i
            return (
              <div className={`faq-item${isOpen ? ' open' : ''}`} key={i}>
                <button className="faq-q" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  {item.q}
                  <Plus className="pm" size={22} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div className="faq-a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}>
                      <div className="faq-a-inner">{item.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function MasterPage() {
  return (
    <>
      <section className="page-hero" style={{ '--page-photo': `url(${photos.masterLake})` } as CSSProperties}>
        <div className="page-symbol"><img className="logo-emblem" src={photos.logoEmblem} alt="Дух Сибири" /></div>
        <div className="section-intro">
          <span className="kicker">Святовид Татур</span>
          <h2>Шаман, мастер и основатель «Духа Сибири»</h2>
          <p className="lead" style={{ color: 'var(--cream-soft)' }}>Бубны рождаются через руки, чтобы звучать, помогать выстраивать практику и входить в диалог с миром, родом и природой.</p>
        </div>
      </section>
      <section className="section on-dark">
        <div className="section-inner master">
          <div className="master-portrait"><span className="badge"><MapPin size={14} /> Хакасия · СПб</span></div>
          <div>
            <span className="kicker">О мастере</span>
            <blockquote>«Я не мистик и не эзотерик. Я шаман — человек, опирающийся на собственный опыт и познающий всё в первоисточнике».</blockquote>
            <p className="bio">Мастерская «Дух Сибири» работает с 2009 года. Святовид создаёт предметы Силы — бубны, зеркала Толи, онгоны, обереги — и проводит обряды, практики и обучение. Среди тех, для кого создавались инструменты: {knownClients.join(', ')}.</p>
            <div className="stat-grid">
              {stats.map((s) => (<div className="stat" key={s.label}><strong><CountUp value={s.value} /></strong><span>{s.label}</span></div>))}
            </div>
            <div className="voices-grid" style={{ marginTop: 32, gridTemplateColumns: '1fr 1fr' }}>
              {['Создаёт предметы Силы', 'Основатель мастерской', 'Практики в Хакасии', 'Заказ через личный отклик'].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--cream-soft)', fontSize: 15 }}>
                  <ShieldCheck size={18} style={{ color: 'var(--ember-500)' }} />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <PhotoEssay />
      <PrinciplesBand />
    </>
  )
}

function ContactsPage() {
  return (
    <>
      <section className="page-hero" style={{ '--page-photo': `url(${photos.khakLake})` } as CSSProperties}>
        <div className="page-symbol"><img className="logo-emblem" src={photos.logoEmblem} alt="Дух Сибири" /></div>
        <div className="section-intro">
          <span className="kicker">Контакты</span>
          <h2>Связаться, записаться или обсудить заказ</h2>
          <p className="lead" style={{ color: 'var(--cream-soft)' }}>Самый быстрый путь — позвонить или написать ВКонтакте. Соцсети и видео помогают заранее почувствовать стиль мастера и мастерской.</p>
        </div>
      </section>
      <section className="section on-light">
        <div className="section-inner">
          <div className="contact-card" style={{ marginTop: 0 }}>
            <strong>Заказ бубна</strong>
            <a className="phone" href={masterPhoneHref} onClick={() => goal('phone')}>{masterPhone}</a>
            <p>Для обряда, практикума или участия в датах 2026 года лучше сразу написать, какая дата или направление откликается.</p>
          </div>
          <div className="resource-grid">
            {resources.map((resource) => (
              <a href={resource.href} key={resource.label} target="_blank" rel="noreferrer">
                {resource.label}<ArrowUpRight size={20} />
              </a>
            ))}
            <a href={vkContact} target="_blank" rel="noreferrer" className="full" onClick={() => goal('vk')}>Написать ВКонтакте<Send size={20} /></a>
          </div>
        </div>
      </section>
    </>
  )
}

function RequestSection({ form, onChange, onSubmit, status }: {
  form: LeadForm; onChange: (f: keyof LeadForm, v: string) => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; status: 'idle' | 'sending' | 'sent' | 'error'
}) {
  return (
    <section className="section on-light" id="request">
      <div className="section-inner">
        <div className="section-intro">
          <span className="kicker">Заявка</span>
          <h2>Оставьте контакт и пару слов о запросе</h2>
          <p className="lead">Без сложной анкеты. Мастер сам уточнит материалы, дату, формат, стоимость и подготовку.</p>
        </div>
        <form className="order-grid" onSubmit={onSubmit}>
          <div className="form-main">
            <Select label="Направление" value={form.serviceType} onChange={(v) => onChange('serviceType', v)} options={['Бубен на заказ', 'Обряд или церемония', 'Практика или обучение', 'Личная консультация']} />
            <Field label="Имя" value={form.name} onChange={(v) => onChange('name', v)} placeholder="Как к вам обращаться" required />
            <Field label="Телефон или ВКонтакте" value={form.contact} onChange={(v) => onChange('contact', v)} placeholder="+7… или ссылка на профиль VK" required />
            <Field label="Город" value={form.city} onChange={(v) => onChange('city', v)} placeholder="Откуда вы" />
            <label className="field field-wide">
              <span>Что нужно</span>
              <input value={form.purpose} onChange={(e) => onChange('purpose', e.target.value)} placeholder="Например: бубен для практик, личный обряд, обучение" />
            </label>
            <div className="request-chips field-wide" aria-label="Быстрый выбор запроса">
              {['Бубен на заказ', 'Обряд', 'Практика с бубном', 'Обучение', 'Консультация'].map((item) => (
                <button type="button" className={form.purpose === item ? 'chip-active' : ''} onClick={() => onChange('purpose', item)} key={item}>{item}</button>
              ))}
            </div>
            <label className="field field-wide">
              <span>Комментарий</span>
              <textarea value={form.message} onChange={(e) => onChange('message', e.target.value)} placeholder="Напишите свободно: что хотите, где находитесь, какие сроки или вопросы есть" />
            </label>
          </div>
          <aside className="summary-panel">
            <Sparkles className="sp-icon" size={24} />
            <h3>Заявка мастеру</h3>
            <p>{form.serviceType}. Запрос: {form.purpose || 'Уточнить с мастером'}.</p>
            <button className="button button-primary submit-button" disabled={status === 'sending'}>
              {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}<Send size={18} />
            </button>
            <a className="button button-ghost summary-link" href={vkContact} target="_blank" rel="noreferrer">Написать ВКонтакте</a>
            {status === 'sent' && <strong className="form-status success">Заявка отправлена. Мастер свяжется с вами.</strong>}
            {status === 'error' && <strong className="form-status error">Не удалось отправить через сайт. Напишите ВКонтакте или позвоните.</strong>}
          </aside>
        </form>
      </div>
    </section>
  )
}

function Footer({ onOrder, onNav }: { onOrder: () => void; onNav: (p: PageKey) => void }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-cta">
          <span className="kicker">Дух Сибири</span>
          <h2>Готовы услышать свой инструмент?</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="button button-primary" onClick={onOrder}>Заказать бубен <ArrowRight size={18} /></button>
            <a className="button button-ghost" href={vkContact} target="_blank" rel="noreferrer" onClick={() => goal('vk')}>ВКонтакте <Send size={17} /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Дух Сибири · Святовид Татур</span>
          <span style={{ display: 'inline-flex', gap: 18, flexWrap: 'wrap' }}>
            {resources.map((r) => (<a key={r.label} href={r.href} target="_blank" rel="noreferrer" style={{ color: 'var(--cream-soft)' }}>{r.label}</a>))}
          </span>
        </div>
        <div className="footer-legal">
          <button type="button" onClick={() => onNav('privacy')}>Политика конфиденциальности</button>
          <button type="button" onClick={() => onNav('cookies')}>Политика Cookie</button>
        </div>
      </div>
    </footer>
  )
}

function Field({ label, onChange, placeholder, required, value }: { label: string; onChange: (v: string) => void; placeholder: string; required?: boolean; value: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} />
    </label>
  )
}

function Select({ label, onChange, options, value }: { label: string; onChange: (v: string) => void; options: string[]; value: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (<option value={option} key={option}>{option}</option>))}
      </select>
    </label>
  )
}

function ShopPage() {
  return (
    <>
      <section className="page-hero" style={{ '--page-photo': `url(${photos.processBench})` } as CSSProperties}>
        <div className="page-symbol"><img className="logo-emblem" src={photos.logoEmblem} alt="Дух Сибири" /></div>
        <div className="section-intro">
          <span className="kicker">Лавка</span>
          <h2>Предметы силы и атрибуты практики</h2>
          <p className="lead" style={{ color: 'var(--cream-soft)' }}>Колотушки, зеркала-кузунгу, комплекты для гадания, ритуальные ложки и артыш для окуривания. Часть — в наличии, часть — под заказ.</p>
        </div>
      </section>
      <section className="section on-dark">
        <div className="section-inner">
          <div className="catalog-grid">
            {shopItems.map((item, i) => (
              <motion.article
                className="catalog-card"
                key={item.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
              >
                <div className="catalog-media">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <span className={`catalog-status${item.status === 'В наличии' ? ' free' : ''}`}>{item.status}</span>
                </div>
                <div className="catalog-body">
                  <div className="catalog-head">
                    <h3>{item.name}</h3>
                  </div>
                  <p>{item.spec}</p>
                  <div className="catalog-foot">
                    <span className="catalog-price">{item.price}</span>
                    <a className="button button-primary catalog-btn" href={vkContact} target="_blank" rel="noreferrer" onClick={() => goal('order')}>Заказать <ArrowRight size={16} /></a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <p className="catalog-note">Заказ и наличие — через ВКонтакте или по телефону. Часть предметов мастер делает под человека, поэтому сроки и цену уточняйте лично.</p>
        </div>
      </section>
    </>
  )
}

function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <>
      <section className="page-hero" style={{ '--page-photo': `url(${photos.khakLake})` } as CSSProperties}>
        <div className="page-symbol"><img className="logo-emblem" src={photos.logoEmblem} alt="Дух Сибири" /></div>
        <div className="section-intro">
          <span className="kicker">Документы</span>
          <h2>{title}</h2>
          <p className="lead" style={{ color: 'var(--cream-soft)' }}>{intro}</p>
        </div>
      </section>
      <section className="section on-light">
        <div className="section-inner">
          <div className="legal">
            <p className="legal-meta">Дата вступления в силу: {legalUpdated}</p>
            {sections.map((s) => (
              <div className="legal-block" key={s.h}>
                <h3>{s.h}</h3>
                {s.p?.map((t, i) => <p key={i}>{t}</p>)}
                {s.list && <ul>{s.list.map((t, i) => <li key={i}>{t}</li>)}</ul>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

const pagePaths: Record<PageKey, string> = {
  home: '/',
  drums: '/drums',
  shop: '/shop',
  practices: '/practices',
  master: '/master',
  contacts: '/contacts',
  privacy: '/privacy',
  cookies: '/cookies',
}

function getPageFromPath(): PageKey {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const match = (Object.entries(pagePaths) as Array<[PageKey, string]>).find(([, p]) => p === path)
  return match ? match[0] : 'home'
}

export default App
