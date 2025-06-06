import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  BarChart3, 
  Puzzle, 
  Settings, 
  CheckCircle, 
  Rocket, 
  GraduationCap, 
  Wrench 
} from 'lucide-react';

const ProjectLifeCycle = () => {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const cardRefs = useRef([]);
  const containerRef = useRef(null);

  const phases = [
    {
      id: 1,
      title: 'Requirements Gathering',
      icon: FileText,
      description: 'Initial discovery and planning with the client.',
      color: 'from-blue-500 to-blue-600',
      tasks: [
        {
          title: 'Client Meeting',
          subtasks: [
            'Schedule call',
            'Discuss goals and expectations',
            'Identify primary features'
          ]
        },
        {
          title: 'Requirement Document',
          subtasks: [
            'Write feature specs',
            'Organize by modules or flows',
            'Share document with client'
          ]
        },
        {
          title: 'Finalization',
          subtasks: [
            'Confirm features',
            'Lock scope',
            'Add revision/change policy notes'
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Estimation & Planning',
      icon: BarChart3,
      description: 'Define timelines and delivery milestones.',
      color: 'from-green-500 to-green-600',
      tasks: [
        {
          title: 'Time & Resource Estimates',
          subtasks: [
            'Evaluate design/dev/test effort',
            'Define demo and delivery cycles'
          ]
        },
        {
          title: 'Sprint Planning',
          subtasks: [
            'Divide tasks into bi-weekly sprints',
            'Assign internal resources'
          ]
        },
        {
          title: 'Timeline & Roadmap',
          subtasks: [
            'Create shared timeline sheet',
            'Build internal Kanban/project tracker'
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Prototyping (if needed)',
      icon: Puzzle,
      description: 'Design skeleton UI or clickable prototype.',
      color: 'from-purple-500 to-purple-600',
      tasks: [
        {
          title: 'Wireframes',
          subtasks: [
            'Sketch low-fidelity layout',
            'Present basic flow'
          ]
        },
        {
          title: 'Interactive Prototypes',
          subtasks: [
            'Use Figma or similar tool',
            'Link flows and screens'
          ]
        },
        {
          title: 'Feedback & Approval',
          subtasks: [
            'Present to client',
            'Revise based on input',
            'Lock final designs'
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'Tech Setup & Development',
      icon: Settings,
      description: 'Start coding and infrastructure setup.',
      color: 'from-orange-500 to-orange-600',
      tasks: [
        {
          title: 'Project Initialization',
          subtasks: [
            'Set up GitHub repo',
            'Configure CI/CD and servers'
          ]
        },
        {
          title: 'Bi-weekly Sync',
          subtasks: [
            'Schedule regular progress demos',
            'Gather and apply feedback'
          ]
        },
        {
          title: 'Task Management',
          subtasks: [
            'Track with internal board (e.g., Notion, Trello)',
            'Share updates with client (if agreed)'
          ]
        },
        {
          title: 'Quality Standards',
          subtasks: [
            'Enforce code reviews',
            'Follow security and scalability best practices'
          ]
        }
      ]
    },
    {
      id: 5,
      title: 'Testing & QA',
      icon: CheckCircle,
      description: 'Ensure product is bug-free and secure.',
      color: 'from-teal-500 to-teal-600',
      tasks: [
        {
          title: 'Manual Testing',
          subtasks: [
            'Check UX flows, responsiveness',
            'Cross-browser and device testing'
          ]
        },
        {
          title: 'Bug Fixes',
          subtasks: [
            'Log and prioritize issues',
            'Patch critical blockers'
          ]
        },
        {
          title: 'Security Checks',
          subtasks: [
            'Sanitize inputs',
            'SSL and auth layer verification'
          ]
        },
        {
          title: 'Final Walkthrough',
          subtasks: [
            'Demo for client',
            'Get sign-off for launch'
          ]
        }
      ]
    },
    {
      id: 6,
      title: 'Take the Product Live!',
      icon: Rocket,
      description: 'Launch the project to production.',
      color: 'from-red-500 to-red-600',
      tasks: [
        {
          title: 'Deployment',
          subtasks: [
            'Push to production (AWS, Vercel, etc.)',
            'Configure backups and monitoring'
          ]
        },
        {
          title: 'Domain & SSL',
          subtasks: [
            'Setup custom domain',
            'Apply SSL certs and CDN'
          ]
        },
        {
          title: 'Launch Plan',
          subtasks: [
            'Choose soft launch or full rollout',
            'Monitor performance in real-time'
          ]
        }
      ]
    },
    {
      id: 7,
      title: 'Handover / Client Training',
      icon: GraduationCap,
      description: 'Deliver project assets and training.',
      color: 'from-indigo-500 to-indigo-600',
      tasks: [
        {
          title: 'Access Delivery',
          subtasks: [
            'Provide admin accounts',
            'Share hosting credentials'
          ]
        },
        {
          title: 'Documentation',
          subtasks: [
            'User guides',
            'Codebase overview (if needed)'
          ]
        },
        {
          title: 'Training',
          subtasks: [
            'Screen recordings',
            'Live walkthrough sessions'
          ]
        }
      ]
    },
    {
      id: 8,
      title: 'Post-Launch Support',
      icon: Wrench,
      description: 'Continued support and future planning.',
      color: 'from-gray-500 to-gray-600',
      tasks: [
        {
          title: 'Maintenance',
          subtasks: [
            'Bug fixes',
            'Platform updates'
          ]
        },
        {
          title: 'Feedback Collection',
          subtasks: [
            'Monitor user input',
            'Prioritize suggestions'
          ]
        },
        {
          title: 'Future Roadmap',
          subtasks: [
            'Define Phase 2',
            'Scope enhancements'
          ]
        }
      ]
    }
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            setVisibleCards(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Mouse drag functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <section className="bg-gray-50 py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, #6B7280 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, #6B7280 1px, transparent 1px)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Project Delivery Life Cycle
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A transparent, structured approach to bringing your ideas to life. Each phase ensures quality, 
            communication, and successful project delivery from concept to completion.
          </p>
          <p className="text-sm text-gray-500 italic">
            💡 Scroll horizontally or drag to explore all phases
          </p>
        </div>

        {/* Horizontal Timeline Container */}
        <div className="relative">
          {/* Horizontal Timeline Line */}
          <div className="absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 via-purple-500 via-orange-500 via-teal-500 via-red-500 via-indigo-500 to-gray-500 z-0"></div>

          {/* Scrollable Timeline */}
          <div
            ref={containerRef}
            className={`
              flex gap-8 overflow-x-auto pb-6 pt-4 px-4
              scrollbar-hide cursor-grab select-none
              ${isDragging ? 'cursor-grabbing' : ''}
            `}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isVisible = visibleCards.has(index);

              return (
                <div
                  key={phase.id}
                  ref={el => cardRefs.current[index] = el}
                  data-index={index}
                  className="relative flex-shrink-0"
                >
                  {/* Timeline Node */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-lg border-4 border-white z-10 relative`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Phase Card */}
                  <div
                    className={`
                      w-80 bg-white rounded-2xl shadow-lg hover:shadow-xl
                      transition-all duration-700 overflow-hidden
                      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${phase.color} p-6 text-white`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 leading-tight">{phase.title}</h3>
                          <p className="text-white/90 text-sm leading-relaxed">{phase.description}</p>
                        </div>
                        <span className="text-2xl font-bold opacity-50 ml-3 flex-shrink-0">
                          {String(phase.id).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <div className="space-y-5">
                        {phase.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="border-l-4 border-gray-100 pl-4 hover:border-gray-300 transition-colors duration-200">
                            <h4 className="text-base font-semibold text-gray-800 mb-2">
                              {task.title}
                            </h4>
                            <ul className="space-y-1.5 ml-3">
                              {task.subtasks.map((subtask, subtaskIndex) => (
                                <li key={subtaskIndex} className="flex items-start space-x-2">
                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-600 text-sm leading-relaxed">{subtask}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Start Your Project?
            </h3>
            <p className="text-gray-600 mb-6">
              Let's discuss your requirements and kick off the first phase of your project delivery journey.
            </p>
            <button className="bg-gradient-to-r from-sand-dark to-sand text-white font-semibold px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              Schedule a Discovery Call
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
    </section>
  );
};

export default ProjectLifeCycle; 