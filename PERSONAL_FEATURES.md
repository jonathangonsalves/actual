# Personal Features - Actual Budget Custom Deployment

This document tracks custom features added to my personal Actual Budget deployment.

## 🎯 Goals Feature

A comprehensive goal tracking system that allows you to set financial targets and track progress through tagged transactions.

### Features Added

#### 1. Goals Management
- **Create Goals**: Set target amounts, optional target dates, and custom tag patterns
- **Goal Cards**: Visual progress bars showing completion percentage
- **Goal Statistics**: Display achieved amount, remaining amount, and progress percentage
- **Color Coding**: Custom colors for each goal for easy identification
- **Delete Goals**: Remove goals when no longer needed

#### 2. Transaction Integration
- **Tag-based Tracking**: Goals track progress through transaction notes containing specific tags (e.g., `#goal_car`)
- **Automatic Calculation**: Goal progress updates automatically when tagged transactions are added
- **Manual Refresh**: Refresh button to recalculate progress on demand

#### 3. Goal Details View
- **Transaction List**: Click on any goal to see all contributing transactions
- **Clean Display**: Shows transaction description (with tags removed) and formatted dates
- **Amount Formatting**: Clean number display without currency symbols
- **Progress Summary**: Complete overview of goal status and remaining amount

#### 4. User Interface
- **Navigation**: Accessible via main navigation menu
- **Responsive Design**: Works on desktop and mobile
- **Consistent Styling**: Matches Actual Budget's design language
- **Empty States**: Helpful guidance when no goals exist

### Technical Implementation

#### Backend (loot-core)
- **Database Schema**: New `goals` table with proper indexing
- **API Endpoints**: 
  - `goals-get`: Retrieve all goals
  - `goals-create`: Create new goals
  - `goals-update`: Update existing goals
  - `goals-delete`: Remove goals
  - `goals-recalculate`: Refresh progress calculations
  - `goals-get-transactions`: Get transactions for specific goals
- **Progress Calculation**: Automatic sum of positive amounts from tagged transactions

#### Frontend (desktop-client)
- **GoalsPage**: Main goals management interface
- **GoalCard**: Individual goal display component
- **CreateGoalModal**: Goal creation form
- **GoalDetailsPage**: Transaction list for specific goals
- **Navigation Integration**: Added to main app routing

### Usage Instructions

1. **Navigate to Goals**: Click "Goals" in the main navigation
2. **Create a Goal**: 
   - Click "+ New Goal"
   - Enter goal name, target amount, and optional target date
   - Set a unique tag pattern (e.g., "car" for #goal_car)
   - Choose a color
3. **Track Progress**:
   - Add transactions with the goal tag in notes (e.g., "Monthly savings #goal_car")
   - Progress updates automatically
   - Use refresh button if needed
4. **View Details**: Click on any goal card to see all contributing transactions

### File Changes

#### New Files
- `packages/loot-core/src/server/goals/app.ts` - Goals backend logic
- `packages/desktop-client/src/components/goals/GoalsPage.tsx` - Main goals interface
- `packages/desktop-client/src/components/goals/GoalCard.tsx` - Individual goal display
- `packages/desktop-client/src/components/goals/CreateGoalModal.tsx` - Goal creation form
- `packages/desktop-client/src/components/goals/GoalDetailsPage.tsx` - Transaction details view

#### Modified Files
- `packages/loot-core/src/server/main.ts` - Added goals app registration
- `packages/desktop-client/src/components/FinancesApp.tsx` - Added goals routes
- `packages/desktop-client/src/components/sidebar/SidebarWithData.tsx` - Added goals navigation
- Database migration files for goals table creation

### Future Enhancements
- Goal categories and grouping
- Goal templates for common savings targets
- Progress notifications and reminders
- Goal sharing and collaboration
- Advanced reporting and analytics
- Integration with budget categories
- Recurring goal contributions

---

**Created**: January 2025  
**Last Updated**: January 2025  
**Status**: ✅ Complete and Deployed
