# VIGEO Health Brand & Style Guide

*A comprehensive guide to the cozy, professional healthcare design system*


---

## 📋 Table of Contents

* [Brand Colors](#-brand-colors)
* [Typography System](#-typography-system)
* [Layout & Grid System](#-layout--grid-system)
* [Component Library](#-component-library)
* [Animation & Transitions](#-animation--transitions)
* [Responsive Design](#-responsive-design)
* [Accessibility Standards](#-accessibility-standards)
* [Implementation Guidelines](#-implementation-guidelines)


---

## 🎨 Brand Colors

### Primary Brand Colors

```css
--brand-red: #af2d2c;        /* Primary brand color */
--brand-dark: #8b2322;       /* Darker brand variant */
--brand-warm: #b8453e;       /* Warm accent variant */
```

### Cozy Healthcare Palette

```css
--cozy-peach: #ffeee6;       /* Warm background accent */
--cozy-cream: #fefcfa;       /* Ultra-light warm tone */
--cozy-shadow: rgba(175, 45, 44, 0.08); /* Brand-tinted shadows */
--medical-accent: rgba(175, 45, 44, 0.03); /* Subtle medical accent */
```

### Supporting Colors

```css
--healthcare-blue: #2563eb;   /* Professional medical blue */
--healthcare-teal: #0891b2;   /* Trustworthy teal */
--healthcare-green: #059669;  /* Health/wellness green */
--trust-blue: #1e40af;        /* Deep trust color */

/* Additional Brand Colors from Codebase */
--brand-red-light: #fde8e8;   /* Light red accent */
--brand-red-lighter: #fff5f5; /* Ultra-light red */
--brand-blue-light: #e8f2fd;  /* Light blue accent */
--brand-teal-light: #e8fdf5;  /* Light teal accent */
--neutral-light: #f7f7f7;     /* Neutral background */
```

### Text Colors

```css
--text-primary: #1a1a1a;      /* Main headings and important text */
--text-secondary: #64748b;    /* Body text and descriptions */
--text-muted: #94a3b8;        /* Supporting text and labels */
```

### Background & Neutral Colors

```css
--accent-light: #f0f9ff;      /* Light accent background */
--bg-light: #f8fafc;          /* Light section backgrounds */
--border-color: #e2e8f0;      /* Subtle borders and dividers */
```


---

## 🌊 Background Gradients & Patterns

### Main Hero Background

```css
background: linear-gradient(135deg, #fef7f0 0%, #ffffff 50%, #fdf4f0 100%);
```

### Component Backgrounds

```css
/* Glass morphism containers */
background: rgba(255, 252, 249, 0.98);
backdrop-filter: blur(20px);

/* Trust indicators background */
background: linear-gradient(135deg, rgba(175, 45, 44, 0.04), rgba(175, 45, 44, 0.02));
```


---

## 📝 Typography System

### Font Families

```css
/* Primary Font - Used throughout the application */
font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Secondary Font - Legacy use in some components */
font-family: 'Open Sans', sans-serif;
```

### Font Weights

```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```


---

## 📐 Typography Scale

### Headlines

```css
/* Desktop Typography */
h1 { 
  font-size: clamp(2.5rem, 5vw, 4rem); 
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -1px;
}
h2 { 
  font-size: clamp(1.75rem, 4vw, 2.5rem); 
  font-weight: 600;
  line-height: 1.2;
}
h3 { 
  font-size: clamp(1.5rem, 3vw, 2rem); 
  font-weight: 600;
  line-height: 1.3;
}
h4 { 
  font-size: clamp(1.25rem, 2.5vw, 1.5rem); 
  font-weight: 600;
  line-height: 1.4;
}

/* Mobile Typography (max-width: 768px) */
@media (max-width: 768px) {
  h1 { font-size: clamp(2rem, 8vw, 3rem); }
  h2 { font-size: clamp(1.5rem, 6vw, 2.25rem); }
  h3 { font-size: clamp(1.25rem, 5vw, 1.75rem); }
  h4 { font-size: clamp(1.125rem, 4vw, 1.5rem); }
}
```

### Body Text

```css
/* Standard Body Text */
body {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
}

/* Paragraph Text */
p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

/* Hero Description */
.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Labels and Small Text */
.trust-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.eyebrow-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--brand-red);
  letter-spacing: 2px;
  text-transform: uppercase;
}
```


---

## 📦 Layout & Grid System

### Container Widths

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
}

.wide-container {
  max-width: 1600px;
  margin: 0 auto;
}
```

### Grid Layouts

```css
/* Two Column Grid */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

/* Three Column Grid */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
```

### Navigation Heights

```css
:root {
  --nav-height: 72px;       /* Desktop navigation height */
  --nav-height-mobile: 60px; /* Mobile navigation height */
}

/* Fixed Navigation */
.main-navbar {
  position: fixed;
  top: 0;
  height: var(--nav-height);
  z-index: 1000;
}
```


---

## 🎯 Design Principles

### 1. Cozy Healthcare Aesthetic

* **Warm, welcoming colors** with peachy/cream undertones
* **Organic curved shapes** instead of harsh geometric forms
* **Soft shadows** with brand-color tints
* **Gentle animations** that feel natural and calming

### 2. Professional Medical Standards

* **Clean, readable typography** using Montserrat font family
* **Appropriate contrast ratios** for accessibility
* **Trust indicators** prominently displayed
* **Medical symbols** used subtly as accent elements

### 3. Visual Depth & Energy

* **Layered elements** with proper z-index stacking
* **Glass morphism effects** for modern premium feel
* **Diagonal curved graphics** for dynamic movement
* **Multi-layer shadows** for dimensional depth


---

## 🧩 Component Library

### Navigation Bar Design

```css
/* Main Navbar Structure */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  height: 72px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(175, 45, 44, 0.08);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  transition: all 0.3s ease;
}

/* Navbar Container */
.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo Section */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.navbar-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(175, 45, 44, 0.2);
}

.navbar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-red);
  letter-spacing: -0.5px;
}

/* Navigation Links */
.navbar-nav {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  transition: color 0.3s ease;
  padding: 0.5rem 0;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--brand-red), var(--brand-warm));
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: var(--brand-red);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.active {
  color: var(--brand-red);
  font-weight: 600;
}

/* CTA Buttons in Navbar */
.navbar-cta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(175, 45, 44, 0.05);
  border-radius: 50px;
  color: var(--brand-red);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.navbar-phone:hover {
  background: rgba(175, 45, 44, 0.1);
  transform: translateY(-2px);
}

.navbar-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(175, 45, 44, 0.25);
  transition: all 0.3s ease;
}

.navbar-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(175, 45, 44, 0.35);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  position: relative;
  width: 40px;
  height: 40px;
}

