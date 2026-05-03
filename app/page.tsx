"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Activity, 
  Zap, 
  Terminal, 
  Check, 
  Bell, 
  Mail, 
  MessageSquare, 
  Globe, 
  Code2, 
  Cpu, 
  Lock,
  ArrowRight
} from "lucide-react";
import { Navbar } from "../src/components/layout/Navbar";
import { useAuthStore } from "../src/store/useAuthStore";
import { motion } from "motion/react";

export default function LandingPage() {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="min-h-screen bg-bg-base text-white font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-border-card">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-xs font-bold tracking-widest uppercase mb-8"
          >
            <Zap className="w-3 h-3 fill-brand-primary" />
            Now in Public Beta
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500"
          >
            Silent Monitoring for Serious Cron.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-brand-muted mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Cronwatch is the dead-man&apos;s switch for your infrastructure. If your script doesn&apos;t check in, we wake you up. Instant alerts, zero infrastructure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
          >
            {isLoading ? (
              <div className="w-48 h-12 bg-white/5 animate-pulse rounded-xl" />
            ) : isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-8 h-12 bg-brand-primary border border-white/10 hover:bg-[#6D31D1] text-white rounded-xl text-base font-bold transition-all shadow-2xl shadow-brand-primary/40 flex items-center gap-2 group"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-8 h-12 bg-brand-primary border border-white/10 hover:bg-[#6D31D1] text-white rounded-xl text-base font-bold transition-all shadow-2xl shadow-brand-primary/40 flex items-center gap-2 group"
              >
                Start Monitoring Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto bg-bg-surface border border-border-card rounded-2xl p-1 text-left shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="bg-bg-base rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-border-card bg-bg-surface/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-error/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-brand-success/50" />
                  <span className="ml-3 text-[10px] text-brand-muted font-mono uppercase tracking-widest">backup-sync.sh</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-brand-muted font-mono uppercase">bash</span>
                </div>
              </div>
              <div className="p-8 font-mono text-sm md:text-base leading-relaxed">
                <div className="flex gap-4">
                  <span className="text-gray-700 select-none">1</span>
                  <span><span className="text-brand-muted italic"># Append Cronwatch ping to any script</span></span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-700 select-none">2</span>
                  <span><span className="text-white">./run_backup.sh</span> <span className="text-brand-success">&&</span> \</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-700 select-none">3</span>
                  <span>  <span className="text-blue-400">curl</span> -fsS https://cronwatch.dev/ping/abc123-token</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-bg-base relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Built for the modern stack.</h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto">Everything you need to monitor background tasks, from simple cron jobs to complex data pipelines.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Telegram & Discord",
                desc: "Get notified where you work. Instant alerts via Telegram, Discord, or generic Webhooks.",
                icon: MessageSquare,
                color: "text-blue-400"
              },
              {
                title: "Silent Pings",
                desc: "No overhead. Pinging Cronwatch adds zero latency to your scripts with our globally distributed edge.",
                icon: Zap,
                color: "text-brand-primary"
              },
              {
                title: "Smart Grace Periods",
                desc: "Flaky network? Set a grace period to give your task time to retry before we scream.",
                icon: Shield,
                color: "text-brand-success"
              },
              {
                title: "Public Status Pages",
                desc: "Share your job status with your team or customers via beautiful public status pages.",
                icon: Globe,
                color: "text-purple-400"
              },
              {
                title: "API First",
                desc: "Manage your monitors via our robust REST API. Automate your infrastructure setup easily.",
                icon: Code2,
                color: "text-yellow-400"
              },
              {
                title: "Zero Config",
                desc: "No SDKs to install. If your language supports HTTP requests, it supports Cronwatch.",
                icon: Cpu,
                color: "text-brand-error"
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-bg-surface border border-border-card rounded-2xl hover:border-brand-primary/50 transition-colors group">
                <div className={`w-12 h-12 bg-bg-base border border-border-card rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Docs Section */}
      <section id="docs" className="py-32 bg-[#080808] border-y border-border-card">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold tracking-tight mb-8">Integrated in seconds.</h2>
              <div className="space-y-10">
                {[
                  {
                    step: "01",
                    title: "Create a monitor",
                    desc: "Define your task's name and how often you expect it to run (e.g., every 1 hour)."
                  },
                  {
                    step: "02",
                    title: "Get your ping URL",
                    desc: "We generate a unique token for every monitor. Keep it secret, keep it safe."
                  },
                  {
                    step: "03",
                    title: "Add to your scripts",
                    desc: "Add a simple HTTP GET/POST request at the end of your task execution."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <span className="text-4xl font-black text-brand-primary/20 tabular-nums">{item.step}</span>
                    <div>
                      <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                      <p className="text-brand-muted text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-bg-surface border border-border-card rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Example Snippets</span>
                  <div className="flex gap-2">
                    <div className="px-2 py-1 bg-brand-primary/10 rounded text-[10px] text-brand-primary font-bold">PYTHON</div>
                    <div className="px-2 py-1 bg-yellow-500/10 rounded text-[10px] text-yellow-500 font-bold">JS</div>
                  </div>
                </div>
                <pre className="bg-bg-base p-6 rounded-xl border border-border-card font-mono text-xs overflow-x-auto leading-relaxed">
                  <code className="text-text-muted">
                    <span className="text-brand-success">import</span> requests<br/><br/>
                    <span className="text-brand-muted"># Your logic here</span><br/>
                    <span className="text-white">do_important_stuff()</span><br/><br/>
                    <span className="text-brand-muted"># Ping Cronwatch to signal success</span><br/>
                    <span className="text-white">requests.get(</span><br/>
                    &nbsp;&nbsp;<span className="text-brand-primary">&quot;https://cronwatch.dev/ping/token&quot;</span><br/>
                    <span className="text-white">)</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-bg-base">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Fair pricing for teams of all sizes.</h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto">Start for free, scale when you need to. No credit card required to start.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Hobby",
                price: "$0",
                desc: "Perfect for personal projects.",
                features: ["15 Monitors", "1 Minute Frequency", "Email Alerts", "Basic Grace Period", "7 Day History"],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$9",
                desc: "For developers who need more.",
                features: ["Unlimited Monitors", "1 Minute Frequency", "Telegram & Email Alerts", "Customizable Grace Periods", "90 Day History", "Public Status Pages", "Priority Support"],
                cta: "Get Pro Now",
                popular: true
              }
            ].map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative p-10 bg-bg-surface border rounded-2xl flex flex-col transition-transform hover:-translate-y-2 ${plan.popular ? 'border-brand-primary shadow-2xl shadow-brand-primary/10' : 'border-border-card'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-brand-muted text-sm">/month</span>
                  </div>
                  <p className="text-brand-muted text-xs mt-4">{plan.desc}</p>
                </div>
                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-center gap-3 text-sm text-text-muted">
                      <div className="w-5 h-5 rounded-full bg-brand-success/10 flex items-center justify-center text-brand-success">
                        <Check className="w-3 h-3" />
                      </div>
                      {feat}
                    </div>
                  ))}
                </div>
                <Link
                  href="/register"
                  className={`w-full h-11 rounded-xl font-bold flex items-center justify-center transition-all ${plan.popular ? 'bg-brand-primary hover:bg-[#6D31D1] text-white shadow-xl shadow-brand-primary/20' : 'bg-bg-base border border-border-card hover:border-brand-primary text-white'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="pt-24 pb-12 border-t border-border-card bg-bg-base text-brand-muted">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="text-brand-primary w-6 h-6" />
                <span className="font-bold text-xl text-white">Cronwatch</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                The modern dead-man&apos;s switch for background tasks, cron jobs, and infrastructure health.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></Link>
                <Link href="#" className="hover:text-white transition-colors"><MessageSquare className="w-5 h-5" /></Link>
                <Link href="#" className="hover:text-white transition-colors"><Shield className="w-5 h-5" /></Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/status/test" className="hover:text-white transition-colors">Status Pages</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="mailto:hello@cronwatch.dev" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-border-card/50">
            <p className="text-xs">© 2026 Cronwatch Inc.</p>
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
              SYSTEMS OPERATIONAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
