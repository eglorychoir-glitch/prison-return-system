# Prison Return Management System

## Overview
The Prison Return Management System is a comprehensive web-based application designed for the Uganda Prisons Service to manage and track prison returns efficiently. The system provides role-based access control, real-time notifications, chat functionality, and comprehensive data management capabilities.

## Version
**Version 1.2.0** - Developed by OboteSofTech

## Features

### Core Functionality
- **Google Account Authentication**: Secure login using Google Account email addresses
- **Role-Based Access Control**: Different permissions for Admin, PHQ-KLA, Clerks, Receptionists, and Officers
- **Station-Based Restrictions**: Users are restricted to specific prison stations based on their roles
- **Return Submission**: Submit various types of prison returns (Monthly, Quarterly, Annual)
- **File Upload Support**: Attach files to return submissions
- **Real-Time Notifications**: Audio and visual notifications for new submissions
- **Chat System**: Inter-station communication with message history
- **Search & Sort**: Advanced filtering and sorting of returns
- **CSV Export**: Export returns data to CSV format for reporting

### Return Types Supported
- **Monthly Returns**: Staff Nominal Roll, Prisoners Statistics, Death Records, etc.
- **Quarterly Returns**: PF 30, Recidivists, Welfare Reports, etc.
- **Annual Returns**: PF 24, PSF4 Reports, Annual Reports

## User Roles & Permissions

### Admin (admin@prison.go.ug)
- View all returns from all stations
- Export all returns to CSV
- Full system access

### PHQ-KLA (phq-kla@prison.go.ug)
- View all returns from all stations
- Export all returns to CSV
- Review and approve returns

### Station Users (Clerk, Receptionist, Officer)
- Submit returns for their assigned station
- View their own submitted returns
- Export their own returns to CSV
- Station-specific restrictions apply

## System Architecture

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser LocalStorage (for demo purposes)
- **Styling**: Custom CSS with responsive design
- **Audio**: Web Audio API for notifications

### File Structure
```
prison-returns-system/
├── index.html          # Login page
├── dashboard.html      # Main dashboard
├── submit-return.html  # Return submission form
├── view-returns.html   # Returns viewing and management
├── styles.css          # Application styling
├── script.js           # Main application logic
├── main.js             # Electron main process
├── package.json        # Electron configuration and dependencies
├── images_2.jpg        # Uganda Prisons logo for desktop icon
├── dist/               # Build output directory
├── README.md           # This documentation
└── TODO.md             # Development notes
```

## Installation & Setup

### Desktop Application (Recommended)
The application is now available as a native Windows desktop application with installer.

#### Prerequisites for Building
- Node.js (version 14 or higher)
- npm (comes with Node.js)

#### Building the Desktop App
1. Open command prompt in the `prison-returns-system` directory
2. Install dependencies: `npm install`
3. Build the installer: `npm run build`
4. The installer will be created in the `dist/` directory as `Prison Return Management System Setup X.X.X.exe`

#### Installing the Desktop App
1. Run the generated installer (.exe file) from the `dist/` directory
2. Follow the installation wizard
3. Choose installation directory (default recommended)
4. The app will create desktop and start menu shortcuts with the Uganda Prisons logo
5. Launch the app from desktop icon or start menu

#### Running in Development Mode
To test the app without building:
1. Install dependencies: `npm install`
2. Run the app: `npm start`

### Web Browser Version

#### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for production deployment)

#### Local Development
1. Clone or download the project files
2. Open `index.html` in your web browser
3. The application will run entirely in the browser

#### Production Deployment
1. Upload all files to a web server
2. Ensure the server supports static HTML/CSS/JS files
3. Configure proper HTTPS for security
4. Set up proper authentication backend (recommended for production)

## Usage Guide

### First-Time Login
1. Use pre-configured accounts:
   - **Admin**: admin@prison.go.ug / admin123
   - **PHQ-KLA**: phq-kla@prison.go.ug / phqkla123
2. For station users, use station-specific emails (e.g., maxpri_upper@prison.go.ug)

### Submitting Returns
1. Log in with appropriate credentials
2. Navigate to "Submit Return"
3. Select frequency (Monthly/Quarterly/Annual)
4. Choose return type from dropdown
5. Select station (restricted based on user role)
6. Enter return data or upload file
7. Add optional comments
8. Submit the return

### Viewing Returns
1. Navigate to "View Returns"
2. Use search and sort filters
3. Click "Export to CSV" to download data
4. Download attached files if available

### Using Chat
1. Sign in with phone number or email
2. Send messages to other logged-in users
3. Messages persist across sessions
4. Real-time notifications for new messages

## Station Mapping

### Prison Units
- maxpri_upper@prison.go.ug → MaxPri Upper
- m_bay_pri@prison.go.ug → M-Bay Pri
- luzira_w@prison.go.ug → Luzira (W)
- And many more...

### District Prisons
- masaka_dist@prison.go.ug → MASAKA
- mbarara_dist@prison.go.ug → MBARARA
- And more...

### Regional Prisons
- northern@prison.go.ug → NORTHERN
- central@prison.go.ug → CENTRAL
- And more...

## Security Features

### Authentication
- Email-based authentication with role validation
- Automatic account creation for new users
- Password reset functionality
- Session management

### Data Protection
- Role-based data filtering
- Station-specific access restrictions
- Input validation and sanitization
- Secure file handling

## API Reference

### Key Functions
- `handleLogin()`: User authentication
- `handleSubmitReturn()`: Return submission
- `loadReturns()`: Load filtered returns
- `exportReturnsToCsv()`: CSV export functionality
- `initializeChat()`: Chat system initialization

### Data Structures
- `returnsData`: Available return types by frequency
- `currentUser`: Current logged-in user information
- `chatMessages`: Chat message history

## Troubleshooting

### Common Issues
1. **Login Issues**: Ensure using correct email format (@prison.go.ug)
2. **Station Restrictions**: Check user role and assigned station
3. **File Upload**: Ensure file size is reasonable (< 10MB)
4. **Chat Not Working**: Ensure user is logged in to the system

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development Notes

### Version History
- **1.0.0**: Initial release with core features
- **1.1.0**: Enhanced authentication and station management
- **1.2.0**: Added admin accounts and password reset

### Future Enhancements
- Backend database integration
- Advanced reporting features
- Mobile application
- Multi-language support
- Advanced analytics

## Support
For technical support or feature requests, contact the development team at OboteSofTech.

## License
This software is developed for the Uganda Prisons Service. All rights reserved.
