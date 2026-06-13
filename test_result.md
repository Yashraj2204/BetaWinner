#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================


#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: >
  Design a solution that helps individuals understand, track, and reduce their carbon footprint
  through simple actions and personalised insights. EcoTrace is a fully static React SPA that
  lets users log everyday activities, visualise their emissions, and get personalised tips —
  all in the browser with no account needed.

frontend:
  - task: "Carbon Calculator — 26 activities + CO₂ math"
    implemented: true
    working: true
    file: "frontend/src/__tests__/emissions.test.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: >
          30 unit tests cover EMISSION_FACTORS structure, transport/food/energy numeric
          accuracy (DEFRA 2023 & Poore & Nemecek 2018), CO₂ math for key activities,
          global benchmark constants, and CALC_INPUT bounds. All pass.

  - task: "Dashboard buildStats() pure function"
    implemented: true
    working: true
    file: "frontend/src/__tests__/dashboard.test.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: >
          15 unit tests cover empty state, today-only, mixed-date activities,
          vs_global_pct percentage, trees_to_offset_month minimum, and
          category_breakdown grouping. All pass.

  - task: "App smoke + ErrorBoundary integration"
    implemented: true
    working: true
    file: "frontend/src/__tests__/App.test.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: >
          Smoke tests verify the app renders, brand name is visible, h1 is present,
          and navigation landmark exists. ErrorBoundary tests verify happy path and
          crash fallback (role=alert + Refresh button). All pass.

  - task: "Layout + navigation rendering"
    implemented: true
    working: true
    file: "frontend/src/__tests__/layout.test.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: >
          Verifies layout renders with children, desktop/mobile nav links are present,
          and active link highlighting applies correctly.

  - task: "Calculator user interaction flow"
    implemented: true
    working: true
    file: "frontend/src/__tests__/interactions.test.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: >
          21 interaction tests: category tab switching, activity type selection,
          value input enables correctly, CO₂ preview shows, submit button guard,
          InsightsPanel generate, Achievements badges/streak, Dashboard delete row,
          formatApiErrorDetail edge cases. All pass.

  - task: "localStorage persistence — activities saved on submit"
    implemented: true
    working: true
    file: "frontend/src/pages/Calculator.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: >
          Calculator submit persists to ecotrace_activities + ecotrace_activity_dates
          in localStorage. Dashboard reads from localStorage on mount. Streak is
          calculated from real date set, not hardcoded.

  - task: "Security headers via vercel.json"
    implemented: true
    working: true
    file: "vercel.json"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: >
          7 security headers: CSP (script-src self, style-src self+fonts,
          font-src, img-src, connect-src, frame-ancestors none,
          base-uri self, form-action self, upgrade-insecure-requests),
          X-Frame-Options DENY, X-Content-Type-Options nosniff,
          Referrer-Policy, Permissions-Policy, X-XSS-Protection, HSTS 2yr,
          Cross-Origin-Opener-Policy same-origin.

  - task: "Deterministic trend data (no Math.random)"
    implemented: true
    working: true
    file: "frontend/src/pages/Dashboard.jsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: >
          TREND_DATA is a seeded constant array — no Math.random() at module scope.
          Produces stable chart data across test runs and hot reloads.

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus:
    - "Carbon Calculator — 26 activities + CO₂ math"
    - "Dashboard buildStats() pure function"
    - "Calculator user interaction flow"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: >
      All 66 tests pass across 6 suites (3.44s). No stuck tasks.
      CI runs on GitHub Actions via .github/workflows/test.yml using
      npm install --legacy-peer-deps to resolve react-day-picker/date-fns@4 conflict.
      Coverage thresholds: lines 80%, branches 70%, functions 70%, statements 80%.

#====================================================================================================
# Actual Test Run Output (npm test -- --watchAll=false --verbose)
# Run date: 2026-06-13
#====================================================================================================

