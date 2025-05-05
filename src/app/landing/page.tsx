import Link from "next/link"
import Image from "next/image"
import { Users, Shield, MessageSquare, Heart, Menu, ArrowRight, Star, ChevronRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Introvertia - Connect With Us",
  description: "A social platform designed by for introverts."
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden rounded-2xl">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-emerald-900/20 to-purple-900/5 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-purple-900/20 to-emerald-900/5 blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-emerald-500/5 to-emerald-900/10 blur-3xl animate-pulse-slow"></div>
      </div>

      <header className="container mx-auto py-6 px-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-md overflow-hidden transition-transform duration-500 group-hover:scale-110">
              <Image
                src="/introvertia-icon.png"
                alt="Introvertia Logo"
                fill
                className="object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-emerald-400 font-bold text-2xl relative">
              INTROVERTIA
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400/50 group-hover:w-full transition-all duration-500"></span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#testimonials">Connect</NavLink>
            <Link 
              href="/" 
              className="group relative px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black rounded-lg transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-1 font-medium">
                Visit Introvertia
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </nav>
          <div className="md:hidden">
            <button className="relative p-2 overflow-hidden rounded-lg group bg-zinc-900/80 border border-zinc-800/50 hover:border-emerald-400/30 transition-colors duration-300" title="Menu">
              <Menu className="h-5 w-5 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>
        </div>
      </header>

      <section className="container mx-auto py-20 px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <div className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-medium">
                NEW
              </div>
              <span className="text-zinc-400 text-sm">The social network for introverts</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Connect With <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500 animate-gradient">Us</span>
            </h1>
            <p className="text-xl text-zinc-300 max-w-lg">
              A social platform designed by Nguyễn Phan Hoàng Quân.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/"
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black text-lg px-8 py-3.5 rounded-xl font-medium overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="relative z-10 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
              <Link
                href="#features"
                className="group relative inline-flex items-center justify-center gap-2 border border-emerald-400/50 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 text-lg px-8 py-3.5 rounded-xl font-medium transition-colors duration-300"
              >
                <span>Learn More</span>
                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="flex items-center gap-3 pt-8">
              <div className="flex -space-x-3">
                {/* <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-emerald-400 font-medium">Q</div>
                <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-emerald-400 font-medium">N</div>
                <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-emerald-400 font-medium">P</div> */}
              </div>
              {/* <div className="text-sm text-zinc-400">
                Joined by <span className="text-white font-medium">1,000+</span> introvert users
              </div> */}
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden transform transition-all duration-700 hover:scale-[1.03] hover:-rotate-1">
              <Image
                src="/itv_second.png"
                alt="INTROVERTIA App Interface"
                width={600}
                height={600}
                className="rounded-2xl"
              />
              {/* Overlay gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              {/* Animated orbs */}
              <div className="absolute top-5 right-5 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/10 to-emerald-500/20 blur-xl animate-pulse-slow"></div>
              <div className="absolute bottom-5 left-5 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/10 blur-xl animate-pulse-slow delay-150"></div>
            </div>
            {/* Animated decorations */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl animate-pulse-slow delay-300"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl animate-pulse-slow delay-700"></div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity translate-y-20">
          <span className="text-xs text-zinc-400">Scroll to explore</span>
          <div className="w-6 h-9 border border-zinc-700 rounded-full flex items-center justify-center p-1">
            <div className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce-slow"></div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
            <div className="px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm font-medium mb-6">
              Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">INTROVERTIA</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Designed with the needs of introverts in mind, our platform offers features that respect your social energy and personal space.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="h-7 w-7 text-emerald-400" />}
              title="Privacy First"
              description="Tôi cần sự riêng tư (⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄."
            />
            <FeatureCard 
              icon={<MessageSquare className="h-7 w-7 text-emerald-400" />}
              title="Meaningful Conversations"
              description="Các cuộc trò chuyện vui vẻ, nhưng ý nghĩa thì chưa chắc ( ◡‿◡ *)."
              featured
            />
            <FeatureCard 
              icon={<Users className="h-7 w-7 text-emerald-400" />}
              title="Friendly"
              description="Dành cho người hướng lung tung ( 〃▽〃)."
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
            <div className="px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm font-medium mb-6">
              Process
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">INTROVERTIA</span> Works
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              {/* Our platform makes it easy to connect with like-minded individuals while respecting your boundaries. */}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="space-y-10">
                <StepCard 
                  number="1"
                  title="Create Your Space"
                  description="Set up your profile...."
                />
                <StepCard 
                  number="2"
                  title="Connect"
                  description="Finds people who share your interests and communication style."
                />
                <StepCard 
                  number="3"
                  title="Engage On Your Terms"
                  description="Lets others know when you need space."
                />
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden transform transition-all duration-700 hover:scale-[1.03] hover:rotate-1">
                <Image
                  src="/itv_first.png"
                  alt="How INTROVERTIA Works"
                  width={600}
                  height={600}
                  className="rounded-2xl"
                />
                {/* Animation effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-5 left-5 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/10 to-emerald-500/20 blur-xl animate-pulse-slow"></div>
                <div className="absolute bottom-5 right-5 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/10 blur-xl animate-pulse-slow delay-500"></div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl animate-pulse-slow delay-700"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl animate-pulse-slow delay-300"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
            <div className="px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm font-medium mb-6">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">Users Say</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Hear from our community of introverts.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="Hay lắm bro"
              name="Quan."
              since="2025"
              rating={5}
              initial="Q"
            />
            <TestimonialCard 
              quote="Hay"
              name="Nguyen."
              since="2025"
              rating={5}
              initial="N"
              featured
            />
            <TestimonialCard 
              quote="Quá Vip"
              name="Phan."
              since="2025"
              rating={4}
              initial="P"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 p-12 rounded-2xl border border-zinc-800/50 overflow-hidden group hover:border-emerald-500/20 transition-colors duration-500">
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-500/5 blur-2xl group-hover:bg-purple-500/10 transition-all duration-700"></div>
            
            <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold">
                Ready to Connect <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">Your Way</span>?
              </h2>
              <p className="text-xl text-zinc-300">Join plz. Join đi bro, sợ à? (⁄ ⁄•⁄ω⁄•⁄ ⁄)</p>
              <div className="pt-8">
                <Link 
                  href="/" 
                  className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black text-lg px-10 py-4 rounded-xl font-medium overflow-hidden"
                >
                  <span className="relative z-10">Join Introvertia Now</span>
                  <ArrowRight className="relative z-10 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
              </div>
              {/* Animated decorations */}
              <div className="absolute top-1/4 right-5 opacity-20 group-hover:opacity-60 transition-opacity duration-700 transform rotate-12 group-hover:rotate-45 group-hover:scale-125">
                <Star className="w-6 h-6 text-emerald-400" fill="currentColor" />
              </div>
              <div className="absolute bottom-1/4 left-5 opacity-20 group-hover:opacity-60 transition-opacity duration-700 transform -rotate-12 group-hover:-rotate-45 group-hover:scale-125">
                <Heart className="w-6 h-6 text-emerald-400" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 bg-zinc-950 border-t border-zinc-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center flex-col">
            <div className="flex items-center gap-2 mb-6 group">
              <div className="relative w-10 h-10 rounded-md overflow-hidden transition-transform duration-500 group-hover:scale-110">
                <Image
                  src="/introvertia-icon.png"
                  alt="Introvertia Logo"
                  fill
                  className="object-cover transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-emerald-400 font-bold text-2xl">INTROVERTIA</span>
            </div>
            <p className="text-zinc-400 text-center max-w-md mb-8">
              A social platform created by Nguyen Phan Hoang Quan.
            </p>
            <div className="flex gap-4 mb-8">
              <SocialButton icon={<Users className="w-5 h-5" />} />
              <SocialButton icon={<MessageSquare className="w-5 h-5" />} />
              <SocialButton icon={<Heart className="w-5 h-5" />} />
            </div>
            <Link 
              href="/"
              className="inline-block border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 px-6 py-2.5 rounded-lg text-center font-medium transition-colors duration-300"
            >
              Return to Introvertia
            </Link>
            <p className="text-zinc-500 text-sm mt-8">
              © {new Date().getFullYear()} INTROVERTIA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Reusable components
const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="text-zinc-300 hover:text-emerald-400 transition-colors relative group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400/50 group-hover:w-full transition-all duration-300"></span>
  </Link>
)

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  featured = false 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  featured?: boolean;
}) => (
  <div className={`group relative bg-zinc-900/90 p-8 rounded-xl border border-zinc-800/50 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden ${featured ? 'md:transform md:-translate-y-4' : ''}`}>
    {/* Hover effects */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-all duration-700"></div>
    
    {/* Content */}
    <div className="relative z-10">
      <div className="w-14 h-14 bg-emerald-400/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-400/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-500/20 group-hover:shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">{title}</h3>
      <p className="text-zinc-300 group-hover:text-zinc-200 transition-colors">
        {description}
      </p>
      {featured && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-emerald-400 text-xs font-medium">
          Popular
        </div>
      )}
    </div>
  </div>
)