.hamburger {
  width: 24px;
  height: 2px;
  background: var(--text-primary);
  position: absolute;
  left: 8px;
  transition: all 0.3s ease;
}

.hamburger:nth-child(1) { top: 12px; }
.hamburger:nth-child(2) { top: 19px; }
.hamburger:nth-child(3) { top: 26px; }

.mobile-menu-btn.active .hamburger:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active .hamburger:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile Navigation */
@media (max-width: 768px) {
  .navbar {
    height: 60px;
  }
  
  .navbar-container {
    padding: 0 1rem;
  }
  
  .navbar-nav {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    flex-direction: column;
    padding: 2rem 1rem;
    gap: 1.5rem;
    border-bottom: 1px solid rgba(175, 45, 44, 0.08);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .navbar-nav.active {
    transform: translateY(0);
    opacity: 1;
  }
  
  .navbar-cta {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(175, 45, 44, 0.08);
  }
  
  .navbar-phone,
  .navbar-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
  
  .mobile-menu-btn {
    display: block;
  }
}
```

### Footer Design

```css
/* Main Footer Structure */
.footer {
  background: linear-gradient(180deg, 
    rgba(255, 248, 243, 0.5) 0%, 
    rgba(255, 255, 255, 0.98) 50%,
    rgba(254, 247, 240, 0.8) 100%);
  border-top: 1px solid rgba(175, 45, 44, 0.08);
  padding: 5rem 0 2rem;
  position: relative;
  overflow: hidden;
}

/* Footer Background Decorations */
.footer::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, 
    rgba(175, 45, 44, 0.05) 0%, 
    transparent 70%);
  border-radius: 50%;
  animation: blob 20s infinite;
}

.footer::after {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, 
    rgba(175, 45, 44, 0.03) 0%, 
    transparent 70%);
  border-radius: 50%;
  animation: blob 25s infinite reverse;
}

/* Footer Container */
.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

