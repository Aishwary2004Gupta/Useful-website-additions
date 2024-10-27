# 3D Skewed Navigation Menu

A modern, interactive navigation menu with 3D skewed effects and smooth hover animations. This project creates a visually appealing navigation interface that transforms on user interaction.

## Features
- 3D skewed design with perspective
- Smooth hover animations
- Icon integration using Font Awesome
- Responsive layout
- Modern color scheme
- Shadow effects
- Cross-browser compatible

## Demo

https://github.com/user-attachments/assets/0fd28f4d-33bc-4e2f-9e7b-6a1cced537c1

## Technologies Used
- HTML5
- CSS3
- Font Awesome Icons (v6.5.1)

## Installation

Clone this repository:
```bash
git clone https://github.com/Aishwary2004Gupta/3D-Skewed-Navigation-Menu.git
```

Navigate to the project directory:
```bash
cd 3D-Skewed-Navigation-Menu
```

Open `index.html` in your web browser, or set up a local server.

## Project Structure
```bash
skewed-navigation/
│
├── index.html      # Main HTML file
├── styles.css      # CSS styles
└── README.md       # Project documentation
```

## Usage

### Include the required files in your project
Link Font Awesome CSS in your HTML and link your stylesheet.

```html
<!-- Font Awesome CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<!-- Custom Stylesheet -->
<link rel="stylesheet" href="styles.css">
```

### Add the navigation HTML structure
```html
<nav class="skewed-menu">
  <ul>
    <li><a href="#home"><i class="fa fa-home"></i> Home</a></li>
    <!-- Add more menu items as needed -->
  </ul>
</nav>
```

## Customization

### Colors
You can customize the colors by modifying these CSS variables in `styles.css`:

```css
--background-color: #333;
--hover-color: #9535aa;
--side-panel-color: #2e3133;
--text-color: #999;
```

### Dimensions
Modify these properties to adjust the size:

```css
li {
  width: 200px;
  padding: 15px;
}
```

### Animation Speed
Adjust the transition duration:

```css
li {
  transition: 0.5s;
}
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## Contributing

Fork the repository, create a feature branch, commit your changes, push to the branch, and open a pull request.

```bash
git checkout -b feature/AmazingFeature
git commit -m 'Add some AmazingFeature'
git push origin feature/AmazingFeature
```

## Acknowledgments
- Font Awesome for the icons
- Aishwary Gupta - Creator and maintainer
- Inspired by modern UI/UX design trends

## Contact
Aishwary Gupta - [@Aish2004Gupta](https://twitter.com/Aish2004Gupta)  
Project Link: [https://github.com/Aishwary2004Gupta/3D-Skewed-Navigation-Menu](https://github.com/Aishwary2004Gupta/3D-Skewed-Navigation-Menu)

---

⭐️ If you found this project helpful, please give it a star!
