import React from 'react';

const FilterMenu = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <div id="portfolio" className="mt-5 mb-12">
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`
              relative px-6 py-3 font-semibold text-lg transition-all duration-300
              ${activeFilter === filter
                ? 'text-sand-dark'
                : 'text-gray-600 hover:text-sand-dark'
              }
            `}
          >
            {filter}
            {/* Underline indicator */}
            <div
              className={`
                absolute bottom-0 left-0 w-full h-0.5 bg-sand-dark transition-all duration-300
                ${activeFilter === filter
                  ? 'scale-x-100 opacity-100'
                  : 'scale-x-0 opacity-0'
                }
              `}
            />
            {/* Hover effect */}
            <div
              className={`
                absolute bottom-0 left-0 w-full h-0.5 bg-wet-sand transition-all duration-300
                ${activeFilter !== filter
                  ? 'scale-x-0 hover:scale-x-100 opacity-0 hover:opacity-50'
                  : 'scale-x-0 opacity-0'
                }
              `}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterMenu; 