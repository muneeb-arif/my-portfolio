# Image Storage Guidelines

## Folder Structure
```
public/images/
├── profile/
│   └── profile.jpg (400x400px, optimized)
└── projects/
    ├── project1.jpg (600x400px)
    ├── project2.jpg (600x400px)
    └── ... (more project images)
```

## Image Specifications

### Profile Image
- **Dimensions**: 400x400px (square)
- **Format**: JPG or WebP
- **Size**: < 100KB
- **Quality**: High quality, professional headshot

### Project Images
- **Dimensions**: 600x400px (3:2 aspect ratio)
- **Format**: JPG or WebP
- **Size**: < 200KB each
- **Quality**: High quality screenshots or mockups

## Optimization Tips

1. **Use WebP format** when possible for better compression
2. **Compress images** before uploading:
   - Use tools like TinyPNG, ImageOptim, or Squoosh
   - Target 80-90% quality for JPGs
3. **Provide alt text** for accessibility
4. **Use lazy loading** (already implemented in the code)

## How to Update Images

### 1. Replace Profile Image
1. Add your profile image to `public/images/profile/`
2. Update the image path in `src/components/Hero.js`:
   ```javascript
   src="/images/profile/your-profile.jpg"
   ```

### 2. Replace Project Images
1. Add project images to `public/images/projects/`
2. Update the image paths in `src/App.js`:
   ```javascript
   image: '/images/projects/your-project.jpg'
   ```

## Example Update

Replace this in `src/App.js`:
```javascript
image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center'
```

With:
```javascript
image: '/images/projects/explore-heaven-pakistan.jpg'
``` 