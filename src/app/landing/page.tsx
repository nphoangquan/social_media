import Link from "next/link"
import Image from "next/image"
import { Users, Shield, MessageSquare, Heart, Menu } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Introvertia - Connect Without The Noise",
  description: "A social platform designed by for introverts. Meaningful connections without the social pressure."
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-md overflow-hidden">
              <Image
                src="/introvertia-icon.png"
                alt="Introvertia Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-emerald-400 font-bold text-2xl">INTROVERTIA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-zinc-300 hover:text-emerald-400 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-zinc-300 hover:text-emerald-400 transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-zinc-300 hover:text-emerald-400 transition-colors">
              Testimonials
            </Link>
            <Link href="/" className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-black rounded-lg transition-colors">
              Visit Introvertia
            </Link>
          </nav>
          <div className="md:hidden">
            <button className="text-emerald-400" title="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <section className="container mx-auto py-20 px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Connect Without The <span className="text-emerald-400">Noise</span>
            </h1>
            <p className="text-xl text-zinc-300">
              A social platform designed by Nguyễn Phan Hoàng Quân.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/"
                className="inline-block bg-emerald-400 hover:bg-emerald-500 text-black text-lg px-8 py-3 rounded-lg text-center font-medium"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-block border border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 text-lg px-8 py-3 rounded-lg text-center font-medium"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-lg overflow-hidden border border-emerald-400/30 shadow-[0_0_25px_rgba(0,255,157,0.3)]">
              <Image
                src="/itv_second.png"
                alt="INTROVERTIA App Interface"
                width={600}
                height={600}
                className="rounded-lg"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-full h-full bg-emerald-400/20 rounded-lg -z-10"></div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-zinc-900/80 py-20 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-emerald-400">INTROVERTIA</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/90 p-8 rounded-lg border border-zinc-800/50 hover:border-emerald-400/50 transition-all hover:shadow-[0_0_15px_rgba(0,255,157,0.2)] group">
              <div className="w-14 h-14 bg-emerald-400/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-400/20 transition-all">
                <Shield className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy First</h3>
              <p className="text-zinc-300">
                Tôi cần sự riêng tư (⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄.
              </p>
            </div>
            <div className="bg-zinc-900/90 p-8 rounded-lg border border-zinc-800/50 hover:border-emerald-400/50 transition-all hover:shadow-[0_0_15px_rgba(0,255,157,0.2)] group">
              <div className="w-14 h-14 bg-emerald-400/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-400/20 transition-all">
                <MessageSquare className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Meaningful Conversations</h3>
              <p className="text-zinc-300">
                Các cuộc trò chuyện vui vẻ, nhưng ý nghĩa thì chưa chắc ( ◡‿◡ *).
              </p>
            </div>
            <div className="bg-zinc-900/90 p-8 rounded-lg border border-zinc-800/50 hover:border-emerald-400/50 transition-all hover:shadow-[0_0_15px_rgba(0,255,157,0.2)] group">
              <div className="w-14 h-14 bg-emerald-400/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-400/20 transition-all">
                <Users className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Friendly</h3>
              <p className="text-zinc-300">
                Dành cho người hướng lung tung ( 〃▽〃).
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How <span className="text-emerald-400">INTROVERTIA</span> Works
          </h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Create Your Space</h3>
                    <p className="text-zinc-300">
                      Set up your profile with as much or as little information as you&apos;re comfortable sharing.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Connect Mindfully</h3>
                    <p className="text-zinc-300">
                      Our matching algorithm finds people who share your interests and communication style.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Engage On Your Terms</h3>
                    <p className="text-zinc-300">
                      Set boundaries with our unique social battery feature that lets others know when you need space.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative z-10 rounded-lg overflow-hidden border border-emerald-400/30 shadow-[0_0_25px_rgba(0,255,157,0.3)]">
                <Image
                  src="/itv_second.png"
                  alt="How INTROVERTIA Works"
                  width={600}
                  height={600}
                  className="rounded-lg"
                />
              </div>
              <div className="absolute -top-6 -left-6 w-full h-full bg-emerald-400/20 rounded-lg -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-zinc-900/80 py-20 rounded-md">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            What Our <span className="text-emerald-400">Users Say</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/90 p-8 rounded-lg border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <p className="text-zinc-300 mb-6">
                &ldquo;Hay lắm bro&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">Q</span>
                </div>
                <div>
                  <p className="font-medium">Quan.</p>
                  <p className="text-sm text-zinc-400">Member since 2025</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/90 p-8 rounded-lg border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <p className="text-zinc-300 mb-6">
                &ldquo;Hay&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">N</span>
                </div>
                <div>
                  <p className="font-medium">Nguyen.</p>
                  <p className="text-sm text-zinc-400">Member since 2025</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/90 p-8 rounded-lg border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5 fill-current" />
                <Heart className="h-5 w-5" />
              </div>
              <p className="text-zinc-300 mb-6">
                &ldquo;I&apos;Quá Vip&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">P</span>
                </div>
                <div>
                  <p className="font-medium">Phan.</p>
                  <p className="text-sm text-zinc-400">Member since 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-zinc-900/80 p-12 rounded-2xl border border-zinc-800/50 shadow-[0_0_25px_rgba(0,255,157,0.15)]">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold">
                Ready to Connect <span className="text-emerald-400">Your Way</span>?
              </h2>
              <p className="text-xl text-zinc-300">Join plz (⁄ ⁄•⁄ω⁄•⁄ ⁄)</p>
              <div className="pt-4">
                <Link 
                  href="/" 
                  className="inline-block bg-emerald-400 hover:bg-emerald-500 text-black text-lg px-8 py-3 rounded-lg text-center font-medium"
                >
                  Join Introvertia Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-zinc-950 border-t border-zinc-800/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8 rounded-md overflow-hidden">
                <Image
                  src="/introvertia-icon.png"
                  alt="Introvertia Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-emerald-400 font-bold text-xl">INTROVERTIA</span>
            </div>
            <p className="text-zinc-400 text-center max-w-md mb-6">
              A social platform designed by Nguyen Phan Hoang Quan.
            </p>
            <Link 
              href="/"
              className="inline-block border border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 px-6 py-2 rounded-lg text-center font-medium"
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