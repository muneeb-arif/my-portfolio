import { Suspense } from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getPortfolioSettings } from '@/lib/settings'
import DynamicHead from '@/components/DynamicHead'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import FilterMenu from '@/components/FilterMenu'
import PortfolioGrid from '@/components/PortfolioGrid'
import Technologies from '@/components/Technologies'
import DomainsNiche from '@/components/DomainsNiche'
import ProjectLifeCycle from '@/components/ProjectLifeCycle'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'
import ScrollToTop from '@/components/ScrollToTop'
import LoadingOverlay from '@/components/LoadingOverlay'
import SkeletonLoader from '@/components/SkeletonLoader'

// Dynamic imports for performance
const Modal = dynamic(() => import('@/components/Modal'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96" />,
  ssr: false
})

const Toast = dynamic(() => import('@/components/Toast'), {
  ssr: false
})

// Generate metadata from settings
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPortfolioSettings()
  
  return {
    title: `${settings.banner_name} - ${settings.banner_title}`,
    description: settings.banner_tagline,
    openGraph: {
      title: `${settings.banner_name} - ${settings.banner_title}`,
      description: settings.banner_tagline,
      images: [
        {
          url: settings.avatar_image || '/images/profile/avatar.jpeg',
          width: 1200,
          height: 630,
          alt: `${settings.banner_name} - ${settings.banner_title}`,
        },
      ],
    },
    twitter: {
      title: `${settings.banner_name} - ${settings.banner_title}`,
      description: settings.banner_tagline,
      images: [settings.avatar_image || '/images/profile/avatar.jpeg'],
    },
  }
}

export default async function HomePage() {
  // Get settings on server side
  const settings = await getPortfolioSettings()
  
  // Determine section visibility
  const sectionVisibility = {
    hero: settings.section_hero_visible !== false,
    portfolio: settings.section_portfolio_visible !== false,
    technologies: settings.section_technologies_visible !== false,
    domains: settings.section_domains_visible !== false,
    projectCycle: settings.section_project_cycle_visible !== false,
  }

  return (
    <>
      <DynamicHead />
      
      <div className="App min-h-screen">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        {sectionVisibility.hero && (
          <Suspense fallback={<SkeletonLoader type="hero" />}>
            <Hero />
          </Suspense>
        )}

        {/* Portfolio Section */}
        {sectionVisibility.portfolio && (
          <Suspense fallback={<SkeletonLoader type="portfolio" />}>
            <PortfolioSection />
          </Suspense>
        )}

        {/* Technologies Section */}
        {sectionVisibility.technologies && (
          <Suspense fallback={<SkeletonLoader type="technologies" />}>
            <Technologies />
          </Suspense>
        )}

        {/* Domains & Niche Section */}
        {sectionVisibility.domains && (
          <Suspense fallback={<SkeletonLoader type="domains" />}>
            <DomainsNiche />
          </Suspense>
        )}

        {/* Project Life Cycle */}
        {sectionVisibility.projectCycle && (
          <Suspense fallback={<SkeletonLoader type="lifecycle" />}>
            <ProjectLifeCycle />
          </Suspense>
        )}

        {/* Footer */}
        <Footer />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* Scroll to Top Button */}
        <ScrollToTop />

        {/* Dynamic components that should not SSR */}
        <Suspense fallback={null}>
          <ClientOnlyComponents />
        </Suspense>
      </div>
    </>
  )
}

// Portfolio section component
async function PortfolioSection() {
  return (
    <section id="portfolio" className="py-16">
      <div className="container mx-auto px-4">
        <Suspense fallback={<SkeletonLoader type="filter" />}>
          <FilterMenu />
        </Suspense>
        
        <Suspense fallback={<SkeletonLoader type="projects" />}>
          <PortfolioGrid />
        </Suspense>
      </div>
    </section>
  )
}

// Client-only components that should not be server-side rendered
function ClientOnlyComponents() {
  return (
    <>
      <Modal />
      <Toast />
      <LoadingOverlay />
    </>
  )
} 