import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, ArrowRight, Mail, Instagram, Palette, Users, Calendar, ChevronRight } from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

// Three.js Particle Background
function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  const geometry = new THREE.BufferGeometry();
  const particles = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    particles[i * 3] = (Math.random() - 0.5) * 20;
    particles[i * 3 + 1] = (Math.random() - 0.5) * 20;
    particles[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color="#9187DD"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <ParticleField />
        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [navSpacerHeight, setNavSpacerHeight] = useState<number>(0);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Measure navbar height and keep a spacer so content isn't covered by the fixed nav
  useEffect(() => {
    function measure() {
      const h = navRef.current?.offsetHeight || 0;
      setNavSpacerHeight(h);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isScrolled, isMobileMenuOpen]);

  // Apply theme to html and persist
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const navLinks = [
    { label: 'Work', href: '#featured' },
    { label: 'Events', href: '#events' },
    { label: 'Team', href: '#team' },
    { label: 'Members', href: '#members' },
    { label: 'Join', href: '#join' },
  ];

  return (
    <>
      <nav ref={(el) => (navRef.current = el)} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-artistry-dark/90 backdrop-blur-md py-4' : 'py-6'
      }`}>
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <img src="/assets/mascot.png" alt="Artistry Association mascot" className="w-10 h-10 object-contain" />
            <img src="/assets/Artistry Association.png" alt="Artistry Association" className="hidden sm:block h-6 object-contain" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md text-artistry-cream hover:text-artistry-gold transition-colors"
            >
              <Palette className="w-5 h-5" />
            </button>

            <a href="#join" className="btn-primary text-sm">
              Submit Work
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-artistry-cream p-2"
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-current transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* spacer to prevent nav from covering content */}
      <div aria-hidden style={{ height: navSpacerHeight }} />

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-artistry-dark/98 backdrop-blur-lg transition-all duration-500 lg:hidden ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-display text-artistry-cream hover:text-artistry-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a href="#join" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary mt-4">
            Submit Work
          </a>
        </div>
      </div>
    </>
  );
}

// Hero Section
function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Auto-play entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.fromTo(imageRef.current, 
        { opacity: 0, scale: 1.06 }, 
        { opacity: 1, scale: 1, duration: 1 }
      )
      .fromTo(ruleRef.current, 
        { scaleY: 0 }, 
        { scaleY: 1, duration: 0.8, transformOrigin: 'top' }, 
        0.2
      )
      .fromTo(starRef.current, 
        { scale: 0, rotation: -25 }, 
        { scale: 1, rotation: 0, duration: 0.6 }, 
        0.4
      )
      .fromTo(textRef.current?.querySelectorAll('.animate-in') || [], 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 }, 
        0.3
      );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            gsap.set([imageRef.current, textRef.current, ruleRef.current, starRef.current], {
              opacity: 1, x: 0, y: 0, scale: 1, scaleY: 1
            });
          }
        }
      });

      // EXIT phase (70%-100%)
      scrollTl.fromTo(textRef.current, 
        { x: 0, opacity: 1 }, 
        { x: '18vw', opacity: 0, ease: 'power2.in' }, 
        0.7
      )
      .fromTo(ruleRef.current, 
        { scaleY: 1, opacity: 1 }, 
        { scaleY: 0.2, opacity: 0.2 }, 
        0.7
      )
      .fromTo(imageRef.current, 
        { x: 0, scale: 1, opacity: 1 }, 
        { x: '-10vw', scale: 1.06, opacity: 0.35 }, 
        0.7
      )
      .to(imageRef.current, { opacity: 0 }, 0.95);

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-pinned bg-artistry-dark z-10">
      {/* Hero Image */}
      <div 
        ref={imageRef}
        className="absolute left-0 top-0 w-full lg:w-[62vw] h-full"
      >
        <img 
          src="/assets/hero-group.jpg" 
          alt="Artistry Association Team" 
          className="w-full h-full object-cover img-cinematic"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-artistry-dark/90 lg:block hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-artistry-dark via-transparent to-transparent lg:hidden" />
      </div>

      {/* Gold Rule */}
      <div 
        ref={ruleRef}
        className="hidden lg:block absolute left-[64.5vw] top-[18vh] w-[6px] h-[64vh] bg-artistry-gold"
      />

      {/* Content */}
      <div 
        ref={textRef}
        className="absolute bottom-12 left-6 right-6 lg:left-[66vw] lg:top-[18vh] lg:w-[30vw] lg:bottom-auto"
      >
        <div ref={starRef} className="hidden lg:flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-artistry-gold star-sparkle" />
        </div>
        
        <h1 className="text-hero font-display uppercase text-artistry-cream mb-6 animate-in">
          IMAGIN<br />ATION
        </h1>
        
        <p className="text-lg text-artistry-muted mb-8 max-w-md animate-in">
          A collective of illustrators, designers, and storytellers building worlds—one piece at a time.
        </p>
        
        <div className="flex flex-wrap gap-4 animate-in">
          <a href="#featured" className="btn-primary flex items-center gap-2">
            Explore Work
            <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#join" className="btn-secondary">
            Join the Collective
          </a>
        </div>
      </div>

      {/* Micro Label */}
      <div className="absolute left-6 lg:left-[6vw] top-[8vh] hidden lg:block">
        <span className="font-mono text-xs uppercase tracking-widest text-artistry-muted">
          Artistry Association
        </span>
      </div>
    </section>
  );
}

// Featured Art Section
function FeaturedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0%-30%)
      scrollTl.fromTo(imageRef.current, 
        { x: '-60vw', opacity: 0 }, 
        { x: 0, opacity: 1, ease: 'none' }, 
        0
      )
      .fromTo(ruleRef.current, 
        { scaleY: 0 }, 
        { scaleY: 1, transformOrigin: 'top' }, 
        0
      )
      .fromTo(textRef.current?.querySelectorAll('.animate-item') || [], 
        { x: '40vw', opacity: 0, rotation: 1.5 }, 
        { x: 0, opacity: 1, rotation: 0, stagger: 0.05 }, 
        0
      );

      // EXIT (70%-100%)
      scrollTl.fromTo(imageRef.current, 
        { x: 0, opacity: 1 }, 
        { x: '-18vw', opacity: 0, ease: 'power2.in' }, 
        0.7
      )
      .fromTo(textRef.current, 
        { x: 0, opacity: 1 }, 
        { x: '18vw', opacity: 0 }, 
        0.7
      )
      .fromTo(ruleRef.current, 
        { scaleY: 1, opacity: 1 }, 
        { scaleY: 0.2, opacity: 0.2 }, 
        0.7
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="featured" className="section-pinned bg-artistry-dark z-20">
      {/* Featured Artwork */}
      <div 
        ref={imageRef}
        className="absolute left-0 top-0 w-full lg:w-[58vw] h-full"
      >
        <img 
          src="/assets/featured-art.jpg" 
          alt="Featured Artwork" 
          className="w-full h-full object-cover img-cinematic"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-artistry-dark/90 lg:block hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-artistry-dark via-transparent to-transparent lg:hidden" />
      </div>

      {/* Gold Rule */}
      <div 
        ref={ruleRef}
        className="hidden lg:block absolute left-[62vw] top-[22vh] w-[6px] h-[56vh] bg-artistry-gold"
      />

      {/* Content */}
      <div 
        ref={textRef}
        className="absolute bottom-12 left-6 right-6 lg:left-[64vw] lg:top-[22vh] lg:w-[32vw] lg:bottom-auto"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-artistry-gold star-sparkle" />
        </div>
        
        <h2 className="text-section font-display uppercase text-artistry-cream mb-4 animate-item">
          FEATURED<br />ART
        </h2>
        
        <p className="font-mono text-xs uppercase tracking-widest text-artistry-gold mb-6 animate-item">
          Art of the Month — January
        </p>
        
        <p className="text-lg text-artistry-muted mb-8 max-w-md animate-item">
          Selected by the community—this piece captures emotion, craft, and a world we want to live in.
        </p>
        
        <a href="#" className="btn-primary inline-flex items-center gap-2 animate-item">
          View the Feature
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

// Past Events Section
function EventsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const events = [
    { image: '/assets/event-winter.jpg', title: 'Winter Showcase', date: 'Dec 2025' },
    { image: '/assets/event-sketch.jpg', title: 'Sketch Night Live', date: 'Nov 2025' },
    { image: '/assets/event-portfolio.jpg', title: 'Portfolio Review', date: 'Oct 2025' },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.6,
        }
      });

      const cards = cardsRef.current?.querySelectorAll('.event-card') || [];

      // ENTRANCE (0%-30%)
      scrollTl.fromTo(bandRef.current, 
        { scaleX: 0 }, 
        { scaleX: 1, transformOrigin: 'left' }, 
        0
      )
      .fromTo(titleRef.current, 
        { y: '-12vh', opacity: 0 }, 
        { y: 0, opacity: 1 }, 
        0
      )
      .fromTo(cards[0], 
        { x: '-60vw', rotation: -4, opacity: 0 }, 
        { x: 0, rotation: 0, opacity: 1 }, 
        0.05
      )
      .fromTo(cards[1], 
        { y: '100vh', scale: 0.92, opacity: 0 }, 
        { y: 0, scale: 1, opacity: 1 }, 
        0.1
      )
      .fromTo(cards[2], 
        { x: '60vw', rotation: 4, opacity: 0 }, 
        { x: 0, rotation: 0, opacity: 1 }, 
        0.05
      );

      // EXIT (70%-100%)
      scrollTl.fromTo(bandRef.current, 
        { scaleX: 1, opacity: 1 }, 
        { scaleX: 0.25, opacity: 0.2 }, 
        0.7
      )
      .fromTo(cards[0], 
        { x: 0, opacity: 1 }, 
        { x: '-18vw', opacity: 0 }, 
        0.7
      )
      .fromTo(cards[1], 
        { y: 0, opacity: 1 }, 
        { y: '-18vh', opacity: 0 }, 
        0.7
      )
      .fromTo(cards[2], 
        { x: 0, opacity: 1 }, 
        { x: '18vw', opacity: 0 }, 
        0.7
      )
      .fromTo(titleRef.current, 
        { y: 0, opacity: 1 }, 
        { y: '-8vh', opacity: 0 }, 
        0.7
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="events" className="section-pinned bg-artistry-dark z-30">
      {/* Crimson Band */}
      <div 
        ref={bandRef}
        className="absolute left-0 top-[34vh] w-full h-[32vh] bg-artistry-crimson"
      />

      {/* Title */}
      <div ref={titleRef} className="absolute top-[10vh] left-6 lg:left-[6vw] right-6 lg:right-auto flex items-center justify-between lg:justify-start lg:gap-12 z-10">
        <h2 className="text-section font-display uppercase text-artistry-cream">
          PAST EVENTS
        </h2>
        <a href="#" className="hidden lg:flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-artistry-gold hover:text-artistry-cream transition-colors">
          See All Events
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* Event Cards */}
      <div 
        ref={cardsRef}
        className="absolute top-[20vh] left-6 right-6 lg:left-[6vw] lg:right-[6vw] flex flex-col lg:flex-row gap-6 lg:gap-[4vw]"
      >
        {events.map((event, index) => (
          <div 
            key={index}
            className={`event-card flex-1 rounded-2xl overflow-hidden border border-white/10 card-hover ${
              index === 1 ? 'lg:mt-8' : ''
            }`}
          >
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[64vh]">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover img-cinematic"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-artistry-dark/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-mono text-xs uppercase tracking-widest text-artistry-gold mb-2">
                  {event.date}
                </p>
                <h3 className="text-2xl font-display text-artistry-cream">
                  {event.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Team Section
function TeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0%-30%)
      scrollTl.fromTo(imageRef.current, 
        { x: '70vw', opacity: 0 }, 
        { x: 0, opacity: 1 }, 
        0
      )
      .fromTo(ruleRef.current, 
        { scaleY: 0 }, 
        { scaleY: 1, transformOrigin: 'top' }, 
        0.05
      )
      .fromTo(textRef.current?.querySelectorAll('.animate-item') || [], 
        { x: '-50vw', opacity: 0 }, 
        { x: 0, opacity: 1, stagger: 0.05 }, 
        0
      );

      // EXIT (70%-100%)
      scrollTl.fromTo(imageRef.current, 
        { x: 0, opacity: 1 }, 
        { x: '18vw', opacity: 0, ease: 'power2.in' }, 
        0.7
      )
      .fromTo(textRef.current, 
        { x: 0, opacity: 1 }, 
        { x: '-18vw', opacity: 0 }, 
        0.7
      )
      .fromTo(ruleRef.current, 
        { scaleY: 1, opacity: 1 }, 
        { scaleY: 0.2, opacity: 0.2 }, 
        0.7
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="team" className="section-pinned bg-artistry-dark z-40">
      {/* Team Portrait */}
      <div 
        ref={imageRef}
        className="absolute right-0 top-0 w-full lg:w-[60vw] h-full"
      >
        <img 
          src="/assets/team-portrait.jpg" 
          alt="Artistry Association Team" 
          className="w-full h-full object-cover img-cinematic"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-artistry-dark/90 lg:block hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-artistry-dark via-transparent to-transparent lg:hidden" />
      </div>

      {/* Gold Rule */}
      <div 
        ref={ruleRef}
        className="hidden lg:block absolute left-[42vw] top-[22vh] w-[6px] h-[56vh] bg-artistry-gold"
      />

      {/* Content */}
      <div 
        ref={textRef}
        className="absolute bottom-12 left-6 right-6 lg:left-[6vw] lg:top-[22vh] lg:w-[34vw] lg:bottom-auto"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-artistry-gold star-sparkle" />
        </div>
        
        <h2 className="text-section font-display uppercase text-artistry-cream mb-6 animate-item">
          MEET THE<br />TEAM
        </h2>
        
        <p className="text-lg text-artistry-muted mb-8 max-w-md animate-item">
          Curators, mentors, and creators who keep the community weird, welcoming, and working.
        </p>
        
        <a href="#" className="btn-primary inline-flex items-center gap-2 animate-item">
          Meet the Team
          <Users className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

// Members Section
function MembersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const members = [
    { name: 'Maya Chen', role: 'Illustrator', image: '/assets/member-01.jpg' },
    { name: 'James Wilson', role: 'Concept Artist', image: '/assets/member-02.jpg' },
    { name: 'Sarah Kim', role: 'Animator', image: '/assets/member-03.jpg' },
    { name: 'David Park', role: 'Digital Artist', image: '/assets/member-04.jpg' },
    { name: 'Elena Rodriguez', role: 'Character Designer', image: '/assets/member-05.jpg' },
    { name: 'Alex Thompson', role: 'Illustrator', image: '/assets/member-06.jpg' },
    { name: 'Lisa Wong', role: 'Storyboard Artist', image: '/assets/member-07.jpg' },
    { name: 'Michael Brown', role: '3D Artist', image: '/assets/member-08.jpg' },
    { name: 'Rachel Green', role: 'Art Director', image: '/assets/member-09.jpg' },
    { name: 'Chris Martinez', role: 'Comic Artist', image: '/assets/member-10.jpg' },
    { name: 'Anna White', role: 'Visual Dev', image: '/assets/member-11.jpg' },
    { name: 'Ryan Lee', role: 'Motion Designer', image: '/assets/member-12.jpg' },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current, 
        { y: 24, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards animation
      const cards = gridRef.current?.querySelectorAll('.member-card') || [];
      cards.forEach((card, index) => {
        gsap.fromTo(card, 
          { y: 60, opacity: 0, scale: 0.96 }, 
          { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            },
            delay: index * 0.05
          }
        );
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="members" className="relative bg-artistry-dark z-50 py-24 lg:py-32">
      {/* Header */}
      <div ref={headerRef} className="px-6 lg:px-[6vw] mb-16">
        <h2 className="text-section font-display uppercase text-artistry-cream mb-4">
          MEMBERS
        </h2>
        <p className="text-lg text-artistry-muted max-w-xl">
          A growing roster of illustrators, concept artists, animators, and designers.
        </p>
      </div>

      {/* Members Grid */}
      <div 
        ref={gridRef}
        className="px-6 lg:px-[6vw] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {members.map((member, index) => (
          <div 
            key={index}
            className="member-card group relative rounded-xl overflow-hidden border border-white/10 card-hover"
          >
            <div className="aspect-[4/5]">
              <img 
                src={member.image} 
                alt={member.name}
                className="w-full h-full object-cover img-cinematic transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-artistry-dark via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-lg font-display text-artistry-cream">
                {member.name}
              </h3>
              <p className="font-mono text-xs uppercase tracking-widest text-artistry-gold">
                {member.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 lg:px-[6vw] mt-16 text-center">
        <a href="#join" className="btn-primary inline-flex items-center gap-2">
          Become a Member
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

// Join Section
function JoinSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0%-30%)
      scrollTl.fromTo(bandRef.current, 
        { scaleX: 0 }, 
        { scaleX: 1, transformOrigin: 'left' }, 
        0
      )
      .fromTo(textRef.current?.querySelectorAll('.animate-item') || [], 
        { x: '-50vw', opacity: 0 }, 
        { x: 0, opacity: 1, stagger: 0.05 }, 
        0
      )
      .fromTo(formRef.current, 
        { x: '60vw', rotation: 2, opacity: 0 }, 
        { x: 0, rotation: 0, opacity: 1 }, 
        0.05
      );

      // EXIT (70%-100%)
      scrollTl.fromTo(bandRef.current, 
        { scaleX: 1, opacity: 1 }, 
        { scaleX: 0.3, opacity: 0.2 }, 
        0.7
      )
      .fromTo(textRef.current, 
        { x: 0, opacity: 1 }, 
        { x: '-12vw', opacity: 0 }, 
        0.7
      )
      .fromTo(formRef.current, 
        { x: 0, opacity: 1 }, 
        { x: '18vw', opacity: 0 }, 
        0.7
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="join" className="section-pinned bg-artistry-dark z-[60]">
      {/* Crimson Band */}
      <div 
        ref={bandRef}
        className="absolute left-0 top-[34vh] w-full h-[32vh] bg-artistry-crimson"
      />

      {/* Content */}
      <div 
        ref={textRef}
        className="absolute top-[18vh] left-6 lg:left-[6vw] lg:top-[26vh] lg:w-[40vw]"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-artistry-gold star-sparkle" />
        </div>
        
        <h2 className="text-section font-display uppercase text-artistry-cream mb-6 animate-item">
          JOIN THE<br />COLLECTIVE
        </h2>
        
        <p className="text-lg text-artistry-muted mb-8 max-w-md animate-item">
          Get event invites, open calls, and a monthly digest of featured work.
        </p>
        
        <a href="#" className="inline-flex items-center gap-2 text-artistry-gold hover:text-artistry-cream transition-colors animate-item">
          <Palette className="w-4 h-4" />
          Submit your portfolio
        </a>
      </div>

      {/* Form Card */}
      <div 
        ref={formRef}
        className="absolute bottom-12 left-6 right-6 lg:left-[56vw] lg:top-[22vh] lg:w-[38vw] lg:bottom-auto"
      >
        <div className="bg-artistry-dark/80 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-artistry-gold mb-6">
            Newsletter
          </p>
          
          {submitted ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-artistry-gold mx-auto mb-4" />
              <p className="text-artistry-cream text-lg">Welcome to the collective!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="input-artistry mb-4"
                required
              />
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                Subscribe
                <Mail className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// Footer Section
function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current?.querySelectorAll('.animate-item') || [], 
        { y: 30, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={sectionRef} className="relative bg-artistry-dark z-[70] py-24 lg:py-32">
      <div ref={contentRef} className="px-6 lg:px-[6vw]">
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          {/* Wordmark */}
          <div className="animate-item">
            <img
              src="/assets/Artistry Association.png"
              alt="Artistry Association"
              className="w-[420px] max-w-full h-auto"
            />
            <img
              src="/assets/mascot.png"
              alt="Mascot"
              className="w-24 h-24 mt-8 opacity-80"
            />
          </div>

          {/* Contact */}
          <div className="animate-item">
            <p className="font-mono text-xs uppercase tracking-widest text-artistry-gold mb-6">
              Get in Touch
            </p>
            <a 
              href="mailto:hello@artistry.assoc" 
              className="text-2xl lg:text-3xl text-artistry-cream hover:text-artistry-gold transition-colors block mb-8"
            >
              hello@artistry.assoc
            </a>
            
            <div className="flex gap-6">
              <a href="#" className="text-artistry-muted hover:text-artistry-gold transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-artistry-muted hover:text-artistry-gold transition-colors">
                <Palette className="w-6 h-6" />
              </a>
              <a href="#" className="text-artistry-muted hover:text-artistry-gold transition-colors">
                <Calendar className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-white/10 animate-item">
          <p className="text-artistry-muted text-sm mb-4 lg:mb-0">
            © 2026
            <img src="/assets/Artistry Association.png" alt="Artistry Association" className="inline-block h-4 ml-2 align-middle" />
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-artistry-muted hover:text-artistry-gold transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="text-artistry-muted hover:text-artistry-gold transition-colors text-sm">
              Code of Conduct
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main App
function App() {
  useEffect(() => {
    // Global scroll snap for pinned sections
    const setupSnap = () => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;

            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out'
        }
      });
    };

    // Delay to ensure all ScrollTriggers are created
    const timer = setTimeout(setupSnap, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="relative bg-artistry-dark min-h-screen">
      {/* Custom Cursor with Paint Effect */}
      <CustomCursor />
      
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative">
        <HeroSection />
        <FeaturedSection />
        <EventsSection />
        <TeamSection />
        <MembersSection />
        <JoinSection />
        <FooterSection />
      </main>
    </div>
  );
}

export default App;
