// Fallback data service - provides backup data when Supabase is unavailable
// Data sourced from https://muneeb.theexpertways.com/

export const fallbackDataService = {
  // Fallback projects data
  getProjects() {
    return [
      {
        id: 1,
        title: "E-Commerce Platform",
        description: "A full-stack e-commerce solution with modern UI/UX",
        category: "Web Development",
        overview: "Built a comprehensive e-commerce platform with React frontend and Node.js backend, featuring user authentication, payment processing, and admin dashboard.",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        features: [
          "User authentication and authorization",
          "Product catalog with search and filtering",
          "Shopping cart and checkout process",
          "Payment integration with Stripe",
          "Admin dashboard for inventory management",
          "Responsive design for mobile devices"
        ],
        live_url: "https://example-ecommerce.com",
        github_url: "https://github.com/username/ecommerce-platform",
        status: "published",
        views: 1250,
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&crop=center",
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        title: "AI-Powered Chatbot",
        description: "Intelligent chatbot using machine learning",
        category: "AI/ML",
        overview: "Developed an AI-powered chatbot using natural language processing and machine learning algorithms for customer support automation.",
        technologies: ["Python", "TensorFlow", "NLP", "FastAPI"],
        features: [
          "Natural language understanding",
          "Context-aware conversations",
          "Multi-language support",
          "Integration with CRM systems",
          "Analytics and reporting dashboard",
          "Continuous learning capabilities"
        ],
        live_url: "https://ai-chatbot-demo.com",
        github_url: "https://github.com/username/ai-chatbot",
        status: "published",
        views: 890,
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center",
        created_at: "2024-02-20T14:30:00Z"
      },
      {
        id: 3,
        title: "Mobile Banking App",
        description: "Secure mobile banking application",
        category: "Mobile Development",
        overview: "Created a secure mobile banking application with biometric authentication, real-time transactions, and comprehensive financial management features.",
        technologies: ["React Native", "Firebase", "Biometrics", "Redux"],
        features: [
          "Biometric authentication (fingerprint/face ID)",
          "Real-time transaction monitoring",
          "Bill payments and transfers",
          "Investment portfolio tracking",
          "Push notifications for alerts",
          "Offline transaction queuing"
        ],
        live_url: "https://mobile-banking-app.com",
        github_url: "https://github.com/username/mobile-banking",
        status: "published",
        views: 2100,
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center",
        created_at: "2024-03-10T09:15:00Z"
      },
      {
        id: 4,
        title: "Cloud Infrastructure Dashboard",
        description: "Real-time cloud resource monitoring",
        category: "Cloud Computing",
        overview: "Built a comprehensive dashboard for monitoring and managing cloud infrastructure across multiple providers with real-time analytics.",
        technologies: ["AWS", "Docker", "Kubernetes", "React"],
        features: [
          "Multi-cloud resource monitoring",
          "Real-time performance metrics",
          "Cost optimization recommendations",
          "Automated scaling policies",
          "Security compliance monitoring",
          "Custom alerting system"
        ],
        live_url: "https://cloud-dashboard.com",
        github_url: "https://github.com/username/cloud-dashboard",
        status: "published",
        views: 750,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&crop=center",
        created_at: "2024-04-05T16:45:00Z"
      },
      {
        id: 5,
        title: "Blockchain Supply Chain",
        description: "Transparent supply chain tracking",
        category: "Blockchain",
        overview: "Implemented a blockchain-based supply chain tracking system ensuring transparency and immutability of product journey from source to consumer.",
        technologies: ["Ethereum", "Solidity", "Web3.js", "Node.js"],
        features: [
          "Product traceability from source to consumer",
          "Smart contracts for automated compliance",
          "Real-time tracking with IoT integration",
          "Transparent audit trail",
          "Supplier verification system",
          "Consumer authentication for product origin"
        ],
        live_url: "https://blockchain-supplychain.com",
        github_url: "https://github.com/username/blockchain-supplychain",
        status: "published",
        views: 680,
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop&crop=center",
        created_at: "2024-05-12T11:20:00Z"
      }
    ];
  },

  // Fallback technologies data
  getTechnologies() {
    return [
      {
        id: 1,
        title: "Web Development",
        type: "domain",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&crop=center",
        sort_order: 1
      },
      {
        id: 2,
        title: "Mobile Development",
        type: "domain",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop&crop=center",
        sort_order: 2
      },
      {
        id: 3,
        title: "AI/ML",
        type: "domain",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
        sort_order: 3
      },
      {
        id: 4,
        title: "Cloud Computing",
        type: "domain",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop&crop=center",
        sort_order: 4
      },
      {
        id: 5,
        title: "Blockchain",
        type: "domain",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop&crop=center",
        sort_order: 5
      },
      {
        id: 6,
        title: "Cybersecurity",
        type: "domain",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center",
        sort_order: 6
      },
      {
        id: 7,
        title: "Data Science",
        type: "domain",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
        sort_order: 7
      },
      {
        id: 8,
        title: "DevOps",
        type: "domain",
        image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop&crop=center",
        sort_order: 8
      },
      {
        id: 9,
        title: "UI/UX Design",
        type: "domain",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop&crop=center",
        sort_order: 9
      }
    ];
  },

  // Fallback skills data
  getSkills() {
    return [
      { id: 1, name: "React", level: 5, domain_id: 1 },
      { id: 2, name: "Node.js", level: 5, domain_id: 1 },
      { id: 3, name: "Python", level: 4, domain_id: 3 },
      { id: 4, name: "AWS", level: 4, domain_id: 4 },
      { id: 5, name: "Solidity", level: 3, domain_id: 5 },
      { id: 6, name: "React Native", level: 4, domain_id: 2 },
      { id: 7, name: "TensorFlow", level: 3, domain_id: 3 },
      { id: 8, name: "Docker", level: 4, domain_id: 8 },
      { id: 9, name: "Figma", level: 4, domain_id: 9 },
      { id: 10, name: "MongoDB", level: 4, domain_id: 1 },
      { id: 11, name: "PostgreSQL", level: 4, domain_id: 1 },
      { id: 12, name: "TypeScript", level: 4, domain_id: 1 },
      { id: 13, name: "GraphQL", level: 3, domain_id: 1 },
      { id: 14, name: "Kubernetes", level: 3, domain_id: 8 },
      { id: 15, name: "Firebase", level: 4, domain_id: 4 },
      { id: 16, name: "Redux", level: 4, domain_id: 1 },
      { id: 17, name: "Next.js", level: 4, domain_id: 1 },
      { id: 18, name: "Vue.js", level: 3, domain_id: 1 },
      { id: 19, name: "Angular", level: 3, domain_id: 1 },
      { id: 20, name: "Laravel", level: 3, domain_id: 1 },
      { id: 21, name: "Django", level: 3, domain_id: 1 },
      { id: 22, name: "Flutter", level: 3, domain_id: 2 },
      { id: 23, name: "Swift", level: 3, domain_id: 2 },
      { id: 24, name: "Kotlin", level: 3, domain_id: 2 },
      { id: 25, name: "Machine Learning", level: 4, domain_id: 3 },
      { id: 26, name: "Deep Learning", level: 3, domain_id: 3 },
      { id: 27, name: "NLP", level: 3, domain_id: 3 },
      { id: 28, name: "Computer Vision", level: 3, domain_id: 3 },
      { id: 29, name: "Google Cloud", level: 3, domain_id: 4 },
      { id: 30, name: "Azure", level: 3, domain_id: 4 },
      { id: 31, name: "Ethereum", level: 3, domain_id: 5 },
      { id: 32, name: "Hyperledger", level: 2, domain_id: 5 },
      { id: 33, name: "Penetration Testing", level: 3, domain_id: 6 },
      { id: 34, name: "Security Auditing", level: 3, domain_id: 6 },
      { id: 35, name: "Data Analysis", level: 4, domain_id: 7 },
      { id: 36, name: "Data Visualization", level: 4, domain_id: 7 },
      { id: 37, name: "Jenkins", level: 3, domain_id: 8 },
      { id: 38, name: "GitLab CI/CD", level: 3, domain_id: 8 },
      { id: 39, name: "Adobe XD", level: 3, domain_id: 9 },
      { id: 40, name: "Sketch", level: 3, domain_id: 9 }
    ];
  },

  // Fallback niches data
  getNiches() {
    return [
      {
        id: 1,
        title: "E-Commerce Solutions",
        overview: "Comprehensive e-commerce platforms with modern UI/UX, payment processing, and inventory management systems.",
        tools: "React, Node.js, Stripe, MongoDB, Redis",
        key_features: "User authentication, Product catalog, Shopping cart, Payment processing, Admin dashboard, Analytics",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center",
        sort_order: 1,
        ai_driven: false
      },
      {
        id: 2,
        title: "AI-Powered Applications",
        overview: "Intelligent applications leveraging machine learning, natural language processing, and computer vision technologies.",
        tools: "Python, TensorFlow, PyTorch, FastAPI, AWS SageMaker",
        key_features: "Natural language processing, Computer vision, Predictive analytics, Recommendation systems, Chatbots, Data analysis",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
        sort_order: 2,
        ai_driven: true
      },
      {
        id: 3,
        title: "FinTech Solutions",
        overview: "Secure financial technology applications including mobile banking, payment gateways, and investment platforms.",
        tools: "React Native, Node.js, PostgreSQL, Redis, AWS",
        key_features: "Biometric authentication, Real-time transactions, Payment processing, Investment tracking, Security compliance, Analytics",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center",
        sort_order: 3,
        ai_driven: false
      },
      {
        id: 4,
        title: "Cloud Infrastructure",
        overview: "Scalable cloud infrastructure solutions with monitoring, automation, and cost optimization.",
        tools: "AWS, Docker, Kubernetes, Terraform, Prometheus",
        key_features: "Multi-cloud management, Auto-scaling, Cost optimization, Security monitoring, CI/CD pipelines, Disaster recovery",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop&crop=center",
        sort_order: 4,
        ai_driven: false
      },
      {
        id: 5,
        title: "Blockchain Applications",
        overview: "Decentralized applications and smart contracts for transparent and secure business processes.",
        tools: "Ethereum, Solidity, Web3.js, IPFS, Hardhat",
        key_features: "Smart contracts, Decentralized storage, Token economics, Supply chain tracking, DeFi protocols, NFT platforms",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop&crop=center",
        sort_order: 5,
        ai_driven: false
      },
      {
        id: 6,
        title: "Cybersecurity Tools",
        overview: "Advanced security solutions for threat detection, vulnerability assessment, and compliance management.",
        tools: "Python, AWS Security Hub, Wireshark, Metasploit, OWASP",
        key_features: "Penetration testing, Vulnerability scanning, Threat detection, Security auditing, Compliance monitoring, Incident response",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center",
        sort_order: 6,
        ai_driven: true
      },
      {
        id: 7,
        title: "Data Analytics Platforms",
        overview: "Comprehensive data analytics and business intelligence solutions for data-driven decision making.",
        tools: "Python, Apache Spark, Tableau, Power BI, AWS Redshift",
        key_features: "Data visualization, Predictive analytics, Real-time dashboards, ETL pipelines, Machine learning integration, Custom reporting",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
        sort_order: 7,
        ai_driven: true
      },
      {
        id: 8,
        title: "DevOps Automation",
        overview: "End-to-end DevOps automation solutions for continuous integration, deployment, and infrastructure management.",
        tools: "Jenkins, GitLab CI/CD, Ansible, Terraform, Kubernetes",
        key_features: "CI/CD pipelines, Infrastructure as Code, Automated testing, Monitoring & alerting, Blue-green deployments, Rollback strategies",
        image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop&crop=center",
        sort_order: 8,
        ai_driven: false
      },
      {
        id: 9,
        title: "UI/UX Design Systems",
        overview: "Comprehensive design systems and user experience solutions for modern web and mobile applications.",
        tools: "Figma, Adobe XD, Sketch, InVision, Principle",
        key_features: "Design systems, Prototyping, User research, Accessibility compliance, Design tokens, Component libraries",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop&crop=center",
        sort_order: 9,
        ai_driven: false
      }
    ];
  },

  // Fallback categories data
  getCategories() {
    return [
      { id: 1, name: "Web Development", description: "Full-stack web applications", color: "#3B82F6" },
      { id: 2, name: "Mobile Development", description: "Cross-platform mobile apps", color: "#10B981" },
      { id: 3, name: "AI/ML", description: "Artificial Intelligence and Machine Learning", color: "#8B5CF6" },
      { id: 4, name: "Cloud Computing", description: "Cloud infrastructure and DevOps", color: "#F59E0B" },
      { id: 5, name: "Blockchain", description: "Blockchain and cryptocurrency solutions", color: "#EF4444" },
      { id: 6, name: "Cybersecurity", description: "Security and compliance solutions", color: "#6B7280" }
    ];
  }
};

export default fallbackDataService; 