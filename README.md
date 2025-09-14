# BidBound - Online Auction Platform

A modern, responsive auction platform built with HTML, CSS (SCSS + Tailwind), and vanilla JavaScript. BidBound allows users to create accounts, list items for auction, place bids, and manage their auction activities.

## 🚀 Features

### Core Functionality
- **User Authentication** - Register, login, and logout
- **Auction Listings** - Browse and search auction items
- **Bidding System** - Place bids on auction items
- **User Profiles** - Manage personal listings and bids
- **Create Listings** - Add new items to auction
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### User Features
- **Registration** with profile customization (avatar, banner, bio)
- **Secure login** with JWT token authentication
- **Browse auctions** with search functionality
- **Real-time bidding** with bid history
- **Profile management** with credits display
- **Create and manage** your own auction listings
- **Track bidding activity** on items you've bid on

## 🛠️ Technical Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - SCSS preprocessor + Tailwind CSS framework
- **JavaScript ES6+** - Vanilla JavaScript with modules
- **Responsive Design** - Mobile-first approach

### API Integration
- **Noroff API v2** - Backend services
- **JWT Authentication** - Secure token-based auth
- **RESTful endpoints** - CRUD operations for auctions and users

## 📁 Project Structure

```
BidBound/
├── Index.html              # Main auction feed page
├── Login.html              # User login page
├── Signup.html             # User registration page
├── Profile.html            # User profile and management
├── images/                 # Static assets
│   ├── Logo.svg           # Brand logo
│   ├── Favicon.png        # Site icon
│   └── default-fallback-image.png
├── js/                    # JavaScript modules
│   ├── config.js          # API configuration
│   ├── header.js          # Header navigation logic
│   ├── listings.js        # Auction listings functionality
│   ├── login.js           # Login form handling
│   ├── profile.js         # Profile page logic
│   ├── search.js          # Search functionality
│   └── signup.js          # Registration form handling
└── scss/                  # Stylesheets
    ├── style.scss         # SASS source
    ├── style.css          # Compiled CSS
    └── style.css.map      # Source map
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API calls and Tailwind CDN)
- Local web server (optional, but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Daniel-leiken/Semester-Project-2.git
   cd Semester-Project-2
   ```

2. **Serve the files**
   
   **Option A: Using Live Server (VS Code)**
   - Install Live Server extension
   - Right-click on `Index.html`
   - Select "Open with Live Server"

   **Option B: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   # Then open http://localhost:8000
   ```

   **Option C: Using Node.js**
   ```bash
   npx serve .
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8000` (or your local server URL)
   - The application will load the main auction feed

## 📚 How to Use

### For New Users

1. **Registration**
   - Click "Sign Up" in the header
   - Fill in required fields (name, email, password)
   - Optionally add bio, avatar URL, and banner URL
   - Submit to create account

2. **Login**
   - Click "Login" in the header
   - Enter your email and password
   - You'll be redirected to the main feed

### For Registered Users

1. **Browse Auctions**
   - Main page shows all active auctions
   - Use search bar to find specific items
   - Click on any listing to view details and place bids

2. **Place Bids**
   - Click on a listing to open details modal
   - Enter bid amount (must be higher than current bid)
   - Click "Place Bid" to submit

3. **Create Listings**
   - Click "Create Listing" button (logged-in users only)
   - Fill in title, description, auction end date
   - Optionally add image URLs
   - Submit to create auction

4. **Manage Profile**
   - Click "Profile" in navigation
   - View your active listings
   - See items you've bid on
   - Manage your auction activity

## 🧪 Testing Guide

### Manual Testing Scenarios

#### Authentication Testing
1. **Registration**
   - Test with valid email format
   - Test password requirements
   - Test optional fields (bio, avatar, banner)
   - Verify error handling for invalid data

2. **Login**
   - Test with correct credentials
   - Test with incorrect credentials
   - Verify redirect after successful login
   - Test logout functionality

#### Auction Functionality
1. **Browse Listings**
   - Verify all auctions load correctly
   - Test search functionality
   - Check responsive design on different screen sizes
   - Verify image fallbacks work

2. **Bidding**
   - Test placing valid bids
   - Test bid validation (minimum amount)
   - Verify bid history updates
   - Test bidding on own listings (should be prevented)

3. **Create Listings**
   - Test with all required fields
   - Test with optional images
   - Verify date validation
   - Test form validation

#### Responsive Design Testing
1. **Mobile (< 640px)**
   - Header hamburger menu works
   - Forms are touch-friendly
   - Modals don't overflow screen
   - Navigation is accessible

2. **Tablet (640px - 1024px)**
   - Layout adjusts appropriately
   - Touch targets are adequate
   - Content remains readable

3. **Desktop (> 1024px)**
   - Full navigation visible
   - Optimal layout and spacing
   - Hover states work correctly

### Browser Testing
Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### API Testing
1. **Network Tab**
   - Check API calls in browser dev tools
   - Verify proper authentication headers
   - Check error handling

2. **Authentication**
   - Verify JWT token storage
   - Test token expiration handling
   - Check logout clears tokens

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure you're running from a local server, not file:// protocol
   - Check browser console for specific CORS messages

2. **API Errors**
   - Verify internet connection
   - Check API status in browser network tab
   - Ensure API key is valid in config.js

3. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check browser developer tools for token-related errors
   - Verify email format is correct

4. **Styling Issues**
   - Ensure Tailwind CSS CDN is loading
   - Check for CSS compilation errors
   - Verify browser supports modern CSS features

### Browser Console Debugging
- Open browser Developer Tools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for failed API requests
- Use Application tab to inspect localStorage

## 🔑 Environment Variables

The project uses these configuration values in `js/config.js`:

```javascript
API_BASE_URL: 'https://v2.api.noroff.dev'
API_KEY: 'e3234ae6-950d-4fcb-9c01-f2721b2ca931'
```

## 📱 Mobile Optimization

- **Touch-friendly** interface design
- **Responsive** layouts for all screen sizes
- **Mobile-specific** navigation with hamburger menu
- **Optimized** modals and forms for mobile viewing
- **Fast loading** with minimal dependencies

## 🔒 Security Features

- **JWT token** authentication
- **Secure API** communication
- **Input validation** on forms
- **XSS protection** through proper data handling
- **Authentication checks** on protected routes

## 🎨 Design System

- **Tailwind CSS** utility-first framework
- **SCSS** for custom styling and variables
- **Responsive** breakpoints (mobile, tablet, desktop)
- **Consistent** color scheme and typography
- **Accessible** design with proper contrast ratios

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

This is a student project for Noroff University College. For educational purposes only.

## 📞 Support

For technical issues or questions about this project, please check the browser console for error messages and verify all prerequisites are met.

---

**Built with ❤️ as part of Noroff University College coursework**