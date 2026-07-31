👶 Ravnoor's Tracker
A mobile-friendly web application for daily baby activity logging (feeding and diapers), vaccine schedules, medicine trackers, doctor appointments, and growth charts. Built with zero running costs using free-tier MongoDB Atlas and Vercel hosting.

📑 Table of Contents
1. MongoDB Atlas Setup (Free Database)

2. Local Setup & Initial Admin Creation

3. GitHub & Vercel Deployment

4. Install as a Mobile App (PWA)

5. Adding Family Members

✨ Key Features

📊 Free Tier Limits

🚀 Future Enhancements

1. MongoDB Atlas Setup (Free Database)
Register for a free account at mongodb.com/cloud/atlas/register.

Click Create a deployment and select the M0 Free cluster (no credit card required).

Create a Database User and securely store the username and password.

Under Network Access, add 0.0.0.0/0 (Allow access from anywhere) to allow incoming connections from Vercel.

Navigate to Connect -> Drivers and copy your connection string. It will look similar to this:

Plaintext
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
Append the database name /ravnoortracker directly after the password in the connection string:

Plaintext
mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ravnoortracker?retryWrites=true&w=majority
2. Local Setup & Initial Admin Creation
Install dependencies and set up environment variables:

Bash
npm install
cp .env.local.example .env.local
Open .env.local and fill in the values:

MONGODB_URI: Your MongoDB connection string from Step 1.

AUTH_SECRET: Generate a secure key by running openssl rand -base64 32 in your terminal and paste it here.

Create the first Admin account (replace with your name, email, and password):

Bash
MONGODB_URI="your-connection-string" node scripts/create-user.mjs "Param" param@example.com yourpassword admin
Run the local development server:

Bash
npm run dev
Open http://localhost:3000 in your browser and log in.

3. GitHub & Vercel Deployment
Initialize a Git repository and push the code to GitHub:

Bash
git init
git add .
git commit -m "Initial commit - Ravnoor Tracker App"
git remote add origin https://github.com/<your-username>/ravnoor-tracker.git
git push -u origin main
Sign up or log in at vercel.com using your GitHub account.

Click Add New Project and import your GitHub repository.

Configure the Environment Variables (same as .env.local):

MONGODB_URI

AUTH_SECRET

Click Deploy. Your app will be live in ~2 minutes at a custom Vercel URL (e.g., [https://ravnoor-tracker-xyz.vercel.app](https://ravnoor-tracker-xyz.vercel.app)).

4. Install as a Mobile App (PWA)
Open your live app URL in your mobile browser (Safari on iOS or Chrome on Android).

Log in to your account.

Tap Add to Home Screen from the browser menu (Android) or Share menu (iOS).

An app icon will be added to your home screen, functioning like a native mobile app.

5. Adding Family Members
Account creation is restricted to administrators. To add family members:

Log in with an Admin account and navigate to the Admin tab in the bottom navigation.

Fill in the user's name, email, and temporary password.

Once created, family members can log in, log daily entries, and track progress. Admins retain full visibility over all user activities.

✨ Key Features
Today Tab: Track feedings (breast/bottle/solid) and diaper changes (wet/dirty) date-wise with quick edit/delete options.

Vaccines Tab: View immunization schedules, mark completed vaccines, and highlight overdue items in red.

Medicines Tab: Manage dosages, schedules, and active/stopped statuses.

Appointments Tab: Track doctor visits, dates, locations, and pending/completed statuses.

Growth Tab: Record height, weight, and head circumference with built-in line chart visualizations.

Admin Tab: Manage user accounts, view active users, and monitor combined system activity logs.

Reminders: Built-in browser notifications and in-app banners for upcoming vaccines and appointments (100% free, no third-party services required).

📊 Free Tier Limits
MongoDB Atlas M0: Includes 512MB of database storage — more than enough for several years of logging data.

Vercel Hobby Plan: Free hosting for personal projects with generous bandwidth limits.

🚀 Future Enhancements
Email/SMS Reminders: Integration with Resend (Free tier: 100 emails/day).

Multi-Baby Support: Toggle and manage logs for multiple children.

Milestone Photos: Image upload support for baby milestones.

Data Export: Export logs and health history to PDF or Excel formats.