const StepCard = ({ 
  number, 
  title, 
  description 
}: { 
  number: string; 
  title: string; 
  description: string;
}) => (
  <div className="group flex gap-6 relative">
    <div className="flex-shrink-0 relative">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold text-lg z-10 relative group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300 group-hover:scale-110">
        {number}
      </div>
      {/* Connecting line */}
      {number !== "3" && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-emerald-500/70 to-emerald-500/10"></div>
      )}
    </div>
    <div className="flex-1 pt-2">
      <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors duration-300">{title}</h3>
      <p className="text-zinc-300">
        {description}
      </p>
    </div>
  </div>
)

const TestimonialCard = ({ 
  quote, 
  name, 
  since, 
  rating, 
  initial, 
  featured = false 
}: { 
  quote: string; 
  name: string; 
  since: string; 
  rating: number; 
  initial: string; 
  featured?: boolean;
}) => (
  <div className={`group relative bg-zinc-900/90 p-8 rounded-xl border border-zinc-800/50 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden ${featured ? 'md:transform md:-translate-y-4' : ''}`}>
    {/* Background effects */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-all duration-700"></div>
    
    {/* Content */}
    <div className="relative z-10">
      <div className="flex items-center gap-1 mb-5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${i < rating ? 'text-emerald-400 fill-current' : 'text-zinc-700'}`}
          />
        ))}
      </div>
      <p className="text-zinc-300 mb-7 text-lg font-light italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-emerald-700/30 transition-all duration-300">
          <span className="text-emerald-400 font-bold">{initial}</span>
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-zinc-400">Member since {since}</p>
        </div>
      </div>
      {featured && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-emerald-400 text-xs font-medium">
          Featured
        </div>
      )}
    </div>
  </div>
)

const SocialButton = ({ icon }: { icon: React.ReactNode }) => (
  <button className="w-10 h-10 rounded-full border border-zinc-800 hover:border-emerald-400/50 flex items-center justify-center text-zinc-400 hover:text-emerald-400 transition-all duration-300 group">
    <div className="transform group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
  </button>
) 