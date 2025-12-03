import React, { useState, useEffect } from 'react';
import { dynamicSectionService } from '../services/dynamicSectionService';
import DynamicSectionsRenderer from './DynamicSectionsRenderer';
import './DynamicSections.css';

/**
 * Main component that loads all sections and passes them to renderer
 * This ensures we only make one API call and can handle nested positioning
 */
const DynamicSections = ({ positionAfter = null }) => {
  const [allSections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const result = await dynamicSectionService.listSections();
      if (result.success) {
        const sections = result.data || [];
        console.log(`📝 Loaded ${sections.length} dynamic sections total`);
        setAllSections(sections);
      } else {
        console.error('Failed to load dynamic sections:', result.error);
        setAllSections([]);
      }
    } catch (error) {
      console.error('Error loading dynamic sections:', error);
      setAllSections([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show loading state, just render nothing
  }

  return (
    <DynamicSectionsRenderer 
      positionAfter={positionAfter} 
      allSections={allSections}
    />
  );
};

export default DynamicSections;

