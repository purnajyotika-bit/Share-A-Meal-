import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Users, Truck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function Home() {
  const { t } = useLanguage();
  const { data: donations = [] } = useQuery({
    queryKey: ['donations-stats'],
    queryFn: () => base44.entities.Donation.list(),
    initialData: [],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-stats'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const stats = {
    meals: donations.filter(d => d.status === 'delivered').length,
    donors: users.filter(u => u.role === 'donor').length,
    volunteers: users.filter(u => u.role === 'volunteer').length,
  };

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6">
                <Sparkles className="w-4 h-4" />
                {t('hero_tagline')}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
                {t('hero_title')}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
                {t('hero_sub')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/dashboard?role=donor">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6">
                    {t('donate_food')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/dashboard?role=receiver">
                  <Button size="lg" variant="outline" className="px-6">{t('i_run_ngo')}</Button>
                </Link>
                <Link to="/dashboard?role=volunteer">
                  <Button size="lg" variant="ghost" className="px-6">{t('volunteer')}</Button>
                </Link>
              </div>

              <div className="flex gap-4 mt-10">
                {[
                  { label: t('meals_saved'), value: stats.meals },
                  { label: t('donors'), value: stats.donors },
                  { label: t('volunteers'), value: stats.volunteers },
                ].map((s) => (
                  <div key={s.label} className="bg-card border rounded-xl px-5 py-4 min-w-[110px]">
                    <div className="text-2xl font-bold text-foreground">{s.value}</div>
                    <div className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&h=500&fit=crop"
                  alt="Volunteers distributing food"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-foreground/80 backdrop-blur-md text-background rounded-xl px-5 py-3">
                  <div className="text-[10px] font-bold tracking-[0.15em] uppercase opacity-70">{t('live_label')}</div>
                  <div className="font-semibold">{t('surplus_supper')}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">{t('how_it_works')}</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-12">{t('three_roles')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Utensils, title: t('step1_title'), desc: t('step1_desc') },
              { icon: Users,    title: t('step2_title'), desc: t('step2_desc') },
              { icon: Truck,    title: t('step3_title'), desc: t('step3_desc') },
            ].map((step) => (
              <div key={step.title} className="bg-card border rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <step.icon className="w-8 h-8 text-primary mb-5" />
                <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop"
              alt="Community meal"
              className="rounded-2xl shadow-lg w-full h-[360px] object-cover"
            />
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">{t('why_matters')}</div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">{t('food_waste_title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('food_waste_desc')}</p>
              <div className="flex gap-3">
                <Link to="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    {t('join')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline">{t('see_impact')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
