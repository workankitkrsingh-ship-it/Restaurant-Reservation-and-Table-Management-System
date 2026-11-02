# The Verdant Table — Restaurant Reservation & Table Management System

A full-stack **MEAN (MongoDB, Express.js, Angular, Node.js)** web application built with **Angular CLI**, **TypeScript**, **Tailwind CSS**, and **MongoDB Atlas** featuring a classic **Emerald & Slate Botanical Conservatory** interface.

---

## Core Academic & Technical Features

1. **Angular CLI & TypeScript Setup**: Built on Angular 22 with standalone components, TypeScript interfaces (`RestaurantTable`, `Reservation`, `User`), and modular HTML templates.
2. **Reusable Components**: `<app-table-card>` (with `@Input()` and `@Output()` event emitters) and `<app-navbar>`.
3. **Data Binding & Event Handling**: Two-way binding `[(ngModel)]`, property binding `[ngClass]`, and event handlers `(ngSubmit)`, `(click)`, `(change)`.
4. **State Management with Angular Services**: Reactive state managed via `RestaurantService` and `AuthService`.
5. **JavaScript Array Operations**: Uses `.filter()`, `.map()`, and `.reduce()` for dynamic table filtering, capacity calculation, and reservation search.
6. **Angular Routing & Guards**: Configured routes (`/dashboard`, `/reservations`, `/tables`, `/login`, `/register`) protected with `authGuard`.
7. **Role-Based Access (Guest & Maitre D' Admin)**:
   - **Guests**: View live floor availability, filter tables by section/capacity, book reservations, and cancel bookings.
   - **Admins**: Add/remove tables (Suites #101–#108+), toggle table statuses (`Available`, `Reserved`, `Occupied`, `Maintenance`), and manage all guest reservations (`Seat Party`, `Complete Service`, `Cancel`).

---

## Quick Start

### 1. Install Packages
```bash
# In project root (Angular frontend)
npm install

# In server directory (Express + MongoDB backend)
cd server
npm install
```

### 2. Seed MongoDB Atlas & Run Backend
```bash
cd server
node seed.js
npm run dev
```

### 3. Run Angular Frontend
```bash
# In a second terminal at project root
npm start
```
Open **`http://localhost:4200`** in your browser.

---

## Demo Accounts
- **Maitre D' Admin**: `admin@restaurant.com` / `password123`
- **Guest Member**: `user@restaurant.com` / `password123`
- **Admin Registration Secret Key**: `admin_restaurant_2026`
