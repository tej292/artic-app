# Art Institute of Chicago - Artwork Data Table

This project is a React (Vite + TypeScript) application built for an internship assignment. It features a data table that displays artwork data from the Art Institute of Chicago API, with server-side pagination and persistent row selection.

**Deployed Application URL:** [https://artic-app.netlify.app/]
**Github Repository:[]

---

##  Features

* **Vite + React + TypeScript:** Built with a modern, fast toolchain as required.
* **PrimeReact DataTable:** Uses the `DataTable` component for all data display.
* **Server-Side Pagination:** Implements `lazy` loading to fetch data one page at a time directly from the API. The application only ever stores the data for the *current page* in memory.
* **Persistent Row Selection:** Selections are remembered as you navigate between pages.
* **Custom Selection Panel:** An `OverlayPanel` allows the user to select the top 'n' rows from the *current page*.
* **API Integration:** Fetches data from the `https://api.artic.edu/api/v1/artworks` endpoint.

---

##  Technical Stack

* **Framework/Library:** React
* **Build Tool:** Vite
* **Language:** TypeScript
* **UI Components:** PrimeReact, PrimeIcons
* **Layout:** PrimeFlex
* **API:** Art Institute of Chicago API

---

## Local Development

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [Your-Repo-URL]
    cd artic-datatable-internship
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173` (or the next available port).

---

##  Key Implementation Strategy

This section details the logic used to meet the assignment's core technical challenges, particularly regarding state management and API usage.

### 1. Server-Side Pagination

The PrimeReact `DataTable` is configured in **`lazy` mode**.

* A state variable `lazyState` (tracking `page`, `rows`, and `first`) controls the table's pagination.
* A `useEffect` hook listens for changes to `lazyState`. When the user changes the page, this hook triggers a new API call to fetch *only* the data for the requested page.
* The `totalRecords` value from the API's `pagination` object is used to configure the `DataTable` paginator, ensuring it accurately reflects the total number of items on the server.

### 2. Persistent Selection Strategy

This was a key requirement. The goal was to persist selections across pages without storing data objects from unvisited pages.

My strategy uses two separate states:

1.  **`persistentSelectedIds: Set<number>`**
    * This is the "source of truth" for *all* selections across *all* pages.
    * It stores **only the unique IDs** of the selected artworks.
    * Using a `Set` is highly efficient for adding, deleting, and checking for the existence of an ID.

2.  **`currentPageSelection: Artwork[]`**
    * This state holds the *full artwork objects* for the items selected *on the currently visible page only*.
    * This is the array that is passed directly to the `DataTable`'s `selection` prop.

**The Data Flow:**

1.  **On Data Fetch:** After a new page of artworks is fetched from the API, the app filters this new `artworks` array against the `persistentSelectedIds` set. The resulting items are used to set the `currentPageSelection`.
2.  **On Selection Change:** When the user selects or deselects a row (or all rows), the `onSelectionChange` handler is triggered. This logic "diffs" the changes on the current page and updates the `persistentSelectedIds` set accordingly by adding or removing IDs.

This approach ensures selection persists across pages while strictly adhering to the "no mass data storage" requirement.

### 3. Custom 'n' Row Selection (Compliance)

The assignment required a custom panel to select 'n' rows but **explicitly forbade** fetching data from other pages to fulfill this selection (i.e., no iterative `fetch` loops).

To meet this requirement while respecting the constraint, my implementation of the "custom select" panel **operates on the currently visible page only**.

* When a user enters a number 'n' and clicks "Select," the logic takes the top `n` items from the `artworks` array (the data for the *current page*).
* It then adds these items' IDs to the `persistentSelectedIds` set and updates the `currentPageSelection` state.
* This fulfills the feature request for a custom selection panel without violating the critical "no pre-fetching" rule.