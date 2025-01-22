Project Description: Video Streaming Website Backend
This backend project forms the core of a video streaming platform, built using Express.js for API development and Mongoose for database management. The API functionalities are rigorously tested using Postman to ensure reliability and efficiency.

Key Features:
User Management:
Users can create accounts with secure password storage using bcrypt for encryption.
Authentication and authorization are implemented using JWT (JSON Web Tokens) for enhanced security.

Data Models:
User: Manages user details, including authentication credentials, avatars, and subscriptions.
Video: Handles video metadata like titles, descriptions, and other relevant details.
Subscription: Tracks user subscriptions and related data.

Media Storage:
User avatars and cover images are uploaded and stored on Cloudinary, leveraging Multer for efficient file handling.
Routing and Middleware:

The project uses Express Router to organize routes into modular components, ensuring maintainable and scalable code.
Middleware functions handle error management, authentication, and request validation to maintain robust API functionality.
This backend provides a scalable and secure foundation for video streaming services, with a focus on efficient routing, secure data handling, and seamless media storage integration
