'use client';

import Link from 'next/link';
import { Search, Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight, Briefcase, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { motion } from 'framer-motion';

const Footer = () => {
  const socialLinks = [
    { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { name: 'Ажлын байрууд', href: '/listings' },
    { name: 'Байгууллагууд', href: '/employers' },
    { name: 'CV үүсгэх', href: '/cv-builder' },
    { name: 'Зөвлөгөө', href: '/advice' },
  ];

  const helpLinks = [
    { name: 'Түгээмэл асуултууд', href: '#' },
    { name: 'Үйлчилгээний нөхцөл', href: '#' },
    { name: 'Нууцлалын бодлого', href: '#' },
    { name: 'Холбоо барих', href: '#' },
  ];

  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2.5 group w-fit">
              <div className="rounded-lg bg-primary p-1.5 shadow-sm group-hover:scale-110 transition-all duration-300">
                <Briefcase className="h-4 w-4 text-white stroke-[2.5px]" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">Career</span>
            </Link>
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs">
              Монголын ажлын сурталчилгааны нэгдсэн талбар. Бид танд хамгийн тохиромжтой ажлыг олоход тусална.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <motion.div key={label} whileHover={{ y: -3 }}>
                  <Button 
                    asChild
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg text-slate-400 hover:text-primary hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
                  >
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Үйлчилгээ</h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-slate-500 hover:text-primary text-sm font-bold transition-all flex items-center group"
                  >
                    <span className="relative">
                      {item.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Тусламж</h3>
            <ul className="space-y-3">
              {helpLinks.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-slate-500 hover:text-primary text-sm font-bold transition-all flex items-center group"
                  >
                    <span className="relative">
                      {item.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Хөгжүүлэгчтэй холбогдох</h3>
            <div className="space-y-4">
              <motion.a 
                href="tel:+97680799086"
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-sm text-slate-500 font-bold group w-fit"
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:text-primary group-hover:border-primary/20 group-hover:shadow-md transition-all">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+976 8079-9086</span>
              </motion.a>
              <motion.a 
                href="mailto:nozum1ke@gmail.com"
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-sm text-slate-500 font-bold group w-fit"
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:text-primary group-hover:border-primary/20 group-hover:shadow-md transition-all">
                  <Mail className="h-4 w-4" />
                </div>
                <span>nozum1ke@gmail.com</span>
              </motion.a>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-bold group w-fit cursor-default">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:text-primary transition-all">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>Улаанбаатар, Монгол</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-slate-200/40" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Career Platform. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mern Stack</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">By Ankhbayar Zoltuya</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