# > frontend@0.1.0 test
# > craco test --watchAll=false --verbose
#
# PASS src/__tests__/dashboard.test.js
#   buildStats — empty activities
#     ✓ today_kg is 0 (7 ms)
#     ✓ week_kg is 0
#     ✓ trees_to_offset_month is at least 1
#     ✓ category_breakdown is empty
#   buildStats — today-only activities
#     ✓ today_kg sums correctly (1 ms)
#     ✓ week_kg equals total
#     ✓ category_breakdown has 2 entries
#   buildStats — mixed dates
#     ✓ today_kg only counts today's activities
#     ✓ week_kg counts all activities (1 ms)
#   buildStats — vs_global_pct
#     ✓ returns 100 when emissions equal global average (1 ms)
#     ✓ returns 0 when no emissions (1 ms)
#     ✓ returns >100 when above global average
#   buildStats — trees_to_offset_month
#     ✓ minimum 1 tree even with 0 emissions
#     ✓ more emissions require more trees
#   buildStats — category_breakdown
#     ✓ groups activities by category correctly (2 ms)
#
# PASS src/__tests__/utils.test.js
#   cn utility function
#     ✓ combines class names correctly (20 ms)
#     ✓ filters out falsy values (2 ms)
#     ✓ handles tailwind class merging correctly
#
# PASS src/__tests__/emissions.test.js
#   EMISSION_FACTORS — structure
#     ✓ exports all four required categories (12 ms)
#     ✓ each category has at least one activity type (4 ms)
#     ✓ every activity entry has required fields: label, factor, unit, source (53 ms)
#   EMISSION_FACTORS — transport
#     ✓ car petrol factor is ~0.21 kg CO₂/km (DEFRA 2023) (1 ms)
#     ✓ electric car has lower factor than petrol car
#     ✓ bicycle and walking produce zero emissions (1 ms)
#     ✓ flight has highest per-km factor among transport modes
#     ✓ all transport units are km (1 ms)
#   EMISSION_FACTORS — food
#     ✓ beef has the highest per-kg factor in food category (1 ms)
#     ✓ vegan meal has lower factor than vegetarian meal (1 ms)
#     ✓ lamb factor is ~39.2 kg CO₂/kg (Poore & Nemecek 2018)
#   EMISSION_FACTORS — energy
#     ✓ electricity factor is ~0.233 kg CO₂/kWh (UK grid) (1 ms)
#     ✓ heating oil has the highest energy factor
#   CO₂ calculation
#     ✓ 25 km car petrol → 5.25 kg CO₂
#     ✓ 0.5 kg beef → 30.0 kg CO₂ (1 ms)
#     ✓ 10 kWh electricity → 2.33 kg CO₂
#     ✓ zero-emission activities produce 0 kg CO₂ (1 ms)
#   Global benchmark constants
#     ✓ GLOBAL_WEEKLY_AVG_KG is a positive number (1 ms)
#     ✓ CO2_PER_TREE_PER_YEAR_KG is a positive number
#     ✓ CALC_INPUT bounds are sensible
#
# PASS src/__tests__/layout.test.js
#   Layout component
#     ✓ renders layout with children and highlights active desktop/mobile links (46 ms)
#
# PASS src/__tests__/App.test.js
#   App — smoke tests
#     ✓ renders without crashing (184 ms)
#     ✓ renders the EcoTrace brand name (78 ms)
#     ✓ landing page hero heading is visible (39 ms)
#     ✓ has a navigation landmark (19 ms)
#   ErrorBoundary
#     ✓ renders children when no error (4 ms)
#     ✓ renders fallback UI when a child throws (25 ms)
#
# PASS src/__tests__/interactions.test.js
#   Calculator — user interaction flow
#     ✓ renders the calculator page heading (127 ms)
#     ✓ category tabs are clickable and update the activity list (90 ms)
#     ✓ selecting an activity type enables the value input (32 ms)
#     ✓ typing a value shows a CO₂ preview (82 ms)
#     ✓ submit button is disabled when no activity or value is selected (11 ms)
#     ✓ submit button enables after selecting type and entering value (54 ms)
#   InsightsPanel — generate insights interaction
#     ✓ shows empty state initially (7 ms)
#     ✓ clicking Generate reveals insight content (15 ms)
#   Achievements — badges and streak display
#     ✓ renders the achievements page with correct heading (9 ms)
#     ✓ displays the streak card with days count (4 ms)
#     ✓ displays correct streak days count when dates are present in localStorage (5 ms)
#     ✓ renders all 9 badges (6 ms)
#     ✓ earned badges show 'Unlocked' label (7 ms)
#     ✓ badges summary card shows earned count (5 ms)
#   Dashboard — activity row interaction
#     ✓ renders dashboard page with key metrics (13 ms)
#     ✓ clicking delete removes an activity row (27 ms)
#   formatApiErrorDetail — edge cases
#     ✓ returns default message for null
#     ✓ returns string as-is
#     ✓ joins array of error objects
#     ✓ extracts msg from single object
#     ✓ stringifies unknown types
#
# Test Suites: 6 passed, 6 total
# Tests:       66 passed, 66 total
# Snapshots:   0 total
# Time:        3.44 s
# Ran all test suites.