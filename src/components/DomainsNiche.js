import React, { useState } from 'react';
import DomainCard from './DomainCard';
import DomainModal from './DomainModal';
import { 
  ShoppingCart, 
  DollarSign, 
  GraduationCap, 
  Globe, 
  MessageCircle, 
  FileText, 
  Image, 
  BookOpen 
} from 'lucide-react';

const DomainsNiche = () => {
  const [selectedDomain, setSelectedDomain] = useState(null);

  const domainsData = [
    {
      id: 1,
      title: 'E-commerce',
      subtitle: 'Build scalable online storefronts',
      tags: ['Stripe', 'BNPL'],
      badge: 'AI',
      icon: ShoppingCart,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
      modalContent: [
        'D2C brand storefronts (e.g., cosmetics, apparel)',
        'Multi-vendor marketplace with escrow & dispute resolution',
        'Subscription box model (e.g., snacks, books)',
        'B2B wholesale platform with dynamic pricing',
        'Payment integrations (Stripe, Razorpay, regional gateways)',
        'Buy Now, Pay Later (BNPL) integration',
        'Inventory & supplier sync with ERPs'
      ]
    },
    {
      id: 2,
      title: 'Fintech',
      subtitle: 'Automate financial tasks',
      tags: ['Tax', 'OCR'],
      icon: DollarSign,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop',
      modalContent: [
        'Tax filing automation for freelancers & SMBs',
        'Bookkeeping SaaS for non-accountants (e.g., shopkeepers)',
        'Expense & receipt tracking with OCR',
        'Cashback/Rewards wallet integration for e-commerce',
        'SME loan application & KYC flow',
        'Real-time financial dashboards (for startups/founders)'
      ]
    },
    {
      id: 3,
      title: 'Education',
      subtitle: 'Develop learning platforms',
      tags: ['LMS', 'Scheduler'],
      icon: GraduationCap,
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
      modalContent: [
        'School/academy ERP (admission, fee, attendance)',
        'University student portal (gradebook, course reg, LMS)',
        'Instructor & class scheduling with calendar integration',
        'Online exams with proctoring & analytics',
        'Tutoring marketplace (Zoom/Google Meet integration)',
        'Career guidance + job placement portals for universities'
      ]
    },
    {
      id: 4,
      title: 'Corporate/Personal Websites',
      subtitle: 'Brand and showcase digitally',
      tags: ['CMS', 'Resume'],
      icon: Globe,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
      modalContent: [
        'Company portfolio with CMS (e.g., startups, agencies)',
        'Personal branding site with blog + case studies',
        'Resume/CV generator with public profile link',
        'One-pager sites for events, launches, portfolios'
      ]
    },
    {
      id: 5,
      title: 'AI-Powered Chatbots',
      subtitle: 'Enhance user interactions',
      tags: ['AI', 'Support'],
      badge: 'AI',
      icon: MessageCircle,
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=200&fit=crop',
      modalContent: [
        'Provide instant responses to customer inquiries, enhancing user satisfaction'
      ]
    },
    {
      id: 6,
      title: 'Automated Content Generation & SEO',
      subtitle: 'Effortless product copywriting',
      tags: ['SEO', 'Content'],
      badge: 'AI',
      icon: FileText,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
      modalContent: [
        'Generate product descriptions, blog posts, and ad copy efficiently'
      ]
    },
    {
      id: 7,
      title: 'Visual Content Creation',
      subtitle: 'Enhance visual appeal',
      tags: ['Design', 'Graphics'],
      badge: 'AI',
      icon: Image,
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=200&fit=crop',
      modalContent: [
        'Create and enhance product images for marketing or e-commerce'
      ]
    },
    {
      id: 8,
      title: 'Lesson Planning and Content Creation',
      subtitle: 'Smart tools for educators',
      tags: ['Education', 'Planning'],
      badge: 'AI',
      icon: BookOpen,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop',
      modalContent: [
        'Generate lesson plans and educational content efficiently'
      ]
    }
  ];

  const handleCardClick = (domain) => {
    setSelectedDomain(domain);
  };

  const handleCloseModal = () => {
    setSelectedDomain(null);
  };

  // Navigation between domains in modal
  const handleDomainNavigation = (direction) => {
    if (!selectedDomain) return;

    const currentIndex = domainsData.findIndex(d => d.id === selectedDomain.id);
    let newIndex;

    if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev') {
      newIndex = currentIndex - 1;
    }

    // Check bounds
    if (newIndex >= 0 && newIndex < domainsData.length) {
      setSelectedDomain(domainsData[newIndex]);
    }
  };

  // Check if navigation is possible
  const getNavigationState = () => {
    if (!selectedDomain) return { canNavigateLeft: false, canNavigateRight: false };

    const currentIndex = domainsData.findIndex(d => d.id === selectedDomain.id);
    return {
      canNavigateLeft: currentIndex > 0,
      canNavigateRight: currentIndex < domainsData.length - 1
    };
  };

  return (
    <section id="domains" className="bg-[#F5F1EB] py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, #B8936A 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, #B8936A 1px, transparent 1px)`,
               backgroundSize: '60px 60px'
             }}>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            Domains / Niche
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized expertise across diverse industries, delivering tailored solutions that drive growth and innovation.
          </p>
        </div>

        {/* Domains Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {domainsData.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onClick={handleCardClick}
              isSelected={selectedDomain?.id === domain.id}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <DomainModal 
        domain={selectedDomain} 
        onClose={handleCloseModal}
        onNavigate={handleDomainNavigation}
        {...getNavigationState()}
      />

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sand-dark to-transparent"></div>
    </section>
  );
};

export default DomainsNiche; 