/* Footer Grid Layout */
.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

/* Footer Brand Section */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
}

.footer-logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(175, 45, 44, 0.2);
}

.footer-logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--brand-red);
  letter-spacing: -0.5px;
}

.footer-description {
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 350px;
}

/* Footer Social Links */
.footer-social {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(175, 45, 44, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-red);
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(175, 45, 44, 0.3);
}

/* Footer Links Columns */
.footer-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-column-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  position: relative;
  padding-left: 0;
}

.footer-link::before {
  content: '→';
  position: absolute;
  left: -20px;
  opacity: 0;
  color: var(--brand-red);
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: var(--brand-red);
  padding-left: 20px;
}

.footer-link:hover::before {
  left: 0;
  opacity: 1;
}

/* Footer Contact Info */
.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--text-secondary);
}

.contact-icon {
  width: 40px;
  height: 40px;
  background: rgba(175, 45, 44, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-red);
  flex-shrink: 0;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.contact-value {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.contact-value a {
  color: var(--brand-red);
  text-decoration: none;
  font-weight: 600;
}

/* Footer Newsletter */
.footer-newsletter {
  background: linear-gradient(135deg, 
    rgba(175, 45, 44, 0.04) 0%, 
    rgba(175, 45, 44, 0.02) 100%);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 3rem;
  border: 1px solid rgba(175, 45, 44, 0.08);
}

.newsletter-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}

.newsletter-text h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.newsletter-text p {
  color: var(--text-secondary);
  margin: 0;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
}

.newsletter-input {
  padding: 1rem 1.5rem;
  background: white;
  border: 1px solid rgba(175, 45, 44, 0.15);
  border-radius: 50px;
  min-width: 300px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.newsletter-input:focus {
  outline: none;
  border-color: var(--brand-red);
  box-shadow: 0 0 0 3px rgba(175, 45, 44, 0.1);
}

.newsletter-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(175, 45, 44, 0.25);
}

.newsletter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(175, 45, 44, 0.35);
}

/* Footer Bottom Bar */
.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(175, 45, 44, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copyright {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer-legal-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.legal-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: var(--brand-red);
}

/* Footer Trust Badges */
.footer-trust {
  display: flex;
  gap: 2rem;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.trust-icon {
  width: 40px;
  height: 40px;
  background: rgba(175, 45, 44, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-red);
}

.trust-text {
  display: flex;
  flex-direction: column;
}

.trust-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  font-weight: 600;
}

.trust-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
}

