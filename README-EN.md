# Beta Station- WeChat Mini Program 
## Project Introduction 
Beta Station is a WeChat mini-program designed specifically for students of Beijing Institute of Technology as a campus life service platform. The platform offers a variety of functions including second-hand trading, lost and found, inquiries and assistance, part-time job posting, rental information, and emotional sharing, aiming to create a convenient campus life community for students of BIT. 
## ✨ Main Functions 
### 🏠 Home Page Features
- **Category Navigation**: Second-hand Market, Lost & Found, Inquiry & Assistance, Part-time Job Posting, Rental Information, Emotional Sharing
- **Carousel Banner**: Display important notifications and event information
- **Campus Filtering**: Support content filtering for campuses such as Zhongguancun, Liangxiang, Zhuhai, etc.
- **Search Function**: Quick search for relevant content
- **Beta Hot List**: Show the top ten most popular posts currently 
### 💬 Tree Hole Function
- **Anonymous Posting**: Supports anonymous content posting
- **Emotional Exchange**: Provides a platform for emotional sharing and confiding
- **Privacy Protection**: Protects user privacy information 
### 👤 Personal Center
- **Campus Verification**: Student identity verification system
- **My Posts**: Manage personal posts
- **My Comments**: View and manage comment records
- **My Favorites**: Collect favorite posts
- **Contact Customer Service**: Provide customer service contact information
- **Reply Notifications**: View replies to my posts/comments from others
- **Feedback/Suggestions**: User feedback and suggestion system 
### 🎮 Mini Games
- **Synthesize BIT**: An in-built 2048 mini-game for users' entertainment 
### 📱 Other Features
- **QR Code Sharing**: Support for sharing content via QR codes
- **Message Push**: Comment reminders and important notification push
- **Content Review**: Safety review of images and text content
- **Blacklist Management**: User blacklist function 
## 🛠 Technology Stack 
### Front-end Technologies
- **Native Development for WeChat Mini Programs**
- **Vant Weapp UI Component Library** (v1.11.1) - **WXML + WXSS + JavaScript**

### Backend Services
- **Cloud Functions**: WeChat Mini Program Cloud Development
- **API Interfaces**: RESTful API Design
- **Database**: Cloud Database 
### Main Dependencies 
```json
{
"@vant/weapp": "^1.11.1" }
```

## 📁 Project Structure

```
Beita-frontend-main/
├── cloudfunctions/          # Cloud functions directory
│   ├── auth/               # Authentication-related cloud functions
│   ├── getPay/             # Payment-related cloud functions
│   ├── imgCheck/           # Image review cloud functions
│   ├── login/              # Login cloud functions
│   ├── msgCheck/           # Message review cloud functions
│   ├── msgCheck2/          # Message review cloud functions 2
│   └── sendSub/            # Subscription message cloud functions
├── miniprogram/            # Mini-program main directory
│   ├── components/         # Custom components
│   │   ├── navi/          # Navigation component
│   │   ├── radial-menu/   # Radial menu component
│   │   └── SearchBar/     # Search bar component
│   ├── config/            # Configuration files
│   │   └── api.js         # API interface configuration
│   ├── images/            # Image resources
│   ├── pages/             # Page files
│   │   ├── index/         # Home page
│   │   ├── treehole/      # Treehole page
│   │   ├── usercenter/    # User center
│   │   ├── detail/        # Detail page
│   │   ├── search/        # Search page
│   │   ├── addPost/       # Post page
│   │   └── uitem/         # User-related page
│   ├── utils/             # Utility functions
│   └── WXS/               # WXS script files
├── package.json           # Project dependency configuration
└── project.config.json    # Project configuration file
``` 

## 🚀 Installation and Deployment 
### Environment Requirements
- WeChat Developer Tools
- Node.js (for npm package management)
- WeChat Mini Program AppID 
### Installation Steps 
1. **Cloning Project**
```bash
git clone [repository URL] cd Beita-frontend-main
```

2. **Install Dependencies**
```bash
npm install
```

3. **Project Configuration**
- Import the project in WeChat Developer Tools
- Configure AppID: `wxc0d677e74a6493df`
- Ensure that the cloud development environment is enabled 
4. **Configure API Interface**
- Modify the API addresses in `miniprogram/config/api.js`
- Ensure the backend service is running properly 
5. **Build npm packages**
- In WeChat Developer Tools, click "Tools" -> "Build npm"
- Ensure that the `miniprogram_npm` directory is generated. 
Cloud Function Deployment 
Upload cloud function
```bash
Right-click on each cloud function under the cloudfunctions directory in the WeChat Developer Tools, and select "Upload and Deploy: Install Dependencies on the Cloud".
 ```

2. **Configure the Cloud Function Environment**
- Ensure that the environment variables of the cloud function are configured correctly.
- Check the permission settings of the cloud function. 
## 📱 Page Description 
### Main Pages
- **Home Page (pages/index)**: Displays category navigation and popular content
- **Treehole (pages/treehole)**: Anonymous communication platform
- **User Center (pages/usercenter)**: User information and function entry
- **Detail Page (pages/detail)**: Content detail display
- **Search Page (pages/search)**: Content search function
- **Post Page (pages/addPost)**: Content posting function 
### User Page (pages/uitem/)
- **myComment**: My Comments
- **my_like**: My Likes
- **my_task**: My Tasks
- **myReply**: My Replies
- **contact**: Contact Customer Service
- **suggestion**: Feedback
- **game/2048**: 2048 Mini Game 
## 🔧 Development Configuration 
### Project Configuration
- **ES6 to ES5 Conversion**: Enabled
- **Enhanced Compilation**: Enabled
- **Code Compression**: Enabled
- **npm Build**: Manual Build 
### Theme Configuration
- Supports dark mode
- Theme file: `theme.json`
- Site map: `sitemap.json` 
## 📊 API Interface 
The main API interfaces include:
- User Authentication: `wxLogin`
- Content Management: `addtaskXiaoyuan`, `gettaskbyType`
- Comment System: `sendComment`, `addcomment`
- Like Function: `addlike`, `getlikeByPk`
- Content Moderation: `msgCheck`, `imgCheck`
- Search Function: `gettaskbySearch` 
## 🔒 Security Features 
- **Content Review**: Safety review of image and text content
- **User Authentication**: Campus identity verification system
- **Blacklist Management**: User blacklist function
- **Privacy Protection**: Anonymous posting function of the Tree Hole 
## 📝 Update Log 
### v1.0.0
- Initial version released
- Basic functions implemented
- User authentication system
- Content posting and browsing
- Commenting and liking functions 
## 🤝 Contribution Guidelines 
1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 
## 📄 License 
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
## 📞 Contact Information 
- Project maintainer: [zp_x520]
- Email: [xuziping@zzyqtech.cn]
- Project address: [https://github.com/X-zip/Beita-frontend] 
## 🙏 Acknowledgements 
Thank you to all the developers and users who have contributed to the Beta Station project! 
---

**Note**: This project is for learning and research purposes only. Please abide by relevant laws and regulations and the norms of the WeChat Mini Program platform.
