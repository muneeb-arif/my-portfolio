import React, { useState, useEffect } from 'react';
import { dynamicSectionService } from '../services/dynamicSectionService';
import DynamicSection from './DynamicSection';
import './DynamicSections.css';

/**
 * Smart component that renders dynamic sections in the correct order
 * Supports both predefined anchors (hero, portfolio, gallery) and 
 * positioning after other dynamic sections via section_id
 */
const DynamicSectionsRenderer = ({ positionAfter, allSections }) => {
  const [sectionsToRender, setSectionsToRender] = useState([]);

  useEffect(() => {
    if (!allSections || allSections.length === 0) {
      setSectionsToRender([]);
      return;
    }

    // Filter sections that should appear at this position
    let filtered = allSections.filter(section => {
      if (positionAfter === null) {
        // Show sections without a position_after (end of page)
        return !section.position_after || section.position_after === '' || section.position_after === null;
      } else {
        // Show sections that should appear after this anchor
        return section.position_after === positionAfter;
      }
    });

    // Sort by sort_order
    filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
    setSectionsToRender(filtered);
  }, [positionAfter, allSections]);

  if (sectionsToRender.length === 0) {
    return null;
  }

  return (
    <>
      {sectionsToRender.map((section) => (
        <React.Fragment key={section.id}>
          <DynamicSection section={section} />
          {/* Recursively render sections that should appear after this one */}
          {/* Use section_id (which is now always set to UUID) or fallback to id */}
          <DynamicSectionsRenderer 
            positionAfter={section.section_id || section.id}
            allSections={allSections}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default DynamicSectionsRenderer;