/* Mobile Footer */
@media (max-width: 768px) {
  .footer {
    padding: 3rem 0 1rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  
  .newsletter-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
  
  .newsletter-input {
    min-width: 100%;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .footer-legal-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .footer-trust {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
}
```

## 🧩 Component Library

### Glass Morphism Cards

```css
.glass-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 
    0 30px 100px rgba(0, 0, 0, 0.12),
    0 15px 50px rgba(175, 45, 44, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
```

### Service Cards

```css
.service-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.service-card:hover::before {
  transform: scaleX(1);
}
```


---

## 🔵 Button Styles

### Primary CTA Button

```css
.btn-primary {
  padding: 1.25rem 2.5rem;
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
  color: white;
  font-weight: 600;
  border-radius: 50px; /* Pill-shaped */
  box-shadow: 0 8px 32px rgba(175, 45, 44, 0.25), 
              0 4px 16px rgba(175, 45, 44, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(175, 45, 44, 0.35);
}
```

### Secondary CTA Button

```css
.btn-secondary {
  padding: 1.25rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(175, 45, 44, 0.15);
  border-radius: 50px; /* Pill-shaped */
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```


---

## ⭕ Component Patterns

### Trust Indicators / Stats

```css
.trust-indicators {
  display: flex;
  gap: 2.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(175, 45, 44, 0.04), rgba(175, 45, 44, 0.02));
  border-radius: 24px;
  border: 1px solid rgba(175, 45, 44, 0.12);
  box-shadow: 0 10px 40px rgba(175, 45, 44, 0.08);
}

.trust-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
  border-radius: 50%; /* Perfect circles */
  box-shadow: 0 8px 32px rgba(175, 45, 44, 0.25);
}
```

### Glass Morphism Containers

```css
.hero-container {
  background: rgba(255, 252, 249, 0.98);
  border-radius: 40px; /* Extra rounded for cozy feel */
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.12),
              0 15px 50px rgba(175, 45, 44, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
```


---

## 🌊 Diagonal Curved Graphics

### Implementation Pattern

```css
/* Organic curved overlays using clip-path */
.curved-overlay {
  clip-path: ellipse(80% 60% at 20% 40%);
  transform: rotate(-15deg);
  background: linear-gradient(145deg, 
    rgba(175, 45, 44, 0.08) 0%, 
    rgba(175, 45, 44, 0.04) 30%, 
    transparent 60%);
  animation: gentle-sway 20s ease-in-out infinite;
}

/* Diagonal wave patterns */
.diagonal-wave {
  clip-path: polygon(0% 20%, 100% 0%, 100% 60%, 0% 80%);
  transform: rotate(-8deg);
  background: linear-gradient(160deg, 
    rgba(175, 45, 44, 0.05) 0%, 
    transparent 50%);
}
```

### Animation Patterns

```css
@keyframes gentle-sway {
  0%, 100% { transform: rotate(-15deg) translateY(0px); }
  25% { transform: rotate(-12deg) translateY(-10px); }
  50% { transform: rotate(-18deg) translateY(5px); }
  75% { transform: rotate(-14deg) translateY(-5px); }
}

@keyframes gentle-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```


---

## 📏 Spacing & Layout

### Container Spacing

```css
.hero-container {
  max-width: 1400px;
  padding: 4rem 3rem;
  gap: 6rem; /* Grid gap between content and image */
}

.hero-content {
  gap: 2.5rem; /* Vertical spacing between content blocks */
}
```

### Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 2rem 1.5rem;
  }
}

/* Mobile */  
@media (max-width: 480px) {
  .hero-container {
    padding: 1.5rem 1rem;
  }
}
```


---

## 💫 Shadow System

### Component Shadows

```css
/* Subtle elements */
--shadow-sm: 0 2px 8px rgba(0,0,0,0.08);

/* Cards and containers */
--shadow-md: 0 4px 16px rgba(0,0,0,0.12);

/* Prominent elements */
--shadow-lg: 0 8px 32px rgba(0,0,0,0.16);

/* Brand-tinted shadows */
.brand-shadow {
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.12),
              0 15px 50px rgba(175, 45, 44, 0.08);
}
```


---

## 🎭 Interaction States

### Hover Animations

```css
/* Gentle lift and scale */
.interactive-element:hover {
  transform: translateY(-2px) scale(1.02);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dramatic button hover */
.btn-primary:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(175, 45, 44, 0.35);
}
```

### Animation Timing

* **Standard transitions**: `0.3s ease`
* **Premium interactions**: `0.4s cubic-bezier(0.4, 0, 0.2, 1)`
* **Background animations**: `15s - 32s ease-in-out infinite`


---

## 🏥 Healthcare-Specific Guidelines

### Medical Symbols & Icons

* Use ⚕ (caduceus) symbol sparingly as accent
* Circular icon containers for trust/credibility
* Subtle medical blue accents for professional elements

### Trust Building Elements

* Display certifications prominently
* Use gradient text for important statistics
* Include "Licensed," "Certified," "Insured" messaging
* Professional photography with warm, caring atmosphere

### Accessibility Standards

* Minimum contrast ratio: 4.5:1 for normal text
* Focus indicators on all interactive elements
* Readable font sizes across all devices
* Clear visual hierarchy with appropriate heading structure


---

## 🎨 Usage Examples

### Hero Section Implementation

```html
<section class="hero">
  <div class="diagonal-wave-1"></div>
  <div class="diagonal-wave-2"></div>
  <div class="hero-container">
    <div class="hero-content">
      <h1 class="hero-headline">Complete Healthcare<br><span class="headline-accent">Solutions at Home</span></h1>
      <p class="hero-description">VIGEO Health delivers comprehensive care...</p>
      <div class="hero-actions">
        <a href="#" class="btn-primary">Get Started Today</a>
        <a href="tel:" class="btn-secondary">Call us now!</a>
      </div>
    </div>
  </div>
</section>
```


---


---

## 🎬 Animation & Transitions

### Standard Timing Functions

```css
:root {
  --transition-speed: 0.3s;
  --transition-slow: 0.6s;
  --transition-fast: 0.2s;
  --ease-standard: ease;
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Common Animations

```css
/* Fade Slide Up */
@keyframes fadeSlideUp {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Fade Slide Left */
@keyframes fadeSlideLeft {
  from { 
    opacity: 0; 
    transform: translateX(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
}

/* Icon Pulse */
@keyframes iconPulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
}

/* Blob Movement */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -20px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(15px, -10px) scale(1.05);
  }
}
```

### Hover Effects

```css
/* Standard Hover Lift */
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Button Hover Effect */
.btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(175, 45, 44, 0.35);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```


---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Breakpoints */
--breakpoint-xs: 480px;   /* Extra small devices */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices (tablets) */
--breakpoint-lg: 1024px;  /* Large devices (desktops) */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* Ultra wide screens */
```

### Mobile-Specific Styles

```css
/* Mobile Navigation */
@media (max-width: 768px) {
  .main-navbar {
    height: 60px;
    padding: 8px 16px;
  }
  
  .hero-container {
    padding: 2rem 1rem;
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  /* Mobile Typography */
  body {
    font-size: 0.95rem;
  }
  
  /* Touch-Friendly Buttons */
  .btn {
    min-height: 48px;
    padding: 1rem 2rem;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
}
```


---

## ♿ Accessibility Standards

### Color Contrast

```css
/* WCAG AA Compliant Combinations */
/* Background → Text Color → Contrast Ratio */

/* White backgrounds */
#ffffff → #1a1a1a: 19.5:1  /* Exceeds AAA */
#ffffff → #64748b: 5.32:1  /* Passes AA */
#ffffff → #af2d2c: 5.02:1  /* Passes AA */

/* Brand color backgrounds */
#af2d2c → #ffffff: 5.02:1  /* Passes AA */
#8b2322 → #ffffff: 7.91:1  /* Passes AAA */
```

### Focus States

```css
/* Visible focus indicators */
:focus {
  outline: 2px solid var(--brand-red);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--brand-red);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Labels

```html
<!-- Navigation landmarks -->
<nav aria-label="Main navigation">
<nav aria-label="Footer navigation">

<!-- Interactive elements -->
<button aria-label="Open menu" aria-expanded="false">
<a href="tel:" aria-label="Call VIGEO Health">

<!-- Form elements -->
<input aria-label="Email address" aria-required="true">
<select aria-label="Select your state">
```


---

## 🚀 Implementation Guidelines

### CSS Architecture

```css
/* File Organization */
/static/
  /css/
    base.css        /* Reset and base styles */
    main.css        /* Core styles and variables */
    homepage.css    /* Page-specific styles */
    navbar.css      /* Component styles */
    form.css        /* Form-specific styles */
  /mobile/
    /css/           /* Mobile-specific styles */
```

### Naming Conventions

```css
/* BEM-inspired naming */
.component {}
.component__element {}
.component--modifier {}

/* Utility classes */
.text-center {}
.mt-4 {} /* margin-top: 1rem */
.rounded-lg {} /* border-radius: 16px */

/* State classes */
.is-active {}
.is-loading {}
.has-error {}
```

### Performance Best Practices

```css
/* Use CSS custom properties for theming */
:root {
  --primary: var(--brand-red);
}

/* Optimize animations */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Hardware acceleration */
}

/* Prefer transforms over position changes */
.slide-in {
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

/* Use contain for layout stability */
.card {
  contain: layout style;
}
```

### Cross-Browser Support

```css
/* Vendor prefixes where needed */
.backdrop-blur {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Fallbacks for older browsers */
.modern-gradient {
  background: var(--brand-red); /* Fallback */
  background: linear-gradient(135deg, var(--brand-red), var(--brand-dark));
}
```


---

## 📊 Component States

### Interactive State Colors

```css
/* Default states */
--state-hover: rgba(175, 45, 44, 0.05);
--state-active: rgba(175, 45, 44, 0.1);
--state-focus: rgba(175, 45, 44, 0.2);
--state-disabled: rgba(0, 0, 0, 0.38);

/* Success/Error states */
--state-success: #059669;
--state-error: #dc2626;
--state-warning: #f59e0b;
--state-info: #2563eb;
```

### Loading States

```css
/* Skeleton screens */
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  border: 3px solid rgba(175, 45, 44, 0.1);
  border-top-color: var(--brand-red);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```


---

*This brand guide ensures consistent, cozy, and professional healthcare design across all VIGEO Health digital properties. Last updated: January 2025*