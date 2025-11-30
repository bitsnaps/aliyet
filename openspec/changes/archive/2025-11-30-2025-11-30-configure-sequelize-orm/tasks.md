# Tasks: Configure Sequelize ORM

- [x] **Task 1: Define User Model**
  - Create/update the `User` model in `server/utils/models.js` with `username` and `password` fields.

- [x] **Task 2: Implement Database Seeding**
  - Add logic to `server/utils/db.js` to seed the database with a default admin user if one doesn't exist.

- [x] **Task 3: Update Login Endpoint**
  - Modify `server/api/auth/login.post.js` to use the `User` model for authentication.

- [x] **Task 4: Validate Configuration**
  - Run tests and manually verify the login functionality.