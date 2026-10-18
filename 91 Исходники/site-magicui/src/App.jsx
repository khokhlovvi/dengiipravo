// Черновик главной на блоках Magic UI — для сравнения с утверждённым сайтом (../site)
// Тексты — из content.js сайта, без новых цифр и сумм
import { ArrowRight, Phone, EnvelopeSimple, Plus, Scales, Bank, Gavel } from '@phosphor-icons/react';
import { site, instruments, legalServices, financeExperience, cases } from './content.js';
import { BlurFade } from '@/components/ui/blur-fade';
import { Marquee } from '@/components/ui/marquee';
import { MagicCard } from '@/components/ui/magic-card';
import { TextReveal } from '@/components/ui/text-reveal';
import { DotPattern } from '@/components/ui/dot-pattern';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { Ripple } from '@/components/ui/ripple';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { cn } from '@/lib/utils';

const img = name => `${import.meta.env.BASE_URL}images/${name}`;
const container = 'mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12';

function Cta({ children, className, light, href = '#contact' }) {
  return (
    <ShimmerButton
        type="button"
        onClick={() => { window.location.href = href; }}
        background={light ? '#ffffff' : '#082e50'}
        shimmerColor={light ? '#3d7fbf' : '#9cc3e6'}
        borderRadius="12px"
        className={cn('gap-3 px-6 py-3.5 text-base font-medium', light && 'text-navy', className)}
      >
        {children} <ArrowRight size={20} />
      </ShimmerButton>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className={cn(container, 'flex h-16 items-center justify-between gap-6')}>
        <a href="#" className="text-lg font-semibold tracking-tight">{site.name}</a>
        <nav className="hidden gap-8 text-[15px] text-text-2 md:flex" aria-label="Основная навигация">
          <a href="#" className="text-ink">О нас</a>
          <a href="#solutions" className="hover:text-ink">Решения</a>
          <a href="#contact" className="hover:text-ink">Контакты</a>
        </nav>
        <a href="#contact" className="rounded-[10px] bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-hover">Обсудить задачу</a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden lg:min-h-[680px]">
      <DotPattern
        width={22}
        height={22}
        className="text-navy/20 [mask-image:radial-gradient(640px_circle_at_20%_30%,white,transparent)]"
      />
      <div className={cn(container, 'relative z-10 pt-16 md:pt-24 lg:py-32')}>
        <div className="lg:max-w-[600px]">
          <BlurFade delay={0.05}>
            <div className="inline-flex rounded-full border border-line bg-white/80 px-4 py-1.5 text-sm">
              <AnimatedShinyText className="mx-0 text-text-3">Финансовые инструменты и правовая работа</AnimatedShinyText>
            </div>
          </BlurFade>
          <BlurFade delay={0.15}>
            <h1 className="mt-6 text-[clamp(40px,6vw,80px)] leading-[1.03] font-semibold tracking-[-0.045em]">
              Капитал под задачи вашего бизнеса
            </h1>
          </BlurFade>
          <BlurFade delay={0.25}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-2">
              Юридическая надёжность и коммерческая выгода в каждом решении
            </p>
          </BlurFade>
          <BlurFade delay={0.35}>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Cta>Обсудить задачу</Cta>
              <a href="#solutions" className="inline-flex items-center gap-2 font-medium text-navy hover:underline">
                Все решения <ArrowRight size={18} />
              </a>
            </div>
          </BlurFade>
        </div>
      </div>
      {/* Фото без рамки — часть фона, края растворяются в белом */}
      <BlurFade delay={0.2} blur="0px" className="hero-photo pointer-events-none h-[340px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%]">
        <picture>
          <source type="image/webp" srcSet={`${img('hero-800.webp')} 800w, ${img('hero.webp')} 1600w`} sizes="(max-width: 1024px) 100vw, 60vw" />
          <img src={img('hero.jpg')} alt="" className="h-full w-full object-cover object-right" fetchPriority="high" />
        </picture>
      </BlurFade>
    </section>
  );
}

function SolutionsStrip() {
  const pill = name => (
    <span key={name} className="rounded-full border border-line bg-surface px-5 py-2.5 text-[15px] whitespace-nowrap text-text-2">{name}</span>
  );
  return (
    <section id="solutions" className="relative border-y border-line py-6" aria-label="Решения">
      <Marquee pauseOnHover className="[--duration:45s]">{instruments.map(i => pill(i[0]))}</Marquee>
      <Marquee reverse pauseOnHover className="[--duration:40s]">{legalServices.map(i => pill(i[0]))}</Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white" />
    </section>
  );
}

