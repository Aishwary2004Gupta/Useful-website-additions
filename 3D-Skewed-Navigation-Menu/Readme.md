3D Skewed Navigation Menu

A modern, interactive navigation menu with 3D skewed effects and smooth hover animations. This project creates a visually appealing navigation interface that transforms on user interaction.


Features

3D skewed design with perspective
Smooth hover animations
Icon integration using Font Awesome
Responsive layout
Modern color scheme
Shadow effects
Cross-browser compatible

Demo



Technologies Used

HTML5
CSS3
Font Awesome Icons (v6.5.1)

Installation

Clone this repository:

bashCopygit clone https://github.com/Aishwary2004Gupta/3D-Skewed-Navigation-Menu.git

Navigate to the project directory:

bashCopycd skewed-navigation

Open index.html in your web browser, or set up a local server.

Project Structure
Copyskewed-navigation/
│
├── index.html          # Main HTML file
├── styles.css         # CSS styles
└── README.md          # Project documentation
Usage

Include the required files in your project:

Link Font Awesome CSS in your HTML
Link your stylesheet



htmlCopy<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="styles.css">

Add the navigation HTML structure:

htmlCopy<nav class="navigation">
    <ul>
        <li style="--i:6;">
            <span class="icon"><i class="fas fa-home"></i></span>
            <a href="#">Home</a>
        </li>
        <!-- Add more menu items as needed -->
    </ul>
</nav>
Customization
Colors
You can customize the colors by modifying these CSS variables in styles.css:

Background color: background: #333;
Hover color: background: #9535aa;
Side panel color: background: #2e3133;
Text color: color: #999;

Dimensions
Modify these properties to adjust the size:
cssCopyli {
    width: 200px;
    padding: 15px;
}
Animation Speed
Adjust the transition duration:
cssCopyli {
    transition: 0.5s;
}
Browser Support

Chrome (latest)
Firefox (latest)
Safari (latest)
Edge (latest)
Opera (latest)

Contributing

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

License
This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgments

Font Awesome for the icons
[Your Name] - Creator and maintainer
Inspired by modern UI/UX design trends

Contact
Your Name - @yourtwitter
Project Link: https://github.com/yourusername/skewed-navigation

Feel free to ⭐️ the repo if you found this helpful!