# Adeel - Full Stack Developer Portfolio

A modern, responsive portfolio website built with React.js and Tailwind CSS, featuring a desert-themed design inspired by the beautiful landscapes of Pakistan.

## 🚀 Features

- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **Desert Theme**: Beautiful sand-colored gradient backgrounds with parallax effects
- **Modern UI/UX**: Clean design with smooth animations and hover effects
- **Portfolio Filtering**: Filter projects by category (All, Web Development, UI/UX Design, Backend)
- **Modal Popups**: iOS-style full-screen project detail modals
- **Lazy Loading**: Optimized image loading for better performance
- **Accessibility**: Semantic HTML and keyboard navigation support
- **SEO Optimized**: Meta tags and proper HTML structure

## 🎨 Design Features

- **Color Palette**: Desert Sand (#E9CBA7), Wet Sand (#C9A77D), and complementary earth tones
- **Typography**: Open Sans font family for clean, modern text
- **Animations**: Smooth transitions, floating elements, and entrance animations
- **Background Elements**: SVG mountain silhouettes, fort illustrations, and floating particles

## 🛠️ Tech Stack

- **React.js** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Modern JavaScript features
- **HTML5 & CSS3** - Semantic markup and styling
- **Unsplash API** - High-quality placeholder images

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adeel-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the website

## 🏗️ Build for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder, ready for deployment.

## 📁 Project Structure

```
src/
├── components/
│   ├── Hero.js          # Hero section with profile and CTA buttons
│   ├── FilterMenu.js    # Portfolio category filter buttons
│   ├── PortfolioGrid.js # Grid layout for portfolio cards
│   ├── Card.js          # Individual portfolio project card
│   └── Modal.js         # Full-screen project detail modal
├── App.js               # Main application component
├── index.js             # React entry point
└── index.css            # Global styles and Tailwind imports
```

## 🎯 Customization

### Updating Portfolio Projects

Edit the `projects` array in `src/App.js` to add, remove, or modify portfolio items:

```javascript
const projects = [
  {
    id: 1,
    title: 'Your Project Title',
    description: 'Brief project description',
    category: 'Web Development', // or 'UI/UX Design', 'Backend'
    image: 'path-to-your-image.jpg',
    buttonText: 'View Demo', // or 'View Details'
    details: {
      overview: 'Detailed project description...',
      technologies: ['React', 'Node.js', 'etc'],
      features: ['Feature 1', 'Feature 2', 'etc'],
      liveUrl: 'https://your-live-demo.com',
      githubUrl: 'https://github.com/your-repo'
    }
  }
  // ... more projects
];
```

### Updating Personal Information

- **Name & Title**: Edit the text in `src/components/Hero.js`
- **Profile Image**: Replace the image URL in the Hero component
- **Contact Email**: Update the email in the "Contact Me" button handler

### Customizing Colors

Modify the color palette in `tailwind.config.js`:

```javascript
colors: {
  'desert-sand': '#E9CBA7',
  'wet-sand': '#C9A77D',
  'sand-dark': '#B8936A',
  'sand-light': '#F5E6D3',
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Performance Optimizations

- Lazy loading for images
- Intersection Observer for animations
- Optimized bundle size with React.js
- Efficient CSS with Tailwind's purge feature
- Minimal JavaScript for core functionality

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

**Adeel** - Full Stack Developer
- Email: adeel@example.com
- Portfolio: [Live Demo](#)
- GitHub: [GitHub Profile](#)

---

Built with ❤️ using React.js and Tailwind CSS 