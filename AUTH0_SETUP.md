# Auth0 Integration for AI Literacy Bridge

This project integrates Auth0 for authentication but can also work in demo mode without Auth0 credentials.

## Setup Auth0 (Optional)

1. **Create Auth0 Account**
   - Go to [auth0.com](https://auth0.com) and create a free account
   - Create a new application (Single Page Application)

2. **Configure Auth0 Application**
   - Set Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Set Allowed Logout URLs: `http://localhost:3000/auth`
   - Set Allowed Web Origins: `http://localhost:3000`

3. **Environment Variables**
   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local
   
   # Add your Auth0 credentials to .env.local
   AUTH0_SECRET=use_openssl_rand_hex_32_to_generate_a_32_bytes_value
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   ```

4. **Generate AUTH0_SECRET**
   ```bash
   openssl rand -hex 32
   ```

## Demo Mode (Default)

Without Auth0 credentials, the application runs in demo mode:
- Simple authentication simulation
- All features work normally
- Perfect for development and testing

## Production Deployment

For production with real Auth0:
1. Set up Auth0 tenant
2. Configure production domains
3. Add environment variables to hosting platform
4. Enable user metadata for roles and preferences

## Educational Roles

The application supports these roles through Auth0 user metadata:
- **Student**: Personalized learning experience
- **Teacher**: Analytics and curriculum management
- **Scribe**: Exam assistance and note-taking
- **Admin**: Platform management

## Accessibility Integration

Auth0 user profiles include accessibility preferences:
- Screen reader support
- High contrast mode
- Font size preferences
- Voice navigation settings
- Language preferences

## Security Features

- OAuth 2.0 / OpenID Connect
- JWT tokens for session management
- PKCE flow for enhanced security
- Educational data privacy compliance (COPPA)
- Role-based access control (RBAC)