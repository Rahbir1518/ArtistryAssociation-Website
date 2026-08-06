import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Mail,
  Palette,
  Users,
} from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import { AnimatedImageBox } from './components/AnimatedImageBox';
import aryAndBobImg from './images/ary and bob.png';
import './App.css';

const NAV_BREAKPOINT = '(max-width: 899px)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/* Events slider geometry — kept in one place so the scroll maths and the CSS agree */
const CARD_WIDTH = 420;
const CARD_GAP = 32;
const LERP = 0.11;
/* Extra pinned scroll after the track finishes, as a fraction of viewport height */
const EVENTS_TAIL = 0.4;
/* Ambient horizontal drift for the members row, in px per px of scroll */
const DRIFT_RATE = 0.055;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * Runs a rAF loop only while `ref` is near the viewport, so scroll-linked
 * sections cost nothing when they are off-screen.
 */
function useScrollFrame(
  ref: React.RefObject<HTMLElement | null>,
  onFrame: (element: HTMLElement) => void,
  enabled: boolean
) {
  const callbackRef = useRef(onFrame);

  useEffect(() => {
    callbackRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    let frame = 0;
    let running = false;

    const loop = () => {
      callbackRef.current(element);
      frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          loop();
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { rootMargin: '250px 0px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, enabled]);
}

/* Fade + 24px rise at 15% intersection, once only. `key` re-runs the sweep when a
   route swap mounts a fresh set of targets. */
function useRevealOnScroll(key?: string) {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal:not([data-visible="true"])')
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.visible = 'true';
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [key]);
}

// Navigation Component
function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isNarrow = useMediaQuery(NAV_BREAKPOINT);

  // Theme state — palette toggles light ↔ dark; default light
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  /* Separate collapse / expand thresholds: a single one flips back and forth while
     you hover around it, restarting the transition mid-flight. Reads sampled in a
     rAF so a fast scroll cannot queue a state update per event. */
  useEffect(() => {
    let frame = 0;

    const sample = () => {
      frame = 0;
      const y = window.scrollY;
      setIsScrolled((collapsed) => (collapsed ? y > 60 : y > 140));
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Apply theme to html and persist
  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // The overlay only exists below the nav breakpoint, so widening the window closes it
  const menuOpen = isMobileMenuOpen && isNarrow;

  // Lock the page behind the full-screen menu
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navLinks = [
    { label: 'Work', href: '#featured' },
    { label: 'Events', href: '#events' },
    { label: 'Team', href: '#team' },
    { label: 'Members', href: '#members' },
    { label: 'Join', href: '#join' },
  ];

  return (
    <>
      <header className="nav-shell">
        <nav className="nav-pill" data-scrolled={isScrolled} aria-label="Main">
          <a href="#" className="flex shrink-0 items-center gap-2.5">
            <img src="/assets/mascot.png" alt="" className="nav-logo" aria-hidden />
            <span
              className="meta nav-wordmark text-[13px] tracking-[0.18em]"
              style={{ color: 'var(--ink-900)' }}
            >
              Artistry
            </span>
            <span className="nav-dot" aria-hidden />
          </a>

          <div className="nav-center flex-1 items-center justify-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="nav-icon-btn"
            >
              <Palette className="h-[18px] w-[18px]" />
            </button>

            <a href="#join" className="btn-primary nav-cta !py-2.5 !text-[14px]">
              Submit Work
            </a>

            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen(!menuOpen)}
              className="nav-icon-btn nav-burger"
            >
              <span className="flex w-[18px] flex-col gap-[5px]" aria-hidden>
                <span
                  className="block h-[1.5px] w-full origin-center rounded-full transition-transform duration-300"
                  style={{
                    background: 'currentColor',
                    transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : undefined,
                  }}
                />
                <span
                  className="block h-[1.5px] w-full rounded-full transition-opacity duration-300"
                  style={{ background: 'currentColor', opacity: menuOpen ? 0 : 1 }}
                />
                <span
                  className="block h-[1.5px] w-full origin-center rounded-full transition-transform duration-300"
                  style={{
                    background: 'currentColor',
                    transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : undefined,
                  }}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div id="mobile-menu" className="nav-overlay" data-open={menuOpen} aria-hidden={!menuOpen}>
        <p className="eyebrow mb-4" style={{ color: 'var(--violet-300)' }}>
          Artistry Association
        </p>
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
            className="nav-overlay-link"
          >
            {link.label}
          </a>
        ))}
        <a
          href="#join"
          onClick={() => setIsMobileMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
          className="btn-primary mt-8 w-full"
        >
          Submit Work
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </>
  );
}

// Hero Section — full-bleed Art of the Month
function HeroSection() {
  return (
    <section className="hero-frame" aria-labelledby="hero-heading">
      <img
        src="/assets/featured-art.jpg"
        alt="Untitled, January's Art of the Month — a figure dissolving into a field of teal light"
        className="hero-art"
      />
      <div className="hero-scrim hero-scrim-in" aria-hidden />
      <div className="hero-scrim-boost hero-scrim-in" aria-hidden />

      <div className="hero-content">
        <p className="eyebrow hero-in" style={{ color: 'var(--violet-300)', ['--d' as string]: '200ms' }}>
          Art of the Month — January
        </p>

        <h1
          id="hero-heading"
          className="font-display text-hero hero-heading hero-in mt-5"
          style={{ ['--d' as string]: '280ms' }}
        >
          Featured
          <br />
          Art
        </h1>

        <p className="hero-body hero-in mt-6" style={{ ['--d' as string]: '360ms' }}>
          Selected by the community—this piece captures emotion, craft, and a world we want to live in.
        </p>

        <a href="#featured" className="btn-frosted hero-in mt-9" style={{ ['--d' as string]: '440ms' }}>
          View the feature
          <ArrowRight className="btn-arrow h-4 w-4" aria-hidden />
        </a>
      </div>

      {/* Attribution — the gallery wall label, repeated on every artwork on the site */}
      <div className="hero-credit hero-in" style={{ ['--d' as string]: '520ms' }}>
        <p className="meta" style={{ color: 'rgb(var(--white-rgb) / 0.6)' }}>
          Maya Chen
        </p>
        <p className="eyebrow" style={{ color: 'rgb(var(--white-rgb) / 0.6)' }}>
          @mayadraws
        </p>
      </div>
    </section>
  );
}

type WorkItem = {
  image: string;
  artist: string;
  handle: string;
  medium: string;
  category: string;
  ratio: string;
};

const WORK_FILTERS = ['All', 'Illustration', '3D', 'Animation', 'Traditional'];
/* Fixed rather than random, so a piece keeps its angle across filters and re-renders */
const WORK_TILTS = [-0.9, 0.6, -0.4, 1.1, -1.2, 0.5, 0.9, -0.7];

// Work Section — masonry of member submissions
function FeaturedSection() {
  const [activeFilter, setActiveFilter] = useState('All');

  const works: WorkItem[] = [
    { image: '/assets/featured-art.jpg', artist: 'Maya Chen', handle: '@mayadraws', medium: 'Digital', category: 'Illustration', ratio: '4 / 5' },
    { image: '/assets/member-03.jpg', artist: 'Sarah Kim', handle: '@sarahmoves', medium: 'Frame loop', category: 'Animation', ratio: '1 / 1' },
    { image: '/assets/event-sketch.jpg', artist: 'James Wilson', handle: '@jwconcept', medium: 'Graphite', category: 'Traditional', ratio: '3 / 4' },
    { image: '/assets/member-08.jpg', artist: 'Michael Brown', handle: '@mbrender', medium: 'Blender', category: '3D', ratio: '4 / 3' },
    { image: '/assets/hero-group.jpg', artist: 'Elena Rodriguez', handle: '@elenadraws', medium: 'Digital', category: 'Illustration', ratio: '3 / 2' },
    { image: '/assets/member-05.jpg', artist: 'Alex Thompson', handle: '@athompson', medium: 'Gouache', category: 'Traditional', ratio: '4 / 5' },
    { image: '/assets/event-portfolio.jpg', artist: 'Rachel Green', handle: '@rgreen', medium: 'Digital', category: 'Illustration', ratio: '1 / 1' },
    { image: '/assets/member-11.jpg', artist: 'Anna White', handle: '@annavisdev', medium: 'Cinema 4D', category: '3D', ratio: '2 / 3' },
    { image: '/assets/event-newyear.png', artist: 'Ryan Lee', handle: '@ryanmotion', medium: 'After Effects', category: 'Animation', ratio: '5 / 4' },
    { image: '/assets/member-07.jpg', artist: 'Lisa Wong', handle: '@lisaboards', medium: 'Ink', category: 'Traditional', ratio: '4 / 5' },
  ];

  const visible = activeFilter === 'All' ? works : works.filter((work) => work.category === activeFilter);

  return (
    <section id="featured" className="px-6 py-28 lg:px-[6vw] lg:py-40">
      <div className="reveal mb-14 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Member submissions</p>
          <h2 className="font-display text-section mt-5">Imagination</h2>
        </div>
        <p className="body-lg max-w-md">
          A collective of illustrators, designers, and storytellers building worlds—one piece at a time.
        </p>
      </div>

      <div className="reveal mb-10 flex flex-wrap gap-2.5" role="group" aria-label="Filter work by medium">
        {WORK_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className="filter-chip"
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="work-grid">
        {visible.map((work, index) => (
          <a
            key={work.image + work.artist}
            href="#featured"
            className="work-item"
            aria-label={`${work.artist}, ${work.medium}`}
            style={{ ['--tilt' as string]: `${WORK_TILTS[index % WORK_TILTS.length]}deg` }}
          >
            <div style={{ aspectRatio: work.ratio }}>
              <img src={work.image} alt={`${work.medium} piece by ${work.artist}`} loading="lazy" />
            </div>
            <div className="wall-label">
              <span className="wall-label-name">{work.artist}</span>
              <span className="wall-label-meta">
                {work.handle} · {work.medium}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

type EventItem = {
  image: string;
  title: string;
  date: string;
  time: string;
  description: string;
  status: 'live' | 'upcoming' | 'past';
};

const STATUS_LABEL: Record<EventItem['status'], string> = {
  live: 'Live',
  upcoming: 'Upcoming',
  past: 'Archive',
};

function EventCard({
  event,
  onFocus,
}: {
  event: EventItem;
  onFocus?: () => void;
}) {
  return (
    <a href="#events" className="event-card" onFocus={onFocus}>
      <div className="event-card-media">
        <img src={event.image} alt={event.title} loading="lazy" />
      </div>
      <div className="event-card-fade" aria-hidden />

      <div className="absolute left-7 top-7 z-10">
        <p className="meta" style={{ color: 'rgb(var(--white-rgb) / 0.85)' }}>
          {event.date} · {event.time}
        </p>
      </div>

      <div className="absolute inset-x-7 bottom-7 z-10 flex flex-col items-start gap-4">
        <span className={`chip chip-${event.status}`}>
          <span className="chip-dot" aria-hidden />
          {STATUS_LABEL[event.status]}
        </span>
        <h3 className="font-display text-card-title" style={{ color: 'var(--white)' }}>
          {event.title}
        </h3>
        <p className="text-step-1" style={{ color: 'var(--ink-400)' }}>
          {event.description}
        </p>
      </div>
    </a>
  );
}

// Events Section — vertical scroll drives horizontal movement
function EventsSection() {
  const events: EventItem[] = [
    {
      image: '/assets/event-newyear.png',
      title: 'New Year Challenge',
      date: 'Feb 14',
      time: '7PM EST',
      description: 'One prompt, one week, no rules on medium.',
      status: 'live',
    },
    {
      image: '/assets/hero-group.jpg',
      title: 'Critique Night',
      date: 'Feb 27',
      time: '8PM EST',
      description: 'Bring one piece, leave with three fixes.',
      status: 'upcoming',
    },
    {
      image: '/assets/event-winter.jpg',
      title: 'Winter Showcase',
      date: 'Dec 2025',
      time: 'Archive',
      description: 'Forty members, one gallery wall, zero themes.',
      status: 'past',
    },
    {
      image: '/assets/event-sketch.jpg',
      title: 'Sketch Night Live',
      date: 'Nov 2025',
      time: 'Archive',
      description: 'Two hours of timed figure drawing, on stream.',
      status: 'past',
    },
    {
      image: '/assets/event-portfolio.jpg',
      title: 'Portfolio Review',
      date: 'Oct 2025',
      time: 'Archive',
      description: 'Working art directors, fifteen minutes each.',
      status: 'past',
    },
  ];

  const isNarrow = useMediaQuery(NAV_BREAKPOINT);
  const reduceMotion = useMediaQuery(REDUCED_MOTION);
  const isHorizontal = !isNarrow && !reduceMotion;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const distanceRef = useRef(0);
  const edgeRef = useRef<'start' | 'middle' | 'end'>('start');
  const [edge, setEdge] = useState<'start' | 'middle' | 'end'>('start');

  /* Outer height = viewport + horizontal distance + a tail. 1px of scroll still buys
     1px of travel, but the tail holds the section pinned after the track has run out,
     giving the eased position time to land on the last card before it unpins. */
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!isHorizontal || !section || !track) {
      if (section) section.style.height = '';
      if (track) track.style.transform = '';
      return;
    }

    const measure = () => {
      distanceRef.current = Math.max(0, track.scrollWidth - window.innerWidth);
      const tail = distanceRef.current > 0 ? window.innerHeight * EVENTS_TAIL : 0;
      section.style.height = `${window.innerHeight + distanceRef.current + tail}px`;
    };

    measure();
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
      section.style.height = '';
      track.style.transform = '';
    };
  }, [isHorizontal, events.length]);

  const progressRef = useRef(0);

  useScrollFrame(
    sectionRef,
    (section) => {
      const track = trackRef.current;
      if (!track) return;

      /* Measured against the track distance, not the section height, so progress hits
         1 with the tail still to scroll rather than at the instant of unpinning */
      const rect = section.getBoundingClientRect();
      const distance = distanceRef.current;
      const target = distance > 0 ? clamp(-rect.top / distance, 0, 1) : 0;

      /* Glide toward the scroll position rather than snapping to it */
      let current = progressRef.current + (target - progressRef.current) * LERP;
      if (Math.abs(target - current) < 0.00005) current = target;
      progressRef.current = current;

      /* The whole track moves as one — per-card offsets read as misalignment, not depth */
      const x = -distance * current;
      track.style.transform = `translate3d(${x}px, 0, 0)`;

      if (railRef.current) railRef.current.style.transform = `scaleX(${current})`;

      const nextEdge = current <= 0.002 ? 'start' : current >= 0.998 ? 'end' : 'middle';
      if (nextEdge !== edgeRef.current) {
        edgeRef.current = nextEdge;
        setEdge(nextEdge);
      }
    },
    isHorizontal
  );

  const scrollByCard = (direction: 1 | -1) => {
    window.scrollBy({ top: direction * (CARD_WIDTH + CARD_GAP), behavior: 'smooth' });
  };

  /* Tabbing to a card off-screen scrolls the track until it is in view */
  const revealCard = (index: number) => {
    const section = sectionRef.current;
    if (!isHorizontal || !section || distanceRef.current === 0) return;
    const offset = Math.min(distanceRef.current, index * (CARD_WIDTH + CARD_GAP));
    const documentTop = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: documentTop + offset, behavior: 'smooth' });
  };

  const heading = (
    <>
      <p className="eyebrow">{events.length} gatherings</p>
      <h2 className="font-display text-section mt-5">
        Events
      </h2>
      <p className="body-lg mt-6">
        Critique nights, workshops, and challenges—every month, all year.
      </p>
      <a
        href="#events"
        className="meta mt-8 inline-flex items-center gap-2 transition-colors duration-300"
        style={{ color: 'var(--violet-600)' }}
      >
        See all events
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </a>
    </>
  );

  // Reduced motion: no pinning, no horizontal movement — a plain vertical stack
  if (reduceMotion) {
    return (
      <section id="events" className="px-6 py-28 lg:px-[6vw] lg:py-40">
        <div className="mb-14 max-w-md">{heading}</div>
        <div className="flex flex-col items-center gap-8 sm:items-start">
          {events.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>
      </section>
    );
  }

  // Touch / narrow: native scroll-snap carousel, never scroll-jacked
  if (isNarrow) {
    return (
      <section id="events" className="py-24">
        <div className="mb-10 px-6">{heading}</div>
        <div className="events-snap">
          {events.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="events" ref={sectionRef} className="relative">
      <div className="events-viewport">
        <div className="events-heading-veil" aria-hidden />
        <div className="events-heading">{heading}</div>

        <div ref={trackRef} className="events-track">
          {events.map((event, index) => (
            <div key={event.title} className="event-parallax">
              <EventCard event={event} onFocus={() => revealCard(index)} />
            </div>
          ))}
        </div>

        <div className="events-controls">
          <div className="events-rail">
            <div ref={railRef} className="events-rail-fill" style={{ transform: 'scaleX(0)' }} />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="events-nav-btn"
              aria-label="Previous events"
              disabled={edge === 'start'}
              onClick={() => scrollByCard(-1)}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              className="events-nav-btn"
              aria-label="Next events"
              disabled={edge === 'end'}
              onClick={() => scrollByCard(1)}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Team Section
function TeamSection() {
  return (
    <section id="team" className="px-6 py-28 lg:px-[6vw] lg:py-40">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="reveal">
          <p className="eyebrow">Nine curators</p>
          <h2 className="font-display text-section mt-5">
            Meet the
            <br />
            Team
          </h2>
          <p className="body-lg mt-6 max-w-md">
            Curators, mentors, and creators who keep the community weird, welcoming, and working.
          </p>
          <a href="#members" className="btn-secondary mt-9">
            Meet the Team
            <Users className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <figure className="reveal" style={{ ['--d' as string]: '80ms' }}>
          <div className="overflow-hidden rounded-[24px]" style={{ aspectRatio: '16 / 10' }}>
            <AnimatedImageBox
              variant="section"
              src="/assets/team-portrait.jpg"
              alt="The Artistry Association curatorial team"
            />
          </div>
          <figcaption className="meta mt-4">Toronto · Est. 2019</figcaption>
        </figure>
      </div>
    </section>
  );
}

// Members Section
function MembersSection() {
  const members = [
    { name: 'Maya Chen', role: 'Illustrator', image: '/assets/member-01.jpg', submissions: 34 },
    { name: 'James Wilson', role: 'Concept Artist', image: '/assets/member-02.jpg', submissions: 28 },
    { name: 'Sarah Kim', role: 'Animator', image: '/assets/member-03.jpg', submissions: 41 },
    { name: 'David Park', role: 'Digital Artist', image: '/assets/member-04.jpg', submissions: 19 },
    { name: 'Elena Rodriguez', role: 'Character Designer', image: '/assets/member-05.jpg', submissions: 23 },
    { name: 'Alex Thompson', role: 'Illustrator', image: '/assets/member-06.jpg', submissions: 16 },
    { name: 'Lisa Wong', role: 'Storyboard Artist', image: '/assets/member-07.jpg', submissions: 30 },
    { name: 'Michael Brown', role: '3D Artist', image: '/assets/member-08.jpg', submissions: 12 },
    { name: 'Rachel Green', role: 'Art Director', image: '/assets/member-09.jpg', submissions: 25 },
    { name: 'Chris Martinez', role: 'Comic Artist', image: '/assets/member-10.jpg', submissions: 37 },
    { name: 'Anna White', role: 'Visual Dev', image: '/assets/member-11.jpg', submissions: 21 },
    { name: 'Ryan Lee', role: 'Motion Designer', image: '/assets/member-12.jpg', submissions: 14 },
  ];

  const featured = members.slice(0, 4);

  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useMediaQuery(REDUCED_MOTION);

  /* Ambient drift: the row eases sideways as the page scrolls, wrapping seamlessly */
  useScrollFrame(
    marqueeRef,
    (element) => {
      const track = trackRef.current;
      if (!track) return;
      const rowWidth = track.firstElementChild?.getBoundingClientRect().width ?? 0;
      if (rowWidth === 0) return;
      const travelled = window.innerHeight - element.getBoundingClientRect().top;
      const offset = ((travelled * DRIFT_RATE) % rowWidth + rowWidth) % rowWidth;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    },
    !reduceMotion
  );

  return (
    <section id="members" className="px-6 py-28 lg:px-[6vw] lg:py-40">
      <div className="reveal max-w-2xl">
        <p className="eyebrow">
          1,248 members
          <span className="mx-2" style={{ color: 'var(--violet-300)' }} aria-hidden>
            /
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="chip-dot inline-block" style={{ background: 'var(--magenta)' }} aria-hidden />
            12 online now
          </span>
        </p>
        <h2 className="font-display text-section mt-5">Members</h2>
        <p className="body-lg mt-6">
          A growing roster of illustrators, concept artists, animators, and designers.
        </p>
      </div>

      <div className="reveal mt-14" style={{ ['--d' as string]: '80ms' }}>
        <div ref={marqueeRef} className="avatar-marquee">
          <div ref={trackRef} className="avatar-marquee-track">
            {[0, 1, 2].map((copy) => (
              <div key={copy} className="avatar-row" aria-hidden={copy > 0}>
                {members.map((member) => (
                  <div key={member.name} className="avatar-row-item" title={member.name}>
                    <img src={member.image} alt={copy === 0 ? member.name : ''} loading="lazy" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="meta mt-5">+1,236 more</p>
      </div>

      <div className="reveal mt-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" style={{ ['--d' as string]: '160ms' }}>
        {featured.map((member) => (
          <article key={member.name} className="member-card">
            <div className="member-card-avatar">
              <img src={member.image} alt={member.name} loading="lazy" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-step-2 font-medium" style={{ color: 'var(--text-strong)' }}>
                {member.name}
              </h3>
              <p className="eyebrow mt-1">{member.role}</p>
              <p className="eyebrow mt-1" style={{ color: 'var(--violet-600)' }}>
                {member.submissions} pieces
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="reveal mt-14">
        <a href="#join" className="btn-secondary">
          Become a Member
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}

// Join Section — one line, one action
function JoinSection() {
  return (
    <section id="join" className="band-dark px-6 py-28 lg:px-[6vw] lg:py-36">
      <div className="reveal mx-auto flex max-w-5xl flex-col items-start gap-12 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="font-display text-section max-w-2xl">
          Show us what
          <br />
          you made
        </h2>
        <a href="#join" className="btn-primary shrink-0">
          Submit Your Work
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}

// Footer Section
function FooterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail('');
    }
  };

  const columns = [
    {
      title: 'Explore',
      links: [
        { label: 'Work', href: '#featured' },
        { label: 'Events', href: '#events' },
        { label: 'Team', href: '#team' },
        { label: 'Members', href: '#members' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Submit Work', href: '#join' },
        { label: 'Open Calls', href: '#events' },
        { label: 'Code of Conduct', href: ROUTE_HASH.conduct },
        { label: 'Privacy', href: ROUTE_HASH.privacy },
      ],
    },
  ];

  return (
    <footer
      className="band-dark relative overflow-hidden border-t px-6 pb-12 pt-20 lg:px-[6vw] lg:pt-24"
      style={{ borderColor: 'var(--hairline-on-dark)' }}
    >
      {/* The mascot returns as a large, low-opacity background mark */}
      <img
        src={aryAndBobImg}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-10 w-[520px] max-w-[70vw] opacity-[0.07]"
      />

      <div className="relative grid gap-14 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-12">
        <div>
          <img
            src="/assets/Artistry Association.png"
            alt="Artistry Association"
            className="wordmark h-9 w-auto object-contain"
          />
          <p className="eyebrow mt-6" style={{ color: 'var(--violet-300)' }}>
            Get in touch
          </p>
          <a
            href="mailto:hello@artistry.assoc"
            className="mt-3 block text-step-3 transition-colors duration-300"
            style={{ color: 'var(--white)' }}
          >
            hello@artistry.assoc
          </a>

          <div className="mt-8 flex gap-4">
            {[
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Palette, label: 'Portfolio' },
              { Icon: Calendar, label: 'Event calendar' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="https://www.instagram.com/artistryassociation"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300"
                style={{ border: '1px solid var(--hairline-on-dark)', color: 'var(--violet-300)' }}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="eyebrow" style={{ color: 'var(--ink-400)' }}>
              {column.title}
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        className="relative mt-16 max-w-md border-t pt-10"
        style={{ borderColor: 'var(--hairline-on-dark)' }}
      >
        <p className="eyebrow" style={{ color: 'var(--violet-300)' }}>
          Newsletter
        </p>
        {submitted ? (
          <p className="mt-4 text-step-2" style={{ color: 'var(--white)' }}>
            Welcome to the collective!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="footer-input"
              required
            />
            <button type="submit" className="btn-primary shrink-0">
              Subscribe
              <Mail className="h-4 w-4" aria-hidden />
            </button>
          </form>
        )}
      </div>

      <div
        className="relative mt-16 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: 'var(--hairline-on-dark)' }}
      >
        <p className="eyebrow" style={{ color: 'var(--ink-400)' }}>
          © 2026 Artistry Association
        </p>
        <div className="flex gap-8">
          <a href={ROUTE_HASH.privacy} className="footer-link">
            Privacy
          </a>
          <a href={ROUTE_HASH.conduct} className="footer-link">
            Code of Conduct
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ *
 * Legal pages — hash routed so they need no router dependency
 * ------------------------------------------------------------------ */

type Route = 'home' | 'conduct' | 'privacy';

const ROUTE_HASH: Record<Exclude<Route, 'home'>, string> = {
  conduct: '#/code-of-conduct',
  privacy: '#/privacy',
};

const routeFromHash = (): Route => {
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  if (hash === ROUTE_HASH.conduct) return 'conduct';
  if (hash === ROUTE_HASH.privacy) return 'privacy';
  return 'home';
};

function useRoute() {
  const [route, setRoute] = useState<Route>(routeFromHash);

  useEffect(() => {
    const onHashChange = () => {
      const next = routeFromHash();
      setRoute(next);

      if (next !== 'home') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      /* Coming back to the home page from a legal page: the section the hash points
         at is only mounted after this render, so the browser's own jump missed it */
      const id = window.location.hash.slice(1);
      if (!id) return;
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

type LegalSection = {
  heading: string;
  body?: string;
  list?: string[];
};

type LegalContent = {
  eyebrow: string;
  title: string;
  updated: string;
  lede: string;
  sections: LegalSection[];
};

const LEGAL_PAGES: Record<Exclude<Route, 'home'>, LegalContent> = {
  conduct: {
    eyebrow: 'Community standards',
    title: 'Code of Conduct',
    updated: 'Last updated 6 August 2026',
    lede: 'Artistry Association is a room full of people making things in public. That only works if the room feels safe. Here is what we expect from each other—in the Discord, at events, in critique threads, and anywhere our name is on the door.',
    sections: [
      {
        heading: 'The short version',
        body: 'Be kind. Be honest. Be useful. Assume the person on the other side of the screen is trying, and treat their work-in-progress the way you would want yours treated.',
      },
      {
        heading: 'What we expect',
        list: [
          'Lead with respect. Disagree with the work, never with the person.',
          'Use the name and pronouns someone gives you. If you slip, correct it and move on.',
          'Welcome beginners. Everyone posted a rough first drawing once.',
          'Keep it clean in shared spaces—no slurs, no sexual content, no gore outside clearly labelled channels.',
          'Ask before sharing. Someone else’s unfinished work, DMs, or personal details are theirs to post, not yours.',
          'Give credit. Name your references, your collaborators, and your sources.',
        ],
      },
      {
        heading: 'Giving critique',
        body: 'Critique is the reason most people are here, so we hold it to a standard.',
        list: [
          'Answer what was asked. If someone wants help with colour, do not rewrite their concept.',
          'Be specific. "The values in the midground read flat" beats "something feels off".',
          'Point at a fix, not just a flaw.',
          'Skip the sandwich theatre—honest and warm is better than fake praise wrapped around a jab.',
          'One critique per piece is plenty. Pile-ons are not feedback.',
        ],
      },
      {
        heading: 'Credit, copying, and AI',
        list: [
          'Post work you made. Studies and fan art are welcome—label them as such.',
          'Tracing or repainting someone else’s piece without credit is not okay.',
        ],
      },
      {
        heading: 'Not okay here',
        list: [
          'Harassment, stalking, or repeated unwanted contact.',
          'Hate speech or slurs of any kind, including "as a joke".',
          'Sexual attention toward anyone, and any sexual content involving minors—instant and permanent removal.',
          'Doxxing, screenshot-leaking, or sharing private conversations.',
          'Art theft, plagiarism, or reselling another member’s work.',
          'Spam, scams, unsolicited commission pitches in DMs, and self-promo dumped into critique threads.',
        ],
      },
      {
        heading: 'If something goes wrong',
        body: 'Tell us. Email conduct@artistry.assoc or message any moderator—the ones with the violet dot. Reports go to a small group of organisers, we will not share your name with the person you reported without asking you first, and you will hear back within three days. Reporting something in good faith never counts against you, even if we end up disagreeing about the outcome.',
      },
      {
        heading: 'What happens next',
        body: 'Most issues end at a quiet word. Beyond that we escalate: a private warning, then a temporary mute or removal from events, then a permanent ban. Serious harm—threats, sexual content involving minors, targeted harassment—skips straight to the end. Decisions are made by at least two organisers, and you can appeal once by replying to the notice you receive.',
      },
      {
        heading: 'Where this applies',
        body: 'Everywhere Artistry Association operates: the Discord, critique nights, workshops, showcases, our social accounts, and member-run meetups that use our name. Behaviour elsewhere can still matter if it makes this community unsafe.',
      },
    ],
  },
  privacy: {
    eyebrow: 'Your data',
    title: 'Privacy Policy',
    updated: 'Last updated 6 August 2026',
    lede: 'We are an art community, not an advertising business. We collect the least we can get away with, we never sell it, and everything below is written to be read rather than skimmed past.',
    sections: [
      {
        heading: 'The short version',
        body: 'We keep your email so we can send you what you asked for, your submissions so we can show them, and rough traffic numbers so we know which pages work. That is it. No ad networks, no data brokers, no selling.',
      },
      {
        heading: 'What we collect',
        list: [
          'Membership details you type in: name or handle, email address, and any links you choose to add.',
          'Work you submit: images, titles, medium, and the caption you write with them.',
          'Newsletter sign-ups: your email address and the date you subscribed.',
          'Event RSVPs: which sessions you signed up for and whether you attended.',
          'Basic usage data: pages viewed, approximate region, browser type, and referring site—aggregated, never tied to your name.',
        ],
      },
      {
        heading: 'What we do with it',
        list: [
          'Run the community: your account, your submissions, and your place at events.',
          'Send the newsletter and occasional event reminders—only if you opted in.',
          'Show your work on the site and our social accounts, always with your name and handle attached.',
          'Understand which pages and events people actually use, so we build more of what works.',
          'Enforce the Code of Conduct when we receive a report.',
        ],
      },
      {
        heading: 'What we never do',
        body: 'We do not sell, rent, or trade your personal information. We do not run third-party advertising trackers. We do not build advertising profiles, and we do not share your email with other organisations for their own marketing.',
      },
      {
        heading: 'Cookies and analytics',
        body: 'We use a single cookie to remember your theme choice, and privacy-friendly analytics that count visits without cross-site tracking or fingerprinting. Nothing here follows you around the rest of the internet. Blocking cookies will not lock you out of the site—you will just get the light theme every time.',
      },
      {
        heading: 'Who else touches your data',
        body: 'Only the services we need to operate: our web host, our email delivery provider, our analytics provider, and Discord for the community itself. They process data on our instructions and are not allowed to use it for anything else. We will also disclose information if the law genuinely requires it.',
      },
      {
        heading: 'How long we keep it',
        list: [
          'Newsletter emails: until you unsubscribe, then deleted within 30 days.',
          'Member accounts: while your membership is active, plus 12 months after it lapses.',
          'Submitted work: kept in the archive unless you ask us to remove it.',
          'Analytics: aggregated after 14 months, with the raw records discarded.',
          'Conduct reports: three years, so patterns of behaviour stay visible to moderators.',
        ],
      },
      {
        heading: 'Your artwork stays yours',
        body: 'Submitting work gives us permission to display it on the site, in showcases, and on our social accounts with credit. It does not transfer copyright, it is not exclusive, and it is not permanent—ask and we will take a piece down.',
      },
      {
        heading: 'Your choices',
        list: [
          'Unsubscribe from any newsletter using the link in its footer.',
          'Ask for a copy of everything we hold about you.',
          'Ask us to correct anything that is wrong.',
          'Ask us to delete your account, your data, or a single submission.',
          'Object to a use you are not comfortable with, and we will stop or explain why we cannot.',
        ],
      },
      {
        heading: 'Age',
        body: 'The community is intended for people aged 13 and over. If you are under 16, please ask a parent or guardian before you sign up. If we learn we are holding data for a child under 13, we delete it.',
      },
      {
        heading: 'Changes',
        body: 'If we change anything that materially affects you, we will update the date at the top of this page and send a note to the newsletter. Small clarifications get the date change alone.',
      },
      {
        heading: 'Contact',
        body: 'Questions, requests, or corrections: privacy@artistry.assoc. A real person reads that inbox and we aim to reply within 30 days.',
      },
    ],
  },
};

function LegalPage({ page }: { page: LegalContent }) {
  return (
    <article className="legal-shell">
      <a href="#" className="legal-back">
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        Back to Artistry
      </a>

      <header className="legal-head">
        <p className="eyebrow" style={{ color: 'var(--violet-600)' }}>
          {page.eyebrow}
        </p>
        <h1 className="font-display text-section mt-5">{page.title}</h1>
        <p className="meta mt-5">{page.updated}</p>
        <p className="body-lg mt-7">{page.lede}</p>
      </header>

      {page.sections.map((section, index) => (
        <section key={section.heading} className="legal-section">
          <p className="eyebrow legal-index" aria-hidden>
            {String(index + 1).padStart(2, '0')}
          </p>
          <h2 className="legal-h">{section.heading}</h2>
          {section.body && <p className="legal-p">{section.body}</p>}
          {section.list && (
            <ul className="legal-list">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <aside className="legal-note">
        <p className="eyebrow" style={{ color: 'var(--violet-600)' }}>
          Questions
        </p>
        <p className="legal-p mt-3">
          Anything unclear, or something you want changed? Write to{' '}
          <a href="mailto:hello@artistry.assoc" className="legal-link">
            hello@artistry.assoc
          </a>{' '}
          and a person—not a form—will answer.
        </p>
      </aside>
    </article>
  );
}

// Main App
function App() {
  const route = useRoute();
  useRevealOnScroll(route);

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--surface)' }}>
      <CustomCursor />
      <div className="grain-overlay" aria-hidden />

      <a href="#featured" className="sr-only focus:not-sr-only">
        Skip to content
      </a>

      <Navigation />

      {route === 'home' ? (
        <main className="relative">
          <HeroSection />
          <FeaturedSection />
          <EventsSection />
          <TeamSection />
          <MembersSection />
          <JoinSection />
        </main>
      ) : (
        <main className="relative">
          <LegalPage page={LEGAL_PAGES[route]} />
        </main>
      )}

      <FooterSection />
    </div>
  );
}

export default App;
