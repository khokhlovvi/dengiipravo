import { useEffect, useRef, useState } from 'react';
import { ArrowRight, X, List, Check, WarningCircle, Phone, EnvelopeSimple, Scales, Bank, Gavel } from '@phosphor-icons/react';
import { Marquee, GlowCard, ShimmerButton, TextReveal, FlickeringGrid, Ripple } from './effects.jsx';
import { site, solutions, experience, regionWork, steps, topics, pages } from './content.js';

// Подпапка сборки: '' для сайта в корне, '/test' для тестовой версии
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const routes = ['/', '/solutions', '/privacy'];

export function normalize(path) {
  let p = (path || '/').split(/[?#]/)[0];
  if (BASE && (p === BASE || p.startsWith(`${BASE}/`))) p = p.slice(BASE.length);
  p = p.replace(/\/+$/, '') || '/';
  if (p === '/about') p = '/';
  return routes.includes(p) ? p : '/404';
}

// Телефон — хотя бы 6 цифр, или email
const contactPattern = String.raw`\s*([^\s@]+@[^\s@]+\.[^\s@]+|(\D*\d){6,}\D*)\s*`;

const motionOk = () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Picture({ name, alt = '', className, priority, sizes = '100vw' }) {
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={`${BASE}/images/${name}-800.webp 800w, ${BASE}/images/${name}.webp 1600w`} sizes={sizes} />
      <img src={`${BASE}/images/${name}.jpg`} alt={alt} decoding="async" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} />
    </picture>
  );
}

// Шахматная доска: финансы и право чередуются, соседние клетки всегда разного цвета
// В две колонки каждая вторая строка переставляется (--o2), иначе чередование сложилось бы в полосы
function Board({ items, cols = 3, className = '', children }) {
  return (
    <div className={`board board-${cols} ${items.length % 2 ? 'board-odd' : ''} ${className}`}>
      {items.map((item, i) => children(item, { '--o2': Math.floor(i / 2) % 2 ? i + (i % 2 ? -1 : 1) : i }))}
    </div>
  );
}

const kinds = { finance: 'Финансы', law: 'Право' };

function BoardCell({ kind, label, style, glow, children }) {
  const body = <><span className="cell-kind">{kinds[kind]}{label && ` · ${label}`}</span>{children}</>;
  const cls = `cell cell-${kind}`;
  return glow
    ? <GlowCard className={cls} style={style}>{body}</GlowCard>
    : <article className={cls} style={style}><div className="cell-inner">{body}</div></article>;
}

// Мягкое появление блоков при прокрутке: то, что уже на экране, показываем сразу
function useReveal(route) {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('motion')) return;
    const els = [...document.querySelectorAll('.reveal:not(.is-visible)')];
    els.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('is-visible'); });
    root.classList.add('motion-ready');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(el => { if (!el.classList.contains('is-visible')) io.observe(el); });
    return () => io.disconnect();
  }, [route]);
}