const tasks = [
  {
    title: 'Финансовые решения для бизнеса',
    text: [
      'Формируем финансовую стратегию на основе юридической и коммерческой экспертизы нашей компании: от структурирования актива до сопровождения сделок',
      'Помогаем подобрать финансирование, привлечь капитал и подготовить активы к требованиям участников сделки',
    ],
    cta: 'Обсудить задачу бизнеса',
  },
  {
    title: 'Правовая защита личного капитала',
    text: [
      'Защищаем личный капитал и интересы собственников в вопросах наследства, раздела имущества и признания прав',
      'Помогаем разрешать имущественные споры и готовить сделки с недвижимостью',
    ],
    cta: 'Обсудить защиту капитала',
  },
];

function ClientTasks() {
  return (
    <section className={cn(container, 'py-20 md:py-28')}>
      <BlurFade inView>
        <h2 className="max-w-3xl text-[clamp(30px,3.4vw,46px)] leading-[1.08] font-semibold tracking-[-0.035em]">С какими задачами к нам обращаются</h2>
      </BlurFade>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {tasks.map((t, i) => (
          <BlurFade key={t.title} inView delay={0.1 * i} className="h-full">
            <MagicCard
              className="h-full rounded-2xl"
              gradientColor="#eaf1f7"
              gradientFrom="#3d7fbf"
              gradientTo="#082e50"
              gradientOpacity={1}
            >
              <div className="flex h-full flex-col gap-4 p-8 md:p-10">
                <h3 className="text-2xl font-medium tracking-tight">{t.title}</h3>
                {t.text.map(p => <p key={p} className="text-[17px] leading-relaxed text-text-2">{p}</p>)}
                <a href="#contact" className="mt-auto inline-flex items-center gap-2 pt-4 font-medium text-navy">{t.cta} <ArrowRight size={18} /></a>
              </div>
            </MagicCard>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

function Principle() {
  return (
    <section className="bg-surface" aria-label="Принцип работы">
      <TextReveal className="h-[160vh]">Работаем с первопричиной задачи, а не с её следствиями</TextReveal>
      <div className={cn(container, 'relative -mt-[24vh] pb-24')}>
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-text-2">
          Нам важно не только закрыть текущий запрос, но и понять стратегию бизнеса, его среднесрочные и долгосрочные планы — тогда решение работает на цели компании, а не только на сегодняшнюю задачу
        </p>
      </div>
    </section>
  );
}

const expertise = [
  { icon: Scales, title: 'Деньги и право вместе', text: 'Команда объединяет финансовую и юридическую экспертизу, поэтому мы смотрим на каждую задачу одновременно с точки зрения денег и права' },
  { icon: Bank, title: 'Финансовые институты и партнёры', text: 'Сотрудничаем с финансовыми институтами, среди которых крупнейшие игроки рынка, а специализированные партнёры помогают нам решать нестандартные задачи' },
  { icon: Gavel, title: 'Высшие судебные инстанции', text: 'Судебные специалисты команды имеют опыт успешной работы в высших судебных инстанциях, включая Верховный Суд РФ, и сотрудничают с экспертным сообществом региона и федерального округа' },
];

function Expertise() {
  return (
    <section className="relative overflow-hidden lg:py-28">
      {/* Фото без рамки — часть фона, края растворяются в белом */}
      <BlurFade inView blur="0px" className="story-photo pointer-events-none h-[360px] lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[56%]">
        <picture>
          <source type="image/webp" srcSet={`${img('warehouse-800.webp')} 800w, ${img('warehouse.webp')} 1600w`} sizes="(max-width: 1024px) 100vw, 56vw" />
          <img src={img('warehouse.jpg')} alt="Архитектурная иллюстрация промышленной недвижимости" loading="lazy" className="h-full w-full object-cover" />
        </picture>
      </BlurFade>
      <div className={cn(container, 'relative z-10 pb-20 lg:grid lg:grid-cols-2 lg:pb-0')}>
        <div className="lg:col-start-2 lg:pl-8">
          <BlurFade inView>
            <h2 className="text-[clamp(30px,3.4vw,46px)] leading-[1.08] font-semibold tracking-[-0.035em]">Экспертиза команды</h2>
          </BlurFade>
          <div className="mt-10 flex flex-col gap-9">
            {expertise.map(({ icon: Icon, title, text }, i) => (
              <BlurFade key={title} inView delay={0.1 * i} className="flex gap-5">
                <Icon size={30} className="mt-0.5 shrink-0 text-navy" />
                <div>
                  <h3 className="text-xl font-medium tracking-tight">{title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-text-2">{text}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section id="experience" className={cn(container, 'pt-6 pb-20 md:pb-28 lg:pt-16')}>
      <BlurFade inView>
        <h2 className="text-[clamp(30px,3.4vw,46px)] leading-[1.08] font-semibold tracking-[-0.035em]">Наш опыт</h2>
      </BlurFade>

      <h3 className="mt-12 text-sm font-medium tracking-wide text-text-3 uppercase">Финансы и развитие бизнеса</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {financeExperience.map(([title, text], i) => (
          <BlurFade key={title} inView delay={0.08 * i} className="rounded-2xl bg-surface p-6">
            <h4 className="text-lg font-medium tracking-tight">{title}</h4>
            <p className="mt-3 text-[15px] leading-relaxed text-text-2">{text}</p>
          </BlurFade>
        ))}
      </div>

      <h3 className="mt-16 text-sm font-medium tracking-wide text-text-3 uppercase">Судебная практика</h3>
      <div className="mt-5 divide-y divide-line border-y border-line">
        {cases.map(([tag, title, number, court, text], i) => (
          <BlurFade key={number} inView delay={0.05 * i}>
            <details className="group py-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-6">
                <span className="w-8 text-sm text-text-3 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">
                  <span className="block text-sm text-text-3">{tag}</span>
                  <span className="mt-1 block text-xl font-medium tracking-tight">{title}</span>
                </span>
                <span className="grid size-10 place-items-center rounded-full border border-line transition-transform duration-300 group-open:rotate-45"><Plus size={18} /></span>
              </summary>
              <div className="pt-4 pl-14">
                <p className="max-w-3xl leading-relaxed text-text-2">{text}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 text-sm text-text-3"><span>{number}</span><span>{court}</span></p>
              </div>
            </details>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-navy text-white" style={{ '--foreground': '#ffffff' }}>
      <FlickeringGrid className="absolute inset-0 [mask-image:radial-gradient(700px_circle_at_85%_50%,white,transparent)]" color="#9cc3e6" maxOpacity={0.18} flickerChance={0.08} squareSize={3} gridGap={7} />
      <Ripple mainCircleSize={260} mainCircleOpacity={0.12} numCircles={6} className="left-[60%]" />
      <div className={cn(container, 'relative grid gap-10 py-20 md:py-28 lg:grid-cols-2 lg:items-end')}>
        <BlurFade inView>
          <h2 className="text-[clamp(32px,3.6vw,52px)] leading-[1.06] font-semibold tracking-[-0.035em] text-white">Обсудим следующий шаг</h2>
          <p className="mt-5 text-lg text-white/75">Финансовые решения для бизнеса и правовая защита капитала</p>
        </BlurFade>
        <BlurFade inView delay={0.1} className="flex flex-col gap-6 lg:items-end">
          <address className="flex flex-col gap-3 text-lg not-italic lg:items-end">
            <a href={site.phoneHref} className="inline-flex items-center gap-3 hover:underline"><Phone size={22} />{site.phone}</a>
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 hover:underline"><EnvelopeSimple size={22} />{site.email}</a>
          </address>
          <Cta light href={`mailto:${site.email}?subject=Заявка с сайта`}>Оставить заявку</Cta>
        </BlurFade>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className={cn(container, 'flex flex-col gap-6 py-10 text-[15px] text-text-2 md:flex-row md:items-center md:justify-between')}>
        <div>
          <div className="font-semibold text-ink">{site.name}</div>
          <div className="mt-1">Финансовые инструменты и правовая работа</div>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <a href={site.phoneHref}>{site.phone}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
      <div className={cn(container, 'pb-10 text-sm text-text-3')}>
        © {new Date().getFullYear()} {site.legal.name} · ИНН {site.legal.inn} · ОГРН {site.legal.ogrn}
      </div>
    </footer>
  );
}

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SolutionsStrip />
        <ClientTasks />
        <Principle />
        <Expertise />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
