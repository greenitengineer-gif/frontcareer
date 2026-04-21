# Career Laravel Backend

This is the Laravel migration of the Career platform backend.

## Requirements

- PHP >= 7.4
- Composer
- PostgreSQL

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    composer install
    ```

2.  **Environment Configuration**
    ```bash
    cp .env.example .env
    ```
    Update the database credentials and AI API keys in the `.env` file.

3.  **Generate App Key**
    ```bash
    php artisan key:generate
    ```

4.  **Run Migrations**
    ```bash
    php artisan migrate
    ```

5.  **Start the Server**
    ```bash
    php artisan serve
    ```

## API Documentation

The API routes are defined in `routes/api.php`. All API endpoints are prefixed with `/api`.

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user profile (Requires token)

### Jobs
- `GET /api/listings` - List all jobs
- `POST /api/listings` - Create a job (Employer only)
- `GET /api/listings/{id}` - Get job details
- `PUT /api/listings/{id}` - Update job
- `DELETE /api/listings/{id}` - Delete job

### CV
- `GET /api/cv` - Get user CV
- `POST /api/cv` - Create/Update CV
- `GET /api/cv/public` - List public CVs

## Key Differences from Node.js Backend

- **ORM**: Uses Eloquent instead of Supabase-JS.
- **Authentication**: Uses Laravel Sanctum for API tokens.
- **Structure**: Follows standard Laravel MVC pattern.
- **UUIDs**: Fully supported and integrated into models.