function RequestDialog({ dialogRef, topic }) {
  const [state, setState] = useState('idle');
  const errorRef = useRef(null);
  useEffect(() => { if (state === 'error') errorRef.current?.scrollIntoView({ block: 'nearest', behavior: motionOk() ? 'smooth' : 'instant' }); }, [state]);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState('sending');
    try {
      const r = await fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, page: window.location.pathname }) });
      if (!r.ok) throw new Error(String(r.status));
      form.reset();
      setState('done');
    } catch {
      setState('error');
    }
  }
  const close = () => dialogRef.current.close();
  return (
    <dialog ref={dialogRef} className="request-dialog" aria-labelledby="request-title" onClose={() => setState('idle')} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="dialog-inner">
        <button type="button" className="icon-button dialog-close" aria-label="Закрыть" onClick={close}><X size={22} /></button>
        {state === 'done' ? (
          <div className="dialog-result" role="status">
            <span className="result-icon"><Check size={28} weight="bold" /></span>
            <h2 id="request-title">Заявка отправлена</h2>
            <p>Мы получили ваш запрос и свяжемся с вами по указанному контакту</p>
            <button type="button" className="button" onClick={close}>Готово</button>
          </div>
        ) : (
          <>
            <h2 id="request-title">Расскажите о задаче</h2>
            <p className="dialog-lead">Коротко опишите задачу — мы свяжемся с вами и предложим следующий шаг</p>
            <form onSubmit={submit}>
              <div className="form-pair">
                <label className="field">Ваше имя<input name="name" autoComplete="name" required maxLength={100} /></label>
                <label className="field">Компания<span className="field-hint">необязательно</span><input name="company" autoComplete="organization" maxLength={150} /></label>
              </div>
              <label className="field">Телефон или email<input name="contact" autoComplete="tel" required maxLength={150} pattern={contactPattern} title="Укажите телефон (не меньше 6 цифр) или email" placeholder="+7 900 000-00-00 или name@mail.ru" /></label>
              <label className="field">Направление
                <select name="topic" defaultValue={topic} key={topic}>{topics.map(t => <option key={t}>{t}</option>)}</select>
              </label>
              <label className="field">Что нужно решить<textarea name="message" rows={4} required maxLength={3000} placeholder="Финансирование, сделка, спор или защита личного капитала" /></label>
              <label className="trap" aria-hidden="true">Сайт<input name="website" tabIndex={-1} autoComplete="off" /></label>
              <label className="consent">
                <input type="checkbox" name="consent" value="yes" required />
                <span>Согласен на обработку персональных данных в соответствии с <a href={`${BASE}/privacy`} target="_blank" rel="noopener">политикой</a></span>
              </label>
              {state === 'error' && (
                <div className="form-error" role="alert" ref={errorRef}>
                  <WarningCircle size={22} />
                  <p>Не получилось отправить заявку — попробуйте ещё раз или свяжитесь с нами напрямую: <a href={site.phoneHref}>{site.phone}</a>, <a href={`mailto:${site.email}`}>{site.email}</a></p>
                </div>
              )}
              <button className="button button-wide" type="submit" disabled={state === 'sending'}>
                {state === 'sending' ? <><span className="spinner" aria-hidden="true" />Отправляем</> : <>Отправить заявку <ArrowRight size={20} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

// Задачи клиентов: доска 2 × 2, финансы и право по диагонали
const tasks = [
  ['finance', 'Финансовая стратегия', 'Формируем финансовую стратегию на основе юридической и коммерческой экспертизы нашей компании: от структурирования актива до сопровождения сделок', 'Обсудить задачу бизнеса', 'Обсуждение задачи'],
  ['law', 'Защита личного капитала', 'Защищаем личный капитал и интересы собственников в вопросах наследства, раздела имущества и признания прав', 'Обсудить защиту капитала', 'Защита личного капитала'],
  ['finance', 'Финансирование и капитал', 'Помогаем подобрать финансирование, привлечь капитал и подготовить активы, в том числе недвижимость в крае, к требованиям банков, лизинговых компаний и инвесторов', 'Обсудить финансирование', 'Обсуждение задачи'],
  ['law', 'Споры и сделки с недвижимостью', 'Разрешаем имущественные и земельные споры в Краснодарском крае и на побережье Чёрного моря, вплоть до Верховного Суда РФ, и готовим сделки с недвижимостью', 'Обсудить спор или сделку', 'Защита владельца недвижимости'],
];

const expertise = [
  [Scales, 'Деньги и право вместе', 'Команда объединяет финансовую и юридическую экспертизу, поэтому мы смотрим на каждую задачу одновременно с точки зрения денег и права'],
  [Bank, 'Финансовые институты и партнёры', 'Сотрудничаем с финансовыми институтами, среди которых крупнейшие игроки рынка, а специализированные партнёры помогают нам решать нестандартные задачи'],
  [Gavel, 'Высшие судебные инстанции', 'Судебные специалисты команды ведут дела в судах Краснодарского края и доводят их до Верховного Суда РФ. Кассационные суды юга России находятся в Краснодаре, поэтому мы представляем клиентов на месте во всех инстанциях'],
];

function AboutPage({ request, link }) {
  return (
    <>
      <section className="hero">
        <div className="dot-pattern" aria-hidden="true" />
        <div className="container hero-content">
          <span className="hero-pill"><span className="shiny-text">Финансы и право в Краснодарском крае и СКФО</span></span>
          <h1>Защищаем активы бизнеса и помогаем им работать</h1>
          <p>Юридическая надёжность и коммерческая выгода в каждом решении для бизнеса Краснодарского края и республик Северного Кавказа</p>
          <div className="hero-actions">
            <ShimmerButton onClick={() => request()}>Обсудить задачу <ArrowRight size={20} /></ShimmerButton>
            {link('/solutions', <>Все решения <ArrowRight size={18} /></>, 'text-link')}
          </div>
        </div>
        <Picture name="hero" className="hero-media" priority sizes="(max-width: 1024px) 100vw, 60vw" />
      </section>

      <section className="solutions-strip" aria-label="Направления работы">
        <Marquee items={solutions} duration={85} />
        <Marquee items={[...solutions].reverse()} duration={80} reverse />
      </section>

      <section className="container section client-tasks">
        <h2 className="reveal">С какими задачами к нам обращаются</h2>
        <Board items={tasks} cols={2} className="reveal">
          {([kind, title, text, cta, topic], style) => (
            <BoardCell key={title} kind={kind} style={style} glow>
              <h3>{title}</h3>
              <p>{text}</p>
              <button type="button" className="text-button" onClick={() => request(topic)}>{cta} <ArrowRight size={18} /></button>
            </BoardCell>
          )}
        </Board>
      </section>

      <section className="principle" aria-label="Принцип работы">
        <TextReveal text="Работаем с первопричиной задачи, а не с её следствиями" />
        <div className="container principle-note">
          <p className="reveal">Нам важно не только закрыть текущий запрос, но и понять стратегию бизнеса, его среднесрочные и долгосрочные планы — тогда решение работает на цели компании, а не только на сегодняшнюю задачу</p>
        </div>
      </section>

      <section className="story">
        <Picture name="warehouse" className="story-media" alt="Архитектурная иллюстрация промышленной недвижимости" sizes="(max-width: 1024px) 100vw, 56vw" />
        <div className="container story-grid">
          <div className="story-copy">
            <h2 className="reveal">Экспертиза команды</h2>
            <div className="expertise-list">
              {expertise.map(([Icon, title, text]) => (
                <div key={title} className="expertise-item reveal">
                  <Icon size={30} className="expertise-icon" />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container section cases-section" id="experience">
        <h2 className="reveal">Наш опыт</h2>
        <Board items={experience} className="reveal">
          {({ kind, tag, title, text, number, court }, style) => (
            <BoardCell key={title} kind={kind} label={tag} style={style}>
              <h3>{title}</h3>
              <p>{text}</p>
              {number && <p className="case-reference"><span>{number}</span><span>{court}</span></p>}
            </BoardCell>
          )}
        </Board>
      </section>

      <section className="container section region" id="region">
        <h2 className="reveal">Работаем на месте в Краснодарском крае и СКФО</h2>
        <p className="region-lead reveal">Знаем местную судебную практику и требования к земле и недвижимости на побережье. Ведём задачи наших клиентов на месте и работаем региональным консультантом для юридических и финансовых компаний из других регионов: берём на себя всё, что нужно сделать в крае, а клиентов с задачами в других регионах передаём партнёрам</p>
        <div className="region-grid reveal">
          {regionWork.map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <button type="button" className="text-button region-cta reveal" onClick={() => request('Партнёрство и работа в регионе')}>Обсудить сотрудничество <ArrowRight size={18} /></button>
      </section>
    </>
  );
}

function SolutionsPage({ request }) {
  return (
    <>
      <section className="solutions-intro">
        <div className="dot-pattern" aria-hidden="true" />
        <div className="container">
          <h1 className="page-title">Финансы и право <br className="desktop-break" />под вашу задачу</h1>
          <p className="page-lead">Смотрим на задачу одновременно с точки зрения денег и права: подбираем финансовый инструмент, проверяем актив и сделку, защищаем интересы в суде. Решение строим от стратегии бизнеса и привлекаем к работе подходящих партнёров — от крупнейших игроков рынка до специализированных компаний для нестандартных случаев. Работаем с задачами, связанными с Краснодарским краем и республиками СКФО, для клиентов из любого региона России</p>
          <Board items={solutions} className="reveal">
            {({ kind, name, desc, detail }, style) => (
              <BoardCell key={name} kind={kind} style={style} glow>
                <h3>{name}</h3>
                <p className="cell-desc">{desc}</p>
                <p>{detail}</p>
                <button type="button" className="text-button" aria-label={`Обсудить: ${name}`} onClick={() => request(name)}>Обсудить задачу <ArrowRight size={18} /></button>
              </BoardCell>
            )}
          </Board>
        </div>
      </section>

      <section className="container section process">
        <h2 className="reveal">Работа над вашей задачей</h2>
        <div className="step-cards">
          {steps.map(([h, p], i) => (
            <article key={h} className="reveal">
              <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function PrivacyPage() {
  const { legal } = site;
  const operator = legal.fullName || legal.name || site.name;
  return (
    <article className="container prose">
      <h1 className="page-title">Политика обработки персональных данных</h1>
      <p className="prose-meta">Редакция от 12 октября 2026 года</p>

      <h2>Общие положения</h2>
      <p>Политика составлена в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет, как {operator} (далее — Оператор) обрабатывает и защищает персональные данные посетителей сайта {site.url.replace('https://', '')}.</p>
      <p>Отправляя заявку через форму на сайте, посетитель даёт согласие на обработку своих персональных данных на условиях этой политики.</p>

      <h2>Какие данные мы обрабатываем</h2>
      <ul>
        <li>имя;</li>
        <li>название компании, если оно указано;</li>
        <li>номер телефона или адрес электронной почты;</li>
        <li>текст обращения и выбранное направление;</li>
        <li>технические данные, которые браузер передаёт серверу автоматически: IP-адрес, дата и время запроса, сведения о браузере.</li>
      </ul>

      <h2>Цели обработки</h2>
      <p>Данные используются только для того, чтобы ответить на обращение, обсудить задачу посетителя и подготовить предложение. Мы не используем их для рекламных рассылок и не передаём третьим лицам, кроме случаев, предусмотренных законом.</p>

      <h2>Правовое основание</h2>
      <p>Обработка ведётся на основании согласия субъекта персональных данных (пункт 1 части 1 статьи 6 Закона № 152-ФЗ), которое он даёт, отмечая соответствующее поле в форме заявки.</p>

      <h2>Как мы обрабатываем данные</h2>
      <p>Оператор собирает, записывает, систематизирует, хранит, уточняет, использует и удаляет персональные данные с использованием средств автоматизации и без них. Данные хранятся на серверах, расположенных в Российской Федерации. Уведомления о новых заявках, которые сотрудники получают в мессенджере, не содержат персональных данных.</p>
      <p>Данные хранятся до достижения целей обработки, но не дольше одного года с момента последнего обращения, либо до отзыва согласия, если более долгий срок не требуется по закону или договору.</p>

      <h2>Защита данных</h2>
      <p>Сайт передаёт данные по защищённому протоколу HTTPS. Доступ к заявкам есть только у сотрудников, которым он нужен для ответа на обращение.</p>

      <h2>Права посетителя</h2>
      <p>Посетитель вправе узнать, какие его данные обрабатываются, потребовать их уточнения или удаления и отозвать согласие. Для этого достаточно написать на <a href={`mailto:${site.email}`}>{site.email}</a>. Мы ответим в течение десяти рабочих дней.</p>

      <h2>Файлы cookie</h2>
      <p>Сайт не использует файлы cookie и сервисы веб-аналитики для отслеживания посетителей.</p>

      <h2>Изменение политики</h2>
      <p>Оператор может обновлять политику. Действующая редакция всегда опубликована на этой странице.</p>

      <h2>Контакты Оператора</h2>
      <p>
        {legal.fullName && <>{legal.fullName}<br /></>}
        {legal.inn && <>ИНН {legal.inn}{legal.kpp && `, КПП ${legal.kpp}`}{legal.ogrn && `, ОГРН ${legal.ogrn}`}<br /></>}
        {legal.address && <>Адрес: {legal.address}<br /></>}
        Телефон: <a href={site.phoneHref}>{site.phone}</a><br />
        Email: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
    </article>
  );
}

function NotFoundPage({ link }) {
  return (
    <section className="container not-found">
      <span className="not-found-code">404</span>
      <h1 className="page-title">Такой страницы нет</h1>
      <p>Возможно, ссылка устарела или в адресе опечатка</p>
      <div className="not-found-links">
        {link('/', <>На главную <ArrowRight size={18} /></>, 'button')}
        {link('/solutions', <>Решения <ArrowRight size={18} /></>, 'text-link')}
      </div>
    </section>
  );
}

export function App({ url }) {
  const [path, setPath] = useState(() => normalize(url ?? window.location.pathname));
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [topic, setTopic] = useState('Обсуждение задачи');
  const dialogRef = useRef(null);
  useReveal(path);

  useEffect(() => {
    const onPop = () => { setPath(normalize(window.location.pathname)); setMenu(false); };
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = e => { if (e.key === 'Escape') setMenu(false); };
    onScroll();
    window.addEventListener('popstate', onPop);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    const meta = pages[path];
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
  }, [path]);

  function navigate(e, to) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const [p, hash] = to.split('#');
    const next = normalize(p);
    if (next !== path || window.location.hash !== (hash ? `#${hash}` : '')) window.history.pushState({}, '', BASE + to);
    setPath(next);
    setMenu(false);
    requestAnimationFrame(() => {
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: motionOk() ? 'smooth' : 'instant' });
      else window.scrollTo(0, 0);
    });
  }
  function request(t = 'Обсуждение задачи') { setTopic(t); setMenu(false); dialogRef.current.showModal(); }
  const link = (to, label, cls = '', current) => <a className={cls} href={BASE + to} aria-current={current ? 'page' : undefined} onClick={e => navigate(e, to)}>{label}</a>;

  return (
    <>
      <a className="skip-link" href="#main">К содержанию</a>
      <header className={`header ${scrolled || menu ? 'is-scrolled' : ''} ${menu ? 'menu-open' : ''}`}>
        <div className="header-inner">
          {link('/', site.name, 'wordmark')}
          <nav className="nav" id="site-nav" aria-label="Основная навигация">
            {link('/', 'О нас', '', path === '/')}
            {link('/solutions', 'Решения', '', path === '/solutions')}
            {link('/#contact', 'Контакты')}
          </nav>
          <div className="header-actions">
            <button type="button" className="button button-small" onClick={() => request()}><span>Обсудить<span className="cta-tail"> задачу</span></span></button>
            <button type="button" className="icon-button menu-toggle" aria-label={menu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menu} aria-controls="site-nav" onClick={() => setMenu(!menu)}>{menu ? <X size={24} /> : <List size={24} />}</button>
          </div>
        </div>
      </header>

      <main id="main" key={path} className="page">
        {path === '/' && <AboutPage request={request} link={link} />}
        {path === '/solutions' && <SolutionsPage request={request} />}
        {path === '/privacy' && <PrivacyPage />}
        {path === '/404' && <NotFoundPage link={link} />}

        {path !== '/404' && path !== '/privacy' && (
          <section id="contact" className="contact">
            <FlickeringGrid />
            <Ripple />
            <div className="container contact-inner">
              <div className="reveal">
                <h2>Обсудим следующий шаг</h2>
                <p>Финансовые решения и правовая защита капитала в Краснодарском крае и СКФО</p>
              </div>
              <div className="contact-actions reveal">
                <address className="contact-details">
                  <a href={site.phoneHref}><Phone size={22} />{site.phone}</a>
                  <a href={`mailto:${site.email}`}><EnvelopeSimple size={22} />{site.email}</a>
                </address>
                <ShimmerButton light onClick={() => request()}>Оставить заявку <ArrowRight size={20} /></ShimmerButton>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            {link('/', site.name, 'wordmark')}
            <p>Финансовые инструменты и правовая работа в Краснодарском крае</p>
          </div>
          <nav className="footer-nav" aria-label="Навигация в подвале">
            {link('/', 'О нас')}
            {link('/solutions', 'Решения')}
            {link('/#contact', 'Контакты')}
          </nav>
          <div className="footer-contacts">
            <a href={site.phoneHref}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
        <div className="container footer-legal">
          <span>© {new Date().getFullYear()} {site.legal.name || site.name}{site.legal.inn && ` · ИНН ${site.legal.inn}`}{site.legal.ogrn && ` · ОГРН ${site.legal.ogrn}`}</span>
          {link('/privacy', 'Политика обработки персональных данных')}
        </div>
      </footer>

      <RequestDialog dialogRef={dialogRef} topic={topic} />
    </>
  );
}
