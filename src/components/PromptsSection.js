import React, { useState, useEffect, useCallback } from 'react';
import portfolioService from '../services/portfolioService';
import { useSettings } from '../services/settingsContext';
import Card from './Card';
import Modal from './Modal';
import FilterMenu from './FilterMenu';
import './PromptsSection.css';

// Debug import
console.log('🔍 PromptsSection: portfolioService import check:', {
  portfolioService: typeof portfolioService,
  hasGetPublishedProjects: typeof portfolioService?.getPublishedProjects,
  isFunction: typeof portfolioService?.getPublishedProjects === 'function'
});

const PromptsSection = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { settings, loading: settingsLoading } = useSettings();
  
  // Ensure prompts is always an array
  const safePrompts = Array.isArray(prompts) ? prompts : [];
  
  // Debug settings
  console.log('🔍 PromptsSection: Settings debug:', {
    settingsLoading,
    hasSettings: !!settings,
    section_prompts_visible: settings?.section_prompts_visible,
    settingsKeys: settings ? Object.keys(settings) : []
  });

  useEffect(() => {
    // Only load prompts if settings are loaded and prompts section is visible
    if (!settingsLoading && settings && settings.section_prompts_visible) {
      console.log('🔍 PromptsSection: Settings ready, loading prompts...');
      loadPrompts();
    } else {
      console.log('🔍 PromptsSection: Waiting for settings or prompts not visible:', {
        settingsLoading,
        hasSettings: !!settings,
        section_prompts_visible: settings?.section_prompts_visible
      });
    }
  }, [settingsLoading, settings]);

  const loadPrompts = useCallback(async () => {
    try {
      console.log('🔍 PromptsSection: Loading prompts...');
      setLoading(true);
      
      // Debug portfolioService
      console.log('🔍 PromptsSection: portfolioService debug:', {
        portfolioService: typeof portfolioService,
        hasGetPublishedProjects: typeof portfolioService?.getPublishedProjects,
        isFunction: typeof portfolioService?.getPublishedProjects === 'function'
      });
      
      if (!portfolioService || typeof portfolioService.getPublishedProjects !== 'function') {
        throw new Error('portfolioService.getPublishedProjects is not available');
      }
      
      const projects = await portfolioService.getPublishedProjects();
      
      console.log('🔍 PromptsSection: Projects loaded:', {
        totalProjects: projects?.length || 0,
        isArray: Array.isArray(projects),
        sampleProject: projects?.[0]
      });
      
      if (Array.isArray(projects)) {
        // Filter to only prompts (is_prompt = 1) and published status
        const filteredPrompts = projects.filter(p => p.is_prompt == 1 && p.status === 'published');
        console.log('🔍 PromptsSection: Filtered prompts:', {
          totalPrompts: filteredPrompts.length,
          samplePrompt: filteredPrompts[0]
        });
        setPrompts(filteredPrompts);
      } else {
        console.error('❌ PromptsSection: Projects is not an array:', projects);
        setError('Failed to load prompts');
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      setError(`Error loading prompts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if prompts section is visible (after settings are loaded)
  console.log('🔍 PromptsSection Debug:', {
    settingsLoading,
    hasSettings: !!settings,
    section_prompts_visible: settings?.section_prompts_visible,
    promptsIsArray: Array.isArray(prompts),
    promptsLength: safePrompts?.length
  });
  
  if (settingsLoading || !settings || !settings.section_prompts_visible) {
    console.log('❌ PromptsSection returning null due to:', {
      settingsLoading,
      noSettings: !settings,
      promptsHidden: !settings?.section_prompts_visible
    });
    return null;
  }

  const handlePromptClick = (prompt, index) => {
    if (!prompt || !safePrompts || !safePrompts.length) {
      console.error('Invalid prompt or prompts array');
      return;
    }
    setSelectedPrompt(prompt);
    setCurrentPromptIndex(index);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPrompt(null);
  };

  const handleNavigate = (direction) => {
    const filteredPrompts = getFilteredPrompts();
    if (!Array.isArray(filteredPrompts) || filteredPrompts.length === 0) {
      console.error('No filtered prompts available for navigation');
      return;
    }
    
    let newIndex;

    if (direction === 'prev') {
      newIndex = currentPromptIndex > 0 ? currentPromptIndex - 1 : filteredPrompts.length - 1;
    } else {
      newIndex = currentPromptIndex < filteredPrompts.length - 1 ? currentPromptIndex + 1 : 0;
    }

    setCurrentPromptIndex(newIndex);
    setSelectedPrompt(filteredPrompts[newIndex]);
  };

  const getFilteredPrompts = () => {
    if (!safePrompts || safePrompts.length === 0) {
      return [];
    }
    if (selectedCategory === 'all') {
      return safePrompts;
    }
    return safePrompts.filter(prompt => prompt?.category === selectedCategory);
  };

  const getCategories = () => {
    if (!safePrompts || safePrompts.length === 0) {
      return ['all'];
    }
    const categories = [...new Set(safePrompts.map(prompt => prompt?.category).filter(Boolean))];
    return ['all', ...categories];
  };

  const filteredPrompts = getFilteredPrompts();

  if (loading) {
    return (
      <section id="prompts" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sand-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading prompts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="prompts" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Prompts</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (safePrompts.length === 0) {
    return (
      <section id="prompts" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Prompts Available</h3>
            <p className="text-gray-600">No prompts have been published yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="prompts" className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 2px 2px, #C9A77D 2px, transparent 0)`,
               backgroundSize: '30px 30px'
             }}>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            AI Prompts
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            A collection of AI prompts and templates to help you get started with your projects.
          </p>
        </div>

        {/* Filter Menu */}
        {getCategories() && getCategories().length > 1 && (
          <div className="mb-12">
            <FilterMenu
              filters={getCategories()}
              activeFilter={selectedCategory}
              onFilterChange={setSelectedCategory}
            />
          </div>
        )}

        {/* Prompts Grid */}
        {filteredPrompts && Array.isArray(filteredPrompts) && filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPrompts.map((prompt, index) => {
              // Ensure prompt has required properties
              const safePrompt = {
                id: prompt?.id || `prompt-${index}`,
                title: prompt?.title || 'Untitled Prompt',
                description: prompt?.description || 'No description available',
                category: prompt?.category || 'Uncategorized',
                image: prompt?.image || '/images/domains/default.jpeg',
                buttonText: 'View Prompt',
                ...prompt
              };
              
              return (
                <Card
                  key={safePrompt.id}
                  project={safePrompt}
                  onClick={() => handlePromptClick(prompt, index)}
                  animationDelay={index * 0.1}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Prompts Found</h3>
            <p className="text-gray-600">
              No prompts match the selected category.
            </p>
          </div>
        )}
      </div>

      {/* Prompt Modal */}
      {showModal && selectedPrompt && filteredPrompts && (
        <Modal
          project={selectedPrompt}
          onClose={handleCloseModal}
          onNavigate={handleNavigate}
          canNavigateLeft={filteredPrompts.length > 1}
          canNavigateRight={filteredPrompts.length > 1}
          isPrompt={true}
        />
      )}
    </section>
  );
};

export default PromptsSection; 